import { useState, useEffect } from "react";
import { TrendingUp, Star, Award } from "lucide-react";
import RouteCard from "../components/RouteCard";
import Loader from "../components/Loader";
import { API_ENDPOINTS, getAuthHeaders } from "../utils/apiConfig";
import { HEADER_ICON_SIZE } from "../utils/constants";

const Trending = () => {
  // ==================== STATE ====================

  // State to store top 5 routes
  const [topRoutes, setTopRoutes] = useState([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Error state
  const [error, setError] = useState(null);

  // ==================== EFFECTS ====================

  /*
   * Effect that runs when component mounts
   * Loads TOP 5 routes from backend
   */
  useEffect(() => {
    fetchTopRoutes();
  }, []);

  // ==================== FUNCTIONS ====================

  /**
   * Fetches ALL routes and sorts them by score
   *
   * Sorting criteria:
   * 1. By average_rating (descending) - Highest rated first
   * 2. If same rating, by total_votes (descending)
   * 3. If same votes, by creation date (most recent first)
   */
  const fetchTopRoutes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching all routes...");

      // Get ALL routes directly
      const response = await fetch(API_ENDPOINTS.ROUTES, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Error loading routes");
      }

      const data = await response.json();

      console.log(`📊 Total routes found: ${data.length}`);

      // Sort routes by multiple criteria
      const sortedRoutes = data.sort((a, b) => {
        // 1. First by rating (average_rating) - highest to lowest
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;

        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }

        // 2. If same rating, by total votes
        const votesA = a.total_votes || 0;
        const votesB = b.total_votes || 0;

        if (votesB !== votesA) {
          return votesB - votesA;
        }

        // 3. If same votes, by creation date (most recent first)
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });

      // Take only the first 5 routes
      setTopRoutes(sortedRoutes.slice(0, 5));

      console.log(`✅ TOP 5 routes loaded for ranking`);
    } catch (err) {
      console.error("❌ Error fetching trending routes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gets medal emoji based on position
   * @param {number} position - Position in ranking (1, 2, 3, etc.)
   * @returns {string} - Corresponding emoji
   */
  const getMedalEmoji = (position) => {
    switch (position) {
      case 1:
        return "🥇"; // Gold
      case 2:
        return "🥈"; // Silver
      case 3:
        return "🥉"; // Bronze
      case 4:
        return "⬆️";
      default:
        return "⬇️"; // Number for positions 4 and 5
    }
  };

  /**
   * Gets CSS color class based on position
   * @param {number} position - Position in ranking
   * @returns {string} - Bootstrap class
   */
  const getPositionClass = (position) => {
    switch (position) {
      case 1:
        return "bg-warning"; // Gold
      case 2:
        return "bg-secondary"; // Silver
      case 3:
        return "bg-danger"; // Bronze/Red
      default:
        return "bg-success"; // Green for the rest
    }
  };

  // ==================== RENDERING ====================

  // Show loader while loading
  if (isLoading) {
    return (
      <div className="container py-5">
        <Loader />
      </div>
    );
  }

  // Show error if there's a problem
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-danger mt-3" onClick={fetchTopRoutes}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if no routes available
  if (topRoutes.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <TrendingUp size={64} className="text-muted mb-3" />
          <h3 className="text-muted">No routes available</h3>
          <p className="text-muted">
            Be the first to create a route and appear in the ranking.
          </p>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDERING ====================

  return (
    <div className="container py-5">
      {/* Page header */}
      <div className="text-center mb-5">
        {/* Main icon */}
        <div className="mb-3">
          <div className="mb-3 header-icon-badge badge-purple"><TrendingUp size={HEADER_ICON_SIZE} /></div>
        </div>

        {/* Title */}
        <h1 className="display-4 fw-bold mb-3">
          Trending Routes
        </h1>

        {/* Subtitle */}
        <p className="lead text-muted">
          The {topRoutes.length} highest rated routes by the community
        </p>

        {/* Decorative divider */}
        <hr className="w-25 mx-auto border-warning border-3" />
      </div>

      {/* TOP 5 routes grid */}
      <div className="row g-4">
        {topRoutes.map((route, index) => {
          const position = index + 1; // Position in ranking (1, 2, 3, 4, 5)

          return (
            <div key={route.id} className="col-12">
              {/* Card container with position badge */}
              <div className="position-relative">
                {/* Position badge (medal or number) */}
                <div
                  className={`position-absolute badge ${getPositionClass(position)} rounded-pill`}
                  style={{
                    top: "-10px",
                    left: "20px",
                    zIndex: 10,
                    fontSize: "1.2rem",
                    padding: "10px 20px",
                    boxShadow: "0 4px 8px `rgba(0, 0, 0, 1)",
                  }}
                >
                  <Award size={18} className="me-2" />
                  <span className="fw-bold">{getMedalEmoji(position)}</span>
                  {position > 3 && <span className="ms-2"></span>}
                </div>

                {/* Route card with special hover effect for top 3 */}
                <div
                  className={`card shadow-lg ${position <= 3 ? "border-warning border-3" : ""}`}
                  style={{
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      {/* Left column: Ranking information */}
                      <div className="col-md-2 text-center border-end">
                        {/* Large position number */}
                        <div className="display-1 fw-bold text-muted ">
                          {position}
                        </div>

                        {/* Voting statistics */}
                        <div className="mt-3">
                          <Star
                            size={32}
                            className="text-warning mb-2"
                            fill="currentColor"
                          />
                          <div className="fw-bold fs-4">
                            {route.average_rating?.toFixed(1) || "0.0"}
                          </div>
                          <small className="text-muted">
                            {route.total_votes || 0} votes
                          </small>
                        </div>
                      </div>

                      {/* Right column: RouteCard */}
                      <div className="col-md-10">
                        <RouteCard route={route} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informative footer */}
      <div className="text-center mt-5 pt-4 border-top">
        <p className="text-muted">
          <Star size={16} className="text-warning me-2" />
          Ranking is automatically updated based on user votes
        </p>
      </div>
    </div>
  );
};

export default Trending;
