import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Gestión de Puertos y Control de Acceso (CORS)
app.use(cors()); // Permite que tu frontend de React se conecte
app.use(express.json());

// Verificación de Credenciales e Infraestructura (Azure SQL)
const dbConfig = {
    user: 'CloudSAf5c38632',
    password: 'Aegon25?', // ⚠️ ¡IMPORTANTE: Reemplaza esto con tu contraseña real!
    server: 'luminadb1.database.windows.net', 
    database: 'luminatb',
    options: {
        encrypt: true, // Requerido obligatoriamente por Azure
        trustServerCertificate: false // Recomendado para producción
    }
};

// Ruta base para confirmar que el servidor está encendido en la nube
app.get('/', (req, res) => {
    res.send('Backend de Lumina funcionando perfectamente 🚀');
});

// Endpoint de Autenticación (Staff)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('SELECT Id_usuario, Username, Rol FROM [dbo].[Usuarios] WHERE Email = @email AND Password_hash = @password');

        if (result.recordset && result.recordset.length > 0) {
            // Devolvemos el usuario sin la contraseña por seguridad
            res.status(200).json({ success: true, usuario: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
        }
    } catch (err) {
        console.error("❌ Error en login:", err);
        res.status(500).json({ error: 'Error interno del servidor al autenticar' });
    }
});

// Endpoint de Reservaciones (Público)
app.post('/api/reservas', async (req, res) => {
    const { nombre, email, telefono, idHabitacion, fechaIngreso, fechaSalida, diasAnticipacion, probabilidadCancelacion } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        
        // 1. Verificar si el cliente existe, si no, insertarlo
        let idCliente;
        const clienteCheck = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT Id_cliente FROM [dbo].[Clientes] WHERE Email = @email');

        if (clienteCheck.recordset && clienteCheck.recordset.length > 0) {
            idCliente = clienteCheck.recordset[0].Id_cliente;
        } else {
            // Se usa OUTPUT INSERTED para recuperar el ID del nuevo cliente de forma segura
            const nuevoCliente = await pool.request()
                .input('nombre', sql.NVarChar, nombre)
                .input('email', sql.NVarChar, email)
                .input('telefono', sql.NVarChar, telefono || '0000000000')
                .query(`
                    INSERT INTO [dbo].[Clientes] (Nombre, Email, Telefono, Historial_cancelaciones) 
                    OUTPUT INSERTED.Id_cliente 
                    VALUES (@nombre, @email, @telefono, 0)
                `);
            idCliente = nuevoCliente.recordset[0].Id_cliente;
        }

        // 2. Crear la reserva enlazada al cliente
        const nuevaReserva = await pool.request()
            .input('idCliente', sql.Int, idCliente)
            .input('idHabitacion', sql.Int, idHabitacion || 1)
            .input('fechaIngreso', sql.Date, fechaIngreso)
            .input('fechaSalida', sql.Date, fechaSalida)
            .input('diasAnticipacion', sql.Int, diasAnticipacion || 30)
            .input('prob', sql.Decimal(5,2), probabilidadCancelacion || 15.5)
            .query(`
                INSERT INTO [dbo].[Reservas] 
                (Id_cliente, Id_habitacion, Fecha_ingreso, Fecha_salida, Dias_anticipacion, Probabilidad_cancelacion, Estado_reserva) 
                OUTPUT INSERTED.Id_reserva
                VALUES 
                (@idCliente, @idHabitacion, @fechaIngreso, @fechaSalida, @diasAnticipacion, @prob, 'Confirmada')
            `);

        // 3. Responder al frontend con el folio (Id_reserva) generado en la nube
        res.status(201).json({ 
            success: true, 
            mensaje: 'Reserva guardada en Azure SQL exitosamente',
            folio: nuevaReserva.recordset[0].Id_reserva
        });

    } catch (err) {
        console.error("❌ Error en la base de datos al guardar:", err);
        res.status(500).json({ error: 'Error al intentar guardar en Azure SQL' });
    }
});

// --- CONEXIÓN CON EL FRONTEND ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Servir los archivos estáticos compilados de React
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Cualquier ruta web que el usuario escriba, redirigirla a React
// app.get('*', (req, res) => {
   // res.sendFile(path.join(__dirname, 'dist', 'index.html'));
//});

// Asignación de puerto para evitar choques con React
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Servidor Backend corriendo y escuchando en el puerto ${PORT}`);
});