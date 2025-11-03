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

  // Favoritos
  ADD_FAVORITE: (routeId) => `${API_BASE_URL}/api/routes/${routeId}/favorite`,
  REMOVE_FAVORITE: (routeId) =>
    `${API_BASE_URL}/api/routes/${routeId}/favorite`,
  USER_FAVORITES: (userId) => `${API_BASE_URL}/api/users/${userId}/favorites`,

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
// SISTEMA DE CACHÉ EN MEMORIA
// ============================================================================
const cache = {
  locations: new Map(),
  pois: new Map(),
  images: new Map(),
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (aumentado de 5)

// Sistema de control de peticiones para evitar rate limiting
let lastOverpassRequest = 0;
const MIN_OVERPASS_INTERVAL = 2000; // 2 segundos mínimo entre peticiones

const getCacheKey = (prefix, ...args) => {
  return `${prefix}_${args.join("_")}`;
};

const getFromCache = (key) => {
  const cached =
    cache.locations.get(key) || cache.pois.get(key) || cache.images.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.locations.delete(key);
    cache.pois.delete(key);
    cache.images.delete(key);
    return null;
  }

  console.log(`✅ Usando caché para: ${key.split("_")[0]}`);
  return cached.data;
};

const setInCache = (key, data, type = "locations") => {
  cache[type].set(key, {
    data,
    timestamp: Date.now(),
  });
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

  // Verificar caché
  const cacheKey = getCacheKey("location", query, countryCode, type, limit);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log("✅ Ubicaciones desde caché:", query);
    return cached;
  }

  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: 1,
    limit: limit,
    "accept-language": "es",
  });

  if (countryCode) {
    params.append("countrycodes", countryCode);
  }

  if (type) {
    params.append("featuretype", type);
  }

  try {
    // Añadir timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "WaypointApp/1.0",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Error fetching locations");
    }

    const data = await response.json();

    // Guardar en caché
    setInCache(cacheKey, data, "locations");

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Timeout buscando ubicaciones:", query);
    } else {
      console.error("Error searching locations:", error);
    }
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
    const fileName = wikimediaCommons
      .replace("File:", "")
      .replace("Category:", "");

    // Usar la API de Wikimedia para obtener la URL de la imagen
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
        fileName
      )}&prop=imageinfo&iiprop=url&format=json&origin=*`
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
      `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        title
      )}&prop=pageimages&format=json&pithumbsize=500&origin=*`
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
 * Versiones con caché de las funciones de imágenes
 */
const getWikimediaImageCached = async (wikimediaCommons) => {
  const cacheKey = getCacheKey("wikimedia", wikimediaCommons);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const imageUrl = await getWikimediaImage(wikimediaCommons);
  if (imageUrl) {
    setInCache(cacheKey, imageUrl, "images");
  }
  return imageUrl;
};

const getWikipediaImageCached = async (wikipediaTag) => {
  const cacheKey = getCacheKey("wikipedia", wikipediaTag);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const imageUrl = await getWikipediaImage(wikipediaTag);
  if (imageUrl) {
    setInCache(cacheKey, imageUrl, "images");
  }
  return imageUrl;
};

/**
 * Calcular centroide de un polígono o way
 */
const calculateCentroid = (nodes) => {
  if (!nodes || nodes.length === 0) return null;

  const validNodes = nodes.filter((n) => n.lat != null && n.lon != null);
  if (validNodes.length === 0) return null;

  const lat =
    validNodes.reduce((sum, node) => sum + node.lat, 0) / validNodes.length;
  const lon =
    validNodes.reduce((sum, node) => sum + node.lon, 0) / validNodes.length;

  return { lat, lon };
};
/**
 * Buscar puntos de interés con Overpass API (OpenStreetMap)
 * Usado para encontrar museos, restaurantes, monumentos, etc.
 */
export const searchPointsOfInterest = async (lat, lon, type, radius = 5000) => {
  // Verificar caché PRIMERO - Evita peticiones innecesarias
  const cacheKey = getCacheKey("poi", lat, lon, type, radius);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

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

  // Query OPTIMIZADA - Solo campos necesarios, timeout reducido
  const query = `
  [out:json][timeout:15];
  (
    node["${osmQuery.split("=")[0]}"="${osmQuery.split("=")[1]}"](around:${radius},${lat},${lon});
    way["${osmQuery.split("=")[0]}"="${osmQuery.split("=")[1]}"](around:${radius},${lat},${lon});
  );
  out center 50;
