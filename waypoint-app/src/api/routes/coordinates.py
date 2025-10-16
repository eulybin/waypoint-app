from flask import jsonify
import requests



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
