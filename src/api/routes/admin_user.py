from flask import Flask, jsonify
from api.models import db, User, Route, Vote, UserRole
from flask_jwt_extended import get_jwt_identity



def admin_get_routes():
    # Obtener todas las rutas con info de admin
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role != UserRole.ADMIN:
            return jsonify({"message": "Acceso denegado"}), 403

        routes = Route.query.order_by(Route.created_at.desc()).all()
        return jsonify([route.serialize() for route in routes]), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener rutas"}), 500

def admin_get_users():
    """Obtener todos los usuarios - solo admin"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role != UserRole.ADMIN:
            return jsonify({"message": "Acceso denegado"}), 403

        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify([user.serialize() for user in users]), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener usuarios"}), 500

def admin_get_stats():
    # Obtener estadísticas generales
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role != UserRole.ADMIN:
            return jsonify({"message": "Acceso denegado"}), 403

        total_users = User.query.count()
        total_routes = Route.query.count()
        total_votes = Vote.query.count()
        active_users = User.query.filter_by(is_active=True).count()

        return (
            jsonify(
                {
                    "total_users": total_users,
                    "total_routes": total_routes,
                    "total_votes": total_votes,
                    "active_users": active_users,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"message": "Error al obtener estadísticas"}), 500
