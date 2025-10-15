// Configuración de la API Backend
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3001";

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  REGISTER: `${API_BASE_URL}/api/register`,
  LOGIN: `${API_BASE_URL}/api/login`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  CREATE_ADMIN: `${API_BASE_URL}/api/create-admin`,

  // Rutas
  ROUTES: `${API_BASE_URL}/api/routes`,
  ROUTE_DETAIL: (id) => `${API_BASE_URL}/api/routes/${id}`,
  ROUTES_BY_CITY: (city) => `${API_BASE_URL}/api/routes/city/${city}`,
  ROUTES_BY_USER: (userId) => `${API_BASE_URL}/api/routes/user/${userId}`,
  TOP_ROUTES: `${API_BASE_URL}/api/routes/top`,

  // Votos
  VOTES: `${API_BASE_URL}/api/votes`,
  ROUTE_VOTES: (routeId) => `${API_BASE_URL}/api/votes/route/${routeId}`,
  USER_VOTES: (userId) => `${API_BASE_URL}/api/votes/user/${userId}`,

  // APIs Externas
  WEATHER: (city) => `${API_BASE_URL}/api/external/weather/${city}`,
  GEOCODE: (location) => `${API_BASE_URL}/api/external/geocode/${location}`,

  // Admin
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_ROUTES: `${API_BASE_URL}/api/admin/routes`,
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_DELETE_USER: (userId) => `${API_BASE_URL}/api/admin/users/${userId}`,

  // Reportes
  REPORT: `${API_BASE_URL}/api/report`,
};

// Helper para obtener headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ============================================================================
// SERVICIOS DE AUTOCOMPLETADO - USANDO APIS REALES
// ============================================================================

/**
 * Buscar ubicaciones con Nominatim (OpenStreetMap)
 * Usado para autocompletar países, ciudades, localidades
 */
export const searchLocations = async (query, options = {}) => {
  const { countryCode, type, limit = 10 } = options;

  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: 1,
    limit: limit, // Usar el límite pasado como parámetro
    "accept-language": "es",
  });

  if (countryCode) {
    params.append("countrycodes", countryCode);
  }

  // Filtrar por tipo (country, city, town, etc.)
  if (type) {
    params.append("featuretype", type);
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "WaypointApp/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching locations");
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
};

/**
 * Buscar puntos de interés con Overpass API (OpenStreetMap)
 * Usado para encontrar museos, restaurantes, monumentos, etc.
 */
export const searchPointsOfInterest = async (lat, lon, type, radius = 5000) => {
  // Mapeo de tipos a tags de OSM
  const osmTags = {
    museum: "tourism=museum",
    restaurant: "amenity=restaurant",
    cafe: "amenity=cafe",
    bar: "amenity=bar",
    park: "leisure=park",
    monument: "historic=monument",
    church: "amenity=place_of_worship",
    hotel: "tourism=hotel",
    attraction: "tourism=attraction",
    viewpoint: "tourism=viewpoint",
  };

  const osmQuery = osmTags[type] || "tourism=attraction";

  // Query Overpass API
  const query = `
    [out:json][timeout:25];
    (
      node["${osmQuery.split("=")[0]}"="${
    osmQuery.split("=")[1]
  }"](around:${radius},${lat},${lon});
      way["${osmQuery.split("=")[0]}"="${
    osmQuery.split("=")[1]
  }"](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      throw new Error("Error fetching POIs");
    }

    const data = await response.json();

    // Procesar y formatear resultados
    return data.elements
      .filter((el) => el.tags && el.tags.name)
      .map((el) => ({
        id: el.id,
        name: el.tags.name,
        type: el.tags[osmQuery.split("=")[0]],
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        address: el.tags["addr:street"] || "",
        city: el.tags["addr:city"] || "",
      }))
      .slice(0, 50); // Limitar a 50 resultados
  } catch (error) {
    console.error("Error searching POIs:", error);
    return [];
  }
};
