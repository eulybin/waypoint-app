/**
 * PÁGINA: TRENDING
 *
 * Muestra el TOP 5 de rutas más votadas de todos los usuarios
 * Las rutas se ordenan por puntuación (average_rating) y total de votos
 *
 * Características:
 * - Ranking visual con posiciones (🥇🥈🥉)
 * - Tarjetas de rutas con toda la información
 * - Loading state mientras carga
 * - Manejo de errores
 * - Responsive design
 */

import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Star, Award } from "lucide-react";
import RouteCard from "../components/RouteCard";
import Loader from "../components/Loader";
import { API_ENDPOINTS, getAuthHeaders } from "../utils/apiConfig";
import { HEADER_ICON_SIZE } from "../utils/constants";

const Trending = () => {
  // ==================== ESTADOS ====================

  // Estado para almacenar las rutas del top 5
  const [topRoutes, setTopRoutes] = useState([]);

  // Estado de carga
  const [isLoading, setIsLoading] = useState(true);

  // Estado de error
  const [error, setError] = useState(null);

  // ==================== EFECTOS ====================

  /**
   * Efecto que se ejecuta al montar el componente
   * Carga las rutas del TOP 5 desde el backend
   */
  useEffect(() => {
    fetchTopRoutes();
  }, []); // Array vacío = solo se ejecuta una vez al montar

  // ==================== FUNCIONES ====================

  /**
   * Obtiene TODAS las rutas y las ordena por puntuación
   *
   * Criterios de ordenamiento:
   * 1. Por average_rating (descendente) - Las mejor puntuadas primero
   * 2. Si tienen la misma puntuación, por total_votes (descendente)
   * 3. Si tienen los mismos votos, por fecha de creación (más recientes primero)
   */
  const fetchTopRoutes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Obteniendo todas las rutas...");

      // Obtenemos TODAS las rutas directamente
      const response = await fetch(API_ENDPOINTS.ROUTES, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Error al cargar las rutas");
      }

      const data = await response.json();

      console.log(`📊 Total de rutas encontradas: ${data.length}`);

      // Ordenamos las rutas por múltiples criterios
      const sortedRoutes = data.sort((a, b) => {
        // 1. Primero por puntuación (average_rating) - de mayor a menor
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;

        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }

        // 2. Si tienen la misma puntuación, por total de votos
        const votesA = a.total_votes || 0;
        const votesB = b.total_votes || 0;

        if (votesB !== votesA) {
          return votesB - votesA;
        }

        // 3. Si tienen los mismos votos, por fecha de creación (más reciente primero)
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });

      // Tomamos solo las primeras 5 rutas
      setTopRoutes(sortedRoutes.slice(0, 5));

      console.log(`✅ TOP 5 rutas cargadas para el ranking`);
    } catch (err) {
      console.error("❌ Error al obtener rutas trending:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene el emoji de medalla según la posición
   * @param {number} position - Posición en el ranking (1, 2, 3, etc.)
   * @returns {string} - Emoji correspondiente
   */
  const getMedalEmoji = (position) => {
    switch (position) {
      case 1:
        return "🥇"; // Oro
      case 2:
        return "🥈"; // Plata
      case 3:
        return "🥉"; // Bronce
      case 4:
        return "⬆️";
      default:
        return "⬇️"; // Número para posiciones 4 y 5
    }
  };

  /**
   * Obtiene la clase CSS de color según la posición
   * @param {number} position - Posición en el ranking
   * @returns {string} - Clase de Bootstrap
   */
  const getPositionClass = (position) => {
    switch (position) {
      case 1:
        return "bg-warning"; // Dorado
      case 2:
        return "bg-secondary"; // Plateado
      case 3:
        return "bg-danger"; // Bronce/Rojo
      default:
        return "bg-success"; // Verde para el resto
    }
  };

  // ==================== RENDERIZADO ====================

  // Mostrar loader mientras carga
  if (isLoading) {
    return (
      <div className="container py-5">
        <Loader />
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-danger mt-3" onClick={fetchTopRoutes}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay rutas
  if (topRoutes.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <TrendingUp size={64} className="text-muted mb-3" />
          <h3 className="text-muted">No hay rutas disponibles</h3>
          <p className="text-muted">
            Sé el primero en crear una ruta y aparecer en el ranking.
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDERIZADO PRINCIPAL ====================

  return (
    <div className="container py-5">
      {/* Header de la página */}
      <div className="text-center mb-5">
        {/* Icono principal */}
        <div className="mb-3">
          <div className="mb-3 header-icon-badge badge-purple"><TrendingUp size={HEADER_ICON_SIZE} /></div>
        </div>

        {/* Título */}
        <h1 className="display-4 fw-bold mb-3">
          Rutas en Tendencia
        </h1>

        {/* Subtítulo */}
        <p className="lead text-muted">
          Las {topRoutes.length} rutas mejor valoradas por la comunidad
        </p>

        {/* Divider decorativo */}
        <hr className="w-25 mx-auto border-warning border-3" />
      </div>

      {/* Grid de rutas del TOP 5 */}
      <div className="row g-4">
        {topRoutes.map((route, index) => {
          const position = index + 1; // Posición en el ranking (1, 2, 3, 4, 5)

          return (
            <div key={route.id} className="col-12">
              {/* Contenedor de la tarjeta con badge de posición */}
              <div className="position-relative">
                {/* Badge de posición (medalla o número) */}
                <div
                  className={`position-absolute badge ${getPositionClass(position)} rounded-pill`}
                  style={{
                    top: "-10px",
                    left: "20px",
                    zIndex: 10,
                    fontSize: "1.2rem",
                    padding: "10px 20px",
                    boxShadow: "0 4px 8px `rgba(0, 0, 0, 1)",
                  }}
                >
                  <Award size={18} className="me-2" />
                  <span className="fw-bold">{getMedalEmoji(position)}</span>
                  {position > 3 && <span className="ms-2"></span>}
                </div>

                {/* Tarjeta de la ruta con efecto hover especial para top 3 */}
                <div
                  className={`card shadow-lg ${position <= 3 ? "border-warning border-3" : ""}`}
                  style={{
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                >
                  <div className="card-body p-4">
                    <div className="row align-items-center">
                      {/* Columna izquierda: Información del ranking */}
                      <div className="col-md-2 text-center border-end">
                        {/* Número de posición grande */}
                        <div className="display-1 fw-bold text-muted ">
                          {position}
                        </div>

                        {/* Estadísticas de votación */}
                        <div className="mt-3">
                          <Star
                            size={32}
                            className="text-warning mb-2"
                            fill="currentColor"
                          />
                          <div className="fw-bold fs-4">
                            {route.average_rating?.toFixed(1) || "0.0"}
                          </div>
                          <small className="text-muted">
                            {route.total_votes || 0} votos
                          </small>
                        </div>
                      </div>

                      {/* Columna derecha: RouteCard */}
                      <div className="col-md-10">
                        <RouteCard route={route} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer informativo */}
      <div className="text-center mt-5 pt-4 border-top">
        <p className="text-muted">
          <Star size={16} className="text-warning me-2" />
          El ranking se actualiza automáticamente según las votaciones de los
          usuarios
        </p>
      </div>
    </div>
  );
};

export default Trending;
