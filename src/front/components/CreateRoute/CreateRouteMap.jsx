import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import {
  MapPin,
  Check,
  Plus,
  AlertCircle,
  Compass,
  Building2,
  UtensilsCrossed,
  Coffee,
  Beer,
  Trees,
  Landmark,
  Church,
  Hotel,
  Mountain,
  Loader,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./CreateRouteMap.css";
import { HEADER_ICON_SIZE } from "../../utils/constants";

// Fix para los iconos de Leaflet (problema conocido)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ============================================================================
// ICONOS PERSONALIZADOS POR CATEGORÍA Y ESTADO
// ============================================================================
// Mapeo de tipos a iconos de Lucide React
const iconComponentMap = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  bar: Beer,
  museum: Building2,
  park: Trees,
  monument: Landmark,
  church: Church,
  hotel: Hotel,
  attraction: Compass,
  viewpoint: Mountain,
};

// Mapeo de tipos a colores Bootstrap
const iconColorMap = {
  attraction: '#0d6efd',    // primary
  museum: '#0dcaf0',        // info
  restaurant: '#dc3545',    // danger
  cafe: '#ffc107',          // warning
  bar: '#198754',           // success
  park: '#198754',          // success
  monument: '#6c757d',      // secondary
  church: '#0dcaf0',        // info
  hotel: '#0d6efd',         // primary
  viewpoint: '#198754',     // success
};

