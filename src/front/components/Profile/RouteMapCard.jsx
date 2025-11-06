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
import { STANDARD_ICON_SIZE } from "../../utils/constants";

// Fix for default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const RouteMapCard = ({ route, type = "created", onDelete }) => {
  // type can be "created", "favorite" or "detail"
  const lineColor = "blue"; // All routes in blue
  const typeLabel =
    type === "created"
      ? "Created Route"
      : type === "favorite"
        ? "Favorite Route"
        : "Route Details";
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllPOIs, setShowAllPOIs] = useState(false); // ← NEW STATE to expand POIs
  // New state for coordinates with street-calculated route
  const [useStreetRouting, setUseStreetRouting] = useState(false); // Toggle to activate/deactivate routing
  const [streetRoute, setStreetRoute] = useState(null); // Stores street-calculated route
  const [routeInfo, setRouteInfo] = useState(null); // Stores duration and distance
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false); // Loading state
  const [transportMode, setTransportMode] = useState("driving"); // 'driving' (car), 'foot' (walking) or 'bike' (bicycle)

  //EFFECT: Clear calculated route if coordinates change
  useEffect(() => {
    setStreetRoute(null);
    setRouteInfo(null);
    setUseStreetRouting(false);
    setTransportMode("driving");
  }, [route.id]); // Runs when route changes

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
      console.error("Error deleting route:", error);
      alert("Could not delete the route. Please try again.");
      setIsDeleting(false);
    }
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      // Opening fullscreen - activate street routing if not already active
      if (!useStreetRouting && !streetRoute && coordinates.length > 0) {
        setIsCalculatingRoute(true);
        try {
          const result = await getRouteFromOSRM(coordinates, transportMode);
          setStreetRoute(result.coordinates);
          setRouteInfo({ duration: result.duration, distance: result.distance });
          setUseStreetRouting(true);
        } catch (error) {
          console.error("Error calculating route:", error);
        } finally {
          setIsCalculatingRoute(false);
        }
      } else if (!useStreetRouting && streetRoute) {
        // If route already calculated, just activate it
        setUseStreetRouting(true);
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // New function to activate/deactivate street routing
  const toggleStreetRouting = async () => {
    // If already active, deactivate it (return to straight line)
    if (useStreetRouting) {
      setUseStreetRouting(false);
      return;
    }

    // If no calculated route, calculate it
    if (!streetRoute && coordinates.length > 0) {
      setIsCalculatingRoute(true);

      try {
        // Call OSRM service to calculate route with selected transport mode
        const result = await getRouteFromOSRM(coordinates, transportMode);
        setStreetRoute(result.coordinates); // Store calculated route
        setRouteInfo({ duration: result.duration, distance: result.distance }); // Store info
        setUseStreetRouting(true); // Activate routing mode
      } catch (error) {
        console.error("Error calculating route:", error);
        alert("Could not calculate street route");
      } finally {
        setIsCalculatingRoute(false);
      }
    } else {
      // If already calculated, just activate it
      setUseStreetRouting(true);
    }
  };

  // New function to change transport mode
  const handleTransportModeChange = async (newMode) => {
    if (newMode === transportMode) return; // Do nothing if already selected

    console.log(`🔄 Changing mode from ${transportMode} to ${newMode}`);
    setTransportMode(newMode);

    // If routing is active, recalculate with new mode
    if (useStreetRouting && coordinates.length > 0) {
      setIsCalculatingRoute(true);

      try {
        console.log(`📍 Calculating new route for mode: ${newMode}`);
        const result = await getRouteFromOSRM(coordinates, newMode);
        console.log(
          `✅ New route calculated with ${result.coordinates.length} points`
        );

        // Force update by clearing state first
        setStreetRoute(null);
        setRouteInfo(null);
        // Use setTimeout to ensure React detects the change
        setTimeout(() => {
          setStreetRoute(result.coordinates);
          setRouteInfo({
            duration: result.duration,
            distance: result.distance,
          });
        }, 0);
      } catch (error) {
        console.error("Error calculating route:", error);
        alert("Could not calculate street route");
      } finally {
        setIsCalculatingRoute(false);
      }
    }
  };

  // Function to format duration time
  const formatDuration = (seconds) => {
    if (!seconds) return null;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  };

  // Function to format distance
  const formatDistance = (meters) => {
    if (!meters) return null;

    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Function to extract route coordinates
  const getRouteCoordinates = () => {
    if (!route.coordinates) {
      console.log("Route without coordinates:", route.city);
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
      console.error("Error parsing coordinates:", e);
      return [];
    }
  };

  const coordinates = getRouteCoordinates();

  // Calculate map center based on route coordinates
  const calculateCenter = () => {
    if (coordinates.length === 0) {
      return [40.416775, -3.70379]; // Default center
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

  // If no coordinates, show a message
  if (coordinates.length === 0) {
    return (
      <div className={`${type === "detail" ? "col-12" : "col-md-6"} mb-4`}>
        <div className="card h-100 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="card-title mb-1">
                  <MapPin
                    size={STANDARD_ICON_SIZE}
                    className="me-2"
                    style={{ color: lineColor }}
                  />
                  {route.city}, {route.country}
                </h5>
                {route.locality && (
                  <p className="text-body small mb-2">{route.locality}</p>
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
                    type="button"
                    className="btn btn-danger btn-sm d-inline-flex align-items-center justify-content-center"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    title="Delete route"
                    style={{ width: 30, height: 30 }} // optional for consistent sizing
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
                This route has no saved coordinates. It was created before the
                system update.
              </small>
            </div>

            <div className="mb-3">
              <h6 className="text-body small mb-2">Points of Interest:</h6>
              <div className="d-flex flex-wrap gap-1">
                {/* Show 3 or all depending on state */}
                {(showAllPOIs
                  ? route.points_of_interest
                  : route.points_of_interest?.slice(0, 3)
                )?.map((poi, index) => (
                  <span key={index} className="badge bg-secondary-subtle text-body border">
                    {poi}
                  </span>
                ))}

                {/* Button to expand/collapse if more than 3 */}
                {route.points_of_interest?.length > 3 && (
                  <button
                    className="badge bg-primary text-white border-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowAllPOIs(!showAllPOIs)}
                  >
                    {showAllPOIs ? (
                      <>
                        <ChevronUp size={12} className="me-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} className="me-1" />+
                        {route.points_of_interest.length - 3} more
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* RATING SECTION - ALWAYS VISIBLE */}
            <div className="mb-3 p-3 border rounded">
              <h6 className="text-body small mb-2">Route rating:</h6>
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
                  <span className="text-body small ms-2">
                    ({route.total_votes || 0}{" "}
                    {(route.total_votes || 0) === 1 ? "vote" : "votes"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
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
                <h5 className="card-title mb-1 d-flex align-items-center">
                  <MapPin size={STANDARD_ICON_SIZE} className="me-2 text-body flex-shrink-0" />
                  <span>{route.city}, {route.country}</span>
                </h5>
                {route.locality && (
                  <p className="text-body small mb-2">{route.locality}</p>
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
                    title="Delete route"
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

            <div className="mb-2">
              <h6 className="text-body small mb-2">
                Points of Interest ({coordinates.length}):
              </h6>
              <div className="d-flex flex-wrap gap-1">
                {/* Show 3 or all depending on state */}
                {(showAllPOIs
                  ? route.points_of_interest
                  : route.points_of_interest?.slice(0, 3)
                )?.map((poi, index) => (
                  <span key={index} className="badge bg-secondary-subtle text-body border">
                    {poi}
                  </span>
                ))}

                {/* Button to expand/collapse if more than 3 */}
                {route.points_of_interest?.length > 3 && (
                  <button
                    className="badge bg-primary text-white border-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowAllPOIs(!showAllPOIs)}
                  >
                    {showAllPOIs ? (
                      <>
                        <ChevronUp size={12} className="me-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={12} className="me-1" />+
                        {route.points_of_interest.length - 3} more
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* RATING SECTION - ALWAYS VISIBLE */}
            <div className="mb-3 mt-3 p-3 border rounded">
              <h6 className="text-body small mb-2">Route rating:</h6>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={STANDARD_ICON_SIZE}
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
                  <span className="text-body small ms-2">
                    ({route.total_votes || 0}{" "}
                    {(route.total_votes || 0) === 1 ? "vote" : "votes"})
                  </span>
                </div>
              </div>
            </div>

            {/* Individual route map with fullscreen button */}
            <div
              style={{
                width: "100%",
                height: type === "detail" ? "600px" : "300px",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Fullscreen button */}
              <button
                onClick={toggleFullscreen}
                className="btn bg-body text-body border btn-sm shadow-sm"
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
                title="View fullscreen map"
              >
                <Maximize2 size={18} />
                <span className="small">Fullscreen</span>
              </button>

              {/* STREET ROUTING BUTTON - Below fullscreen button */}
              <button
                onClick={toggleStreetRouting}
                disabled={isCalculatingRoute || coordinates.length === 0}
                className={`btn btn-sm shadow-sm ${useStreetRouting ? "btn-success" : "bg-body text-body border"}`}
                style={{
                  position: "absolute",
                  top: "60px", // Below fullscreen button
                  right: "10px",
                  zIndex: 900,
                  borderRadius: "8px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                title={
                  useStreetRouting ? "View straight line" : "View street route"
                }
              >
                {isCalculatingRoute ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span className="small">Calculating...</span>
                  </>
                ) : (
                  <>
                    <RouteIcon size={18} />
                    <span className="small">
                      {useStreetRouting ? "Straight line" : "Street route"}
                    </span>
                  </>
                )}
              </button>

              {/* TRANSPORT MODE SELECTOR - Below routing button */}
              {useStreetRouting && (
                <div
                  style={{
                    position: "absolute",
                    top: "110px", // Below routing button
                    right: "10px",
                    zIndex: 900,
                    display: "flex",
                    flexDirection: "column", // Vertical to save space
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => handleTransportModeChange("driving")}
                    disabled={isCalculatingRoute}
                    className={`btn btn-sm shadow-sm ${transportMode === "driving" ? "btn-primary" : "bg-body text-body border"}`}
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    title="Car route"
                  >
                    <Car size={18} />
                    <span className="small">Car</span>
                  </button>

                  <button
                    onClick={() => handleTransportModeChange("foot")}
                    disabled={isCalculatingRoute}
                    className={`btn btn-sm shadow-sm ${transportMode === "foot" ? "btn-primary" : "bg-body text-body border"}`}
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    title="Walking route"
                  >
                    <Footprints size={18} />
                    <span className="small">Walking</span>
                  </button>

                  <button
                    onClick={() => handleTransportModeChange("bike")}
                    disabled={isCalculatingRoute}
                    className={`btn btn-sm shadow-sm ${transportMode === "bike" ? "btn-primary" : "bg-body text-body border"}`}
                    style={{
                      borderRadius: "8px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    title="Bike route"
                  >
                    <Bike size={18} />
                    <span className="small">Bike</span>
                  </button>
                </div>
              )}

              {/* ROUTE INFORMATION - Duration and distance */}
              {useStreetRouting && routeInfo && routeInfo.duration && (
                <div
                  className="bg-body text-body border shadow-sm"
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 900,
                    padding: "8px 16px",
                    borderRadius: "8px",
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
                    <Clock size={14} className="text-body" />
                    <span className="fw-medium" style={{ fontSize: "14px" }}>
                      {formatDuration(routeInfo.duration)}
                    </span>
                  </div>
                  <div
                    className="border-end"
                    style={{
                      width: "1px",
                      height: "16px",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <RouteIcon size={14} className="text-body" />
                    <span className="fw-medium" style={{ fontSize: "14px" }}>
                      {formatDistance(routeInfo.distance)}
                    </span>
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
                      <small>{coordinates.length} points of interest</small>
                    </div>
                  </Popup>
                </Polyline>
                {/* NUMBERED MARKERS */}
                <RouteMarkers
                  coordinates={coordinates}
                  color={lineColor}
                  pointsOfInterest={route.points_of_interest}
                />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Delete confirmation modal */}
        <DeleteRouteModal
          show={showDeleteModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          routeName={`${route.city}, ${route.country}`}
          isDeleting={isDeleting}
        />
      </div>

      {/* Fullscreen map modal */}
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
