from flask import jsonify
from api.models import db, User, Route, Favorite
from flask_jwt_extended import get_jwt_identity

def toggle_favorite(route_id):
    """Añade o elimina una ruta de los favoritos de un usuario."""
    try:
        user_id = int(get_jwt_identity())
        
        route = Route.query.get(route_id)
        if not route:
            return jsonify({"message": "Ruta no encontrada"}), 404

        favorite = Favorite.query.filter_by(user_id=user_id, route_id=route_id).first()

        if favorite:
            # Si ya es favorito, lo elimina
            db.session.delete(favorite)
            db.session.commit()
            return jsonify({"message": "Ruta eliminada de favoritos"}), 200
        else:
            # Si no es favorito, lo añade
            new_favorite = Favorite(user_id=user_id, route_id=route_id)
            db.session.add(new_favorite)
            db.session.commit()
            return jsonify({"message": "Ruta añadida a favoritos"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error al procesar la solicitud de favorito", "error": str(e)}), 500

def get_user_favorites(user_id):
    """Obtiene todas las rutas favoritas de un usuario."""
    try:
        # Opcional: verificar permisos si solo el propio usuario puede ver sus favoritos
        current_user_id = int(get_jwt_identity())
        if current_user_id != user_id:
            return jsonify({"message": "No tienes permisos"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "Usuario no encontrado"}), 404
            
        favorite_routes = [fav.route.serialize() for fav in user.favorites]
        
        return jsonify(favorite_routes), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener las rutas favoritas", "error": str(e)}), 500