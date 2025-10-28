import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, User, TrendingUp, Menu, Sun, Moon, LogOut, MapPinPlus, MessageSquareWarning } from 'lucide-react';
import useGlobalReducer from '../../hooks/useGlobalReducer';
import { actionTypes } from '../../store';
import { NAVBAR_ICON_SIZE, STANDARD_ICON_SIZE, NAVBAR_WIDTH, NAVBAR_CHILD_DIV_WIDTH, CREATE_ROUTE_FONT_SIZE } from '../../utils/constants';
import brandNameLight from '../../assets/brand-name-light.svg';
import brandNameDark from '../../assets/brand-name-dark.svg';
import useAuth from '../../hooks/useAuth';
import { navRouteLinks } from './navRouteLinks';

const iconMap = { Home, Compass, User, TrendingUp };

const DesktopSidebar = () => {
  const { store, dispatch } = useGlobalReducer();
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/search');
    setShowMoreMenu(false);
  };

  return (
    <div
      className="navbar-desktop d-none d-md-flex flex-column bg-body border-end vh-100 position-fixed top-0 start-0"
      style={{ width: NAVBAR_WIDTH, zIndex: 1000 }}
    >
      {/* Brand */}
      <div className="p-4">
        <Link to="/" className="text-decoration-none d-inline-block mt-3">
          {store.isDarkMode ? (
            <img src={brandNameDark} alt="Waypoint Brand Name" className="img-fluid" />
          ) : (
            <img src={brandNameLight} alt="Waypoint Brand Name" className="img-fluid" />
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-grow-1 p-3">
        {navRouteLinks.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={index}
              to={item.path}
              className="d-flex align-items-center gap-3 text-decoration-none text-body p-3 rounded-3 mb-2 sidebar-item"
            >
              <Icon size={NAVBAR_ICON_SIZE} />
              <span className="fw-semibold nav-label">{item.label}</span>
            </Link>
          );
        })}

        <div className="position-relative rounded-3">
          <button
            onClick={() => {
              setShowAppearance(false);
              setShowMoreMenu((prev) => !prev);
            }}
            className="d-flex align-items-center gap-3 text-body p-3 rounded-3 w-100 border-0 bg-transparent sidebar-item"
          >
            <Menu size={24} />
            <span className="fw-semibold nav-label">More</span>
          </button>

          <Link
            to="/create-route"
            className="btn bg-orange text-white rounded-3 w-100 fw-bold py-3 mt-4 d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: CREATE_ROUTE_FONT_SIZE }}
          >
            <MapPinPlus size={NAVBAR_ICON_SIZE} />
            <span className="nav-label">Create Route</span>
          </Link>

          {/* More dropdown */}
          {showMoreMenu && (
            <div
              className="position-absolute bottom-100 start-0 bg-body border rounded-3 shadow-lg mb-2"
              style={{ width: NAVBAR_CHILD_DIV_WIDTH }}
            >
              <button
                onClick={() => {
                  setShowAppearance(true);
                  setShowMoreMenu(false);
                }}
                className="d-flex align-items-center gap-3 text-body p-3 border-bottom w-100 border-0 bg-transparent text-start sidebar-item rounded-top-3"
              >
                <Moon size={STANDARD_ICON_SIZE} />
                <span>Appearance</span>
              </button>
              <button
                onClick={() => dispatch({ type: actionTypes.OPEN_REPORT_MODAL })}
                className="d-flex align-items-center gap-3 text-body p-3 border-bottom w-100 border-0 bg-transparent text-start sidebar-item"
              >
                <MessageSquareWarning size={STANDARD_ICON_SIZE} />
                <span>Report a Problem</span>
              </button>
              <button
                className="d-flex align-items-center gap-3 text-body p-3 w-100 border-0 bg-transparent text-start logout-item rounded-bottom-3"
                onClick={handleLogout}
              >
                <LogOut size={STANDARD_ICON_SIZE} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Appearance submenu */}
          {showAppearance && (
            <div
              className="position-absolute bottom-100 start-0 bg-body border rounded-3 shadow-lg mb-2"
              style={{ width: NAVBAR_CHILD_DIV_WIDTH }}
            >
              <div className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    {store.isDarkMode ? (
                      <Moon size={STANDARD_ICON_SIZE} />
                    ) : (
                      <Sun size={STANDARD_ICON_SIZE} />
                    )}
                    <span>Dark Mode</span>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={store.isDarkMode}
                      onChange={() => dispatch({ type: actionTypes.TOGGLE_DARK_MODE })}
                    />
                  </div>
                </div>
              </div>
              <div className="p-2 border-top">
                <button
                  onClick={() => {
                    setShowAppearance(false);
                    setShowMoreMenu(false);
                  }}
                  className="btn btn-sm text-muted w-100"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default DesktopSidebar;
