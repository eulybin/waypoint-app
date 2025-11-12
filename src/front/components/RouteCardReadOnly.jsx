// COMPONENT: RouteCardReadOnly
// Read-only card to display tourist route information for non-authenticated users
// Used in: Search page (for guests)

import { useState } from "react";
import {
    MapPin,
    User as UserIcon,
    Star,
    Calendar,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const RouteCardReadOnly = ({ route }) => {
    // Calculate average stars to display
    const [showAllPOIs, setShowAllPOIs] = useState(false);
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star
                    key={`full-${i}`}
                    size={16}
                    fill="currentColor"
                    className="text-warning"
                />
            );
        }

        // Half star
        if (hasHalfStar && fullStars < 5) {
            stars.push(
                <Star
                    key="half"
                    size={16}
                    fill="currentColor"
                    className="text-warning"
                    style={{ opacity: 0.5 }}
                />
            );
        }

        // Empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} size={16} className="text-muted" />);
        }

        return stars;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body">
                {/* Location */}
                <div className="d-flex align-items-center gap-2 mb-2">
                    <MapPin size={18} className="text-body" />
                    <h5 className="card-title mb-0 fw-bold">
                        {route.city}, {route.country}
                    </h5>
                </div>

                {/* Locality (if exists) */}
                {route.locality && (
                    <p className="text-muted small mb-2">{route.locality}</p>
                )}

                {/* Points of interest */}
                <div className="mb-3">
                    <p className="small text-body mb-1">Points of Interest:</p>
                    <div className="d-flex flex-wrap gap-1">
                        {/* Show 3 or all depending on state */}
                        {(showAllPOIs
                            ? route.points_of_interest
                            : route.points_of_interest?.slice(0, 3)
                        )?.map((poi, index) => (
                            <span key={index} className="badge bg-body text-body border">
                                {typeof poi === 'string' ? poi : poi.name}
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
                {/* Rating and votes */}
                <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="d-flex gap-1">
                        {renderStars(route.average_rating || 0)}
                    </div>
                    <span className="text-muted small">
                        {route.average_rating?.toFixed(1) || "0.0"} (
                        {route.total_votes || 0} {route.total_votes === 1 ? "vote" : "votes"})
                    </span>
                </div>

                {/* Author and date */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <div className="d-flex align-items-center gap-2">
                        <UserIcon size={16} className="text-muted" />
                        <span className="small text-muted">{route.author_name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Calendar size={16} className="text-muted" />
                        <span className="small text-muted">
                            {formatDate(route.created_at)}
                        </span>
                    </div>
                </div>

                {/* No view details button - read-only */}
                <div className="alert alert-info mt-3 mb-0 small text-center">
                    Sign in to view route details and interactive features
                </div>
            </div>
        </div>
    );
};

export default RouteCardReadOnly;