`;

  // Lista de servidores Overpass alternativos
  const overpassServers = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
  ];

  // CONTROL DE RATE LIMITING - Esperar entre peticiones
  const now = Date.now();
  const timeSinceLastRequest = now - lastOverpassRequest;
  if (timeSinceLastRequest < MIN_OVERPASS_INTERVAL) {
    const waitTime = MIN_OVERPASS_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Esperando ${waitTime}ms para evitar rate limiting...`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  lastOverpassRequest = Date.now();

  // Intentar con múltiples servidores si uno falla
  let lastError = null;
  for (
    let serverIndex = 0;
    serverIndex < overpassServers.length;
    serverIndex++
  ) {
    const server = overpassServers[serverIndex];

    try {
      console.log(
        `🌐 Intentando servidor ${serverIndex + 1}/${overpassServers.length}: ${server}`
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 segundos

      const response = await fetch(server, {
        method: "POST",
        body: query,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429) {
        console.warn(
          `⚠️ Rate limit en servidor ${serverIndex + 1}, probando siguiente...`
        );
        lastError = new Error(`Rate limit (429)`);
        // Esperar más tiempo antes del siguiente intento
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Procesamiento OPTIMIZADO
      const pois = data.elements
        .filter((el) => el.tags && el.tags.name)
        .map((el) => {
          let poiLat = null;
          let poiLon = null;

          if (el.lat != null && el.lon != null) {
            poiLat = el.lat;
            poiLon = el.lon;
          } else if (el.center?.lat != null && el.center?.lon != null) {
            poiLat = el.center.lat;
            poiLon = el.center.lon;
          } else if (el.bounds) {
            poiLat = (el.bounds.minlat + el.bounds.maxlat) / 2;
            poiLon = (el.bounds.minlon + el.bounds.maxlon) / 2;
          }

          return {
            id: el.id,
            name: el.tags.name,
            type: el.tags[osmQuery.split("=")[0]],
            lat: poiLat,
            lon: poiLon,
            address: el.tags["addr:street"] || "",
            city: el.tags["addr:city"] || "",
            wikimedia: el.tags["wikimedia_commons"] || null,
            wikipedia: el.tags["wikipedia"] || null,
            image: null,
          };
        })
        .filter((poi) => poi.lat != null && poi.lon != null)
        .slice(0, 50);

      console.log(`✅ Encontrados ${pois.length} POIs de tipo "${type}"`);

      // Obtener imágenes SOLO para los primeros 8 (reducido para más velocidad)
      const poisWithImages = await Promise.all(
        pois.slice(0, 8).map(async (poi) => {
          let imageUrl = null;

          if (poi.wikimedia) {
            imageUrl = await getWikimediaImageCached(poi.wikimedia);
          }

          if (!imageUrl && poi.wikipedia) {
            imageUrl = await getWikipediaImageCached(poi.wikipedia);
          }

          return { ...poi, image: imageUrl };
        })
      );

      const result = [...poisWithImages, ...pois.slice(8)];

      // Guardar en caché - IMPORTANTE
      setInCache(cacheKey, result, "pois");

      return result;
    } catch (error) {
      lastError = error;

      if (error.name === "AbortError") {
        console.error(`⏱️ Timeout en servidor ${serverIndex + 1}`);
      } else {
        console.error(
          `❌ Error en servidor ${serverIndex + 1}:`,
          error.message
        );
      }

      // Si no es el último servidor, continuar con el siguiente
      if (serverIndex < overpassServers.length - 1) {
        console.log(`🔄 Probando siguiente servidor...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  // Si todos los servidores fallaron
  console.error("❌ Todos los servidores Overpass fallaron");
  console.error("💡 Sugerencia: Espera 1-2 minutos antes de intentar de nuevo");

  // Retornar array vacío en lugar de lanzar error
  return [];
};
