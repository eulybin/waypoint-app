from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime
import json
from api.routes import register_login, profile, api_map, route_report_problem, votes, coordinates, admin_user

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

@api.route("/create-admin", methods=["POST"])
def create_admin():
    return register_login.create_admin()

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
   return api_map.get_routes_by_city(city)

@api.route("/routes/user/<int:user_id>", methods=["GET"])
def get_routes_by_user(user_id):
    # Obtener rutas de un usuario específico
    return api_map.get_routes_by_user(user_id)

@api.route("/routes/top", methods=["GET"])
def get_top_routes():
    # Obtener top rutas por rating
    return api_map.get_top_routes()


# SISTEMA DE VOTACIÓN

@api.route("/external/geocode/<string:location>", methods=["GET"])
def geocode_location(location):
    # Obtener coordenadas de una ubicación
    return coordinates.geocode_location(location)


@api.route("/votes", methods=["POST"])
@jwt_required()
def vote_route():
    # Votar por una ruta (1-5 estrellas)
    return votes.vote_route()
    


@api.route("/votes/route/<int:route_id>", methods=["GET"])
def get_route_votes(route_id):
    # Obtener todos los votos de una ruta
    return votes.get_route_votes(route_id)

@api.route("/votes/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_votes(user_id):
    # Obtener votos de un usuario - solo el propio usuario o admin
    return votes.get_user_votes(user_id)




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




# ADMINISTRACIÓN - Solo para admins


@api.route("/admin/users", methods=["GET"])
@jwt_required()
def admin_get_users():
    """Obtener todos los usuarios - solo admin"""
    return admin_user.admin_get_users()


@api.route("/admin/routes", methods=["GET"])
@jwt_required()
def admin_get_routes():
    # Obtener todas las rutas con info de admin
    return admin_user.admin_get_routes()


@api.route("/admin/stats", methods=["GET"])
@jwt_required()
def admin_get_stats():
    # Obtener estadísticas generales
    return admin_user.admin_get_stats()


@api.route("/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    '''Éliminar usuario - solo admin'''
    return admin_user.delete_user(user_id)


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



@api.route("/report", methods=["POST"])
def report_problem():
    """Reportar un problema o enviar feedback"""
    return route_report_problem.report_problem()