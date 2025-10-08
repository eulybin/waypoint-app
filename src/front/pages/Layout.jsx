import HorizontalNavbar from "../components/HorizontalNavbar"
import Navbar from "../components/Navbar"
import { Outlet } from "react-router-dom/dist"

export const Layout = () => {
    return (
        <>
            {/* <HorizontalNavbar /> */}
            <Navbar />
            <Outlet />
        </>

    )
}