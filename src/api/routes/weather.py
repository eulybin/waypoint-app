from flask import jsonify
import requests
from datetime import datetime


def get_weather(city):
    """Obtener información del clima usando wttr.in API (100% gratuita, sin API key)"""
    try:
        print(f"Consultando clima para: {city}")
        
        # Usar wttr.in API - completamente gratuita
        weather_url = f"https://wttr.in/{city}"
        
        # Headers para obtener respuesta en JSON
        headers = {
            'User-Agent': 'curl/7.64.1',  # Simular curl para mejor compatibilidad
            'Accept': 'application/json'
        }
        
        # Parámetros para formato JSON y configuración
        params = {
            'format': 'j1',  # JSON format
            'lang': 'en'     # Request data in English
        }
        
        response = requests.get(weather_url, headers=headers, params=params, timeout=15)
        
        print(f"Status código: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error en respuesta: {response.text}")
            return jsonify({
                "message": f"No se pudo obtener información del clima para '{city}'",
                "status_code": response.status_code,
                "suggestions": ["Madrid", "Barcelona", "Valencia", "París", "Londres", "Nueva York"]
            }), 404
            
        data = response.json()
        
        # Procesar datos actuales
        current_condition = data['current_condition'][0]
        nearest_area = data['nearest_area'][0]
        
        # Mapear códigos de clima a iconos
        weather_code = int(current_condition['weatherCode'])
        icon_map = {
            113: "01d",  # Soleado/Despejado
            116: "02d",  # Parcialmente nublado
            119: "03d",  # Nublado
            122: "04d",  # Muy nublado
            143: "50d",  # Niebla
            176: "10d",  # Lluvia ligera
            179: "13d",  # Nieve ligera
            182: "09d",  # Aguanieve
            185: "09d",  # Llovizna
            200: "11d",  # Tormenta
            227: "13d",  # Ventisca
            230: "13d",  # Tormenta de nieve
            248: "50d",  # Niebla densa
            260: "50d",  # Niebla helada
            263: "09d",  # Llovizna ligera
            266: "09d",  # Llovizna
            281: "09d",  # Llovizna helada
            284: "09d",  # Llovizna helada intensa
            293: "10d",  # Lluvia ligera discontinua
            296: "10d",  # Lluvia ligera
            299: "10d",  # Lluvia moderada discontinua
            302: "10d",  # Lluvia moderada
            305: "10d",  # Lluvia intensa discontinua
            308: "10d",  # Lluvia intensa
            311: "09d",  # Lluvia helada ligera
            314: "09d",  # Lluvia helada moderada
            317: "09d",  # Lluvia helada intensa
            320: "13d",  # Nieve ligera discontinua
            323: "13d",  # Nieve ligera
            326: "13d",  # Nieve moderada discontinua
            329: "13d",  # Nieve moderada
            332: "13d",  # Nieve intensa discontinua
            335: "13d",  # Nieve intensa
            338: "13d",  # Nieve muy intensa
            350: "09d",  # Granizo ligero
            353: "10d",  # Chubascos ligeros
            356: "10d",  # Chubascos moderados
            359: "10d",  # Chubascos intensos
            362: "09d",  # Aguanieve ligera
            365: "09d",  # Aguanieve moderada
            368: "13d",  # Chubascos de nieve ligeros
            371: "13d",  # Chubascos de nieve moderados
            374: "09d",  # Granizo ligero
            377: "09d",  # Granizo moderado
            386: "11d",  # Tormenta ligera
            389: "11d",  # Tormenta moderada
            392: "11d",  # Tormenta con nieve ligera
            395: "11d",  # Tormenta con nieve moderada
        }
        
        current_icon = icon_map.get(weather_code, "01d")
        
        current = {
            'temperature': float(current_condition['temp_C']),
            'feels_like': float(current_condition['FeelsLikeC']),
            'humidity': int(current_condition['humidity']),
            # Prefer the default English description from weatherDesc
            'description': current_condition['weatherDesc'][0]['value'],
            'icon': current_icon,
            'wind_speed': round(float(current_condition['windspeedKmph']) / 3.6, 1),  # Convertir km/h a m/s
            'wind_deg': int(current_condition['winddirDegree']),
            'pressure': int(current_condition['pressure']),
            'visibility': round(float(current_condition['visibility']), 1),
            'uv_index': int(current_condition['uvIndex']),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Procesar pronóstico de los próximos días
        forecast_list = []
        
        for day_data in data['weather'][:5]:  # Máximo 5 días
            date_str = day_data['date']
            
            # Obtener temperaturas min y max
            min_temp = float(day_data['mintempC'])
            max_temp = float(day_data['maxtempC'])
            
            # Usar el clima del mediodía (índice 4 = 12:00)
            midday_weather = day_data['hourly'][4] if len(day_data['hourly']) > 4 else day_data['hourly'][0]
            day_weather_code = int(midday_weather['weatherCode'])
            day_icon = icon_map.get(day_weather_code, "01d")
            
            dt = datetime.strptime(date_str, '%Y-%m-%d')
            
            # Use English day name directly
            day_name_es = dt.strftime('%A')

            forecast_list.append({
                "date": date_str,
                "day_name": day_name_es,
                "temp_max": max_temp,
                "temp_min": min_temp,
                "description": midday_weather['weatherDesc'][0]['value'],
                "icon": day_icon,
                "humidity": int(midday_weather['humidity']),
                "wind_speed": round(float(midday_weather['windspeedKmph']) / 3.6, 1),
                "pop": int(midday_weather.get('chanceofrain', 0))  # Probabilidad de lluvia
            })
        
        # Pronóstico por horas (próximas 12 horas del primer día)
        hourly_list = []
        if data['weather']:
            first_day_hourly = data['weather'][0]['hourly']
            current_hour = datetime.now().hour
            
            # Buscar desde la hora actual
            for i, hour_data in enumerate(first_day_hourly):
                hour_time = int(hour_data['time']) // 100  # Convertir formato 300 -> 3
                
                if len(hourly_list) >= 12:
                    break
                    
                if hour_time >= current_hour or len(hourly_list) > 0:
                    hourly_weather_code = int(hour_data['weatherCode'])
                    hourly_icon = icon_map.get(hourly_weather_code, "01d")
                    
                    hourly_list.append({
                        "time": f"{hour_time:02d}:00",
                        "temperature": float(hour_data['tempC']),
                        "description": hour_data['weatherDesc'][0]['value'],
                        "icon": hourly_icon,
                        "humidity": int(hour_data['humidity']),
                        "pop": int(hour_data.get('chanceofrain', 0))
                    })
        
        # Respuesta final para el widget
        weather_widget_data = {
            'city': nearest_area['areaName'][0]['value'],
            'country': nearest_area['country'][0]['value'],
            'region': nearest_area['region'][0]['value'],
            'coordinates': {
                'lat': float(nearest_area['latitude']),
                'lon': float(nearest_area['longitude'])
            },
            'current': current,
            'forecast': forecast_list,
            'hourly': hourly_list,
            'api_info': {
                'source': 'wttr.in (Igor Chubin) - Servicio gratuito',
                'updated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'no_api_key_required': True
            }
        }
        
        print(f"Datos procesados correctamente para {nearest_area['areaName'][0]['value']}")
        return jsonify(weather_widget_data), 200

    except requests.RequestException as e:
        print(f"Error de conexión: {str(e)}")
        return jsonify({
            "message": "Error de conexión con el servicio de clima", 
            "error": str(e),
            "suggestion": "Verifica tu conexión a internet o intenta más tarde"
        }), 500
    except (KeyError, IndexError, ValueError) as e:
        print(f"Error procesando datos: {str(e)}")
        return jsonify({
            "message": "Error procesando los datos del clima", 
            "error": str(e),
            "fallback_data": {
                "city": city,
                "current": {
                    "temperature": 20,
                    "description": "Información no disponible temporalmente",
                    "icon": "01d"
                }
            }
        }), 500
    except Exception as e:
        print(f"Error general: {str(e)}")
        return jsonify({
            "message": "Error interno del servidor", 
            "error": str(e)
        }), 500
