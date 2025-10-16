from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime



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
