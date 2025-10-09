from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime
import json

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
    
def get_route_votes(route_id):
    # Obtener todos los votos de una ruta
    try:
        votes = Vote.query.filter_by(route_id=route_id).all()
        return jsonify([vote.serialize() for vote in votes]), 200
    except Exception as e:
        return jsonify({"message": "Error al obtener votos"}), 500


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
