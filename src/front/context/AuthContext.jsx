import { createContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, getAuthHeaders } from '../utils/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    // ========== REGISTER ==========
    const registerUser = async (newUserObject, signal) => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUserObject),
            signal,
        };

        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "User registration failed.");
            }

            return { success: true, data };

        } catch (error) {
            const isAborted = error.name === "AbortError";
            const errorMessage = isAborted
                ? "Request was aborted."
                : error.message || "Unexpected registration error.";

            console.error(`Registration error: ${errorMessage}`);

            return { success: false, error: errorMessage };
        }
    };

    // ========== LOGIN ==========
    const loginUser = async (userLoginData, signal) => {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userLoginData),
            signal,
        };

        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Login failed (HTTP ${response.status})`);
            }

            if (!data.token) {
                throw new Error("Server did not return a valid authentication token.");
            }

            localStorage.setItem("token", data.token);
            setUser(data.user || null);
            setIsAuthenticated(true);

            return { success: true, user: data.user };

        } catch (error) {
            const isAborted = error.name === "AbortError";
            const errorMessage = isAborted
                ? "Request cancelled."
                : error.message || "Unexpected login error.";

            console.error(`Login error: ${errorMessage}`);

            return { success: false, error: errorMessage };
        }
    };

    // ========== LOGOUT ==========
    const logoutUser = () => {
        localStorage.removeItem('token');
        if (user?.id) localStorage.removeItem(`home.city.${user.id}`);
        localStorage.removeItem('home.city.guest');
        setUser(null);
        setIsAuthenticated(false);
    };

    // ========== VERIFY TOKEN ==========
    const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            logoutUser();
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.PROFILE, {
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error('Error verifying authentication:', error);
            logoutUser();
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        loginUser,
        registerUser,
        logoutUser,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
