from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime
import json


# AUTENTICACIÓN Y USUARIOS



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

# LOGIN


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

