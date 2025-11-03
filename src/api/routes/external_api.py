from flask import Blueprint, jsonify, request
import requests
from functools import lru_cache
from datetime import datetime, timedelta

external_api = Blueprint("external_api", __name__)

# Caché con decorador (se mantiene en memoria)
@lru_cache(maxsize=100)
def fetch_pois_cached(lat, lon, poi_type, radius):
    """Fetch POIs con caché automático"""
    osmTags = {
        "museum": "tourism=museum",
        "restaurant": "amenity=restaurant",
        "cafe": "amenity=cafe",
        "bar": "amenity=bar",
        "park": "leisure=park",
        "monument": "historic=monument",
        "church": "amenity=place_of_worship",
        "hotel": "tourism=hotel",
        "attraction": "tourism=attraction",
        "viewpoint": "tourism=viewpoint",
    }
    
    query_tag = osmTags.get(poi_type, "tourism=attraction")
    tag_parts = query_tag.split("=")
    
    query = f"""
    [out:json][timeout:15];
    (
      node["{tag_parts[0]}"="{tag_parts[1]}"](around:{radius},{lat},{lon});
      way["{tag_parts[0]}"="{tag_parts[1]}"](around:{radius},{lat},{lon});
    );
    out center 50;
    """
    
    try:
        response = requests.post(
            "https://overpass-api.de/api/interpreter",
            data=query,
            timeout=20
        )
        return response.json()
    except Exception as e:
        print(f"Error fetching POIs: {e}")
        return {"elements": []}

@external_api.route("/pois", methods=["GET"])
def get_pois():
    """Endpoint proxy para POIs con caché"""
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    poi_type = request.args.get("type", "attraction")
    radius = request.args.get("radius", 5000, type=int)
    
    if not lat or not lon:
        return jsonify({"error": "Missing lat or lon"}), 400
    
    data = fetch_pois_cached(lat, lon, poi_type, radius)
    return jsonify(data), 200