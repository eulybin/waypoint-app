import { useState } from "react";
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
 * @returns {Promise<Object>} - Objeto con {coordinates, duration, distance} o coordenadas originales si falla
 */
export const getRouteFromOSRM = async (coordinates, mode = "driving") => {
  try {
    // OSRM necesita formato lng,lat (al revés de Leaflet que usa lat,lng)
    const coordsString = coordinates
      .map((coord) => `${coord[1]},${coord[0]}`) // Invertimos a lng,lat
      .join(";");

    // Usamos los servidores de OpenStreetMap.de para todos los modos
    // Todos son del mismo proveedor y funcionan de forma consistente
    let baseUrl, profile;

    if (mode === "foot") {
      // Modo a pie
      baseUrl = "https://routing.openstreetmap.de/routed-foot/route/v1";
      profile = "foot";
    } else if (mode === "bike") {
      // Modo bicicleta
      baseUrl = "https://routing.openstreetmap.de/routed-bike/route/v1";
      profile = "bike";
    } else {
      // Modo coche (driving) - CAMBIADO a OpenStreetMap.de
      baseUrl = "https://routing.openstreetmap.de/routed-car/route/v1";
      profile = "driving";
    }

    // URL completa de la API con el modo de transporte seleccionado
    const url = `${baseUrl}/${profile}/${coordsString}?overview=full&geometries=geojson`;

    console.log(`🗺️ Calculando ruta por calles (${mode})...`);
    console.log(`📍 Servidor: ${baseUrl}`);
    console.log(`📍 URL completa: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log(`📦 Respuesta OSRM (${mode}):`, data);

    // Si todo va bien, OSRM devuelve code: 'Ok'
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      console.log(
        `✅ Ruta ${mode} calculada con ${route.geometry.coordinates.length} puntos`
      );
      console.log(`⏱️ Duración: ${route.duration} segundos`);
      console.log(`📏 Distancia: ${route.distance} metros`);

      // Extraemos la geometría y la convertimos de vuelta a [lat, lng]
      const geometry = route.geometry.coordinates;
      const coordinates = geometry.map((coord) => [coord[1], coord[0]]);

      return {
        coordinates,
        duration: route.duration, // en segundos
        distance: route.distance, // en metros
      };
    }

    // Si falla, devolvemos las coordenadas originales (línea recta)
    console.warn(
      `⚠️ No se pudo calcular ruta en modo ${mode}, usando línea recta. Código:`,
      data.code
    );
    return { coordinates, duration: null, distance: null };
  } catch (error) {
    console.error(`❌ Error al calcular ruta en modo ${mode}:`, error);
    return { coordinates, duration: null, distance: null }; // Fallback a línea recta
  }
};
