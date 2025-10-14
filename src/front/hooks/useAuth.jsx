import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth is being used outside of the AuthProvider context');
    }
    const { user, loading, isAuthenticated, loginUser, registerUser, logoutUser, checkAuth } = ctx;
    return { user, loading, isAuthenticated, loginUser, registerUser, logoutUser, checkAuth };
};

export default useAuth;