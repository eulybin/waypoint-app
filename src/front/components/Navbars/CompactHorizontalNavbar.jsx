import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, User, TrendingUp, MapPinPlus, Menu, Sun, Moon, LogOut, MessageSquareWarning } from 'lucide-react';
import useGlobalReducer from '../../hooks/useGlobalReducer';
import { actionTypes } from '../../store';
import { NAVBAR_ICON_SIZE, STANDARD_ICON_SIZE, NAVBAR_Z_INDEX } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import { navRouteLinks } from './navRouteLinks';

const iconMap = { Home, Compass, User, TrendingUp };

const CompactHorizontalNavbar = ({ showMoreMenu, setShowMoreMenu, showAppearance, setShowAppearance }) => {
  const { store, dispatch } = useGlobalReducer();
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const isMoreOpen = showMoreMenu || showAppearance;

  const handleLogout = () => {
    logoutUser();
    navigate('/search');
    setShowMoreMenu(false);
  };

  return (
    <nav className="navbar-compact-horizontal bg-body border-top position-fixed bottom-0 start-0 end-0 d-flex align-items-center justify-content-around px-2 py-2" style={{ zIndex: 1000 }}>
      {/* Main navigation links - Icons only */}
      {navRouteLinks.map((item, idx) => {
        const Icon = iconMap[item.icon];
        return (
          <Link
            key={idx}
            to={item.path}
            className="d-flex align-items-center justify-content-center text-body text-decoration-none p-2 rounded-4 compact-nav-item"
            aria-label={item.label}
            title={item.label}
          >
            <Icon size={NAVBAR_ICON_SIZE} />
          </Link>
        );
      })}

      {/* More Menu */}
      <div className="position-relative d-flex align-items-center">
        <button
          className={`btn btn-link text-body p-2 d-flex align-items-center justify-content-center text-decoration-none rounded-4 compact-nav-item ${isMoreOpen ? 'active' : ''}`}
          onClick={() => {
            if (showAppearance) {
              setShowAppearance(false);
              setShowMoreMenu(false);
            } else {
              setShowMoreMenu((prev) => !prev);
            }
          }}
          aria-label="More options"
          title="More"
        >
          <Menu size={NAVBAR_ICON_SIZE} />
        </button>

        {isMoreOpen && (
          <>
            <div
              className="position-absolute end-100 bg-body border rounded-3 d-flex me-5"
              style={{
                zIndex: NAVBAR_Z_INDEX,
              }}
            >
              {/* Appearance Toggle */}
              <button
                onClick={() => dispatch({ type: actionTypes.TOGGLE_DARK_MODE })}
                className="d-flex align-items-center justify-content-center text-body p-2 border-0 bg-transparent sidebar-item rounded-start-3"
                aria-label={store.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={store.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {store.isDarkMode ? <Sun size={STANDARD_ICON_SIZE} /> : <Moon size={STANDARD_ICON_SIZE} />}
              </button>

              {/* Report Problem */}
              <button
                onClick={() => {
                  dispatch({ type: actionTypes.OPEN_REPORT_MODAL });
                  setShowMoreMenu(false);
                }}
                className="d-flex align-items-center justify-content-center text-body p-2 border-0 bg-transparent sidebar-item"
                aria-label="Report a Problem"
                title="Report a Problem"
              >
                <MessageSquareWarning size={STANDARD_ICON_SIZE} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="d-flex align-items-center justify-content-center text-body p-2 border-0 bg-transparent logout-item rounded-end-3"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={STANDARD_ICON_SIZE} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Route Button */}
      <Link
        to="/create-route"
        className="d-flex align-items-center justify-content-center text-decoration-none p-2 rounded-4 badge-orange-dark text-white"
        aria-label="Create Route"
        title="Create Route"
      >
        <MapPinPlus size={NAVBAR_ICON_SIZE} />
      </Link>
    </nav>
  );
};

export default CompactHorizontalNavbar;