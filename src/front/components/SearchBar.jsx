import brandNameLight from "../assets/brand-name-light.svg"
import brandNameDark from "../assets/brand-name-dark.svg"
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Search } from "lucide-react";
import { STANDARD_ICON_SIZE, INPUT_ICON_POSITION, SEARCH_BAR_MAX_WIDTH } from "../utils/constants";

const SearchBar = () => {

    const { store } = useGlobalReducer()

    return (
        <div className="d-flex flex-column align-items-center vh-100 bg-body pt-5">
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
            <div className="position-relative w-100" style={{ maxWidth: SEARCH_BAR_MAX_WIDTH }}>
                <Search
                    size={STANDARD_ICON_SIZE}
                    className="position-absolute text-muted ms-2"
                    style={INPUT_ICON_POSITION}
                />
                <input
                    type="text"
                    className="form-control ps-5 py-2 rounded-pill shadow-sm border search-input"
                    placeholder="Search for a city"
                />
            </div>
        </div>
    );
}

export default SearchBar