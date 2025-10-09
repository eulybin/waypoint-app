from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime
import json
from api.routes import register_login, profile

def get_all_routes():
    # Obtener todas las rutas
    try:
        routes = Route.query.order_by(Route.created_at.desc()).all()
        return jsonify([route.serialize() for route in routes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener rutas"}), 500

def create_route():
    # Crear nueva ruta
    try:
        # Asegurarse de que user_id sea entero
        user_id = int(get_jwt_identity())
        data = request.get_json()

        # Validación
        if (
            not data
            or not data.get("country")
            or not data.get("city")
            or not data.get("points_of_interest")
        ):
            return (
                jsonify({"message": "Faltan datos: country, city, points_of_interest"}),
                400,
            )

        # Crear ruta
        new_route = Route(
            user_id=user_id,
            country=data["country"],
            city=data["city"],
            locality=data.get("locality", ""),
            points_of_interest=(
                json.dumps(data["points_of_interest"])
                if isinstance(data["points_of_interest"], list)
                else data["points_of_interest"]
            ),
            coordinates=(
                json.dumps(data["coordinates"]) if data.get("coordinates") else None
            ),
        )

        db.session.add(new_route)
        db.session.commit()

        return (
            jsonify(
                {"message": "Ruta creada exitosamente", "route": new_route.serialize()}
            ),
            201,
        )

    except Exception as e:
        # Log detallado para depuración
        import traceback

        tb = traceback.format_exc()
        print("ERROR al crear ruta:", str(e))
        print(tb)
        # En entorno de desarrollo puede ser útil devolver la traza
        return (
            jsonify(
                {"message": "Error al crear ruta", "error": str(e), "traceback": tb}
            ),
            500,
        )

def get_route_detail(route_id):
    """Obtener detalle de una ruta específica"""
    try:
        route = Route.query.get(route_id)
        if not route:
            return jsonify({"message": "Ruta no encontrada"}), 404
        return jsonify(route.serialize()), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener ruta"}), 500

def update_route(route_id):
    """Actualizar ruta - solo el autor"""
    try:
        user_id = int(get_jwt_identity())
        route = Route.query.get(route_id)

        if not route:
            return jsonify({"message": "Ruta no encontrada"}), 404

        # Verificar que es el autor
        if route.user_id != user_id:
            return jsonify({"message": "No tienes permisos para editar esta ruta"}), 403

        data = request.get_json()

        # Actualizar campos
        if data.get("country"):
            route.country = data["country"]
        if data.get("city"):
            route.city = data["city"]
        if data.get("locality"):
            route.locality = data["locality"]
        if data.get("points_of_interest"):
            route.points_of_interest = (
                json.dumps(data["points_of_interest"])
                if isinstance(data["points_of_interest"], list)
                else data["points_of_interest"]
            )
        if data.get("coordinates"):
            route.coordinates = json.dumps(data["coordinates"])

        db.session.commit()

        return (
            jsonify(
                {"message": "Ruta actualizada exitosamente", "route": route.serialize()}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"message": "Error al actualizar ruta"}), 500

def delete_route(route_id):
    """Eliminar ruta - solo autor o admin"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        route = Route.query.get(route_id)

        if not route:
            return jsonify({"message": "Ruta no encontrada"}), 404

        # Verificar permisos: autor o admin
        if route.user_id != user_id and user.role != UserRole.ADMIN:
            return (
                jsonify({"message": "No tienes permisos para eliminar esta ruta"}),
                403,
            )

        db.session.delete(route)
        db.session.commit()

        return jsonify({"message": "Ruta eliminada exitosamente"}), 200

    except Exception as e:
        return jsonify({"message": "Error al eliminar ruta"}), 500



