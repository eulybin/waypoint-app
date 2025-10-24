/**
 * SERVICIO DE ROUTING - routingService.js
 *
 * Este servicio calcula rutas reales por calles usando OSRM (gratis)
 * OSRM = Open Source Routing Machine
 * Soporta diferentes modos de transporte: coche, caminando, bicicleta
 */

/**
 * Calcula una ruta por calles entre múltiples puntos
 *
 * @param {Array} coordinates - Array de coordenadas [[lat, lng], [lat, lng], ...]
 * @param {String} mode - Modo de transporte: 'driving' (coche), 'foot' (caminando), 'bike' (bicicleta)
 * @returns {Promise<Array>} - Ruta calculada o coordenadas originales si falla
 */
export const getRouteFromOSRM = async (coordinates, mode = "driving") => {
  try {
    // OSRM necesita formato lng,lat (al revés de Leaflet que usa lat,lng)
    const coordsString = coordinates
      .map((coord) => `${coord[1]},${coord[0]}`) // Invertimos a lng,lat
      .join(";");

    // Convertir el modo al formato correcto de OSRM
    // OSRM usa: 'driving', 'foot-walking', 'bike'
    const osrmMode = mode === "foot" ? "foot-walking" : mode;

    // URL de la API pública de OSRM con el modo de transporte seleccionado
    const url = `https://router.project-osrm.org/route/v1/${osrmMode}/${coordsString}?overview=full&geometries=geojson`;

    console.log(`🗺️ Calculando ruta por calles (${osrmMode})...`);
    console.log(`📍 URL: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    console.log(`📦 Respuesta OSRM:`, data);

    // Si todo va bien, OSRM devuelve code: 'Ok'
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      console.log(
        `✅ Ruta calculada con ${data.routes[0].geometry.coordinates.length} puntos`
      );

      // Extraemos la geometría y la convertimos de vuelta a [lat, lng]
      const geometry = data.routes[0].geometry.coordinates;
      return geometry.map((coord) => [coord[1], coord[0]]);
    }

    // Si falla, devolvemos las coordenadas originales (línea recta)
    console.warn(
      "⚠️ No se pudo calcular ruta, usando línea recta. Código:",
      data.code
    );
    return coordinates;
  } catch (error) {
    console.error("❌ Error al calcular ruta:", error);
    return coordinates; // Fallback a línea recta
  }
};
