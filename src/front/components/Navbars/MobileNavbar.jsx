import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, User, TrendingUp, Menu, Sun, Moon, LogOut, MapPinPlus, MessageSquareWarning } from 'lucide-react';
import useGlobalReducer from '../../hooks/useGlobalReducer';
import { actionTypes } from '../../store';
import { STANDARD_ICON_SIZE, NAVBAR_ICON_SIZE } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import { navRouteLinks } from './navRouteLinks';

const iconMap = { Home, Compass, User, TrendingUp };

const MobileNavbar = ({ showMoreMenu, setShowMoreMenu, showAppearance, setShowAppearance }) => {
  const { store, dispatch } = useGlobalReducer();
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const isMoreOpen = showMoreMenu || showAppearance;

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setShowMoreMenu(false);
  };

  return (
    <div className="navbar-mobile d-flex d-md-none flex-column align-items-center justify-content-center bg-body border-end vh-100 position-fixed top-0 start-0">
      <div className="d-flex flex-column align-items-center mt-3 w-100">
        {navRouteLinks.map((item, idx) => {
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={idx}
              to={item.path}
              className="mobile-nav-item d-inline-flex align-items-center justify-content-center text-body text-decoration-none my-3 p-3 rounded-4 sidebar-item mx-2 w-80"
              aria-label={item.label}
              title={item.label}
            >
              <Icon size={NAVBAR_ICON_SIZE} />
            </Link>
          );
        })}

        {/* MORE BUTTON */}
        <div className="position-relative w-100 d-flex justify-content-center">
          <button
            className="mobile-nav-item d-flex align-items-center justify-content-center text-body border-0 bg-transparent my-3 w-100 p-3 rounded-4 sidebar-item mx-2"
            onClick={() => {
              if (showAppearance) {
                setShowAppearance(false);
                setShowMoreMenu(false);
              } else {
                setShowMoreMenu((prev) => !prev);
              }
            }}
            aria-label="More"
          >
            <Menu size={NAVBAR_ICON_SIZE} />
          </button>

          {isMoreOpen && (
            <div className="position-absolute bottom-100 start-50 translate-middle-x bg-body border rounded-3 shadow-lg navbar-popup mb-2">
              <button
                onClick={() => dispatch({ type: actionTypes.TOGGLE_DARK_MODE })}
                className="d-flex align-items-center justify-content-center text-body p-3 w-100 border-0 bg-transparent sidebar-item rounded-top-3"
                aria-label={store.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={store.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {store.isDarkMode ? <Sun size={STANDARD_ICON_SIZE} /> : <Moon size={STANDARD_ICON_SIZE} />}
              </button>
              <button
                onClick={() => dispatch({ type: actionTypes.OPEN_REPORT_MODAL })}
                className="d-flex align-items-center justify-content-center text-body p-3 w-100 border-0 bg-transparent sidebar-item"
                aria-label="Report a Problem"
                title="Report a Problem"
              >
                <MessageSquareWarning size={STANDARD_ICON_SIZE} />
              </button>
              <button
                onClick={handleLogout}
                className="d-flex align-items-center justify-content-center text-body p-3 w-100 border-0 bg-transparent logout-item rounded-bottom-3"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={STANDARD_ICON_SIZE} />
              </button>
            </div>
          )}
        </div>

        {/* CREATE ROUTE */}
        <Link
          to="/create-route"
          className="mobile-nav-item d-inline-flex align-items-center justify-content-center text-decoration-none my-3 p-3 rounded-4 mx-2 badge-orange-dark text-light"
          aria-label="Create Route"
          title="Create Route"
        >
          <MapPinPlus size={NAVBAR_ICON_SIZE} />
        </Link>
      </div>
    </div>
  );
};

export default MobileNavbar;
