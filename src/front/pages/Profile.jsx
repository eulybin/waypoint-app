import { useState, useEffect } from "react";

import useAuth from "../hooks/useAuth";
import { getRoutesByUser, deleteRoute } from "../services/routesService";
import { getUserFavorites, removeFavorite } from "../services/favoritesService";
import RouteMapCard from "../components/Profile/RouteMapCard";
import { Loader, MapPin, Heart, ChevronLeft, ChevronRight } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [createdRoutes, setCreatedRoutes] = useState([]);
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("created"); // "created" o "favorites"
  const [currentPageCreated, setCurrentPageCreated] = useState(1); // Página actual para rutas creadas
  const [currentPageFavorites, setCurrentPageFavorites] = useState(1); // Página actual para favoritas
  const ITEMS_PER_PAGE = 4; // 4 rutas por página

  const handleDeleteRoute = async (routeId) => {
    try {
      await deleteRoute(routeId);
      // Actualizar el estado para remover la ruta eliminada
      setCreatedRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route.id !== routeId)
      );
      // También removerla de favoritas si está ahí
      setFavoriteRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route.id !== routeId)
      );
    } catch (error) {
      console.error("Error al eliminar ruta:", error);
      throw error; // Propagar el error para que RouteMapCard lo maneje
    }
  };

  const handleDeleteRouteFavorite = async (routeId) => {
    try {
      await removeFavorite(routeId);
      // Actualizar el estado para remover la ruta de favoritas
      setFavoriteRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route.id !== routeId)
      );
    } catch (error) {
      console.error("Error al eliminar ruta de favoritas:", error);
      throw error; // Propagar el error para que RouteMapCard lo maneje
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      setLoading(true);
      setError("");
      try {
        const [created, favorites] = await Promise.all([
          getRoutesByUser(user.id),
          getUserFavorites(user.id),
        ]);
        setCreatedRoutes(created);
        setFavoriteRoutes(favorites);
      } catch (err) {
        setError(
          "No se pudieron cargar los datos del perfil. Inténtalo de nuevo más tarde."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  // ========== PAGINACIÓN ==========
  // Para rutas creadas
  const totalPagesCreated = Math.ceil(createdRoutes.length / ITEMS_PER_PAGE);
  const startIndexCreated = (currentPageCreated - 1) * ITEMS_PER_PAGE;
  const endIndexCreated = startIndexCreated + ITEMS_PER_PAGE;
  const currentCreatedRoutes = createdRoutes.slice(
    startIndexCreated,
    endIndexCreated
  );

  // Para rutas favoritas
  const totalPagesFavorites = Math.ceil(favoriteRoutes.length / ITEMS_PER_PAGE);
  const startIndexFavorites = (currentPageFavorites - 1) * ITEMS_PER_PAGE;
  const endIndexFavorites = startIndexFavorites + ITEMS_PER_PAGE;
  const currentFavoriteRoutes = favoriteRoutes.slice(
    startIndexFavorites,
    endIndexFavorites
  );

  const goToPageCreated = (pageNumber) => {
    setCurrentPageCreated(pageNumber);
  };

  const goToPageFavorites = (pageNumber) => {
    setCurrentPageFavorites(pageNumber);
  };

  return (
    <div className="container mt-4 mb-5">
      {/* HEADER */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-2">Perfil de {user?.name}</h1>
        <p className="text-muted">Gestiona tus rutas creadas y favoritas</p>
      </div>

      {/* SISTEMA DE PESTAÑAS - CENTRADO Y ESTÉTICO */}
      <div className="d-flex justify-content-center mb-5">
        <div
          className="btn-group shadow-sm"
          role="group"
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <button
            type="button"
            className={`btn btn-lg ${activeTab === "created" ? "btn-primary" : "btn-light"}`}
            onClick={() => setActiveTab("created")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "15px 30px",
              fontWeight: activeTab === "created" ? "bold" : "normal",
              fontSize: "16px",
              transition: "all 0.3s ease",
              borderRight: "1px solid #dee2e6",
            }}
          >
            <MapPin size={22} />
            <span>Rutas Creadas</span>
            <span
              className={`badge ${activeTab === "created" ? "bg-light text-primary" : "bg-primary text-white"}`}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {createdRoutes.length}
            </span>
          </button>
          <button
            type="button"
            className={`btn btn-lg ${activeTab === "favorites" ? "btn-warning" : "btn-light"}`}
            onClick={() => setActiveTab("favorites")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "15px 30px",
              fontWeight: activeTab === "favorites" ? "bold" : "normal",
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
          >
            <Heart
              size={22}
              fill={activeTab === "favorites" ? "currentColor" : "none"}
            />
            <span>Rutas Favoritas</span>
            <span
              className={`badge ${activeTab === "favorites" ? "bg-light text-warning" : "bg-warning text-white"}`}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {favoriteRoutes.length}
            </span>
          </button>
        </div>
      </div>

      {/* CONTENIDO DE LA PESTAÑA ACTIVA */}
      <div
        style={{
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        {activeTab === "created" ? (
          /* Sección de Rutas Creadas */
          <div className="mb-5">
            {createdRoutes.length > 0 ? (
              <>
                <div className="row">
                  {currentCreatedRoutes.map((route) => (
                    <RouteMapCard
                      key={route.id}
                      route={route}
                      type="created"
                      onDelete={handleDeleteRoute}
                    />
                  ))}
                </div>

                {/* PAGINACIÓN PARA RUTAS CREADAS */}
                {totalPagesCreated > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                    {/* Botón Anterior */}
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => goToPageCreated(currentPageCreated - 1)}
                      disabled={currentPageCreated === 1}
                    >
                      <ChevronLeft size={20} />
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="d-flex gap-2">
                      {[...Array(totalPagesCreated)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            className={`btn ${currentPageCreated === pageNumber ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => goToPageCreated(pageNumber)}
                            style={{ minWidth: "40px" }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Botón Siguiente */}
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => goToPageCreated(currentPageCreated + 1)}
                      disabled={currentPageCreated === totalPagesCreated}
                    >
                      Siguiente
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Info de paginación */}
                {totalPagesCreated > 1 && (
                  <div className="text-center text-muted mt-3">
                    <small>
                      Mostrando {startIndexCreated + 1} -{" "}
                      {Math.min(endIndexCreated, createdRoutes.length)} de{" "}
                      {createdRoutes.length} rutas
                    </small>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <MapPin size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-2">No hay rutas creadas</h4>
                <p className="text-muted">
                  ¡Crea tu primera ruta para empezar tu aventura!
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Sección de Rutas Favoritas */
          <div className="mb-5">
            {favoriteRoutes.length > 0 ? (
              <>
                <div className="row">
                  {currentFavoriteRoutes.map((route) => (
                    <RouteMapCard
                      key={route.id}
                      route={route}
                      type="favorite"
                      onDelete={handleDeleteRouteFavorite}
                    />
                  ))}
                </div>

                {/* PAGINACIÓN PARA RUTAS FAVORITAS */}
                {totalPagesFavorites > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                    {/* Botón Anterior */}
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        goToPageFavorites(currentPageFavorites - 1)
                      }
                      disabled={currentPageFavorites === 1}
                    >
                      <ChevronLeft size={20} />
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="d-flex gap-2">
                      {[...Array(totalPagesFavorites)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            className={`btn ${currentPageFavorites === pageNumber ? "btn-warning" : "btn-outline-warning"}`}
                            onClick={() => goToPageFavorites(pageNumber)}
                            style={{ minWidth: "40px" }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Botón Siguiente */}
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        goToPageFavorites(currentPageFavorites + 1)
                      }
                      disabled={currentPageFavorites === totalPagesFavorites}
                    >
                      Siguiente
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Info de paginación */}
                {totalPagesFavorites > 1 && (
                  <div className="text-center text-muted mt-3">
                    <small>
                      Mostrando {startIndexFavorites + 1} -{" "}
                      {Math.min(endIndexFavorites, favoriteRoutes.length)} de{" "}
                      {favoriteRoutes.length} rutas
                    </small>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <Heart size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-2">No hay rutas favoritas</h4>
                <p className="text-muted">
                  Guarda tus rutas favoritas para acceder rápidamente a ellas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
