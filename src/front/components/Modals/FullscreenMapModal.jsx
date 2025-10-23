// COMPONENTE: FullscreenMapModal
// Modal de pantalla completa para visualizar el mapa de una ruta
// Incluye información detallada, puntuación y puntos de interés

import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import { MapPin, Star, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import RouteMarkers from "../Profile/RouteMarkers";

const FullscreenMapModal = ({
  show,
  onClose,
  route,
  coordinates,
  mapCenter,
  lineColor,
  typeLabel,
  type,
  useStreetRouting = false,
  streetRoute = null,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
      onClick={(e) => {
        // Cerrar al hacer clic en el fondo
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Header del modal fullscreen */}
      <div
        style={{
          padding: "20px 30px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h4 className="mb-1">
            <MapPin size={24} className="me-2" style={{ color: lineColor }} />
            {route.city}, {route.country}
          </h4>
          {route.locality && (
            <p className="text-muted small mb-0">{route.locality}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="btn btn-outline-dark btn-lg"
          style={{ borderRadius: "8px" }}
        >
          <X size={24} className="me-2" />
          Cerrar
        </button>
      </div>

      {/* Mapa fullscreen */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Polyline
            positions={coordinates}
            color={lineColor}
            weight={5}
            opacity={0.8}
          >
            <Popup>
              <div>
                <strong>{typeLabel}</strong>
                <br />
                {route.city}, {route.country}
                <br />
                <small>{coordinates.length} puntos de interés</small>
              </div>
            </Popup>
          </Polyline>
          {/*MARCADORES NUMERADOS */}
          <RouteMarkers
            coordinates={coordinates}
            color={lineColor}
            pointsOfInterest={route.points_of_interest}
          />

        </MapContainer>

        {/* Info overlay en pantalla completa */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            maxWidth: "400px",
            zIndex: 1000,
          }}
        >
          <h6 className="mb-2">Información de la ruta</h6>
          <div className="mb-2">
            <span className="badge bg-light text-dark border me-2">
              {coordinates.length} puntos de interés
            </span>
            <span
              className={`badge ${type === "created" ? "bg-primary" : "bg-warning"}`}
            >
              {typeLabel}
            </span>
          </div>

          {/* Puntuación en fullscreen - SIEMPRE VISIBLE */}
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted d-block mb-2">Puntuación:</small>
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={
                      star <= Math.round(route.average_rating || 0)
                        ? "#ffc107"
                        : "none"
                    }
                    color={
                      star <= Math.round(route.average_rating || 0)
                        ? "#ffc107"
                        : "#6c757d"
                    }
                  />
                ))}
              </div>
              <span className="fw-bold">
                {(route.average_rating || 0).toFixed(1)}
              </span>
              <span className="text-muted small">
                ({route.total_votes || 0}{" "}
                {(route.total_votes || 0) === 1 ? "voto" : "votos"})
              </span>
            </div>
          </div>

          {/* Puntos de interés */}
          {route.points_of_interest && route.points_of_interest.length > 0 && (
            <div className="mt-3">
              <small className="text-muted d-block mb-2">
                Lugares destacados:
              </small>
              <div className="d-flex flex-wrap gap-1">
                {route.points_of_interest.map((poi, index) => (
                  <span
                    key={index}
                    className="badge bg-light text-dark border small"
                  >
                    {poi}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullscreenMapModal;
