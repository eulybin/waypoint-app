import brandNameLight from "../assets/brand-name-light.svg";
import brandNameDark from "../assets/brand-name-dark.svg";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Search, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { STANDARD_ICON_SIZE, INPUT_ICON_POSITION, SEARCH_BAR_MAX_WIDTH } from "../utils/constants";
import { useState, useEffect } from "react";
import RouteCardReadOnly from "../components/RouteCardReadOnly";
import Loader from "../components/Loader";
import { API_ENDPOINTS } from "../utils/apiConfig";
import { normalizeText } from "../utils/constants";

const SearchBar = () => {

    const { store } = useGlobalReducer();
    const [allRoutes, setAllRoutes] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch all routes on mount
    useEffect(() => {
        fetchAllRoutes();
    }, []);

    const fetchAllRoutes = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(API_ENDPOINTS.ROUTES, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Error loading routes");

            const data = await response.json();
            setAllRoutes(data);
        } catch (error) {
            console.error("Error fetching routes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilteredRoutes([]);
            setHasSearched(false);
            return;
        }

        const searchNormalized = normalizeText(searchTerm);
        const filtered = allRoutes.filter(
            (route) =>
                normalizeText(route.country).includes(searchNormalized) ||
                normalizeText(route.city).includes(searchNormalized) ||
                normalizeText(route.locality || "").includes(searchNormalized)
        );

        // Sort by rating (highest first), then by votes, then by date
        const sortedFiltered = filtered.sort((a, b) => {
            const ratingA = a.average_rating || 0;
            const ratingB = b.average_rating || 0;

            if (ratingB !== ratingA) {
                return ratingB - ratingA;
            }

            const votesA = a.total_votes || 0;
            const votesB = b.total_votes || 0;

            if (votesB !== votesA) {
                return votesB - votesA;
            }

            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
        });

        setFilteredRoutes(sortedFiltered);
        setCurrentIndex(0);
        setHasSearched(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % filteredRoutes.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
    };

    return (
        <div className="d-flex flex-column align-items-center min-vh-100 bg-body pt-5 pb-5">
            <div className="mb-4">
                {store.isDarkMode ? (
                    <img
                        src={brandNameDark}
                        alt="Waypoint Brand Name"
                        className="img-fluid"
                    />
                ) : (
                    <img
                        src={brandNameLight}
                        alt="Waypoint Brand Name"
                        className="img-fluid"
                    />
                )}
            </div>
            <div className="position-relative w-100 px-3" style={{ maxWidth: SEARCH_BAR_MAX_WIDTH }}>
                <Search
                    size={STANDARD_ICON_SIZE}
                    className="position-absolute text-muted"
                    style={{
                        left: '30px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 6,
                        cursor: 'pointer'
                    }}
                    onClick={handleSearch}
                />
                <input
                    type="text"
                    className="form-control ps-5 py-2 rounded-pill shadow-sm border search-input"
                    placeholder="Search for a city"
                    value={searchTerm}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setSearchTerm(newValue);
                        // Clear results if input is empty
                        if (!newValue.trim()) {
                            setFilteredRoutes([]);
                            setHasSearched(false);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Search Results Carousel */}
            {hasSearched && (
                <div className="container mt-5 mb-5 px-3" style={{ maxWidth: "900px" }}>
                    {isLoading ? (
                        <div className="text-center py-5">
                            <Loader />
                        </div>
                    ) : filteredRoutes.length > 0 ? (
                        <>
                            <div className="d-flex align-items-center gap-2 mb-4 justify-content-center">
                                <h3 className="mb-0 fw-bold">
                                    Found {filteredRoutes.length} {filteredRoutes.length === 1 ? "Route" : "Routes"}
                                </h3>
                            </div>

                            <div className="position-relative">
                                {/* Carousel Controls */}
                                <div className="d-flex align-items-center gap-3 justify-content-center">
                                    <button
                                        className="btn btn-outline-primary rounded-circle p-2 shrink-0 d-flex align-items-center justify-content-center"
                                        onClick={goToPrev}
                                        disabled={filteredRoutes.length <= 1}
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="grow" style={{ maxWidth: "600px" }}>
                                        <RouteCardReadOnly route={filteredRoutes[currentIndex]} />
                                    </div>

                                    <button
                                        className="btn btn-outline-primary rounded-circle p-2 shrink-0 d-flex align-items-center justify-content-center"
                                        onClick={goToNext}
                                        disabled={filteredRoutes.length <= 1}
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                {/* Carousel Indicators */}
                                {filteredRoutes.length > 1 && (
                                    <div className="d-flex justify-content-center gap-2 mt-3">
                                        {filteredRoutes.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`rounded-circle border-0 p-0 ${index === currentIndex ? "bg-primary" : "bg-secondary"
                                                    }`}
                                                style={{
                                                    width: "10px",
                                                    height: "10px",
                                                    minWidth: "10px",
                                                    minHeight: "10px",
                                                    opacity: index === currentIndex ? 1 : 0.5,
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => setCurrentIndex(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="alert alert-warning text-center">
                            No routes found for "{searchTerm}". Try searching for a different city or country.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;