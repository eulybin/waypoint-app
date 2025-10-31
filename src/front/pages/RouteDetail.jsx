/**
 * PÁGINA: ROUTE DETAIL
 * 
 * Vista simplificada y estética del detalle de una ruta
 * Solo muestra:
 * - Sistema de votación elegante
 * - Card del mapa con todas las funcionalidades
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart } from "lucide-react";
import Loader from "../components/Loader";
import RouteMapCard from "../components/Profile/RouteMapCard";
import StarRating from "../components/StarRating";
import useAuth from "../hooks/useAuth";

// Servicios
import { getRouteDetail } from "../services/routesService";
import { voteRoute, getUserVotes } from "../services/votesService";
import { addFavorite, removeFavorite, getUserFavorites } from "../services/favoritesService";

const RouteDetail = () => {
  // ==================== HOOKS ====================
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ==================== ESTADOS ====================
  
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // ==================== EFECTOS ====================
  
  useEffect(() => {
    if (!id || !user) return;

    const controller = new AbortController();
    fetchData(controller.signal);

    return () => controller.abort();
  }, [id, user]);

  // ==================== FUNCIONES ====================
  
  const fetchData = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const [routeData, userVotesData, userFavoritesData] = await Promise.all([
        getRouteDetail(id, signal),
        getUserVotes(user.id, signal),
        getUserFavorites(user.id, signal),
      ]);

      setRoute(routeData);

      const vote = userVotesData.find((v) => v.route_id === parseInt(id));
      if (vote) setUserVote(vote.rating);

      const isFav = userFavoritesData.some((fav) => fav.id === parseInt(id));
      setIsFavorite(isFav);

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error al cargar datos:", err);
        setError(err.message || "No se pudo cargar la ruta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (rating) => {
    try {
      setIsVoting(true);
      await voteRoute(parseInt(id), rating);
      setUserVote(rating);
      
      const updatedRoute = await getRouteDetail(id);
      setRoute(updatedRoute);
    } catch (err) {
      console.error("Error al votar:", err);
      alert(err.message || "No se pudo registrar tu voto");
    } finally {
      setIsVoting(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      setIsTogglingFavorite(true);

      if (isFavorite) {
        await removeFavorite(parseInt(id));
        setIsFavorite(false);
      } else {
        await addFavorite(parseInt(id));
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error con favoritos:", err);
      alert(err.message || "No se pudo actualizar favoritos");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // ==================== RENDERIZADO ====================
  
  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <Loader className="animate-spin" size={48} />
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error || "Ruta no encontrada"}</p>
          <button className="btn btn-danger mt-3" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} className="me-2" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && route.user_id === user.id;

  return (
    <div className="container py-5">
      {/* Botón volver minimalista */}
      <button
        className="btn btn-link text-muted mb-3 p-0"
        onClick={() => navigate(-1)}
        style={{ textDecoration: 'none' }}
      >
        <ArrowLeft size={18} className="me-2" />
        Volver
      </button>

      {/* Panel de votación flotante y elegante */}
      <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '15px' }}>
        <div className="card-body p-4">
          <div className="row align-items-center">
            {/* Puntuación visual grande */}
            <div className="col-md-4 text-center border-end">
              <div className="mb-3">
                <div 
                  className="display-3 fw-bold mb-2" 
                  style={{ 
                    color: '#ffc107',
                    textShadow: '0 2px 4px rgba(255,193,7,0.2)'
                  }}
                >
                  {route.average_rating?.toFixed(1) || "0.0"}
                </div>
                <div className="d-flex justify-content-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      fill={star <= Math.round(route.average_rating || 0) ? "#ffc107" : "none"}
                      color={star <= Math.round(route.average_rating || 0) ? "#ffc107" : "#dee2e6"}
                      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }}
                    />
                  ))}
                </div>
                <p className="text-muted mb-0">
                  <strong>{route.total_votes || 0}</strong> {route.total_votes === 1 ? 'valoración' : 'valoraciones'}
                </p>
              </div>
            </div>

            {/* Sistema de votación */}
            <div className="col-md-5 text-center py-3">
              {!isAuthor ? (
                <>
                  <h5 className="mb-3 text-muted">
                    {userVote ? "✓ Tu valoración" : "Valora esta ruta"}
                  </h5>
                  <div className="d-flex justify-content-center">
                    <StarRating
                      initialRating={userVote || 0}
                      onRatingChange={handleVote}
                      disabled={isVoting}
                    />
                  </div>
                  {userVote && (
                    <small className="text-success d-block mt-2">
                      Has dado {userVote} {userVote === 1 ? 'estrella' : 'estrellas'}
                    </small>
                  )}
                </>
              ) : (
                <div className="alert alert-light border-0 mb-0">
                  <p className="mb-0 text-muted">
                    <small>Esta es tu ruta, no puedes votarla</small>
                  </p>
                </div>
              )}
            </div>

            {/* Botón de favoritos */}
            <div className="col-md-3 text-center">
              <button
                className={`btn btn-lg w-100 ${
                  isFavorite ? "btn-danger" : "btn-outline-danger"
                }`}
                onClick={toggleFavorite}
                disabled={isTogglingFavorite}
                style={{ 
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                }}
              >
                {isTogglingFavorite ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <Heart
                    size={24}
                    className="me-2"
                    fill={isFavorite ? "currentColor" : "none"}
                    style={{ 
                      transition: 'all 0.3s ease',
                      transform: isFavorite ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                )}
                <div className="d-block">
                  <div className="fw-bold">
                    {isFavorite ? "En favoritos" : "Favorito"}
                  </div>
                  <small style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {isFavorite ? "Quitar" : "Agregar"}
                  </small>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card del mapa - Reutilizando RouteMapCard */}
      <div className="row">
        <RouteMapCard
          route={route}
          type="detail" // Tipo especial para vista de detalle (mapa más grande, color azul)
          onDelete={null} // Sin botón de eliminar
        />
      </div>
    </div>
  );
};

export default RouteDetail;