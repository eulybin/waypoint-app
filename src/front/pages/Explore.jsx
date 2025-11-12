import { POPULAR_CITIES_BY_COUNTRY } from "../components/CreateRoute/CardPopularCities";
import { POPULAR_COUNTRIES } from "../components/CreateRoute/CardPopularCountry";
import { normalizeText } from "../utils/constants";
import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Globe,
  Loader,
  ChevronLeft,
  ChevronRight,
  Compass,
  Building2,
  X
} from "lucide-react";
import RouteCard from "../components/RouteCard";
import WeatherWidget from "../components/WeatherWidget";
import { fetchWeather } from "../services/weatherService";
import { API_ENDPOINTS, getAuthHeaders } from "../utils/apiConfig";
import { goToNextPage, goToPrevPage, goToPage, HEADER_ICON_SIZE, NAVBAR_ICON_SIZE, WEATHER_WIDGET_Z_INDEX, WEATHER_WIDGET_OPACITY, CLOSE_WEATHER_ICON_SIZE, STANDARD_ICON_SIZE, PAGINATION_MIN_WIDTH, ROUTE_CARD_IMAGE_HEIGHT, TRENDING_CARD_IMAGE_HEIGHT } from "../utils/constants";

const Explore = () => {
  // ========== STATES ==========
  const [allRoutes, setAllRoutes] = useState([]); // All routes from DB
  const [filteredRoutes, setFilteredRoutes] = useState([]); // Routes after filtering
  const [selectedCountry, setSelectedCountry] = useState(null); // Selected country
  const [selectedCity, setSelectedCity] = useState(null); // Selected city
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const ITEMS_PER_PAGE = 3; // 3 routes per page

  // ========== WEATHER STATES ==========
  const [weatherCity, setWeatherCity] = useState("Madrid");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherAttention, setWeatherAttention] = useState(false);

  // ========== FETCH ROUTES FROM DB ==========
  useEffect(() => {
    fetchAllRoutes();
  }, []);

  // ========== FETCH INITIAL WEATHER ==========
  useEffect(() => {
    handleWeatherUpdate(weatherCity);
  }, []);

  const fetchAllRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.ROUTES, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Error loading routes");

      const data = await response.json();
      setAllRoutes(data);
      setFilteredRoutes(data); // Initially show all
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FILTER ROUTES ==========
  useEffect(() => {
    let filtered = [...allRoutes];

    // Filter by country (compare with country name)
    if (selectedCountry) {
      filtered = filtered.filter(
        (route) =>
          normalizeText(route.country) === normalizeText(selectedCountry.name)
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(
        (route) => normalizeText(route.city) === normalizeText(selectedCity)
      );
    }

    // Filter by manual search
    if (searchTerm.trim()) {
      const searchNormalized = normalizeText(searchTerm);
      filtered = filtered.filter(
        (route) =>
          normalizeText(route.country).includes(searchNormalized) ||
          normalizeText(route.city).includes(searchNormalized) ||
          normalizeText(route.locality || "").includes(searchNormalized)
      );
    }

    setFilteredRoutes(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedCountry, selectedCity, searchTerm, allRoutes]);

  // ========== SYNC WEATHER WITH SELECTED CITY ==========
  useEffect(() => {
    if (selectedCity) {
      handleWeatherUpdate(selectedCity);
      // Trigger attention animation when city is selected
      setWeatherAttention(prev => !prev); // Toggle to trigger re-animation each time
    }
  }, [selectedCity]);

  // ========== HANDLERS ==========
  const handleCountryClick = (country) => {
    // Save complete country object to have access to the code
    setSelectedCountry(country);
    setSelectedCity(null); // Reset city when changing country
    setSearchTerm(""); // Clear search
  };

  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
    setSearchTerm(""); // Clear search
  };

  const handleResetFilters = () => {
    setSelectedCountry(null);
    setSelectedCity(null);
    setSearchTerm("");
  };

  // Scroll to routes section
  const scrollToRoutes = () => {
    const routesSection = document.getElementById('routes-section');
    if (routesSection) {
      routesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle search action (Enter key or icon click)
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSelectedCountry(null);
      setSelectedCity(null);
      scrollToRoutes();

      // Update weather widget if search matches a city
      const searchNormalized = normalizeText(searchTerm);
      const matchedRoute = allRoutes.find(
        (route) =>
          normalizeText(route.city).includes(searchNormalized) ||
          normalizeText(route.locality || "").includes(searchNormalized)
      );

      if (matchedRoute && matchedRoute.city) {
        handleWeatherUpdate(matchedRoute.city);
        setWeatherAttention(prev => !prev); // Trigger attention animation
      }
    }
  };

  // ========== WEATHER HANDLER ==========
  const handleWeatherUpdate = async (city) => {
    if (!city) return;
    setWeatherCity(city);
    setWeatherLoading(true);
    const data = await fetchWeather(city);
    setWeather(data);
    setWeatherLoading(false);
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // Get cities for selected country using country code
  const citiesForSelectedCountry = selectedCountry
    ? POPULAR_CITIES_BY_COUNTRY[selectedCountry.code] || []
    : [];

  // ========== PAGINATION ==========
  const totalPages = Math.ceil(filteredRoutes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRoutes = filteredRoutes.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);

    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);

    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);

  };

  return (
    <div className="container py-4">
      {/* FIXED WEATHER WIDGET - TOP RIGHT */}
      <div
        className="position-fixed top-0 end-0 mt-4 me-4"
        style={{ zIndex: WEATHER_WIDGET_Z_INDEX, opacity: WEATHER_WIDGET_OPACITY }}
      >
        <WeatherWidget
          weather={weather}
          city={weatherCity}
          loading={weatherLoading}
          onChangeCity={handleWeatherUpdate}
          triggerAttention={weatherAttention}
        />
      </div>

      {/* HEADER */}
      <div className="text-center mb-5 mt-5 pt-5">
        <div className="mb-3 header-icon-badge badge-blue"><Compass size={HEADER_ICON_SIZE} /></div>
        <h1 className="display-4 fw-bold">Explore Routes</h1>
        <p className="lead text-muted">
          Discover travel routes created by the community
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="row mb-5">
        <div className="col-md-8 mx-auto">
          <div className="input-group input-group-lg">
            <span
              className="input-group-text"
              style={{ cursor: 'pointer' }}
              onClick={handleSearch}
            >
              <Search size={NAVBAR_ICON_SIZE} />
            </span>
            <input
              id="explore-search-input"
              type="text"
              className="form-control"
              placeholder="Search by country or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            {(searchTerm || selectedCountry || selectedCity) && (
              <button
                className="btn btn-outline-secondary"
                onClick={handleResetFilters}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE FILTERS */}
      {(selectedCountry || selectedCity) && (
        <div className="mb-4">
          <h5 className="mb-3">Active filters:</h5>
          <div className="d-flex gap-2 flex-wrap">
            {selectedCountry && (
              <span className="badge bg-primary fs-6 d-inline-flex align-items-center gap-2">
                <span className="fw-normal">Country:</span>{selectedCountry.name}
                <button
                  type="button"
                  className="btn p-0 border-0 bg-transparent d-flex align-items-center"
                  onClick={() => setSelectedCountry(null)}
                  aria-label="Clear selected country"
                >
                  <X size={14} strokeWidth={3} className="text-white" />
                </button>
              </span>
            )}
            {selectedCity && (
              <span className="badge bg-info fs-6 d-inline-flex align-items-center gap-2">
                <span className="fw-normal">City:</span> {selectedCity}
                <button
                  type="button"
                  className="btn p-0 border-0 bg-transparent d-flex align-items-center"
                  onClick={() => setSelectedCity(null)}
                  aria-label="Clear selected city"
                >
                  <X size={14} strokeWidth={3} className="text-white" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* COUNTRIES SECTION */}
      <section className="mb-5">
        <h2 className="mb-4 d-flex align-items-center gap-2">
          <Globe size={NAVBAR_ICON_SIZE} />
          Popular Countries
        </h2>

        <div className="row g-3">
          {POPULAR_COUNTRIES.map((country) => (
            <div key={country.name} className="col-lg-3 col-md-6">
              <div
                className={`card h-100 cursor-pointer explore-card ${selectedCountry?.name === country.name ? "border-primary border-3" : ""}`}
                onClick={() => handleCountryClick(country)}
              >
                <img
                  src={country.image}
                  className="card-img-top"
                  alt={country.name}
                  style={{ height: ROUTE_CARD_IMAGE_HEIGHT, objectFit: "cover" }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title">{country.name}</h5>
                  <p className="text-muted small">{country.visitors}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CITIES SECTION (Only if country is selected) */}
      {selectedCountry && citiesForSelectedCountry.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-4 d-flex align-items-center gap-2">
            <Building2 size={CLOSE_WEATHER_ICON_SIZE} />
            Cities in {selectedCountry.name}
          </h2>
          <div className="row g-3">
            {citiesForSelectedCountry.map((city) => (
              <div key={city.name} className="col-md-3 col-sm-6">
                <div
                  className={`card h-100 cursor-pointer explore-card ${selectedCity === city.name ? "border-info border-3" : ""}`}
                  onClick={() => handleCityClick(city.name)}
                >
                  <img
                    src={city.image}
                    className="card-img-top rounded-top-3"
                    alt={city.name}
                    style={{ height: TRENDING_CARD_IMAGE_HEIGHT, objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                    <h6 className="card-title">{city.name}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FILTERED ROUTES SECTION */}
      <section id="routes-section">
        <h2 className="mb-4 d-flex align-items-center gap-2">
          <MapPin size={NAVBAR_ICON_SIZE} />
          Available Routes ({filteredRoutes.length})
        </h2>


        {filteredRoutes.length === 0 ? (
          <div className="alert alert-info">
            No routes found with the selected filters.
          </div>
        ) : (
          <>
            <div className="row g-4">
              {currentRoutes.map((route) => (
                <div key={route.id} className="col-lg-4 col-md-6">
                  <RouteCard route={route} />
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                {/* Previous Button */}
                <button
                  className="btn btn-outline-primary"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={STANDARD_ICON_SIZE} />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="d-flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        className={`btn ${currentPage === pageNumber ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => goToPage(pageNumber)}
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
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={STANDARD_ICON_SIZE} />
                </button>
              </div>
            )}

            {/* Pagination info */}
            <div className="text-center text-muted mt-3">
              <small>
                Showing {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredRoutes.length)} of{" "}
                {filteredRoutes.length} routes
              </small>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Explore;
