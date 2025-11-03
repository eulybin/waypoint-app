import { Outlet } from "react-router-dom/dist";
import HorizontalNavbar from "../components/Navbars/HorizontalNavbar";
import VerticalNavbar from "../components/Navbars/VerticalNavbar";
import useAuth from "../hooks/useAuth";
import Loader from "../components/Loader";

const Layout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <Loader />;

    const Navigation = isAuthenticated ? VerticalNavbar : HorizontalNavbar;
    
    return (
        <>
            <Navigation />
            <main className={isAuthenticated ? "with-sidebar" : undefined}>
                <Outlet />
            </main>
        </>
    );
};

export default Layout;