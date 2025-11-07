/**
 * COMPONENT: RouteMarkers
 * 
 * Renders numbered markers at each point of interest (POI)
 * Each marker has a number and a popup with information
 */

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { CATEGORY_NAMES, getPOIColor } from "../../utils/categoryInfo";

/**
 * Creates a custom icon for each marker
 * 
 * @param {number} number - Point number (1, 2, 3...)
 * @param {string} color - Marker color ('blue' or 'orange')
 * @returns {L.DivIcon} - Leaflet icon
 */
const createNumberedIcon = (number, color) => {
    // Create a custom HTML icon with number
    return L.divIcon({
        className: 'custom-marker', // Custom CSS class
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
        iconSize: [30, 30], // Icon size
        iconAnchor: [15, 15], // Anchor point (center)
        popupAnchor: [0, -15], // Where the popup appears
    });
};

/**
 * Component that renders all route markers
 */
const RouteMarkers = ({ coordinates, color = "blue", pointsOfInterest = [], isFullscreen = false }) => {
    // If no coordinates, render nothing
    if (!coordinates || coordinates.length === 0) return null;

    // Popup size based on fullscreen or regular view
    const popupPadding = isFullscreen ? 'p-4' : 'p-3';
    const popupMinWidth = isFullscreen ? '180px' : '150px';
    const badgeFontSize = isFullscreen ? '0.8rem' : '0.7rem';
    const nameFontSize = isFullscreen ? '1rem' : '0.9rem';

    return (
        <>
            {/* Map each coordinate to create a marker */}
            {coordinates.map((coord, index) => (
                <Marker
                    key={`marker-${index}`}
                    position={coord} // [lat, lng]
                    icon={createNumberedIcon(index + 1, color)} // Number from 1 to N
                >
                    {/* Popup that appears when clicking the marker */}
                    <Popup>
                        <div className={`text-center ${popupPadding}`} style={{ minWidth: popupMinWidth }}>
                            {/* Show category if POI is an object with type */}
                            {pointsOfInterest[index]?.type && (
                                <>
                                    <span
                                        className={`badge bg-${getPOIColor(pointsOfInterest[index].type)} text-white mb-2`}
                                        style={{ fontSize: badgeFontSize }}
                                    >
                                        {CATEGORY_NAMES[pointsOfInterest[index].type] || pointsOfInterest[index].type}
                                    </span>
                                    <br />
                                </>
                            )}
                            {/* If there's a point of interest name, show it */}
                            {pointsOfInterest[index] && (
                                <>
                                    <strong style={{ fontSize: nameFontSize }}>
                                        {typeof pointsOfInterest[index] === 'string'
                                            ? pointsOfInterest[index]
                                            : pointsOfInterest[index].name}
                                    </strong>
                                </>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

export default RouteMarkers;