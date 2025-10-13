// ============================================================================
// CONTEXT DE AUTENTICACIÓN
// ============================================================================
// Este Context maneja TODO lo relacionado con autenticación:
// - Login/Logout/Register
// - Verificación de token al cargar la app
// - Estado global del usuario autenticado
// - Protección de rutas

import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, getAuthHeaders } from '../utils/apiConfig';

// Crear el Context
const AuthContext = createContext();

// ============================================================================
// HOOK PERSONALIZADO: useAuth
// ============================================================================
// Usar este hook en cualquier componente para acceder a la autenticación:
// const { user, isAuthenticated, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER: AuthProvider
// ============================================================================
export const AuthProvider = ({ children }) => {
  // ========== ESTADO ==========
  const [user, setUser] = useState(null); // Datos del usuario autenticado
  const [loading, setLoading] = useState(true); // Loading inicial al verificar token
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ¿Está autenticado?

  // ========== EFECTO: Verificar autenticación al montar ==========
  // Se ejecuta UNA VEZ al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  // ========== FUNCIÓN: Verificar si hay token válido ==========
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Hacer petición al backend para validar el token
        const response = await fetch(API_ENDPOINTS.PROFILE, {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token inválido o expirado - hacer logout
          logout();
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        logout();
      }
    }
    
    setLoading(false); // Termina el loading inicial
  };

  // ========== FUNCIÓN: Login ==========
  const login = async (email, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login falló');
      }

      if (data.token) {
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }

      throw new Error('No se recibió token del servidor');
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== FUNCIÓN: Register ==========
  const register = async (name, email, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registro falló');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== FUNCIÓN: Logout ==========
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // ========== VALOR DEL CONTEXT ==========
  // Todo lo que se expone a los componentes que usen useAuth()
  const value = {
    user,              // Datos del usuario
    loading,           // Estado de carga inicial
    isAuthenticated,   // Boolean: ¿está autenticado?
    login,             // Función para hacer login
    register,          // Función para registrarse
    logout,            // Función para hacer logout
    checkAuth,         // Función para re-verificar autenticación
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};