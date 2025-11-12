import { useState, useEffect } from "react";

import useAuth from "../hooks/useAuth";
import { getRoutesByUser, deleteRoute } from "../services/routesService";
import { getUserFavorites, removeFavorite } from "../services/favoritesService";
import RouteMapCard from "../components/Profile/RouteMapCard";
import { Loader, MapPin, Heart, ChevronLeft, ChevronRight, User } from "lucide-react";
import { HEADER_ICON_SIZE, PAGINATION_MIN_WIDTH, PROFILE_CARD_MAX_WIDTH, BORDER_RADIUS_MD } from "../utils/constants";

const Profile = () => {
  const { user } = useAuth();
  const [createdRoutes, setCreatedRoutes] = useState([]);
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("created"); // "created" or "favorites"
  const [currentPageCreated, setCurrentPageCreated] = useState(1); // Current page for created routes
  const [currentPageFavorites, setCurrentPageFavorites] = useState(1); // Current page for favorites
  const ITEMS_PER_PAGE = 4; // 4 routes per page

  const handleDeleteRoute = async (routeId) => {
    try {
      await deleteRoute(routeId);
      // Update state to remove deleted route
      setCreatedRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route.id !== routeId)
      );
      // Also remove it from favorites if it's there
      setFavoriteRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route.id !== routeId)
      );
    } catch (error) {
      console.error("Error deleting route:", error);
      throw error; // Propagate error for RouteMapCard to handle
    }
  };

  const handleDeleteRouteFavorite = async (routeId) => {
    try {
      await removeFavorite(routeId);
      // Update state to remove route from favorites
      setFavoriteRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route.id !== routeId)
      );
    } catch (error) {
      console.error("Error removing route from favorites:", error);
      throw error; // Propagate error for RouteMapCard to handle
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
          "Could not load profile data. Please try again later."
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

  // ========== PAGINATION ==========
  // For created routes
  const totalPagesCreated = Math.ceil(createdRoutes.length / ITEMS_PER_PAGE);
  const startIndexCreated = (currentPageCreated - 1) * ITEMS_PER_PAGE;
  const endIndexCreated = startIndexCreated + ITEMS_PER_PAGE;
  const currentCreatedRoutes = createdRoutes.slice(
    startIndexCreated,
    endIndexCreated
  );

  // For favorite routes
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
        <div className="mb-4 mt-3 header-icon-badge badge-green"><User size={HEADER_ICON_SIZE} /></div>
        <h1 className="display-5 fw-bold mb-2">
          {user?.name?.split(' ')[0].charAt(0).toUpperCase() + user?.name?.split(' ')[0].slice(1).toLowerCase()}'s Profile
        </h1>
        <p className="text-muted">Manage your created and favorite routes</p>
      </div>

      {/* TAB SYSTEM - CENTERED AND AESTHETIC */}
      <div className="d-flex justify-content-center mb-5">
        <div
          className="btn-group shadow-sm"
          role="group"
          style={{
            borderRadius: BORDER_RADIUS_MD,
            overflow: "hidden",
            maxWidth: PROFILE_CARD_MAX_WIDTH,
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
            <span>Created Routes</span>
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
            <span>Favorite Routes</span>
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

      {/* ACTIVE TAB CONTENT */}
      <div
        style={{
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        {activeTab === "created" ? (
          /* Created Routes Section */
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

                {/* PAGINATION FOR CREATED ROUTES */}
                {totalPagesCreated > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                    {/* Previous Button */}
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => goToPageCreated(currentPageCreated - 1)}
                      disabled={currentPageCreated === 1}
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="d-flex gap-2">
                      {[...Array(totalPagesCreated)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            className={`btn ${currentPageCreated === pageNumber ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => goToPageCreated(pageNumber)}
                            style={{ minWidth: PAGINATION_MIN_WIDTH }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => goToPageCreated(currentPageCreated + 1)}
                      disabled={currentPageCreated === totalPagesCreated}
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Pagination info */}
                {totalPagesCreated > 1 && (
                  <div className="text-center text-muted mt-3">
                    <small>
                      Showing {startIndexCreated + 1} -{" "}
                      {Math.min(endIndexCreated, createdRoutes.length)} of{" "}
                      {createdRoutes.length} routes
                    </small>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <MapPin size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-2">No created routes</h4>
                <p className="text-muted">
                  Create your first route and start your adventure!
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Favorite Routes Section */
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

                {/* PAGINATION FOR FAVORITE ROUTES */}
                {totalPagesFavorites > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                    {/* Previous Button */}
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        goToPageFavorites(currentPageFavorites - 1)
                      }
                      disabled={currentPageFavorites === 1}
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="d-flex gap-2">
                      {[...Array(totalPagesFavorites)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            className={`btn ${currentPageFavorites === pageNumber ? "btn-warning" : "btn-outline-warning"}`}
                            onClick={() => goToPageFavorites(pageNumber)}
                            style={{ minWidth: PAGINATION_MIN_WIDTH }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        goToPageFavorites(currentPageFavorites + 1)
                      }
                      disabled={currentPageFavorites === totalPagesFavorites}
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Pagination info */}
                {totalPagesFavorites > 1 && (
                  <div className="text-center text-muted mt-3">
                    <small>
                      Showing {startIndexFavorites + 1} -{" "}
                      {Math.min(endIndexFavorites, favoriteRoutes.length)} of{" "}
                      {favoriteRoutes.length} routes
                    </small>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <Heart size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-2">No favorite routes</h4>
                <p className="text-muted">
                  Save your favorite routes to access them quickly.
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
