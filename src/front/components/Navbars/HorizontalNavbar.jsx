import useGlobalReducer from "../../hooks/useGlobalReducer";
import { actionTypes } from "../../store";
import { Moon, Sun } from 'lucide-react';
import { Link } from "react-router-dom";
import { NAVBAR_ICON_SIZE, NAVBAR_LOGO_SIZE } from "../../utils/constants";
import logo from "../../assets/logo.svg";


const HorizontalNavbar = () => {

    const { store, dispatch } = useGlobalReducer();

    const handleChangeAppearance = () => {
        dispatch({ type: actionTypes.TOGGLE_DARK_MODE });
    };

    return (
        <nav className="navbar navbar-expand bg-body sitcky-top border-bottom p-2">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">
                    <img src={logo} alt="Waypoint Logo" height={NAVBAR_LOGO_SIZE} />
                </Link>
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-link text-body p-2"
                        onClick={handleChangeAppearance}
                        aria-label={store.isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {store.isDarkMode ? <Sun size={NAVBAR_ICON_SIZE} /> : <Moon size={NAVBAR_ICON_SIZE} />}
                    </button>

                    <Link to="/login" className="text-decoration-none">
                        <button type="button" className="btn bg-orange text-white px-3 py-2 rounded-pill fw-semibold">
                            Log in
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default HorizontalNavbar;
