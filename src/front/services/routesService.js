import { API_ENDPOINTS, getAuthHeaders } from '../utils/apiConfig';

// (GET) OBTENER RUTAS TODAS LAS RUTAS
export const getAllRoutes = async (signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTES, { signal });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron obtener las rutas.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en getAllRoutes:', error);
    }
    throw error;
  }
};

// GET: Obtener detalle de una ruta específica
export const getRouteDetail = async (routeId, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTE_DETAIL(routeId), { signal });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo obtener el detalle de la ruta.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en getRouteDetail:', error);
    }
    throw error;
  }
};

// POST: Crear una nueva ruta (requiere autenticación)

export const createRoute = async (routeData, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTES, {
      method: 'POST',
      headers: getAuthHeaders(), // ← Incluye el token JWT
      body: JSON.stringify(routeData),
      signal,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo crear la ruta.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en createRoute:', error);
    }
    throw error;
  }
};

// Parámetros esperados en routeData:
// {
//   country: string,
//   city: string,
//   locality: string (opcional),
//   points_of_interest: array de strings,
//   coordinates: object (opcional)
// }

// PUT: Actualizar una ruta existente (requiere autenticación)
// Solo el autor de la ruta puede actualizarla

export const updateRoute = async (routeId, routeData, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTE_DETAIL(routeId), {
      method: 'PUT',
      headers: getAuthHeaders(), // ← Incluye el token JWT
      body: JSON.stringify(routeData),
      signal,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo actualizar la ruta.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en updateRoute:', error);
    }
    throw error;
  }
};

// DELETE: Eliminar una ruta (requiere autenticación)
// Solo el autor de la ruta puede eliminarla

export const deleteRoute = async (routeId, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTE_DETAIL(routeId), {
      method: 'DELETE',
      headers: getAuthHeaders(), // ← Incluye el token JWT
      signal,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo eliminar la ruta.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en deleteRoute:', error);
    }
    throw error;
  }
};

// GET: Obtener rutas filtradas por ciudad

export const getRoutesByCity = async (city, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTES_BY_CITY(city), { signal });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron obtener las rutas de esta ciudad.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en getRoutesByCity:', error);
    }
    throw error;
  }
};

// GET: Obtener rutas de un usuario específico

export const getRoutesByUser = async (userId, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTES_BY_USER(userId), { signal });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron obtener las rutas del usuario.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en getRoutesByUser:', error);
    }
    throw error;
  }
};

// GET: Obtener las rutas mejor valoradas (top 10)

export const getTopRoutes = async (signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.TOP_ROUTES, { signal });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron obtener las mejores rutas.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en getTopRoutes:', error);
    }
    throw error;
  }
};

