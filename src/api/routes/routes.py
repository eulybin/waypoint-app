from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime
import json
from api.routes import register_login, profile, api_map

api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api)


# AUTENTICACIÓN Y REGISTRO

@api.route("/register", methods=["POST"])
def register():
    return register_login.register()
    
# LOGIN

@api.route("/login", methods=["POST"])
def login():
    return register_login.login()

# PERFIL DE USUARIO

@api.route("/profile", methods=["GET"])
@jwt_required()
def get_current_user():
    return profile.get_current_user()



# RUTAS TURÍSTICAS


@api.route("/routes", methods=["GET"])
def get_all_routes():
    return api_map.get_all_routes()


@api.route("/routes", methods=["POST"])
@jwt_required()
def create_route():
    return api_map.create_route()


@api.route("/routes/<int:route_id>", methods=["GET"])
def get_route_detail(route_id):
    return api_map.get_route_detail(route_id)


@api.route("/routes/<int:route_id>", methods=["PUT"])
@jwt_required()
def update_route(route_id):
    return api_map.update_route(route_id)


@api.route("/routes/<int:route_id>", methods=["DELETE"])
@jwt_required()
def delete_route(route_id):
    return api_map.delete_route(route_id)


@api.route("/routes/city/<string:city>", methods=["GET"])
def get_routes_by_city(city):
    # Obtener rutas por ciudad
    try:
        routes = (
            Route.query.filter_by(city=city).order_by(Route.created_at.desc()).all()
        )
        return jsonify([route.serialize() for route in routes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener rutas por ciudad"}), 500


@api.route("/routes/user/<int:user_id>", methods=["GET"])
def get_routes_by_user(user_id):
    # Obtener rutas de un usuario específico
    try:
        routes = (
            Route.query.filter_by(user_id=user_id)
            .order_by(Route.created_at.desc())
            .all()
        )
        return jsonify([route.serialize() for route in routes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener rutas del usuario"}), 500


@api.route("/routes/top", methods=["GET"])
def get_top_routes():
    # Obtener top rutas por rating
    try:
        routes = Route.query.all()

        # Calcular rating y ordenar
        routes_with_rating = []
        for route in routes:
            avg_rating = route.get_average_rating()
            total_votes = route.get_total_votes()
            if total_votes > 0:  # Solo rutas con votos
                routes_with_rating.append((route, avg_rating, total_votes))

        # Ordenar por rating promedio y número de votos
        routes_with_rating.sort(key=lambda x: (x[1], x[2]), reverse=True)

        # Tomar top 10
        top_routes = [route[0].serialize() for route in routes_with_rating[:10]]

        return jsonify(top_routes), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener top rutas"}), 500


# SISTEMA DE VOTACIÓN


@api.route("/votes", methods=["POST"])
@jwt_required()
def vote_route():
    # Votar por una ruta (1-5 estrellas)
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data or not data.get("route_id") or not data.get("rating"):
            return jsonify({"message": "route_id y rating son requeridos"}), 400

        route_id = data["route_id"]
        rating = data["rating"]

        # Validar rating
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({"message": "Rating debe ser entre 1 y 5"}), 400

        # Verificar que la ruta existe
        route = Route.query.get(route_id)
        if not route:
            return jsonify({"message": "Ruta no encontrada"}), 404

        # No permitir votar por tu propia ruta
        if route.user_id == user_id:
            return jsonify({"message": "No puedes votar por tu propia ruta"}), 400

        # Verificar si ya votó
        existing_vote = Vote.query.filter_by(user_id=user_id, route_id=route_id).first()

        if existing_vote:
            # Actualizar voto existente
            existing_vote.rating = rating
            message = "Voto actualizado exitosamente"
        else:
            # Crear nuevo voto
            new_vote = Vote(user_id=user_id, route_id=route_id, rating=rating)
            db.session.add(new_vote)
            message = "Voto registrado exitosamente"

        db.session.commit()
        return jsonify({"message": message}), 200

    except Exception as e:
        return jsonify({"message": "Error al votar"}), 500


@api.route("/votes/route/<int:route_id>", methods=["GET"])
def get_route_votes(route_id):
    # Obtener todos los votos de una ruta
    try:
        votes = Vote.query.filter_by(route_id=route_id).all()
        return jsonify([vote.serialize() for vote in votes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener votos"}), 500


@api.route("/votes/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_votes(user_id):
    # Obtener votos de un usuario - solo el propio usuario o admin
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)

        # Verificar permisos
        if current_user_id != user_id and current_user.role != UserRole.ADMIN:
            return jsonify({"message": "No tienes permisos"}), 403

        votes = Vote.query.filter_by(user_id=user_id).all()
        return jsonify([vote.serialize() for vote in votes]), 200

    except Exception as e:
        return jsonify({"message": "Error al obtener votos del usuario"}), 500


# APIs EXTERNAS


# @api.route('/external/weather/<string:city>', methods=['GET'])
# def get_weather(city):
#     # Obtener clima de una ciudad
#     try:
#         # OpenWeatherMap API (necesitas registrarte gratis en openweathermap.org)
#         api_key = os.getenv('WEATHER_API_KEY')
#         if not api_key:
#             # Datos de ejemplo si no hay API key
#             return jsonify({
#                 "city": city,
#                 "temperature": 22,
#                 "description": "Soleado",
#                 "humidity": 65,
#                 "message": "Datos de ejemplo - configura WEATHER_API_KEY para datos reales"
#             }), 200

#         url = "http://api.openweathermap.org/data/2.5/weather"
#         params = {
#             'q': city,
#             'appid': api_key,
#             'units': 'metric',
#             'lang': 'es'
#         }

#         response = requests.get(url, params=params, timeout=10)

#         if response.status_code == 200:
#             data = response.json()
#             weather_data = {
#                 'city': data['name'],
#                 'country': data['sys']['country'],
#                 'temperature': data['main']['temp'],
#                 'description': data['weather'][0]['description'],
#                 'icon': data['weather'][0]['icon'],
#                 'humidity': data['main']['humidity'],
#                 'wind_speed': data['wind']['speed']
#             }
#             return jsonify(weather_data), 200
#         else:
#             return jsonify({"message": "Ciudad no encontrada"}), 404

#     except requests.RequestException:
#         return jsonify({"message": "Error de conexión con API de clima"}), 500
#     except Exception as e:
#         return jsonify({"message": "Error al obtener clima"}), 500


@api.route("/external/geocode/<string:location>", methods=["GET"])
def geocode_location(location):
    # Obtener coordenadas de una ubicación
    try:
        # Nominatim (OpenStreetMap) - Gratuito, sin API key
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": location, "format": "json", "limit": 1, "addressdetails": 1}

        headers = {"User-Agent": "TravelRoutesApp/1.0"}  # Nominatim requiere User-Agent

        response = requests.get(url, params=params, headers=headers, timeout=10)

        if response.status_code == 200:
            data = response.json()
            if data:
                location_data = data[0]
                return (
                    jsonify(
                        {
                            "lat": float(location_data["lat"]),
                            "lon": float(location_data["lon"]),
                            "display_name": location_data["display_name"],
                            "address": location_data.get("address", {}),
                        }
                    ),
                    200,
                )
            else:
                return jsonify({"message": "Ubicación no encontrada"}), 404
        else:
            return jsonify({"message": "Error en servicio de geocodificación"}), 500

    except requests.RequestException:
        return jsonify({"message": "Error de conexión con servicio de mapas"}), 500
    except Exception as e:
        return jsonify({"message": "Error al obtener coordenadas"}), 500


# ADMINISTRACIÓN - Solo para admins


@api.route("/admin/users", methods=["GET"])
@jwt_required()
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


@api.route("/admin/routes", methods=["GET"])
@jwt_required()
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


@api.route("/admin/stats", methods=["GET"])
@jwt_required()
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


@api.route("/hello", methods=["POST", "GET"])
def handle_hello():
    response_body = {
        "message": "Hello! Travel Routes API is working correctly",
        "endpoints": {
            "auth": ["/register", "/login", "/profile"],
            "routes": ["/routes", "/routes/<id>", "/routes/city/<city>", "/routes/top"],
            "votes": ["/votes", "/votes/route/<id>"],
            "external": ["/external/weather/<city>", "/external/geocode/<location>"],
            "admin": ["/admin/users", "/admin/routes", "/admin/stats"],
        },
    }
    return jsonify(response_body), 200


# ROUTE FOR REPORT PROBLEM MODAL
@api.route("/report", methods=["POST"])
def report_problem():
    try:
        description = request.form.get("description")
        attached_file = request.files.get("attachedFile")

        if not description:
            return jsonify({"error": "Description is required"}), 400

        # build the email with smtplib library here:
        pass

        # attach the file if it is present
        if attached_file:
            pass

    except Exception as e:
        print("There was an error in /report route:", e)
        return jsonify({"error": "Failed to send the report."}), 500
