import { useContext } from "react";
import { StoreContext } from "../context/StoreContext";

const useGlobalReducer = () => {
    const ctx = useContext(StoreContext)
    if (!ctx) {
        throw new Error("useGlobalReducer is being used outside of StoreProvider context")
    }
    const { store, dispatch } = ctx;
    return { store, dispatch }
}

export default useGlobalReducer;