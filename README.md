# Waypoint · Explora ciudades, crea rutas y comparte experiencias

Rutas turísticas interactivas con React + Vite en el frontend y Flask en el backend. Mapa con Leaflet, votos con estrellas, favoritos, clima y autenticación JWT.

[![Made with Flask](https://img.shields.io/badge/Flask-API-000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/) [![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=000)](https://react.dev/) [![Vite](https://img.shields.io/badge/Vite-4-646cff?logo=vite&logoColor=fff)](https://vitejs.dev/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-336791?logo=postgresql&logoColor=fff)](https://www.postgresql.org/) [![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=fff)](https://render.com)

---

## ✨ Características

- Mapa interactivo con Leaflet (react-leaflet) y clustering de marcadores.
- Creación de rutas con puntos de interés (POIs) y guardado de coordenadas.
- Sistema de votos con estrellas y favoritos por usuario.
- Autenticación con JWT (login, registro, perfil).
- Widget de clima y utilidades de geocodificación (Nominatim/Overpass).
- API REST en Flask con SQLAlchemy y migraciones (Alembic).
- Despliegue sencillo en Render con base de datos gestionada.

## 🧭 Arquitectura

- Frontend: React + Vite en `src/front`.
- Backend: Flask en `src/` con blueprints en `src/api`.
- Persistencia: PostgreSQL (Render) o SQLite local de respaldo.
- Servido en producción por Gunicorn, estáticos servidos desde `public/`.

Estructura parcial del proyecto:

```text
src/
  app.py                 # Configuración Flask, CORS, JWT y estáticos
  wsgi.py                # Entrada para Gunicorn
  api/
    routes/              # Endpoints REST (auth, rutas, votos, favoritos, etc.)
    models.py            # Modelos SQLAlchemy
    commands.py          # Comandos: seed, insert-test-data, reset-db...
front/
  pages/, components/, services/, hooks/, utils/
public/                  # Se genera desde Vite (dist → public en producción)
```

## ⚙️ Requisitos

- Python 3.10
- Node.js 20+
- Pipenv
- PostgreSQL (recomendado en producción) o SQLite local

## 🔑 Variables de entorno (backend)

Crea un archivo `.env` en la raíz con al menos:

```ini
FLASK_DEBUG=1
JWT_SECRET_KEY=tu_clave_segura
# Para Postgres local
# DATABASE_URL=postgresql://usuario:password@localhost:5432/waypoint
# Si no está definida, se usará SQLite (archivo waypoint.db)
```

Frontend (opcional):

- `VITE_BACKEND_URL` → URL del backend si el frontend se despliega por separado.
- Si no se define, el front usa automáticamente el mismo dominio del navegador (ideal cuando Flask sirve la SPA).

## 🚀 Ejecución local

### Backend

```bash
pipenv install
pipenv run upgrade   # aplica migraciones existentes
pipenv run start     # levanta Flask en http://127.0.0.1:3001
```

### Frontend (modo desarrollo con Vite)

```bash
npm install
npm run dev          # http://127.0.0.1:3000
```

### Semillas de datos (opcional)

```bash
pipenv run insert-test-data
# o comandos individuales
flask seed-routes
flask insert-test-users 5
```

> Nota: Si cambias modelos, usa `pipenv run migrate` y luego `pipenv run upgrade`.

## ☁️ Despliegue en Render

Este repo incluye `render.yaml` para desplegar con Blueprint:

1. En Render: New → Blueprint → selecciona este repo.
2. El blueprint creará:
   - Web Service (Python) con build `./render_build.sh` y start `gunicorn wsgi --chdir ./src/`.
   - Base de datos PostgreSQL y la enlazará como `DATABASE_URL`.
3. Variables sugeridas en el servicio:
   - `JWT_SECRET_KEY` (segura)
   - `FLASK_DEBUG=0` en producción
   - `PYTHON_VERSION=3.10.6` (ya en render.yaml)
4. Deploy. El script de build:
   - Construye el front (Vite) y mueve `dist/` a `public/`.
   - Instala dependencias con Pipenv.
   - Ejecuta migraciones (`flask db upgrade`).

Si prefieres front y back en servicios separados, define `VITE_BACKEND_URL` en el sitio estático con la URL del backend.

## 🔌 Endpoints principales (resumen)

- Auth: `/api/register`, `/api/login`, `/api/profile`
- Rutas: `/api/routes`, `/api/routes/<id>`, `/api/routes/city/<city>`
- Votos: `/api/votes`, `/api/votes/route/<routeId>`
- Favoritos: `/api/routes/<routeId>/favorite`
- Externas: `/api/external/weather/<city>`, `/api/external/geocode/<location>`

Consulta los blueprints en `src/api/routes/` para el detalle completo.

## 🧪 Utilidades de desarrollo

- Reset de DB: `flask reset-db`
- Crear admin: `flask create-admin "Nombre" email@dominio.com password`
- Scripts extra en `Pipfile` ([scripts] sección)

## 📚 Recursos

- Guía de backend: `docs/BACKEND_SETUP_GUIDE.md`
- Pruebas con Postman: `docs/POSTMAN_TESTING_GUIDE.md`

## 📄 Licencia

ISC. Consulta `package.json` para más detalles.

---

Hecho con ❤️ para explorar el mundo, una ruta a la vez.
