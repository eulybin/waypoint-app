import { useState, useEffect } from "react";

// COMPONENT: FullscreenMapModal
// Fullscreen modal for visualizing a route map
// Includes detailed information, ratings, and points of interest

import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import {
  MapPin,
  Star,
  X,
  Car,
  Footprints,
  Bike,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
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
  transportMode = "driving",
  onTransportModeChange,
  isCalculatingRoute = false,
  routeInfo = null,
}) => {
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  // Functions to format duration and distance
  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  const formatDistance = (meters) => {
    if (!meters) return null;
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

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
      onClick={(e) => {
        // Close when clicking on background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      {/* Fullscreen modal header */}
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
          <h4 className="mb-1" style={{ color: "#000" }}>
            <MapPin size={24} className="me-2" style={{ color: lineColor }} />
            {route.city}, {route.country}
          </h4>
          {route.locality && (
            <p className="mb-0" style={{ color: "#000", fontSize: "14px" }}>
              {route.locality}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="btn btn-outline-dark btn-lg"
          style={{ borderRadius: "8px" }}
        >
          <X size={24} className="me-2" />
          Close
        </button>
      </div>

      {/* Fullscreen map */}

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
            key={`fullscreen-${route.id}-${transportMode}-${useStreetRouting ? "street" : "direct"}`}
            positions={
              useStreetRouting && streetRoute ? streetRoute : coordinates
            }
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
                <small>{coordinates.length} points of interest</small>
              </div>
            </Popup>
          </Polyline>
          {/*NUMBERED MARKERS */}
          <RouteMarkers
            coordinates={coordinates}
            color={lineColor}
            pointsOfInterest={route.points_of_interest}
          />
        </MapContainer>

        {/* TRANSPORT MODE BUTTONS in fullscreen */}
        {useStreetRouting && onTransportModeChange && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <button
              onClick={() => onTransportModeChange("driving")}
              disabled={isCalculatingRoute}
              className={`btn btn-sm shadow-sm ${transportMode === "driving" ? "btn-primary" : "btn-light"}`}
              style={{
                borderRadius: "8px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Car route"
            >
              <Car size={18} />
              <span className="small">Car</span>
            </button>

            <button
              onClick={() => onTransportModeChange("foot")}
              disabled={isCalculatingRoute}
              className={`btn btn-sm shadow-sm ${transportMode === "foot" ? "btn-primary" : "btn-light"}`}
              style={{
                borderRadius: "8px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Walking route"
            >
              <Footprints size={18} />
              <span className="small">Walking</span>
            </button>

            <button
              onClick={() => onTransportModeChange("bike")}
              disabled={isCalculatingRoute}
              className={`btn btn-sm shadow-sm ${transportMode === "bike" ? "btn-primary" : "btn-light"}`}
              style={{
                borderRadius: "8px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Bike route"
            >
              <Bike size={18} />
              <span className="small">Bike</span>
            </button>
          </div>
        )}

        {/* ROUTE INFORMATION - Duration and distance in fullscreen */}
        {useStreetRouting && routeInfo && routeInfo.duration && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "12px 20px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={18} style={{ color: "#0d6efd" }} />
              <span style={{ fontSize: "16px", fontWeight: "600" }}>
                {formatDuration(routeInfo.duration)}
              </span>
            </div>
            <div
              style={{
                width: "1px",
                height: "20px",
                backgroundColor: "#dee2e6",
              }}
            />
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              {formatDistance(routeInfo.distance)}
            </div>
          </div>
        )}

        {/* Info overlay in fullscreen */}
        {showInfoPanel ? (
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
            {/* Panel header with integrated close button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0" style={{ color: "#000" }}>
                Route information
              </h6>
              <button
                onClick={() => setShowInfoPanel(false)}
                className="btn btn-sm btn-light"
                style={{
                  borderRadius: "6px",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Hide information"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="mb-2">
              <span className="badge bg-light text-dark border me-2">
                {coordinates.length} points of interest
              </span>
              <span
                className={`badge ${type === "created" ? "bg-primary" : "bg-warning"}`}
              >
                {typeLabel}
              </span>
              {useStreetRouting && (
                <span className="badge bg-success text-white ms-2">
                  {transportMode === "driving" ? (
                    <>
                      <Car size={14} className="me-1" />
                      By car
                    </>
                  ) : (
                    <>
                      <Footprints size={14} className="me-1" />
                      Walking
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Rating in fullscreen - ALWAYS VISIBLE */}
            <div className="mt-3 pt-3 border-top">
              <small className="d-block mb-2" style={{ color: "#000" }}>
                Rating:
              </small>
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
                <span className="fw-bold" style={{ color: "#000" }}>
                  {(route.average_rating || 0).toFixed(1)}
                </span>
                <span className="small" style={{ color: "#000" }}>
                  ({route.total_votes || 0}{" "}
                  {(route.total_votes || 0) === 1 ? "vote" : "votes"})
                </span>
              </div>
            </div>

            {/* Points of interest */}
            {route.points_of_interest &&
              route.points_of_interest.length > 0 && (
                <div className="mt-3">
                  <small className="d-block mb-2" style={{ color: "#000" }}>
                    Featured places:
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
        ) : (
          /* Small floating button to show panel when hidden */
          <button
            onClick={() => setShowInfoPanel(true)}
            className="btn btn-light shadow"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              zIndex: 1000,
              borderRadius: "8px",
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            title="Show information"
          >
            <ChevronUp size={18} />
            Show info
          </button>
        )}
      </div>
    </div>
  );
};

export default FullscreenMapModal;
