import express from 'express';
import cors from 'cors';
import sql from 'mssql';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configuración de tu base de datos en Azure SQL
const dbConfig = {
    user: 'CloudSAf5c38632',
    password: 'Aegon25?', // Pon la contraseña que cambiaste
    server: 'luminadb1.database.windows.net', 
    database: 'luminatb',
    options: {
        encrypt: true, 
        trustServerCertificate: false
    }
};

// 2. Endpoint de Login conectado a Azure (Tabla Usuarios)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('SELECT Id_usuario, Username, Rol FROM [dbo].[Usuarios] WHERE Email = @email AND Password_hash = @password');

        if (result.recordset.length > 0) {
            res.status(200).json({ success: true, usuario: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// 3. Endpoint de Reservas conectado a Azure (Tablas Clientes y Reservas)
app.post('/api/reservas', async (req, res) => {
    const { nombre, email, telefono, idHabitacion, fechaIngreso, fechaSalida, diasAnticipacion, probabilidadCancelacion } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        
        // Verificar si el cliente existe, si no, insertarlo
        let idCliente;
        const clienteCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT Id_cliente FROM [dbo].[Clientes] WHERE Email = @email');

        if (clienteCheck.recordset.length > 0) {
            idCliente = clienteCheck.recordset[0].Id_cliente;
        } else {
            const nuevoCliente = await pool.request()
                .input('nombre', sql.NVarChar, nombre)
                .input('email', sql.NVarChar, email)
                .input('telefono', sql.NVarChar, telefono)
                .query('INSERT INTO [dbo].[Clientes] (Nombre, Email, Telefono, Historial_cancelaciones) OUTPUT INSERTED.Id_cliente VALUES (@nombre, @email, @telefono, 0)');
            idCliente = nuevoCliente.recordset[0].Id_cliente;
        }

        // Crear la reserva
        const nuevaReserva = await pool.request()
            .input('idCliente', sql.Int, idCliente)
            .input('idHabitacion', sql.Int, idHabitacion || 1) // Por defecto habitación 1 si no se envía
            .input('fechaIngreso', sql.Date, fechaIngreso)
            .input('fechaSalida', sql.Date, fechaSalida)
            .input('diasAnticipacion', sql.Int, diasAnticipacion || 30)
            .input('prob', sql.Decimal(5,2), probabilidadCancelacion || 15.5) // Resultado del ML
            .query(`
                INSERT INTO [dbo].[Reservas] 
                (Id_cliente, Id_habitacion, Fecha_ingreso, Fecha_salida, Dias_anticipacion, Probabilidad_cancelacion, Estado_reserva) 
                VALUES 
                (@idCliente, @idHabitacion, @fechaIngreso, @fechaSalida, @diasAnticipacion, @prob, 'Confirmada')
            `);

        res.status(201).json({ success: true, mensaje: 'Reserva guardada en Azure SQL' });

    } catch (err) {
        console.error("Error al guardar reserva:", err);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});