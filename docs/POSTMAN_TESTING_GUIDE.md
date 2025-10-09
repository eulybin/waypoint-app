# 🧪 Guía Completa para Probar Endpoints en Postman

## 🔧 Configuración Postman

**URL Base:** `http://localhost:3001/api`

**Variables recomendadas:**

- `baseUrl` = `http://localhost:3001/api`
- `token` = (se obtendrá automáticamente al hacer login)

---

## 🔐 1. AUTENTICACIÓN

### Registrar Usuario

```
Método: POST
URL: http://localhost:3001/api/register
Headers: Content-Type: application/json
Body (raw JSON):
{
  "name": "Victor Test",
  "email": "victor@test.com",
  "password": "123456"
}
```

### Login

```
Método: POST
URL: http://localhost:3001/api/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "victor@test.com",
  "password": "123456"
}
```

**👆 IMPORTANTE:** Copia el `token` de la respuesta para usar en otros endpoints

### Ver Perfil

```
Método: GET
URL: http://localhost:3001/api/profile
Headers: Authorization: Bearer TU_TOKEN_AQUÍ
```

---

## 🗺️ 2. RUTAS TURÍSTICAS

### Crear Ruta

```
Método: POST
URL: http://localhost:3001/api/routes
Headers:
- Authorization: Bearer TU_TOKEN_AQUÍ
- Content-Type: application/json
Body (raw JSON):
{
  "country": "España",
  "city": "Madrid",
  "locality": "Centro",
  "points_of_interest": [
    {
      "name": "Puerta del Sol",
      "description": "Plaza central",
      "latitude": 40.4169473,
      "longitude": -3.7035285
    },
    {
      "name": "Plaza Mayor",
      "description": "Plaza histórica",
      "latitude": 40.4155556,
      "longitude": -3.7073334
    }
  ]
}
```

### Listar Todas las Rutas

```
Método: GET
URL: http://localhost:3001/api/routes
```

### Ver Ruta Específica

```
Método: GET
URL: http://localhost:3001/api/routes/1
```

### Actualizar Ruta

```
Método: PUT
URL: http://localhost:3001/api/routes/1
Headers:
- Authorization: Bearer TU_TOKEN_AQUÍ
- Content-Type: application/json
Body (raw JSON):
{
  "country": "España",
  "city": "Madrid",
  "locality": "Centro Histórico",
  "points_of_interest": [
    {
      "name": "Puerta del Sol ACTUALIZADA",
      "description": "Plaza central actualizada",
      "latitude": 40.4169473,
      "longitude": -3.7035285
    }
  ]
}
```

### Eliminar Ruta

```
Método: DELETE
URL: http://localhost:3001/api/routes/1
Headers: Authorization: Bearer TU_TOKEN_AQUÍ
```

### Rutas por Ciudad

```
Método: GET
URL: http://localhost:3001/api/routes/city/Madrid
```

### Rutas de Usuario

```
Método: GET
URL: http://localhost:3001/api/routes/user/1
```

### Top Rutas (Mejor Calificadas)

```
Método: GET
URL: http://localhost:3001/api/routes/top
```

---

## ⭐ 3. SISTEMA DE VOTACIÓN (PRINCIPAL)

### Votar por Ruta (1-5 estrellas)

```
Método: POST
URL: http://localhost:3001/api/votes
Headers:
- Authorization: Bearer TU_TOKEN_AQUÍ
- Content-Type: application/json
Body (raw JSON):
{
  "route_id": 1,
  "rating": 5
}
```

### Actualizar Voto Existente

```
Método: POST
URL: http://localhost:3001/api/votes
Headers:
- Authorization: Bearer TU_TOKEN_AQUÍ
- Content-Type: application/json
Body (raw JSON):
{
  "route_id": 1,
  "rating": 3
}
```

### Ver Votos de una Ruta

```
Método: GET
URL: http://localhost:3001/api/votes/route/1
```

### Ver Votos de Usuario

```
Método: GET
URL: http://localhost:3001/api/votes/user/1
Headers: Authorization: Bearer TU_TOKEN_AQUÍ
```

---

## 🌍 4. APIs EXTERNAS

### Geocodificar Ubicación

```
Método: GET
URL: http://localhost:3001/api/external/geocode/Madrid, España
```

### Geocodificar - Ejemplo 2

```
Método: GET
URL: http://localhost:3001/api/external/geocode/Plaza Mayor, Madrid
```

---

## 👑 5. ADMINISTRACIÓN (Solo Admin)

### Ver Todos los Usuarios

```
Método: GET
URL: http://localhost:3001/api/admin/users
Headers: Authorization: Bearer TOKEN_DE_ADMIN
```

### Ver Todas las Rutas (Admin)

```
Método: GET
URL: http://localhost:3001/api/admin/routes
Headers: Authorization: Bearer TOKEN_DE_ADMIN
```

### Estadísticas del Sistema

