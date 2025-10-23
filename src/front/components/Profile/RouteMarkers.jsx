/**
 * COMPONENTE: RouteMarkers
 * 
 * Renderiza los marcadores numerados en cada punto de interés (POI)
 * Cada marcador tiene un número y un popup con información
 */

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

/**
 * Crea un icono personalizado para cada marcador
 * 
 * @param {number} number - Número del punto (1, 2, 3...)
 * @param {string} color - Color del marcador ('blue' o 'orange')
 * @returns {L.DivIcon} - Icono de Leaflet
 */
const createNumberedIcon = (number, color) => {
    // Creamos un icono HTML personalizado con número
    return L.divIcon({
        className: 'custom-marker', // Clase CSS personalizada
        html: `
      <div style="
        background-color: ${color};
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${number}
      </div>
    `,
        iconSize: [30, 30], // Tamaño del icono
        iconAnchor: [15, 15], // Punto de anclaje (centro)
        popupAnchor: [0, -15], // Dónde aparece el popup
    });
};

/**
 * Componente que renderiza todos los marcadores de la ruta
 */
const RouteMarkers = ({ coordinates, color = "blue", pointsOfInterest = [] }) => {
    // Si no hay coordenadas, no renderizamos nada
    if (!coordinates || coordinates.length === 0) return null;

    return (
        <>
            {/* Mapeamos cada coordenada para crear un marcador */}
            {coordinates.map((coord, index) => (
                <Marker
                    key={`marker-${index}`}
                    position={coord} // [lat, lng]
                    icon={createNumberedIcon(index + 1, color)} // Número del 1 al N
                >
                    {/* Popup que aparece al hacer clic en el marcador */}
                    <Popup>
                        <div style={{ textAlign: 'center' }}>
                            <strong>Punto {index + 1}</strong>
                            <br />
                            {/* Si hay nombre del punto de interés, lo mostramos */}
                            {pointsOfInterest[index] && (
                                <>
                                    <small>{pointsOfInterest[index]}</small>
                                    <br />
                                </>
                            )}
                            <small className="text-muted">
                                {coord[0].toFixed(4)}, {coord[1].toFixed(4)}
                            </small>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

export default RouteMarkers;