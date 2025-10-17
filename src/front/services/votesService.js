import { API_ENDPOINTS, getAuthHeaders } from '../utils/apiConfig';

// POST: Votar por una ruta (1-5 estrellas)
// ============================================================================
// Parámetros:
// - routeId: ID de la ruta a votar
// - rating: número entre 1 y 5
// 
// Restricciones (implementadas en el backend):
// - No puedes votar por tu propia ruta
// - Solo puedes votar una vez por ruta (se actualiza si ya votaste)
export const voteRoute = async (routeId, rating, signal) => {
  try {
    // Validación local antes de enviar
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('El rating debe ser un número entre 1 y 5');
    }

    const response = await fetch(API_ENDPOINTS.VOTES, {
      method: 'POST',
      headers: getAuthHeaders(), // ← Requiere autenticación
      body: JSON.stringify({ 
        route_id: routeId, 
        rating: rating 
      }),
      signal,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo registrar el voto.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en voteRoute:', error);
    }
    throw error;
  }
};

// GET: Obtener los votos de una ruta 
// Retorna array con todos los votos, incluyendo:
// - usuario que votó
// - rating dado
// - fecha del voto
export const getRouteVotes = async (routeId, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.ROUTE_VOTES(routeId), { signal });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron obtener los votos de la ruta.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en getRouteVotes:', error);
    }
    throw error;
  }
};

// GET: Obtener votos de un usuario (requiere autenticación)
// ============================================================================
// Solo puedes ver tus propios votos (o todos si eres admin)
export const getUserVotes = async (userId, signal) => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_VOTES(userId), {
      headers: getAuthHeaders(), // ← Requiere autenticación
      signal,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron obtener los votos del usuario.');
    }
    
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error en getUserVotes:', error);
    }
    throw error;
  }
};