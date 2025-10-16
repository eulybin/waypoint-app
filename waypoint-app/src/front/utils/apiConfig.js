// ============================================================================
// CONFIGURACIÓN CENTRAL DE LA API
// ============================================================================
// Este archivo centraliza todas las URLs del backend para evitar repetición
// y facilitar cambios (desarrollo, producción, etc.)

// URL base del backend - Se obtiene de variable de entorno o usa localhost
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:3001';

// ============================================================================
// ENDPOINTS DE LA API - Organizados por funcionalidad
// ============================================================================
export const API_ENDPOINTS = {
  // ========== AUTENTICACIÓN ==========
  REGISTER: `${API_BASE_URL}/api/register`,
  LOGIN: `${API_BASE_URL}/api/login`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  CREATE_ADMIN: `${API_BASE_URL}/api/create-admin`,

  // ========== RUTAS TURÍSTICAS ==========
  ROUTES: `${API_BASE_URL}/api/routes`,
  // Funciones para endpoints dinámicos (con parámetros)
  ROUTE_DETAIL: (id) => `${API_BASE_URL}/api/routes/${id}`,
  ROUTES_BY_CITY: (city) => `${API_BASE_URL}/api/routes/city/${city}`,
  ROUTES_BY_USER: (userId) => `${API_BASE_URL}/api/routes/user/${userId}`,
  TOP_ROUTES: `${API_BASE_URL}/api/routes/top`,

  // ========== SISTEMA DE VOTOS ==========
  VOTES: `${API_BASE_URL}/api/votes`,
  ROUTE_VOTES: (routeId) => `${API_BASE_URL}/api/votes/route/${routeId}`,
  USER_VOTES: (userId) => `${API_BASE_URL}/api/votes/user/${userId}`,

  // ========== APIs EXTERNAS ==========
  WEATHER: (city) => `${API_BASE_URL}/api/external/weather/${city}`,
  GEOCODE: (location) => `${API_BASE_URL}/api/external/geocode/${location}`,

  // ========== ADMINISTRACIÓN (solo admins) ==========
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_ROUTES: `${API_BASE_URL}/api/admin/routes`,
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_DELETE_USER: (userId) => `${API_BASE_URL}/api/admin/users/${userId}`,

  // ========== REPORTES ==========
  REPORT: `${API_BASE_URL}/api/report`,
};

// ============================================================================
// HELPER: Obtener headers con token JWT
// ============================================================================
// Esta función se usa en TODAS las peticiones que requieren autenticación
// Automáticamente agrega el token JWT del localStorage a los headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