```
Método: GET
URL: http://localhost:3001/api/admin/stats
Headers: Authorization: Bearer TOKEN_DE_ADMIN
```

---

## 🔧 6. UTILIDADES

### Health Check

```
Método: GET
URL: http://localhost:3001/api/hello
```

### Reportar Problema

```
Método: POST
URL: http://localhost:3001/api/report
Headers: Content-Type: application/x-www-form-urlencoded
Body (form-data):
description: "Problema de prueba"
```

---

## 🧪 CASOS DE PRUEBA ESPECÍFICOS

### ❌ Error: Rating Inválido

```
Método: POST
URL: http://localhost:3001/api/votes
Body:
{
  "route_id": 1,
  "rating": 0
}
Resultado esperado: Error 400 "Rating debe ser entre 1 y 5"
```

### ❌ Error: Rating Fuera de Rango

```
Método: POST
URL: http://localhost:3001/api/votes
Body:
{
  "route_id": 1,
  "rating": 6
}
Resultado esperado: Error 400
```

### ❌ Error: Sin Rating

```
Método: POST
URL: http://localhost:3001/api/votes
Body:
{
  "route_id": 1
}
Resultado esperado: Error 400 "route_id y rating son requeridos"
```

### ❌ Error: Votar Propia Ruta

```
1. Usuario A crea una ruta
2. Usuario A intenta votar su propia ruta
Resultado esperado: Error 400 "No puedes votar por tu propia ruta"
```

### ❌ Error: Sin Token

```
Método: POST
URL: http://localhost:3001/api/votes
Headers: Content-Type: application/json (sin Authorization)
Body:
{
  "route_id": 1,
  "rating": 5
}
Resultado esperado: Error 401 "Token de autorización requerido"
```

---

## 🎯 FLUJO DE PRUEBAS COMPLETO

### Paso 1: Preparación

1. **POST /register** → Registra Usuario A
2. **POST /login** → Login Usuario A (guarda token)
3. **POST /routes** → Usuario A crea ruta (anota el ID de la ruta)

### Paso 2: Sistema de Votación

4. **POST /register** → Registra Usuario B
5. **POST /login** → Login Usuario B (guarda token)
6. **POST /votes** → Usuario B vota ruta de Usuario A con 5 estrellas ⭐
7. **GET /votes/route/1** → Ver votos de la ruta
8. **GET /routes** → Verificar que el rating promedio se calculó correctamente

### Paso 3: Actualización de Votos

9. **POST /votes** → Usuario B cambia su voto a 3 estrellas
10. **GET /votes/route/1** → Verificar que el voto se actualizó
11. **GET /routes** → Verificar que el rating promedio cambió

### Paso 4: Validaciones

12. **POST /votes** → Usuario A intenta votar su propia ruta (debe fallar)
13. **POST /votes** → Probar con rating 0 (debe fallar)
14. **POST /votes** → Probar con rating 6 (debe fallar)

---

## 📊 RESPUESTAS ESPERADAS

### Voto Exitoso

```json
{
  "message": "Voto registrado exitosamente"
}
```

### Actualizar Voto

```json
{
  "message": "Voto actualizado exitosamente"
}
```

### Error de Validación

```json
{
  "message": "Rating debe ser entre 1 y 5"
}
```

### Error de Permisos

```json
{
  "message": "No puedes votar por tu propia ruta"
}
```

### Ruta con Rating Calculado

```json
{
  "id": 1,
  "country": "España",
  "city": "Madrid",
  "average_rating": 4.0,
  "total_votes": 2,
  "author_name": "Victor Test",
  "created_at": "2025-10-09T..."
}
```

---

## 🚀 TIPS PARA POSTMAN

### Automatizar Token

En la pestaña **Tests** del request de login, agrega:

```javascript
if (pm.response.code === 200) {
  const body = pm.response.json();
  if (body.token) {
    pm.collectionVariables.set("token", body.token);
  }
}
```

### Usar Variables

En lugar de URLs hardcodeadas, usa:

- `{{baseUrl}}/votes`
- `Authorization: Bearer {{token}}`

### Organizar en Carpetas

1. 🔐 Autenticación
2. 🗺️ Rutas
3. ⭐ Votación
4. 🌍 Externas
5. 👑 Admin
6. 🧪 Tests

---

## ⚠️ NOTAS IMPORTANTES

1. **Puerto:** Asegúrate de que el servidor esté corriendo en puerto **3001**
2. **Token:** Siempre haz login antes de probar endpoints protegidos
3. **IDs:** Los IDs de rutas y usuarios son auto-incrementales (1, 2, 3...)
4. **Admin:** Para probar endpoints de admin necesitas un usuario con rol ADMIN
5. **Orden:** Sigue el flujo recomendado para evitar errores de dependencias

¡Con esta guía tienes todo lo necesario para probar completamente el sistema de votación! 🎉
