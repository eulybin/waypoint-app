// ============================================================================
// CONTEXT DE AUTENTICACIÓN
// ============================================================================
// - Login/Logout/Register
// - Verificación de token al cargar la app
// - Estado global del usuario autenticado
// - Protección de rutas

import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, getAuthHeaders } from '../utils/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Datos del usuario autenticado
  const [loading, setLoading] = useState(true); // Loading inicial al verificar token
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ¿Está autenticado?

  // Check token on initial render
  useEffect(() => {
    checkAuth();
  }, []);

  // ========== VERIFY TOKEN ==========
  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      logoutUser()
      setLoading(false)
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

  // ========== LOGIN ==========
  const loginUser = async (userLoginData, signal) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userLoginData),
      ...(signal && { signal }),
    };

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, requestOptions);
      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }
      if (!response.ok) {
        throw new Error(data.message || `Login failed (HTTP ${response.status})`);
      }
      if (!data.token) {
        throw new Error('Server did not return a valid authentication token.');
      }
      localStorage.setItem('token', data.token);
      setUser(data.user || null);
      setIsAuthenticated(true);
      return { success: true, user: data.user };

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Login request was aborted by user or component unmount.');
        return { success: false, error: 'Request cancelled.' };
      }
      console.error('Error during login:', error);
      return { success: false, error: error.message || 'Unexpected login error.' };
    }
  };


  // ========== REGISTER ==========
  const registerUser = async (newUserObject, signal) => {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(newUserObject),
      headers: {
        'Content-Type': 'application/json',
      },
      ...(signal && { signal }),
    };

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, requestOptions);
      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: 'Invalid JSON response from server.' };
      }
      if (!response.ok) {
        throw new Error(data.message || 'User registration failed.');
      }
      return { success: true, data };

    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Register request was aborted.');
        return { success: false, error: 'Request was aborted.' };
      }

      console.error('Error in register:', error);
      return { success: false, error: error.message || 'Unexpected registration error.' };
    }
  };

  // ========== LOGOUT ==========
  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // ========== AUTH CONTEXT VALUE OBJECT ==========
  const value = {
    user,              // Datos del usuario
    loading,           // Estado de carga inicial
    isAuthenticated,   // Boolean: ¿está autenticado?
    loginUser,             // Función para hacer login
    registerUser,          // Función para registrarse
    logoutUser,            // Función para hacer logout
    checkAuth,         // Función para re-verificar autenticación
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
