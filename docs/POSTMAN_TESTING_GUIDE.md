# 🧪 Guía Completa de Postman - Sistema de Rutas y Votación

## ⚙️ Configuración Inicial

### Variables de Postman
Crea estas variables en tu colección:
- `baseUrl` = `http://localhost:3001/api`
- `token` = (se llenará automáticamente)
- `adminToken` = (se llenará automáticamente)

### Configuración de Headers
Para todos los requests con Body JSON:
```
Content-Type: application/json
```

Para requests protegidos:
```
Authorization: Bearer {{token}}
```

---

## 🔐 1. REGISTRO Y AUTENTICACIÓN

### 📝 Registrar Usuario Normal

**Endpoint:** `POST /api/register`
```http
POST {{baseUrl}}/register
Content-Type: application/json

{
  "name": "Usuario Normal",
  "email": "usuario@test.com",
  "password": "123456"
}
```

**Respuesta esperada (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "name": "Usuario Normal",
    "email": "usuario@test.com",
    "role": "user",
    "is_active": true,
    "created_at": "2025-10-09T..."
  }
}
```

### 👑 Crear Usuario Administrador

**Endpoint:** `POST /api/create-admin`
```http
POST {{baseUrl}}/create-admin
Content-Type: application/json

{
  "name": "Admin Sistema",
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Respuesta esperada (201):**
```json
{
  "message": "Usuario ADMIN creado exitosamente",
  "user": {
    "id": 2,
    "name": "Admin Sistema", 
    "email": "admin@test.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-10-09T..."
  }
}
```

### 🚪 Login (Usuarios y Admins)

**Endpoint:** `POST /api/login`
```http
POST {{baseUrl}}/login
Content-Type: application/json

{
  "email": "usuario@test.com",
  "password": "123456"
}
```

**Script de Test (pestaña Tests):**
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.token) {
        pm.collectionVariables.set('token', body.token);
        console.log('Token guardado exitosamente');
    }
}
```

**Para Admin, guarda en variable separada:**
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.token) {
        pm.collectionVariables.set('adminToken', body.token);
        console.log('Token de admin guardado');
    }
}
```

### 👤 Ver Perfil

**Endpoint:** `GET /api/profile`
```http
GET {{baseUrl}}/profile
Authorization: Bearer {{token}}
```

---

## 🗺️ 2. GESTIÓN DE RUTAS TURÍSTICAS

### 📋 Listar Todas las Rutas

```http
GET {{baseUrl}}/routes
```

### ➕ Crear Nueva Ruta

```http
POST {{baseUrl}}/routes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "country": "España",
  "city": "Madrid",
  "locality": "Centro Histórico",
  "points_of_interest": [
    {
      "name": "Puerta del Sol",
      "description": "Plaza emblemática del centro de Madrid",
      "latitude": 40.4169473,
      "longitude": -3.7035285
    },
    {
      "name": "Plaza Mayor",
      "description": "Plaza histórica con arquitectura tradicional",
      "latitude": 40.4155556,
      "longitude": -3.7073334
    },
    {
      "name": "Palacio Real",
      "description": "Residencia oficial de la familia real española",
      "latitude": 40.4179543,
      "longitude": -3.7143545
    }
  ],
  "coordinates": {
    "center_lat": 40.4168,
    "center_lng": -3.7038
  }
}
```

### 👁️ Ver Ruta Específica

```http
GET {{baseUrl}}/routes/1
```

### ✏️ Actualizar Ruta

```http
PUT {{baseUrl}}/routes/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "country": "España",
  "city": "Madrid",
  "locality": "Centro - ACTUALIZADO",
  "points_of_interest": [
    {
      "name": "Puerta del Sol - NUEVA DESCRIPCIÓN",
      "description": "Plaza central completamente renovada",
      "latitude": 40.4169473,
      "longitude": -3.7035285
    }
  ]
}
```

### 🗑️ Eliminar Ruta

```http
DELETE {{baseUrl}}/routes/1
Authorization: Bearer {{token}}
```

### 🏙️ Rutas por Ciudad

