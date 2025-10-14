import { useEffect, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store"

export const StoreContext = createContext()

export const StoreProvider = ({ children }) => {
    const [store, dispatch] = useReducer(storeReducer, initialStore())

    useEffect(() => {
        const theme = store.isDarkMode ? "dark" : "light"
        document.documentElement.setAttribute("data-bs-theme", theme)
        localStorage.setItem("isDarkMode", JSON.stringify(store.isDarkMode))
    }, [store.isDarkMode])

    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}