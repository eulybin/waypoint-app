import HorizontalNavbar from "../components/HorizontalNavbar"
import Navbar from "../components/Navbar"
import { Outlet } from "react-router-dom/dist"
import useGlobalReducer from "../hooks/useGlobalReducer"

export const Layout = () => {

    const { store } = useGlobalReducer()

    return (
        <>
            {store.userIsLoggedIn ? <Navbar /> : <HorizontalNavbar />}
            <Outlet />
        </>

    )
}