const getMarkerIcon = (type, isSelected) => {
  const IconComponent = iconComponentMap[type] || Compass;
  const iconColor = iconColorMap[type] || '#0d6efd';

  // Si está seleccionado, mostrar chincheta roja
  if (isSelected) {
    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
          transform: scale(1.2);
          z-index: 1000;
        ">
          <!-- Chincheta roja -->
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                  fill="#dc3545" 
                  stroke="white" 
                  stroke-width="2"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
        </div>
      `,
      className: 'custom-marker-selected',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }

  // Si NO está seleccionado, mostrar icono de la categoría
  const iconSvg = ReactDOMServer.renderToString(
    <IconComponent size={20} strokeWidth={2.5} color="white" />
  );

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${iconColor};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        ${iconSvg}
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// ============================================================================
// COMPONENTE DE POPUP REUTILIZABLE
// ============================================================================
const POIPopupContent = ({ poi, isSelected, onPOIClick }) => (
  <div className="p-2" style={{ minWidth: "200px", paddingTop: "8px" }}>
    <h6 className="fw-bold mb-2" style={{
      paddingRight: "20px",
      wordWrap: "break-word",
      overflowWrap: "break-word"
    }}>
      {poi.name}
    </h6>

    <div className="mb-2">
      <span className="badge bg-secondary">
        {poi.type.charAt(0).toUpperCase() + poi.type.slice(1)}
      </span>
    </div>

    {poi.address && (
      <p className="small text-muted mb-2" style={{
        wordWrap: "break-word",
        overflowWrap: "break-word"
      }}>
        📍 {poi.address}
      </p>
    )}

    <button
      type="button"
      className={`btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2 ${isSelected ? "btn-success" : "btn-primary"
        }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPOIClick(poi);
      }}
    >
      {isSelected ? (
        <>
          <Check size={16} />
          Selected
        </>
      ) : (
        <>
          <Plus size={16} />
          Add to Route
        </>
      )}
    </button>
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const CreateRouteMap = ({
  center = [40.4168, -3.7038], // Madrid por defecto
  pois = [],
  selectedPOIs = [],
  onPOIClick,
  showRoute = true, // Mostrar líneas entre POIs seleccionados
}) => {
  // Si no hay centro válido, usar Madrid
  const mapCenter =
    center && center[0] && center[1] ? center : [40.4168, -3.7038];

  // Filtrar POIs con coordenadas válidas
  const validPOIs = pois.filter(
    (poi) =>
      poi &&
      poi.lat != null &&
      poi.lon != null &&
      !isNaN(poi.lat) &&
      !isNaN(poi.lon)
  );

  // Calcular coordenadas de la ruta (POIs seleccionados en orden con coordenadas válidas)
  const routeCoordinates = selectedPOIs
    .filter((poi) => poi && poi.lat != null && poi.lon != null)
    .map((poi) => [poi.lat, poi.lon]);

  // Si no hay POIs válidos, mostrar mensaje
  if (validPOIs.length === 0) {
    return (
      <div
        className="position-relative rounded-3 overflow-hidden shadow bg-light d-flex align-items-center justify-content-center"
        style={{ height: "600px" }}
      >
        <div className="text-center p-4">
          <Loader size={HEADER_ICON_SIZE} className="text-primary mb-3 animate-spin" />
          <h5 className="fw-bold text-dark">Loading Locations</h5>
          <p className="text-dark">
            Fetching available locations, please wait.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative overflow-hidden shadow-sm border rounded-3">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom={true}
      >
        {/* Capa del mapa */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Línea de la ruta (conecta POIs seleccionados) */}
        {showRoute && routeCoordinates.length > 1 && (
          <>
            {/* Línea de conexión entre POIs */}
            <Polyline
              positions={routeCoordinates}
              color="#0d6efd"
              weight={3}
              opacity={0.6}
            />

            {/* Puntos azules numerados en cada POI seleccionado */}
            {selectedPOIs
              .filter((poi) => poi && poi.lat != null && poi.lon != null)
              .map((poi, index) => (
                <Marker
                  key={`route-point-${poi.id}-${index}`}
                  position={[poi.lat, poi.lon]}
                  icon={L.divIcon({
                    html: `
              <div style="
                width: 20px;
                height: 20px;
                background-color: #0d6efd;
                border: 4px solid white;
                border-radius: 50%;
                box-shadow: 0 3px 8px rgba(0,0,0,0.5);
                position: relative;
                z-index: 2000 !important;
                cursor: pointer;
              ">
                <div style="
                  position: absolute;
                  top: -30px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: #0d6efd;
                  color: white;
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: bold;
                  white-space: nowrap;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  border: 2px solid white;
                ">
                  ${index + 1}
                </div>
              </div>
            `,
                    className: 'route-point-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })}
                  zIndexOffset={2000}
                >
                  <Popup closeButton={true}>
                    <POIPopupContent
                      poi={poi}
                      isSelected={true}
                      onPOIClick={onPOIClick}
                    />
                  </Popup>
                </Marker>
              ))}
          </>
        )}

        {/* Markers con clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `
                <div style="
                  background-color: #1c14fdff;
                  color: white;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  font-size: 16px;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">
                  ${count}
                </div>
              `,
              className: "custom-cluster-icon",
              iconSize: [90, 90],
            });
          }}
        >
          {validPOIs.map((poi) => {
            const isSelected = selectedPOIs.some((p) => p.id === poi.id);

            // Don't show POI marker if it's selected and route line is actually being displayed (2+ POIs)
            if (isSelected && showRoute && selectedPOIs.length > 1) {
              return null;
            }

            return (
              <Marker
                key={poi.id}
                position={[poi.lat, poi.lon]}
                icon={getMarkerIcon(poi.type, isSelected)}
              >
                <Popup closeButton={true}>
                  <POIPopupContent
                    poi={poi}
                    isSelected={isSelected}
                    onPOIClick={onPOIClick}
                  />
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Overlay de información */}
      {validPOIs.length > 0 && (
        <div
          className="position-absolute top-0 end-0 m-3 bg-white rounded-4 shadow p-3"
          style={{ zIndex: 1000 }}
        >
          <div className="d-flex align-items-center gap-2">
            <div>
              <div className="fw-bold text-dark">{validPOIs.length} Available Locations</div>
              <div className={`small ${selectedPOIs.length > 0 ? 'text-success' : 'text-danger'}`}>
                {selectedPOIs.length} selected
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advertencia de POIs inválidos */}
      {pois.length > validPOIs.length && (
        <div
          className="position-absolute bottom-0 start-0 m-3 bg-warning rounded-3 shadow p-2"
          style={{ zIndex: 1000, maxWidth: "300px" }}
        >
          <div className="d-flex align-items-start gap-2">
            <AlertCircle size={16} className="text-dark mt-1 shrink-0" />
            <div className="small text-dark">
              {pois.length - validPOIs.length} POI(s) without valid coordinates are
              not shown on the map
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRouteMap;
