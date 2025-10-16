from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Route, Vote, UserRole, bcrypt
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests
import os
from datetime import datetime
import json

def report_problem():
    try:
        description = request.form.get("description")
        attached_file = request.files.get("attachedFile")

        if not description:
            return jsonify({"error": "La descripción es obligatoria"}), 400

        # Procesar la información del reporte
        report_data = {
            "description": description,
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "user_ip": request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'Unknown')),
            "has_attachment": False,
            "attachment_info": None
        }

        # Procesar archivo adjunto si está presente
        if attached_file and attached_file.filename:
            # Información del archivo
            file_info = {
                "filename": attached_file.filename,
                "size": len(attached_file.read()),
                "content_type": attached_file.content_type
            }
            
            # Resetear el puntero del archivo después de leer
            attached_file.seek(0)
            
            report_data["has_attachment"] = True
            report_data["attachment_info"] = file_info
            
            print(f"Archivo recibido: {file_info['filename']} ({file_info['size']} bytes)")

        # Simular procesamiento del reporte
        print(" Nuevo reporte recibido:")
        print(f"Descripción: {description}")
        print(f"Fecha: {report_data['timestamp']}")
        print(f"IP: {report_data['user_ip']}")
        if report_data["has_attachment"]:
            print(f"Archivo: {report_data['attachment_info']['filename']}")

        # Respuesta exitosa
        return jsonify({
            "message": "Report received successfully! Thank you for your feedback.",
            "status": "success",
            "report_id": f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "data": {
                "description_length": len(description),
                "timestamp": report_data["timestamp"],
                "has_attachment": report_data["has_attachment"],
                "attachment_filename": report_data["attachment_info"]["filename"] if report_data["has_attachment"] else None
            }
        }), 200

    except Exception as e:
        print(f"Error en /report route: {e}")
        return jsonify({
            "error": "Failed to process the report. Please try again.",
            "code": "PROCESSING_ERROR",
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }), 500

