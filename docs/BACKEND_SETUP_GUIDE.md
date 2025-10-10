# 🚀 Guía Completa para Inicializar Backend y Base de Datos

## 📋 Requisitos Previos

### Verificar Instalaciones

```bash
# Python 3.8+ (recomendado 3.11+)
python3 --version

# pip (gestor de paquetes)
pip --version

# pipenv (recomendado)
pip install pipenv
```

---

## 🛠️ 1. CONFIGURACIÓN INICIAL DEL PROYECTO

### Paso 1: Clonar y Navegar al Proyecto

```bash
cd "/Users/victormorenocabello/Desktop/Proyectos Cursos y Mas/PROYECTO FINAL DE 4GEEK/final-project-egor-victor"
```

### Paso 2: Verificar Estructura del Proyecto

```bash
ls -la
# Debes ver: src/, migrations/, Pipfile, requirements.txt, .env
```

---

## 🐍 2. CONFIGURACIÓN DEL ENTORNO PYTHON

### Opción A: Usando Pipenv (Recomendado)

```bash
# Instalar dependencias del Pipfile
pipenv install

# Activar entorno virtual
pipenv shell

# Verificar instalación
pipenv graph
```

### Opción B: Usando pip y venv

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt
```

---

## 🗃️ 3. CONFIGURACIÓN DE BASE DE DATOS

### Configurar Variables de Entorno

```bash
# Editar archivo .env
nano .env
```

### Contenido del archivo .env:

```env
# Flask Configuration
FLASK_APP=src/app.py
FLASK_DEBUG=1
FLASK_RUN_PORT=3001
PORT=3001

# Base de datos - Elige UNA opción:

# OPCIÓN 1: SQLite (Desarrollo - Más fácil)
DATABASE_URL=sqlite:///travel_routes.db

# OPCIÓN 2: PostgreSQL (Producción)
# DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/travel_routes_db

# JWT Configuration
JWT_SECRET_KEY=mi-clave-super-secreta-para-jwt-2024

# API Keys (opcional)
WEATHER_API_KEY=tu-api-key-openweathermap
```

### Exportar Variables de Entorno

```bash
# Cargar variables del .env
export $(cat .env | xargs)

# O usando python-dotenv (ya incluido en requirements.txt)
# Las variables se cargan automáticamente
```

---

## 🗄️ 4. INICIALIZACIÓN DE LA BASE DE DATOS

### Paso 1: Verificar Estado de Migraciones

```bash
# Ver migraciones existentes
ls migrations/versions/

# Si existe el directorio migrations/, continúa al Paso 2
# Si NO existe, ejecuta:
pipenv run flask db init
```

### Paso 2: Crear Nueva Migración (Si es necesario)

```bash
# Solo si has modificado modelos o es primera vez
pipenv run flask db migrate -m "Initial migration with voting system"
```

### Paso 3: Aplicar Migraciones

```bash
# Aplicar migraciones a la base de datos
pipenv run flask db upgrade
```

### Paso 4: Verificar Tablas Creadas

```bash
# Si usas SQLite, puedes verificar con:
sqlite3 travel_routes.db ".tables"

# Debes ver: users, routes, votes, alembic_version
```

---

## 🚀 5. INICIAR EL SERVIDOR

### Método 1: Usando Pipenv (Recomendado)

```bash
# Iniciar servidor en puerto 3001
pipenv run python src/app.py
```

### Método 2: Usando Flask CLI

```bash
# Con pipenv
pipenv run flask run --port=3001 --host=0.0.0.0 --debug

# Sin pipenv (si tienes el entorno activado)
flask run --port=3001 --host=0.0.0.0 --debug
```

### Método 3: Script Personalizado

```bash
# Usar el script del Pipfile
pipenv run start
```

---

## ✅ 6. VERIFICACIÓN DE LA INSTALACIÓN

### Paso 1: Verificar Servidor

```bash
# El servidor debería mostrar:
# * Running on http://0.0.0.0:3001
# * Debug mode: on
```

### Paso 2: Probar Endpoint de Salud

```bash
# En otra terminal o navegador:
curl http://localhost:3001/api/hello

