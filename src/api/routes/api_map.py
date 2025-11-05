from flask import Flask, request, jsonify
from api.models import db, User, Route, Vote, UserRole, bcrypt

from flask_jwt_extended import get_jwt_identity
import json


def get_all_routes():
    # Obtener todas las rutas
    try:
        routes = Route.query.order_by(Route.created_at.desc()).all()
        return jsonify([route.serialize() for route in routes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener rutas"}), 500

def calculate_distance(coord1, coord2):
    """Calcula la distancia entre dos coordenadas usando la fórmula de Haversine"""
    from math import radians, sin, cos, sqrt, atan2
    
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    # Radio de la Tierra en kilómetros
    R = 6371.0
    
    # Convertir grados a radianes
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    # Diferencias
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Fórmula de Haversine
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c
    return distance

def order_points_by_proximity(points):
    """Ordena los puntos usando el algoritmo del vecino más cercano"""
    if len(points) <= 1:
        return points
    
    ordered_points = []
    remaining_points = points.copy()
    
    # Empezar desde el primer punto
    current_point = remaining_points.pop(0)
    ordered_points.append(current_point)
    
    # Mientras queden puntos por visitar
    while remaining_points:
        current_coords = [current_point['lat'], current_point['lon']]
        
        # Encontrar el punto más cercano
        min_distance = float('inf')
        closest_index = 0
        
        for i, point in enumerate(remaining_points):
            point_coords = [point['lat'], point['lon']]
            distance = calculate_distance(current_coords, point_coords)
            
            if distance < min_distance:
                min_distance = distance
                closest_index = i
        
        # Añadir el punto más cercano a la ruta ordenada
        current_point = remaining_points.pop(closest_index)
        ordered_points.append(current_point)
    
    return ordered_points


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
        # Extraer coordenadas de los puntos de interés para crear la polilínea
        points_of_interest = data.get("points_of_interest", [])
        route_path = []
        poi_names = []
        
        if isinstance(points_of_interest, list) and len(points_of_interest) > 0:
            # Ordenar los puntos por proximidad (vecino más cercano)
            ordered_pois = order_points_by_proximity(points_of_interest)
            
            for poi in ordered_pois:
                # Asegurarse de que cada POI es un diccionario con lat y lon
                if isinstance(poi, dict) and 'lat' in poi and 'lon' in poi:
                    route_path.append([poi['lat'], poi['lon']])
                    poi_names.append(poi.get('name', 'POI sin nombre'))
        
        # Guardar el array de coordenadas como un string JSON
        coordinates_json = json.dumps(route_path) if route_path else None
        poi_names_json = json.dumps(poi_names) if poi_names else json.dumps([])

        # Crear ruta
        new_route = Route(
            user_id=user_id,
            country=data["country"],
            city=data["city"],
            locality=data.get("locality", ""),
            points_of_interest=poi_names_json,
            coordinates=coordinates_json,
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
    

def get_routes_by_city(city):
    # Obtener rutas por ciudad
    try:
        routes = (
            Route.query.filter_by(city=city).order_by(Route.created_at.desc()).all()
        )
        return jsonify([route.serialize() for route in routes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener rutas por ciudad"}), 500

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