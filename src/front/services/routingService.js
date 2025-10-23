/**
 * SERVICIO DE ROUTING - routingService.js
 * 
 * Este servicio calcula rutas reales por calles usando OSRM (gratis)
 * OSRM = Open Source Routing Machine
 */

/**
 * Calcula una ruta por calles entre múltiples puntos
 * 
 * @param {Array} coordinates - Array de coordenadas [[lat, lng], [lat, lng], ...]
 * @returns {Promise<Array>} - Ruta calculada o coordenadas originales si falla
 */
export const getRouteFromOSRM = async (coordinates) => {
    try {
        // OSRM necesita formato lng,lat (al revés de Leaflet que usa lat,lng)
        const coordsString = coordinates
            .map(coord => `${coord[1]},${coord[0]}`) // Invertimos a lng,lat
            .join(';');

        // URL de la API pública de OSRM
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

        console.log('🗺️ Calculando ruta por calles...');

        const response = await fetch(url);
        const data = await response.json();

        // Si todo va bien, OSRM devuelve code: 'Ok'
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            console.log('✅ Ruta calculada');

            // Extraemos la geometría y la convertimos de vuelta a [lat, lng]
            const geometry = data.routes[0].geometry.coordinates;
            return geometry.map(coord => [coord[1], coord[0]]);
        }

        // Si falla, devolvemos las coordenadas originales (línea recta)
        console.warn('⚠️ No se pudo calcular ruta, usando línea recta');
        return coordinates;

    } catch (error) {
        console.error('❌ Error:', error);
        return coordinates; // Fallback a línea recta
    }
};