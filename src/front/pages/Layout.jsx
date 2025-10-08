import Navbar from "../components/Navbar"
import HorizontalNavbar from "../components/HorizontalNavbar"
import { Outlet } from "react-router-dom/dist"

export const Layout = () => {
    return (
        <>
            {/* <Navbar /> */}
            <HorizontalNavbar />
            <Outlet />
        </>

    )
}