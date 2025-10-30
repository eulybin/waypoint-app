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
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./CreateRouteMap.css";

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
          <AlertCircle size={48} className="text-warning mb-3" />
          <h5 className="fw-bold">No hay POIs con coordenadas válidas</h5>
          <p className="text-muted">
            Los puntos de interés de esta categoría no tienen información de
            ubicación disponible.
            <br />
            Prueba con otra categoría o ciudad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative rounded-3 overflow-hidden shadow">
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
          <Polyline
            positions={routeCoordinates}
            color="#1427fdff"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
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

            return (
              <Marker
                key={poi.id}
                position={[poi.lat, poi.lon]}
                icon={getMarkerIcon(poi.type, isSelected)}
              >
                <Popup>
                  <div className="p-2" style={{ minWidth: "200px" }}>
                    {/* Nombre del POI */}
                    <h6 className="fw-bold mb-2 text-truncate">{poi.name}</h6>

                    {/* Tipo */}
                    <div className="mb-2">
                      <span className="badge bg-secondary">{poi.type}</span>
                    </div>

                    {/* Dirección */}
                    {poi.address && (
                      <p className="small text-muted mb-2">📍 {poi.address}</p>
                    )}

                    {/* Botón de selección */}
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
                          Seleccionado
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Agregar a Ruta
                        </>
                      )}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Overlay de información */}
      {validPOIs.length > 0 && (
        <div
          className="position-absolute top-0 end-0 m-3 bg-white rounded-3 shadow p-3"
          style={{ zIndex: 1000 }}
        >
          <div className="d-flex align-items-center gap-2">
            <MapPin size={20} className="text-primary" />
            <div>
              <div className="fw-bold">{validPOIs.length} POIs disponibles</div>
              <div className="small text-success">
                {selectedPOIs.length} seleccionados
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
            <AlertCircle size={16} className="text-dark mt-1 flex-shrink-0" />
            <div className="small text-dark">
              {pois.length - validPOIs.length} POI(s) sin coordenadas válidas no
              se muestran en el mapa
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRouteMap;
