import { useEffect, useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store"

const StoreContext = createContext()

export function StoreProvider({ children }) {
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

export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}