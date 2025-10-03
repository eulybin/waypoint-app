"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt 
import requests
import os
from datetime import datetime
import json

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


# Autentificacion

@api.route('/register', methods=['POST'])
def register_user():
    try: 
        data = request.get_json()
        
        # VALIDACION BASICA
        
        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({"message": "Faltan datos: name, email, password"}), 400
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        #Validacion si ya existe
        
        