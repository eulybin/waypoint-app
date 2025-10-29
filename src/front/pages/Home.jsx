import { useNavigate } from "react-router-dom";
import { Compass, MapPinPlus, MapPin, TrendingUp, Star, Heart, MessageSquareWarning, User, GitFork } from "lucide-react";
import { NAVBAR_ICON_SIZE, SETTINGS_ICON_SIZE, FOOTER_ICON_SIZE } from "../utils/constants";
import useGlobalReducer from "../hooks/useGlobalReducer";
import brandNameLight from "../assets/brand-name-light.svg";
import brandNameDark from "../assets/brand-name-dark.svg";
import { actionTypes } from "../store";
import egorPp from "../assets/egor-pp.png";
import victorPp from "../assets/victor-pp.jpeg";

const Home = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  return (
    <>
      <div className="container py-5 px-5">
        {/* Hero */}
        <section className="text-center mb-5">
          <h1 className="display-5 fw-bold mb-3 text-body">
            <img
              src={store.isDarkMode ? brandNameDark : brandNameLight}
              alt="Waypoint Brand Name"
              className="ms-2 align-middle"
              style={{ height: 114 }}
            />
          </h1>
          <p className="lead text-body mb-4 fst-italic">
            Explore your favorite cities, discover new places, and build you own routes.
          </p>
        </section>
        {/* How it works: 3 steps */}
        <section className="mb-5">
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div className="card h-100 pop-card cursor-pointer" role="button" onClick={() => navigate('/explore')} aria-label="Explore routes">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 icon-badge badge-blue"><Compass size={SETTINGS_ICON_SIZE} /></div>
                  <h5 className="fw-semibold mb-2">Explore Places</h5>
                  <p className="text-muted">Discover new destinations waiting to be explored.</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="card h-100 pop-card cursor-pointer" role="button" onClick={() => navigate('/create-route')} aria-label="Create a route">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 icon-badge badge-orange"><MapPinPlus size={SETTINGS_ICON_SIZE} /></div>
                  <h5 className="fw-semibold mb-2">Create Route</h5>
                  <p className="text-muted">Build and share your routes for any city in the world.</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="card h-100 pop-card cursor-pointer" role="button" onClick={() => navigate('/trending')} aria-label="Open trending">
                <div className="card-body p-4 text-center">
                  <div className="mb-3 icon-badge badge-purple"><TrendingUp size={SETTINGS_ICON_SIZE} /></div>
                  <h5 className="fw-semibold mb-2">What's Trending</h5>
                  <p className="text-muted">Find popular routes and what's trending worldwide.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile (left) and Report a problem (right) */}
        <section className="mt-4">
          <div className="row g-4">
            <div className="col-12 col-xl-6">
              <div className="card h-100 pop-card cursor-pointer" role="button" onClick={() => navigate('/profile')} aria-label="Go to profile">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                  <div className="icon-badge badge-gray"><User size={NAVBAR_ICON_SIZE} /></div>
                  <div>
                    <h6 className="fw-semibold mb-1">View Profile</h6>
                    <p className="text-muted mb-2">View and manage all of your favorite routes.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-6">
              <div className="card h-100 pop-card cursor-pointer" role="button" onClick={() => dispatch({ type: actionTypes.OPEN_REPORT_MODAL })} aria-label="Report a problem">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                  <div className="icon-badge badge-crimson"><MessageSquareWarning size={NAVBAR_ICON_SIZE} /></div>
                  <div>
                    <h6 className="fw-semibold mb-1">Report a Problem</h6>
                    <p className="text-muted mb-2">Send us a quick report if you find any issues.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* {FOOTER} */}
      <section className="mt-5 pt-5 pb-5 border-top px-5 bg-body">
        <h5 className="text-body mb-4">Connect with the developers:</h5>
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <a
              href="https://github.com/eulybin"
              target="_blank"
              rel="noopener noreferrer"
              className="card h-100 pop-card text-decoration-none text-body"
              aria-label="Open GitHub profile: eulybin"
            >
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <img
                  src={egorPp}
                  alt="Egor profile"
                  className="profile-img"
                />
                <div>
                  <h6 className="fw-semibold mb-1">GitHub • eulybin</h6>
                  <p className="text-muted mb-0 d-flex align-items-center gap-2 small flex-wrap">
                    <span className="d-flex align-items-center gap-1">
                      <GitFork size={FOOTER_ICON_SIZE} /> 36 repositories
                    </span>
                    <span className="text-muted">|</span>
                    <span className="d-flex align-items-center gap-1">
                      <MapPin size={FOOTER_ICON_SIZE} /> Based in Madrid, Spain
                    </span>
                  </p>
                </div>
              </div>
            </a>
          </div>

          <div className="col-12 col-lg-6">
            <a
              href="https://github.com/VictorPko73"
              target="_blank"
              rel="noopener noreferrer"
              className="card h-100 pop-card text-decoration-none text-body"
              aria-label="Open GitHub profile: VictorPko73"
            >
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <img src={victorPp} alt="Victor profile" className="profile-img" />
                <div>
                  <h6 className="fw-semibold mb-1">GitHub • VictorPko73</h6>
                  <p className="text-muted mb-0 d-flex align-items-center gap-2 small flex-wrap">
                    <span className="d-flex align-items-center gap-1">
                      <GitFork size={FOOTER_ICON_SIZE} /> 44 repositories
                    </span>
                    <span className="text-muted">|</span>
                    <span className="d-flex align-items-center gap-1">
                      <MapPin size={FOOTER_ICON_SIZE} /> Based in Sevilla, Spain
                    </span>
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
