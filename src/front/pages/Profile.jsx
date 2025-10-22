import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { getRoutesByUser } from '../services/routesService';
import { getUserFavorites } from '../services/favoritesService';
import ProfileMap from '../components//Profile/ProfileMap'; 
import { Loader } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [createdRoutes, setCreatedRoutes] = useState([]);
    const [favoriteRoutes, setFavoriteRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;

        const fetchProfileData = async () => {
            setLoading(true);
            setError('');
            try {
                // Usamos Promise.all para cargar ambas listas en paralelo
                const [created, favorites] = await Promise.all([
                    getRoutesByUser(user.id),
                    getUserFavorites(user.id)
                ]);
                setCreatedRoutes(created);
                setFavoriteRoutes(favorites);
            } catch (err) {
                setError('No se pudieron cargar los datos del perfil. Inténtalo de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Loader className="animate-spin" size={48} />
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Perfil de {user?.name}</h1>
            
            <div className="card">
                <div className="card-header">
                    <h3>Mis Rutas en el Mapa</h3>
                </div>
                <div className="card-body">
                    <p>
                        <span style={{ color: 'blue', fontWeight: 'bold' }}>■ Rutas Creadas</span> | 
                        <span style={{ color: 'orange', fontWeight: 'bold' }}> ■ Rutas Favoritas</span>
                    </p>
                    <ProfileMap createdRoutes={createdRoutes} favoriteRoutes={favoriteRoutes} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-md-6">
                    <h2>Rutas Creadas ({createdRoutes.length})</h2>
                    {/* Aquí podrías mostrar una lista de las rutas creadas si quieres */}
                    {createdRoutes.length > 0 ? (
                        <ul>
                            {createdRoutes.map(route => <li key={route.id}>{route.city}</li>)}
                        </ul>
                    ) : (
                        <p>Aún no has creado ninguna ruta.</p>
                    )}
                </div>
                <div className="col-md-6">
                    <h2>Rutas Favoritas ({favoriteRoutes.length})</h2>
                    {/* Aquí podrías mostrar una lista de las rutas favoritas */}
                    {favoriteRoutes.length > 0 ? (
                        <ul>
                            {favoriteRoutes.map(route => <li key={route.id}>{route.city}</li>)}
                        </ul>
                    ) : (
                        <p>Aún no has marcado ninguna ruta como favorita.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;