```http
GET {{baseUrl}}/routes/city/Madrid
```

### 👤 Rutas de Usuario

```http
GET {{baseUrl}}/routes/user/1
```

### 🏆 Top Rutas (Mejor Calificadas)

```http
GET {{baseUrl}}/routes/top
```

---

## ⭐ 3. SISTEMA DE VOTACIÓN

### 🗳️ Votar por una Ruta (1-5 estrellas)

```http
POST {{baseUrl}}/votes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "route_id": 1,
  "rating": 5
}
```

**Validaciones automáticas:**
- ✅ Rating debe ser entre 1 y 5
- ✅ No puedes votar tu propia ruta
- ✅ Solo puedes votar una vez (o actualizar tu voto)

### 🔄 Actualizar Voto Existente

```http
POST {{baseUrl}}/votes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "route_id": 1,
  "rating": 3
}
```

### 📊 Ver Votos de una Ruta

```http
GET {{baseUrl}}/votes/route/1
```

### 📈 Ver Votos de Usuario

```http
GET {{baseUrl}}/votes/user/1
Authorization: Bearer {{token}}
```

---

## 🌍 4. SERVICIOS EXTERNOS

### 🗺️ Geocodificar Ubicación

```http
GET {{baseUrl}}/external/geocode/Madrid, España
```

```http
GET {{baseUrl}}/external/geocode/Plaza Mayor, Madrid
```

---

## 👑 5. FUNCIONES ADMINISTRATIVAS (Solo Admin)

### 📊 Estadísticas del Sistema

```http
GET {{baseUrl}}/admin/stats
Authorization: Bearer {{adminToken}}
```

**Respuesta esperada:**
```json
{
  "total_users": 5,
  "total_routes": 3,
  "total_votes": 8,
  "active_users": 5
}
```

### 👥 Ver Todos los Usuarios

```http
GET {{baseUrl}}/admin/users
Authorization: Bearer {{adminToken}}
```

### 🗺️ Ver Todas las Rutas (Admin)

```http
GET {{baseUrl}}/admin/routes
Authorization: Bearer {{adminToken}}
```

---

## 🔧 6. UTILIDADES

### 🩺 Health Check

```http
GET {{baseUrl}}/hello
```

### 📝 Reportar Problema

```http
POST {{baseUrl}}/report
Content-Type: application/x-www-form-urlencoded

description=Problema de prueba para testing
```

---

## 🧪 7. CASOS DE PRUEBA ESPECÍFICOS

### ✅ Casos Válidos

#### Registro y Login Exitoso
1. Crear usuario normal con `/register`
2. Crear admin con `/create-admin` 
3. Login de ambos usuarios
4. Verificar roles en `/profile`

#### Sistema de Votación
1. Usuario A crea ruta
2. Usuario B vota la ruta (rating: 1-5)
3. Verificar voto en `/votes/route/ID`
4. Usuario B actualiza su voto
5. Verificar cambio en la ruta

### ❌ Casos de Error

#### Votación - Rating Inválido
```http
POST {{baseUrl}}/votes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "route_id": 1,
  "rating": 0
}
```
**Error esperado:** `400 - "Rating debe ser entre 1 y 5"`

#### Votación - Sin Rating
```http
POST {{baseUrl}}/votes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "route_id": 1
}
```
**Error esperado:** `400 - "route_id y rating son requeridos"`

#### Votación - Propia Ruta
1. Usuario crea ruta
2. Mismo usuario intenta votar su ruta
**Error esperado:** `400 - "No puedes votar por tu propia ruta"`

#### Admin - Usuario Normal sin Permisos
```http
GET {{baseUrl}}/admin/stats
Authorization: Bearer {{token}}
```
**Error esperado:** `403 - "Acceso denegado"`

---

## 🎯 8. FLUJO COMPLETO DE PRUEBAS

### Paso 1: Configuración Inicial
1. ✅ Verificar servidor: `GET /hello`
2. ✅ Crear admin: `POST /create-admin`
3. ✅ Login admin: `POST /login` (guardar como adminToken)