# O abrir en navegador:
# http://localhost:3001/api/hello
```

### Respuesta Esperada:

```json
{
  "message": "Hello! Travel Routes API is working correctly",
  "endpoints": {
    "auth": ["/register", "/login", "/profile"],
    "routes": ["/routes", "/routes/<id>", "/routes/city/<city>", "/routes/top"],
    "votes": ["/votes", "/votes/route/<id>"],
    "external": ["/external/weather/<city>", "/external/geocode/<location>"],
    "admin": ["/admin/users", "/admin/routes", "/admin/stats"]
  }
}
```

---

## 🗃️ 7. CONFIGURACIÓN DE BASE DE DATOS AVANZADA

### Para PostgreSQL (Producción):

#### Instalar PostgreSQL

```bash
# macOS con Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Crear usuario y base de datos
sudo -u postgres psql
CREATE USER victormorenocabello WITH PASSWORD 'mi_password';
CREATE DATABASE travel_routes_db OWNER victormorenocabello;
GRANT ALL PRIVILEGES ON DATABASE travel_routes_db TO victormorenocabello;
\q
```

#### Actualizar .env para PostgreSQL:

```env
DATABASE_URL=postgresql://victormorenocabello:mi_password@localhost:5432/travel_routes_db
```

---

## 🔧 8. COMANDOS ÚTILES DE DESARROLLO

### Gestión de Base de Datos

```bash
# Resetear base de datos (CUIDADO: Borra todos los datos)
pipenv run flask db downgrade
pipenv run flask db upgrade

# Ver historial de migraciones
pipenv run flask db history

# Crear migración específica
pipenv run flask db migrate -m "Add new column to votes table"
```

### Desarrollo y Debug

```bash
# Iniciar con logs detallados
FLASK_DEBUG=1 pipenv run python src/app.py

# Ver rutas disponibles
pipenv run flask routes

# Shell interactivo con contexto de la app
pipenv run flask shell
```

### Comandos Personalizados del Proyecto

```bash
# Comandos disponibles en Pipfile
pipenv run start      # Iniciar servidor
pipenv run migrate    # Crear migración
pipenv run upgrade    # Aplicar migraciones
pipenv run init       # Inicializar BD
pipenv run reset_db   # Resetear BD completa
```

---

## 🔍 9. RESOLUCIÓN DE PROBLEMAS COMUNES

### Error: "No module named 'flask'"

```bash
# Verificar que estás en el entorno virtual
pipenv shell
# O reinstalar dependencias
pipenv install
```

### Error: "Database does not exist"

```bash
# Aplicar migraciones
pipenv run flask db upgrade

# Si persiste, resetear BD:
rm -f travel_routes.db  # Solo para SQLite
pipenv run flask db upgrade
```

### Error: Puerto 3001 ocupado

```bash
# Ver qué proceso usa el puerto
lsof -i :3001

# Cambiar puerto en .env
PORT=3002
FLASK_RUN_PORT=3002
```

### Error: "ImportError: cannot import name 'db'"

```bash
# Verificar que src/app.py existe
ls src/app.py

# Verificar FLASK_APP en .env
echo $FLASK_APP
# Debe ser: src/app.py
```

---

## 🧪 10. DATOS DE PRUEBA (Opcional)

### Crear Usuario Admin de Prueba

```python
# En pipenv run flask shell:
from api.models import db, User, UserRole
from flask_bcrypt import generate_password_hash

admin_user = User(
    name="Admin User",
    email="admin@test.com",
    password_hash=generate_password_hash("admin123").decode('utf-8'),
    role=UserRole.ADMIN
)

db.session.add(admin_user)
db.session.commit()
print("Usuario admin creado: admin@test.com / admin123")
```

---

## 📋 11. CHECKLIST DE VERIFICACIÓN FINAL

- [ ] ✅ Python 3.8+ instalado
- [ ] ✅ Pipenv instalado y funcionando
- [ ] ✅ Dependencias instaladas (`pipenv install`)
- [ ] ✅ Archivo .env configurado correctamente
- [ ] ✅ Base de datos inicializada (`pipenv run flask db upgrade`)
- [ ] ✅ Servidor iniciado (`pipenv run python src/app.py`)
- [ ] ✅ Endpoint /api/hello responde correctamente
- [ ] ✅ Puerto 3001 disponible y funcionando
- [ ] ✅ Logs del servidor sin errores críticos

---

## 🎯 COMANDOS RÁPIDOS PARA INICIAR

### Inicio Rápido (Todo en uno):

```bash
# Navegar al proyecto
cd "/Users/victormorenocabello/Desktop/Proyectos Cursos y Mas/PROYECTO FINAL DE 4GEEK/final-project-egor-victor"

# Instalar dependencias
pipenv install

# Aplicar migraciones
pipenv run flask db upgrade

# Iniciar servidor
pipenv run python src/app.py
```

### Verificar que todo funciona:

```bash
# En otra terminal:
curl http://localhost:3001/api/hello
```

# PARA INICIAR SQLITE

## 1. Eliminar migraciones existentes
rm -rf migrations/

## 2. Inicializar migraciones
pipenv run flask db init

## 3. Crear primera migración
pipenv run flask db migrate -m "Initial migration"

## 4. Aplicar migración
pipenv run flask db upgrade

## 5. Ejecutar servidor
pipenv run flask run

