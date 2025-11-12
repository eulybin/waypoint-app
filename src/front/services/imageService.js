/**
 * SERVICIO DE IMÁGENES - imageService.js
 *
 * Este servicio busca imágenes de lugares/POIs usando múltiples APIs:
 * 1. Wikimedia Commons (gratis, sin API key)
 * 2. Pexels (gratis con API key)
 * 3. Fallback a imagen por defecto
 */

// Configuración de Pexels
const PEXELS_API_KEY =
  "fwjjiDdjmn6wtQqEPjbhYFMosHmVgduy3xQtSfaZHjyoDrdlpSiKm2Rp";

// Imagen por defecto cuando no se encuentra nada
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400";

/**
 * Busca una imagen en Wikimedia Commons
 * @param {string} placeName - Nombre del lugar
 * @returns {Promise<string|null>} - URL de la imagen o null
 */
const searchWikimedia = async (placeName) => {
  try {
    console.log(`🔍 Buscando en Wikimedia: ${placeName}`);

    // API de Wikimedia para buscar imágenes
    const searchUrl =
      `https://commons.wikimedia.org/w/api.php?` +
      `action=query&` +
      `titles=${encodeURIComponent(placeName)}&` +
      `prop=pageimages&` +
      `format=json&` +
      `pithumbsize=400&` +
      `origin=*`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    // Extraer la imagen
    const pages = data.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0];
      if (page?.thumbnail?.source) {
        console.log(`✅ Imagen encontrada en Wikimedia`);
        return page.thumbnail.source;
      }
    }

    // Si no se encuentra con el nombre exacto, intentar búsqueda de texto
    const textSearchUrl =
      `https://commons.wikimedia.org/w/api.php?` +
      `action=query&` +
      `generator=search&` +
      `gsrsearch=${encodeURIComponent(placeName)}&` +
      `gsrnamespace=6&` +
      `gsrlimit=1&` +
      `prop=pageimages|imageinfo&` +
      `piprop=thumbnail&` +
      `pithumbsize=400&` +
      `iiprop=url&` +
      `format=json&` +
      `origin=*`;

    const textResponse = await fetch(textSearchUrl);
    const textData = await textResponse.json();

    const textPages = textData.query?.pages;
    if (textPages) {
      const textPage = Object.values(textPages)[0];
      if (textPage?.thumbnail?.source) {
        console.log(`✅ Imagen encontrada en Wikimedia (búsqueda texto)`);
        return textPage.thumbnail.source;
      }
    }

    console.log(`⚠️ No se encontró imagen en Wikimedia`);
    return null;
  } catch (error) {
    console.error("❌ Error en Wikimedia:", error);
    return null;
  }
};

/**
 * Busca una imagen en Pexels
 * @param {string} placeName - Nombre del lugar
 * @returns {Promise<string|null>} - URL de la imagen o null
 */
const searchPexels = async (placeName) => {
  try {
    // Si no hay API key configurada, saltar
    if (!PEXELS_API_KEY || PEXELS_API_KEY === "TU_API_KEY_DE_PEXELS") {
      console.log(`⚠️ Pexels API key no configurada, saltando...`);
      return null;
    }

    console.log(`🔍 Buscando en Pexels: ${placeName}`);

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(placeName)}&per_page=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      console.log(`✅ Imagen encontrada en Pexels`);
      // Retornamos la imagen mediana
      return data.photos[0].src.medium;
    }

    console.log(`⚠️ No se encontró imagen en Pexels`);
    return null;
  } catch (error) {
    console.error("❌ Error en Pexels:", error);
    return null;
  }
};

/**
 * Busca una imagen de un lugar usando múltiples fuentes
 * Orden: Wikimedia → Pexels → Default
 *
 * @param {string} placeName - Nombre del lugar/POI
 * @returns {Promise<string>} - URL de la imagen (siempre retorna algo)
 */
export const getPlaceImage = async (placeName) => {
  if (!placeName) {
    return DEFAULT_IMAGE;
  }

  console.log(`📸 Buscando imagen para: ${placeName}`);

  // 1. Intentar Wikimedia (gratis, buena cobertura de lugares famosos)
  const wikimediaImage = await searchWikimedia(placeName);
  if (wikimediaImage) {
    return wikimediaImage;
  }

  // 2. Intentar Pexels (fotos profesionales)
  const pexelsImage = await searchPexels(placeName);
  if (pexelsImage) {
    return pexelsImage;
  }

  // 3. Fallback a imagen por defecto
  console.log(`ℹ️ Usando imagen por defecto para: ${placeName}`);
  return DEFAULT_IMAGE;
}; /**
 * Busca múltiples imágenes en paralelo
 * @param {Array<string>} placeNames - Array de nombres de lugares
 * @returns {Promise<Array<string>>} - Array de URLs de imágenes
 */
export const getMultiplePlaceImages = async (placeNames) => {
  if (!placeNames || placeNames.length === 0) {
    return [];
  }

  console.log(`📸 Buscando ${placeNames.length} imágenes en paralelo...`);

  // Buscar todas las imágenes en paralelo
  const imagePromises = placeNames.map((name) => getPlaceImage(name));
  const images = await Promise.all(imagePromises);

  return images;
};
