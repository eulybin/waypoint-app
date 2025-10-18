import { Outlet } from "react-router-dom/dist";
import HorizontalNavbar from "../components/HorizontalNavbar";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";

const Layout = () => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <Loader />;


    const Navigation = isAuthenticated ? Navbar : HorizontalNavbar;
    return (
        <>
            <Navigation />
            <Outlet />
        </>
    );
};

export default Layout;