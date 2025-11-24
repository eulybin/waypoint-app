import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass, MapPinPlus, Users } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import brandNameLight from "../assets/brand-name-light.svg";
import brandNameDark from "../assets/brand-name-dark.svg";
import { SETTINGS_ICON_SIZE, HIDE_OR_SHOW_PASSWORD_ICON_SIZE, STANDARD_ICON_SIZE, BORDER_RADIUS_MD } from "../utils/constants";

// Import city images
import florenceImg from "../assets/cities/florence.jpg";
import cancunImg from "../assets/cities/cancun.jpg";
import edinburghImg from "../assets/cities/edinburgh.jpg";

export default function Presentation() {
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    return (
        <div className="presentation-page">
            <div className="container py-5">
                {/* Header Section */}
                <section className="text-center mb-5 py-3">
                    <img
                        src={store.isDarkMode ? brandNameDark : brandNameLight}
                        alt="Waypoint"
                        className="align-middle waypoint-brand"
                        style={{ height: '108px' }}
                    />

                    <p className="lead text-muted fst-italic">
                        Discover, create, and share your favorite routes from all over the world
                    </p>
                </section>

                {/* Section 1 */}
                <div className="row mb-5 g-0 shadow-md" style={{ minHeight: '450px', borderRadius: BORDER_RADIUS_MD, overflow: 'hidden', border: store.isDarkMode ? 'none' : '1px solid #dee2e6' }}>
                    <div className="col-md-6">
                        <div style={{
                            height: '100%',
                            minHeight: '450px',
                            backgroundImage: `url(${florenceImg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                    </div>
                    <div className={`col-md-6 d-flex align-items-center ${store.isDarkMode ? "bg-body" : "bg-light-grey"}`}>
                        <div className="p-5">
                            <div className="mb-3 icon-badge badge-orange">
                                <MapPinPlus size={SETTINGS_ICON_SIZE} />
                            </div>
                            <h2 className="fw-bold mb-4 text-body">
                                Create Custom Routes
                            </h2>
                            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                                Use our interactive map builder to design personalized travel itineraries. Add points of interest,
                                calculate distances, and visualize your journey. Whether it's a weekend getaway or a grand expedition,
                                plan every detail with ease and precision.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn bg-orange text-white px-4 py-2 fw-semibold"
                            >
                                Start Creating <ArrowRight size={HIDE_OR_SHOW_PASSWORD_ICON_SIZE} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="row mb-5 g-0 shadow-sm" style={{ minHeight: '450px', borderRadius: BORDER_RADIUS_MD, overflow: 'hidden', border: store.isDarkMode ? 'none' : '1px solid #dee2e6' }}>
                    <div className="col-md-6 order-md-2">
                        <div style={{
                            height: '100%',
                            minHeight: '450px',
                            backgroundImage: `url(${cancunImg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                    </div>
                    <div className={`col-md-6 order-md-1 d-flex align-items-center ${store.isDarkMode ? "bg-body" : "bg-light-grey"}`}>
                        <div className="p-5">
                            <div className="mb-3 icon-badge badge-blue">
                                <Compass size={SETTINGS_ICON_SIZE} />
                            </div>
                            <h2 className="fw-bold mb-4 text-body">
                                Explore Amazing Destinations
                            </h2>
                            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                                Browse thousands of curated travel routes created by adventurers worldwide. Search by city,
                                filter by country, and discover hidden gems and iconic landmarks. Find inspiration for your
                                next journey from a global community of explorers.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn bg-orange text-white px-4 py-2 fw-semibold"
                            >
                                Explore Routes <ArrowRight size={HIDE_OR_SHOW_PASSWORD_ICON_SIZE} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="row mb-5 g-0 shadow-sm" style={{ minHeight: '450px', borderRadius: BORDER_RADIUS_MD, overflow: 'hidden', border: store.isDarkMode ? 'none' : '1px solid #dee2e6' }}>
                    <div className="col-md-6">
                        <div style={{
                            height: '100%',
                            minHeight: '450px',
                            backgroundImage: `url(${edinburghImg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }} />
                    </div>
                    <div className={`col-md-6 d-flex align-items-center ${store.isDarkMode ? "bg-body" : "bg-light-grey"}`}>
                        <div className="p-5">
                            <div className="mb-3 icon-badge badge-green">
                                <Users size={SETTINGS_ICON_SIZE} />
                            </div>
                            <h2 className="fw-bold mb-4 text-body">
                                Connect & Share with Travelers
                            </h2>
                            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                                Build your personal profile, save favorite routes, and engage with a global community. Rate and review
                                routes, discover trending destinations, and track your travel adventures. See what's popular and share
                                your own experiences with fellow explorers.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="btn bg-orange text-white px-4 py-2 fw-semibold"
                            >
                                Join Community <ArrowRight size={HIDE_OR_SHOW_PASSWORD_ICON_SIZE} className="ms-2" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-lg text-white text-center" style={{
                            background: 'linear-gradient(135deg, #ff8a3d, #f36011)',
                            borderRadius: BORDER_RADIUS_MD
                        }}>
                            <div className="card-body p-5">
                                <h2 className="display-6 fw-bold mb-4">
                                    Ready to Start Your Journey?
                                </h2>
                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="btn btn-light btn-lg px-5 py-3 fw-bold text-orange"
                                    >
                                        Create Free Account <ArrowRight size={STANDARD_ICON_SIZE} className="ms-2" />
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="btn btn-outline-light btn-lg px-5 py-3 fw-bold"
                                    >
                                        Log In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
