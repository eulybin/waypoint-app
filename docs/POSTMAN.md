Guía para probar la API con Postman

Requisitos previos:
- Python 3.10+ (o la versión que uses con Pipenv)
- pipenv (opcional) o un entorno virtual
- Node (solo si quieres arrancar el frontend)

1) Preparar el entorno backend

- Crear y activar el entorno (usando pipenv):

```bash
pipenv install
pipenv shell
```

- Copiar el archivo .env.example (si existe) y configurar las variables necesarias, por ejemplo:

```bash
cp .env.example .env
# editar .env con DATABASE_URL y JWT_SECRET_KEY
```

- Migrar la DB (si usas sqlite o la DB configurada):

```bash
pipenv run migrate
pipenv run upgrade
```

- Ejecutar la app en local (por defecto usa puerto 3001):

```bash
pipenv run start
# o
python src/app.py
```

2) Importar la colección en Postman

- Abre Postman y selecciona Import > File y elige `docs/postman_collection.json`.
- Se importará una colección llamada "TravelRoutes API - Local".
- Variables importantes: `baseUrl` (por defecto `http://localhost:3001/api`) y `token` (vacía, se llenará tras login).

3) Flujo de prueba sugerido

- Register (POST /api/register): crear un usuario de prueba.
- Login (POST /api/login): obtener token. El test en la colección guardará `token` como variable de colección.
- Private (GET /api/private): usar Authorization: `Bearer {{token}}` para probar endpoint protegido.
- Get all routes (GET /api/routes): comprobar rutas públicas.

Notas:
- Si hay problemas con la conexión a la DB revisa `DATABASE_URL` en `.env`.
- Si estás usando Docker o un servicio remoto cambia `baseUrl` a la URL correspondiente.

Si quieres, puedo ejecutar localmente una verificación rápida (hacer requests a los endpoints) si me indicas que permita ejecutar comandos en el terminal. También puedo adaptar la colección si tus endpoints usan rutas o puertos diferentes.