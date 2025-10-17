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
 * Obtener imagen de Wikimedia Commons
 */
const getWikimediaImage = async (wikimediaCommons) => {
  if (!wikimediaCommons) return null;

  try {
    // Extraer el nombre del archivo
    const fileName = wikimediaCommons.replace("File:", "").replace("Category:", "");
    
    // Usar la API de Wikimedia para obtener la URL de la imagen
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json&origin=*`
    );
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const imageUrl = pages[pageId]?.imageinfo?.[0]?.url;
      return imageUrl || null;
    }
  } catch (error) {
    console.error("Error fetching Wikimedia image:", error);
  }
  
  return null;
};

/**
 * Obtener imagen de Wikipedia
 */
const getWikipediaImage = async (wikipediaTag) => {
  if (!wikipediaTag) return null;

  try {
    const [lang, title] = wikipediaTag.split(":");
    if (!title) return null;

    const response = await fetch(
      `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500&origin=*`
    );
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const imageUrl = pages[pageId]?.thumbnail?.source;
      return imageUrl || null;
    }
  } catch (error) {
    console.error("Error fetching Wikipedia image:", error);
  }
  
  return null;
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
    const pois = data.elements
      .filter((el) => el.tags && el.tags.name)
      .map((el) => ({
        id: el.id,
        name: el.tags.name,
        type: el.tags[osmQuery.split("=")[0]],
        lat: el.lat || el.center?.lat,
        lon: el.lon || el.center?.lon,
        address: el.tags["addr:street"] || "",
        city: el.tags["addr:city"] || "",
        wikimedia: el.tags["wikimedia_commons"] || null,
        wikipedia: el.tags["wikipedia"] || null,
        image: null, // Se llenará después
      }))
      .slice(0, 50); // Limitar a 50 resultados

    // Obtener imágenes de Wikimedia/Wikipedia en paralelo (solo las primeras 20 para optimizar)
    const poisWithImages = await Promise.all(
      pois.slice(0, 20).map(async (poi) => {
        let imageUrl = null;
        
        // Intentar primero con Wikimedia Commons
        if (poi.wikimedia) {
          imageUrl = await getWikimediaImage(poi.wikimedia);
        }
        
        // Si no hay imagen, intentar con Wikipedia
        if (!imageUrl && poi.wikipedia) {
          imageUrl = await getWikipediaImage(poi.wikipedia);
        }
        
        return { ...poi, image: imageUrl };
      })
    );

    // Combinar POIs con imágenes y sin imágenes
    return [...poisWithImages, ...pois.slice(20)];
  } catch (error) {
    console.error("Error searching POIs:", error);
    return [];
  }
};
