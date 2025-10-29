import { useNavigate } from "react-router-dom";
import { Compass, MapPinPlus, TrendingUp, Star, Heart, MessageSquareWarning, User } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import brandNameLight from "../assets/brand-name-light.svg";
import brandNameDark from "../assets/brand-name-dark.svg";
import { actionTypes } from "../store";

const Home = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  return (
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
                <div className="mb-3 icon-badge badge-blue"><Compass size={28} /></div>
                <h5 className="fw-semibold mb-2">Explore Places</h5>
                <p className="text-muted">Discover new destinations waiting to be explored.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card h-100 pop-card cursor-pointer" role="button" onClick={() => navigate('/create-route')} aria-label="Create a route">
              <div className="card-body p-4 text-center">
                <div className="mb-3 icon-badge badge-orange"><MapPinPlus size={28} /></div>
                <h5 className="fw-semibold mb-2">Create Route</h5>
                <p className="text-muted">Build and share your routes for any city in the world.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card h-100 pop-card cursor-pointer" role="button" onClick={() => navigate('/trending')} aria-label="Open trending">
              <div className="card-body p-4 text-center">
                <div className="mb-3 icon-badge badge-purple"><TrendingUp size={28} /></div>
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
                <div className="icon-badge badge-gray"><User size={22} /></div>
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
                <div className="icon-badge badge-crimson"><MessageSquareWarning size={22} /></div>
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
  );
};

export default Home;
