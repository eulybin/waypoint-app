import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPin,
  Star,
  Trash2,
  Maximize2,
  Route as RouteIcon,
  Car,
  Footprints,
  Bike,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import DeleteRouteModal from "../Modals/DeleteRouteModal";
import FullscreenMapModal from "../Modals/FullscreenMapModal";
import RouteMarkers from "./RouteMarkers";
import { getRouteFromOSRM } from "../../services/routingService";

// Arreglo para el icono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const RouteMapCard = ({ route, type = "created", onDelete }) => {
  // type puede ser "created", "favorite" o "detail"
  const lineColor = "blue"; // Todas las rutas en azul
  const typeLabel =
    type === "created"
      ? "Ruta Creada"
      : type === "favorite"
        ? "Ruta Favorita"
        : "Detalle de Ruta";
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllPOIs, setShowAllPOIs] = useState(false); // ← NUEVO ESTADO para expandir POIs
  // Nuevo estado para las coordenadas con ruta calculada por calles
  const [useStreetRouting, setUseStreetRouting] = useState(false); // Toggle para activar/desactivar routing
  const [streetRoute, setStreetRoute] = useState(null); // Guarda la ruta calculada por calles
  const [routeInfo, setRouteInfo] = useState(null); // Guarda duración y distancia
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false); // Loading state
  const [transportMode, setTransportMode] = useState("driving"); // 'driving' (coche), 'foot' (caminando) o 'bike' (bicicleta)

  //EFECTO: Limpiar ruta calculada si cambian las coordenadas
  useEffect(() => {
    setStreetRoute(null);
    setRouteInfo(null);
    setUseStreetRouting(false);
    setTransportMode("driving");
  }, [route.id]); // Se ejecuta cuando cambia la ruta

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Nueva función para activar/desactivar el routing por calles
  const toggleStreetRouting = async () => {
    // Si ya está activado, lo desactivamos (volver a línea recta)
    if (useStreetRouting) {
      setUseStreetRouting(false);
      return;
    }

    // Si no hay ruta calculada, la calculamos
    if (!streetRoute && coordinates.length > 0) {
      setIsCalculatingRoute(true);

      try {
        // Llamamos al servicio OSRM para calcular la ruta con el modo de transporte seleccionado
        const result = await getRouteFromOSRM(coordinates, transportMode);
        setStreetRoute(result.coordinates); // Guardamos la ruta calculada
        setRouteInfo({ duration: result.duration, distance: result.distance }); // Guardamos info
        setUseStreetRouting(true); // Activamos el modo routing
      } catch (error) {
        console.error("Error al calcular ruta:", error);
        alert("No se pudo calcular la ruta por calles");
      } finally {
        setIsCalculatingRoute(false);
      }
    } else {
      // Si ya está calculada, solo la activamos
      setUseStreetRouting(true);
    }
  };

  // Nueva función para cambiar el modo de transporte
  const handleTransportModeChange = async (newMode) => {
    if (newMode === transportMode) return; // No hacer nada si ya está seleccionado

    console.log(`🔄 Cambiando modo de ${transportMode} a ${newMode}`);
    setTransportMode(newMode);

    // Si el routing está activado, recalcular con el nuevo modo
    if (useStreetRouting && coordinates.length > 0) {
      setIsCalculatingRoute(true);

      try {
        console.log(`📍 Calculando nueva ruta para modo: ${newMode}`);
        const result = await getRouteFromOSRM(coordinates, newMode);
        console.log(
          `✅ Nueva ruta calculada con ${result.coordinates.length} puntos`
        );

        // Forzar actualización limpiando primero el estado
        setStreetRoute(null);
        setRouteInfo(null);
        // Usar setTimeout para asegurar que React detecte el cambio
        setTimeout(() => {
          setStreetRoute(result.coordinates);
          setRouteInfo({
            duration: result.duration,
            distance: result.distance,
          });
        }, 0);
      } catch (error) {
        console.error("Error al calcular ruta:", error);
        alert("No se pudo calcular la ruta por calles");
      } finally {
        setIsCalculatingRoute(false);
      }
    }
  };

  // Función para formatear el tiempo de duración
  const formatDuration = (seconds) => {
    if (!seconds) return null;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  // Función para formatear la distancia
  const formatDistance = (meters) => {
    if (!meters) return null;

    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
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
      <div className={`${type === "detail" ? "col-12" : "col-md-6"} mb-4`}>
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
                {/* Mostrar 3 o todos según el estado */}
                {(showAllPOIs
                  ? route.points_of_interest
                  : route.points_of_interest?.slice(0, 3)
                )?.map((poi, index) => (
                  <span key={index} className="badge bg-light text-dark border">
                    {poi}
                  </span>
                ))}

                {/* Botón para expandir/colapsar si hay más de 3 */}
                {route.points_of_interest?.length > 3 && (
                  <button
                    className="badge bg-primary text-white border-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowAllPOIs(!showAllPOIs)}
                  >
                    {showAllPOIs ? (
                      <>
                        <ChevronUp size={12} className="me-1" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} className="me-1" />+
                        {route.points_of_interest.length - 3} más
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* SECCIÓN DE PUNTUACIÓN - SIEMPRE VISIBLE */}
            <div className="mb-3 p-3">
              <h6 className="text-muted small mb-2">Puntuación de la ruta:</h6>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
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
                <div>
                  <span className="fw-bold fs-5">
                    {(route.average_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-muted small ms-2">
                    ({route.total_votes || 0}{" "}
                    {(route.total_votes || 0) === 1 ? "voto" : "votos"})
                  </span>
                </div>
              </div>
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
  }

  return (
    <>
      <div className={`${type === "detail" ? "col-12" : "col-md-6"} mb-4`}>
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
                {/* Mostrar 3 o todos según el estado */}
                {(showAllPOIs
                  ? route.points_of_interest
                  : route.points_of_interest?.slice(0, 3)
                )?.map((poi, index) => (
                  <span key={index} className="badge bg-light text-dark border">
                    {poi}
                  </span>
                ))}

                {/* Botón para expandir/colapsar si hay más de 3 */}
                {route.points_of_interest?.length > 3 && (
                  <button
                    className="badge bg-primary text-white border-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowAllPOIs(!showAllPOIs)}
                  >
                    {showAllPOIs ? (
                      <>
                        <ChevronUp size={12} className="me-1" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} className="me-1" />+
                        {route.points_of_interest.length - 3} más
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* SECCIÓN DE PUNTUACIÓN - SIEMPRE VISIBLE */}
            <div className="mb-3 p-3">
              <h6 className="text-muted small mb-2">Puntuación de la ruta:</h6>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
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
                <div>
                  <span className="fw-bold fs-5">
                    {(route.average_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-muted small ms-2">
                    ({route.total_votes || 0}{" "}
                    {(route.total_votes || 0) === 1 ? "voto" : "votos"})
                  </span>
                </div>
              </div>
            </div>

            {/* Mapa individual de la ruta con botón de pantalla completa */}
            <div
              style={{
                width: "100%",
                height: type === "detail" ? "600px" : "300px",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Botón de pantalla completa */}
              <button
                onClick={toggleFullscreen}
                className="btn btn-light btn-sm shadow-sm"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 900,
                  borderRadius: "8px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                title="Ver mapa a pantalla completa"
              >
                <Maximize2 size={18} />
                <span className="small">Pantalla completa</span>
              </button>

              {/* BOTÓN DE ROUTING POR CALLES - Debajo del de pantalla completa */}
              <button
                onClick={toggleStreetRouting}
                disabled={isCalculatingRoute || coordinates.length === 0}
                className={`btn btn-sm shadow-sm ${useStreetRouting ? "btn-success" : "btn-light"}`}
                style={{
                  position: "absolute",
                  top: "60px", // Debajo del botón de pantalla completa
                  right: "10px",
                  zIndex: 900,
                  borderRadius: "8px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                title={
                  useStreetRouting ? "Ver línea recta" : "Ver ruta por calles"
                }
              >
                {isCalculatingRoute ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span className="small">Calculando...</span>
                  </>
                ) : (
                  <>
                    <RouteIcon size={18} />
                    <span className="small">
                      {useStreetRouting ? "Línea recta" : "Ruta por calles"}
                    </span>
                  </>
                )}
              </button>

              {/* SELECTOR DE MODO DE TRANSPORTE - Debajo del botón de routing */}
              {useStreetRouting && (
                <div
                  style={{
                    position: "absolute",
                    top: "110px", // Debajo del botón de routing
                    right: "10px",
                    zIndex: 900,
                    display: "flex",
                    flexDirection: "column", // Vertical para no ocupar mucho espacio
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => handleTransportModeChange("driving")}
                    disabled={isCalculatingRoute}
                    className={`btn btn-sm shadow-sm ${transportMode === "driving" ? "btn-primary" : "btn-light"}`}
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    title="Ruta en coche"
                  >
                    <Car size={18} />
                    <span className="small">Coche</span>
                  </button>

                  <button
                    onClick={() => handleTransportModeChange("foot")}
                    disabled={isCalculatingRoute}
                    className={`btn btn-sm shadow-sm ${transportMode === "foot" ? "btn-primary" : "btn-light"}`}
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    title="Ruta caminando"
                  >
                    <Footprints size={18} />
                    <span className="small">Caminando</span>
                  </button>

                  <button
                    onClick={() => handleTransportModeChange("bike")}
                    disabled={isCalculatingRoute}
                    className={`btn btn-sm shadow-sm ${transportMode === "bike" ? "btn-primary" : "btn-light"}`}
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    title="Ruta en bicicleta"
                  >
                    <Bike size={18} />
                    <span className="small">Bicicleta</span>
                  </button>
                </div>
              )}

              {/* INFORMACIÓN DE LA RUTA - Duración y distancia */}
              {useStreetRouting && routeInfo && routeInfo.duration && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 900,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Clock size={16} style={{ color: "#0d6efd" }} />
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      {formatDuration(routeInfo.duration)}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "1px",
                      height: "16px",
                      backgroundColor: "#dee2e6",
                    }}
                  />
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {formatDistance(routeInfo.distance)}
                  </div>
                </div>
              )}

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
                  key={`${route.id}-${transportMode}-${useStreetRouting ? "street" : "direct"}`}
                  positions={
                    useStreetRouting && streetRoute ? streetRoute : coordinates
                  }
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
                {/* MARCADORES NUMERADOS */}
                <RouteMarkers
                  coordinates={coordinates}
                  color={lineColor}
                  pointsOfInterest={route.points_of_interest}
                />
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

      {/* Modal de mapa en pantalla completa */}
      <FullscreenMapModal
        show={isFullscreen}
        onClose={toggleFullscreen}
        route={route}
        coordinates={coordinates}
        mapCenter={mapCenter}
        lineColor={lineColor}
        typeLabel={typeLabel}
        type={type}
        useStreetRouting={useStreetRouting}
        streetRoute={streetRoute}
        transportMode={transportMode}
        onTransportModeChange={handleTransportModeChange}
        isCalculatingRoute={isCalculatingRoute}
        routeInfo={routeInfo}
      />
    </>
  );
};

export default RouteMapCard;
