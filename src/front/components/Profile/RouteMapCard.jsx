
import { useState } from "react";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Star, Trash2 } from "lucide-react";
import DeleteRouteModal from "../Modals/DeleteRouteModal";

// Arreglo para el icono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const RouteMapCard = ({ route, type = "created", onDelete }) => {
  // type puede ser "created" o "favorite"
  const lineColor = type === "created" ? "blue" : "orange";
  const typeLabel = type === "created" ? "Ruta Creada" : "Ruta Favorita";
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(route.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error al eliminar la ruta:", error);
      alert("No se pudo eliminar la ruta. Por favor, intenta de nuevo.");
      setIsDeleting(false);
    }
  };

  // Función para extraer las coordenadas de la ruta
  const getRouteCoordinates = () => {
    if (!route.coordinates) {
      console.log("Ruta sin coordenadas:", route.city);
      return [];
    }

    try {
      let path;
      if (typeof route.coordinates === "string") {
        path = JSON.parse(route.coordinates);
      } else {
        path = route.coordinates;
      }

      if (Array.isArray(path) && path.length > 0) {
        const validPath = path.filter(
          (p) =>
            Array.isArray(p) &&
            p.length === 2 &&
            typeof p[0] === "number" &&
            typeof p[1] === "number" &&
            !isNaN(p[0]) &&
            !isNaN(p[1])
        );

        if (validPath.length > 0) {
          return validPath;
        }
      }
      return [];
    } catch (e) {
      console.error("Error al parsear coordenadas:", e);
      return [];
    }
  };

  const coordinates = getRouteCoordinates();

  // Calcular el centro del mapa basado en las coordenadas de la ruta
  const calculateCenter = () => {
    if (coordinates.length === 0) {
      return [40.416775, -3.70379]; // Centro por defecto
    }

    const avgLat =
      coordinates.reduce((sum, coord) => sum + coord[0], 0) /
      coordinates.length;
    const avgLon =
      coordinates.reduce((sum, coord) => sum + coord[1], 0) /
      coordinates.length;
    return [avgLat, avgLon];
  };

  const mapCenter = calculateCenter();

  // Si no hay coordenadas, mostrar un mensaje
  if (coordinates.length === 0) {
    return (
      <div className="col-md-6 mb-4">
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="card-title mb-1">
                  <MapPin
                    size={20}
                    className="me-2"
                    style={{ color: lineColor }}
                  />
                  {route.city}, {route.country}
                </h5>
                {route.locality && (
                  <p className="text-muted small mb-2">{route.locality}</p>
                )}
              </div>
              <div className="d-flex gap-2 align-items-center">
                <span
                  className={`badge ${type === "created" ? "bg-primary" : "bg-warning"}`}
                >
                  {typeLabel}
                </span>
                {onDelete && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    title="Eliminar ruta"
                  >
                    {isDeleting ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="alert alert-warning mb-3">
              <small>
                Esta ruta no tiene coordenadas guardadas. Fue creada antes de la
                actualización del sistema.
              </small>
            </div>

            <div className="mb-3">
              <h6 className="text-muted small mb-2">Puntos de Interés:</h6>
              <div className="d-flex flex-wrap gap-1">
                {route.points_of_interest?.map((poi, index) => (
                  <span key={index} className="badge bg-light text-dark border">
                    {poi}
                  </span>
                ))}
              </div>
            </div>

            {route.average_rating > 0 && (
              <div className="d-flex align-items-center gap-2">
                <Star size={16} className="text-warning" fill="currentColor" />
                <span className="small">
                  {route.average_rating.toFixed(1)} ({route.total_votes} votos)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        <DeleteRouteModal
          show={showDeleteModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          routeName={`${route.city}, ${route.country}`}
          isDeleting={isDeleting}
        />
      </div>
    );
  }

  return (
    <div className="col-md-6 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="card-title mb-1">
                <MapPin
                  size={20}
                  className="me-2"
                  style={{ color: lineColor }}
                />
                {route.city}, {route.country}
              </h5>
              {route.locality && (
                <p className="text-muted small mb-2">{route.locality}</p>
              )}
            </div>
            <div className="d-flex gap-2 align-items-center">
              <span
                className={`badge ${type === "created" ? "bg-primary" : "bg-warning"}`}
              >
                {typeLabel}
              </span>
              {onDelete && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  title="Eliminar ruta"
                >
                  {isDeleting ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mb-3">
            <h6 className="text-muted small mb-2">
              Puntos de Interés ({coordinates.length}):
            </h6>
            <div className="d-flex flex-wrap gap-1">
              {route.points_of_interest?.map((poi, index) => (
                <span key={index} className="badge bg-light text-dark border">
                  {poi}
                </span>
              ))}
            </div>
          </div>

          {route.average_rating > 0 && (
            <div className="d-flex align-items-center gap-2 mb-3">
              <Star size={16} className="text-warning" fill="currentColor" />
              <span className="small">
                {route.average_rating.toFixed(1)} ({route.total_votes} votos)
              </span>
            </div>
          )}

          {/* Mapa individual de la ruta */}
          <div
            style={{
              width: "100%",
              height: "300px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Polyline
                positions={coordinates}
                color={lineColor}
                weight={4}
                opacity={0.7}
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
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <DeleteRouteModal
        show={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        routeName={`${route.city}, ${route.country}`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default RouteMapCard;
