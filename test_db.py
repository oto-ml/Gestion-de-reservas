# Primero instala la librería en tu terminal: pip install pyodbc
import pyodbc

# Tus credenciales exactas de Azure
server = 'luminadb1.database.windows.net'
database = 'luminatb'
username = 'CloudSAf5c38632'
password = 'Aegon25?' # Borra los corchetes y pon tu contraseña real
driver = '{ODBC Driver 18 for SQL Server}' # Puede ser 17 o 18 dependiendo de tu equipo

# Armamos el string de conexión (basado en el formato ODBC)
connection_string = f'DRIVER={driver};SERVER={server};PORT=1433;DATABASE={database};UID={username};PWD={password};Timeout=30;'

try:
    # Intentamos conectar
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()
    print("¡Conexión a Azure SQL exitosa! 🚀")
    
    # Prueba de Caja Blanca: Consultar si nuestras tablas ya existen
    print("\nTablas encontradas en la base de datos:")
    cursor.execute("SELECT name FROM sys.tables")
    for row in cursor.fetchall():
        print("-", row[0])
        
    conn.close()

except Exception as e:
    print("Error al conectar. Verifica tu contraseña o el Firewall de Azure:")
    print(e)