### Paso 2: Usuarios y Rutas  
4. ✅ Crear usuario normal: `POST /register`
5. ✅ Login usuario: `POST /login` (guardar como token)
6. ✅ Usuario crea ruta: `POST /routes`
7. ✅ Verificar ruta: `GET /routes`

### Paso 3: Sistema de Votación
8. ✅ Crear segundo usuario: `POST /register`
9. ✅ Login segundo usuario: `POST /login`
10. ✅ Usuario 2 vota ruta: `POST /votes` (rating: 5)
11. ✅ Verificar voto: `GET /votes/route/1`
12. ✅ Usuario 2 cambia voto: `POST /votes` (rating: 3)
13. ✅ Verificar cambio: `GET /votes/route/1`

### Paso 4: Funciones Admin
14. ✅ Admin ve stats: `GET /admin/stats`
15. ✅ Admin ve usuarios: `GET /admin/users`
16. ✅ Admin ve rutas: `GET /admin/routes`

### Paso 5: Validaciones de Error
17. ❌ Usuario vota propia ruta (debe fallar)
18. ❌ Rating inválido: 0, 6, -1 (debe fallar)
19. ❌ Usuario normal accede admin (debe fallar)

---

## 📋 9. CONFIGURACIÓN POSTMAN PASO A PASO

### Headers Configuration
1. Abre Postman
2. Ve a Headers tab
3. Agrega: `Content-Type: application/json`
4. Para requests protegidos: `Authorization: Bearer {{token}}`

### Body Configuration
1. Selecciona "Body" tab
2. Marca "raw"
3. En dropdown selecciona "JSON"
4. Pega el JSON del ejemplo

### Variables Setup
1. Ve a Variables tab de tu collection
2. Crea variables:
   - `baseUrl`: `http://localhost:3001/api`
   - `token`: (vacío inicialmente)
   - `adminToken`: (vacío inicialmente)

### Test Scripts
Para automatizar el guardado de tokens, usa estos scripts en la pestaña "Tests":

**Para login normal:**
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.token) {
        pm.collectionVariables.set('token', body.token);
    }
}
```

**Para login admin:**
```javascript
if (pm.response.code === 200) {
    const body = pm.response.json();
    if (body.token) {
        pm.collectionVariables.set('adminToken', body.token);
    }
}
```

---

## ⚠️ 10. NOTAS IMPORTANTES

### Diferencias Clave
- 📝 **`/register`:** Solo usuarios normales (`role: "user"`)
- 👑 **`/create-admin`:** Solo administradores (`role: "admin"`)
- 🔐 **`/login`:** Mismo endpoint para ambos tipos

### Headers Críticos
- ✅ Siempre incluir `Content-Type: application/json`
- ✅ Tokens en formato `Bearer {{variable}}`
- ✅ Verificar que headers estén activados (checkbox)

### Troubleshooting
- **Error 415:** Falta `Content-Type: application/json`
- **Error 401:** Token faltante o inválido
- **Error 403:** Usuario sin permisos (no admin)
- **Error 500:** Problema de servidor (revisar logs)

### Orden Recomendado
1. Crear admin PRIMERO
2. Probar funciones admin
3. Crear usuarios normales
4. Probar sistema de votación
5. Validar casos de error

---

## 🚀 11. COMANDOS RÁPIDOS

### Crear Admin
```http
POST http://localhost:3001/api/create-admin
Content-Type: application/json

{"name": "Admin", "email": "admin@test.com", "password": "admin123"}
```

### Crear Usuario
```http
POST http://localhost:3001/api/register
Content-Type: application/json

{"name": "Usuario", "email": "user@test.com", "password": "123456"}
```

### Login
```http
POST http://localhost:3001/api/login
Content-Type: application/json

{"email": "admin@test.com", "password": "admin123"}
```

### Votar
```http
POST http://localhost:3001/api/votes
Authorization: Bearer TOKEN
Content-Type: application/json

{"route_id": 1, "rating": 5}
```

¡Con esta guía completa tienes todo lo necesario para probar exhaustivamente el sistema de rutas y votación! 🎉