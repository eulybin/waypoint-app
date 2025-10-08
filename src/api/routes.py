from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime
import json

api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api)


# AUTENTICACIÓN - Manteniendo tu código con correcciones


@api.route("/register", methods=["POST"])
def register():
    try:
        print("=== INICIO REGISTRO ===")
        data = request.get_json()
        print(f"Data recibida: {data}")

        # Validación básica
        if (
            not data
            or not data.get("name")
            or not data.get("email")
            or not data.get("password")
        ):
            print("Error: Faltan datos")
            return jsonify({"message": "Faltan datos: name, email, password"}), 400

        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        print(f"Datos extraídos - Name: {name}, Email: {email}")

        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=email).first()
        print(f"Usuario existente: {existing_user}")
        if existing_user:
            return jsonify({"message": "El usuario ya existe"}), 400

        print("Hasheando password...")
        # Hashear la password con Flask-Bcrypt
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        print("Password hasheada correctamente")

        print("Creando usuario...")
        user = User(
            name=name,
            email=email,
            password_hash=hashed_password,
            role=UserRole.USER,
            is_active=True,
        )
        print("Usuario creado en memoria")

        print("Agregando a la sesión...")
        db.session.add(user)
        print("Haciendo commit...")
        db.session.commit()
        print("Commit exitoso")

        # Crear token
        print("Creando token...")
        token = create_access_token(identity=user.id)
        print("Token creado")

        return (
            jsonify(
                {
                    "message": "Usuario registrado exitosamente",
                    "token": token,
                    "user": user.serialize(),
                }
            ),
            201,
        )

    except Exception as e:
        print(f"ERROR EN REGISTRO: {str(e)}")
        print(f"TIPO DE ERROR: {type(e)}")
        import traceback

        print(f"TRACEBACK: {traceback.format_exc()}")
        return jsonify({"message": f"Error interno del servidor: {str(e)}"}), 500


@api.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email y contraseña son obligatorios."}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "Credenciales invalidas"}), 401

        # Verificar la password con Flask-Bcrypt
        if not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({"message": "Credenciales invalidas"}), 401

        if not user.is_active:
            return jsonify({"message": "Usuario inactivo"}), 401

        # Usar id como entero para mantener consistencia con el modelo
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "user": user.serialize()}), 200

    except Exception as e:
        return jsonify({"message": "Error interno del servidor"}), 500


@api.route("/private", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        print("=== ENDPOINT PRIVADO ===")
        # Normalizar a entero: el identity debe ser el id del usuario
        user_id = int(get_jwt_identity())
        print(f"User ID del token: {user_id}")

        user = User.query.get(user_id)
        print(f"Usuario encontrado: {user}")

        if not user or not user.is_active:
            print("Usuario no encontrado o inactivo")
            return jsonify({"message": "Usuario no encontrado o inactivo"}), 404

        print("Usuario válido, devolviendo datos")
        return jsonify(user.serialize()), 200

    except Exception as e:
        print(f"Error en endpoint privado: {str(e)}")
        return jsonify({"message": f"Error: {str(e)}"}), 500


# RUTAS TURÍSTICAS


@api.route("/routes", methods=["GET"])
def get_all_routes():
    # Obtener todas las rutas
    try:
        routes = Route.query.order_by(Route.created_at.desc()).all()
        return jsonify([route.serialize() for route in routes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener rutas"}), 500


@api.route("/routes", methods=["POST"])
@jwt_required()
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


@api.route("/routes/<int:route_id>", methods=["GET"])
def get_route_detail(route_id):
    """Obtener detalle de una ruta específica"""
    try:
        route = Route.query.get(route_id)
        if not route:
            return jsonify({"message": "Ruta no encontrada"}), 404
        return jsonify(route.serialize()), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener ruta"}), 500


@api.route("/routes/<int:route_id>", methods=["PUT"])
@jwt_required()
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


@api.route("/routes/<int:route_id>", methods=["DELETE"])
@jwt_required()
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
            "auth": ["/register", "/login", "/private"],
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
