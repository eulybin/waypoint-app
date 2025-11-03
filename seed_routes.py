#!/usr/bin/env python3
"""
Archivo para generar rutas por defecto en la base de datos
Este script crea 50 rutas turísticas diversas con datos realistas

IMPORTANTE: Ejecutar desde la raíz del proyecto:
    python3 seed_routes.py

O mejor aún, usar los comandos Flask:
    flask seed-routes
    flask insert-test-data
"""

import os
import sys
import json
from datetime import datetime, timedelta
import random

# Configurar las variables de entorno necesarias
from dotenv import load_dotenv
load_dotenv()

# Agregar el directorio src al path para poder importar los módulos
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from api.models import db, User, Route, Vote, UserRole, bcrypt
    from flask import Flask
    from flask_migrate import Migrate
    from flask_jwt_extended import JWTManager
except ImportError as e:
    print(f"❌ Error importando módulos: {e}")
    print("💡 Asegúrate de:")
    print("   1. Estar en el directorio raíz del proyecto")
    print("   2. Tener el entorno virtual activado")
    print("   3. Haber ejecutado: pip install -r requirements.txt")
    print("   O usar: flask insert-test-data")
    sys.exit(1)

# Configuración básica de Flask para ejecutar el script
app = Flask(__name__)

# Configuración de la base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace("postgres://", "postgresql://")
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/test.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret"

# Inicializar extensiones
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Datos de ejemplo para las rutas
ROUTES_DATA = [
    # ESPAÑA
    {
        "country": "España", "city": "Madrid", "locality": "Centro",
        "points_of_interest": ["Museo del Prado", "Puerta del Sol", "Plaza Mayor", "Retiro", "Gran Vía"],
        "coordinates": [
            [40.4138, -3.6921],  # Prado
            [40.4169, -3.7035],  # Puerta del Sol
            [40.4155, -3.7074],  # Plaza Mayor
            [40.4153, -3.6844],  # Retiro
            [40.4200, -3.7010]   # Gran Vía
        ]
    },
    {
        "country": "España", "city": "Barcelona", "locality": "Eixample",
        "points_of_interest": ["Sagrada Familia", "Park Güell", "Casa Batlló", "Las Ramblas", "Barrio Gótico"],
        "coordinates": [
            [41.4036, 2.1744],   # Sagrada Familia
            [41.4145, 2.1527],   # Park Güell
            [41.3916, 2.1649],   # Casa Batlló
            [41.3829, 2.1771],   # Las Ramblas
            [41.3825, 2.1769]    # Barrio Gótico
        ]
    },
    {
        "country": "España", "city": "Sevilla", "locality": "Centro Histórico",
        "points_of_interest": ["Catedral de Sevilla", "Alcázar", "Barrio Santa Cruz", "Plaza de España", "Torre del Oro"],
        "coordinates": [
            [37.3859, -5.9930],  # Catedral
            [37.3838, -5.9903],  # Alcázar
            [37.3844, -5.9891],  # Santa Cruz
            [37.3713, -5.9868],  # Plaza España
            [37.3819, -5.9962]   # Torre del Oro
        ]
    },
    
    # FRANCIA
    {
        "country": "Francia", "city": "París", "locality": "1er Arrondissement",
        "points_of_interest": ["Torre Eiffel", "Louvre", "Notre Dame", "Arco del Triunfo", "Montmartre"],
        "coordinates": [
            [48.8584, 2.2945],   # Torre Eiffel
            [48.8606, 2.3376],   # Louvre
            [48.8530, 2.3499],   # Notre Dame
            [48.8738, 2.2950],   # Arco del Triunfo
            [48.8867, 2.3431]    # Montmartre
        ]
    },
    {
        "country": "Francia", "city": "Lyon", "locality": "Vieux Lyon",
        "points_of_interest": ["Basílica de Fourvière", "Traboules", "Place Bellecour", "Musée des Beaux-Arts", "Parc de la Tête d'Or"],
        "coordinates": [
            [45.7624, 4.8227],   # Fourvière
            [45.7640, 4.8281],   # Traboules
            [45.7576, 4.8320],   # Bellecour
            [45.7677, 4.8338],   # Musée
            [45.7797, 4.8542]    # Parc
        ]
    },
    
    # ITALIA
    {
        "country": "Italia", "city": "Roma", "locality": "Centro Storico",
        "points_of_interest": ["Coliseo", "Foro Romano", "Vaticano", "Fontana di Trevi", "Panteón"],
        "coordinates": [
            [41.8902, 12.4922],  # Coliseo
            [41.8925, 12.4853],  # Foro Romano
            [41.9029, 12.4534],  # Vaticano
            [41.9009, 12.4833],  # Fontana di Trevi
            [41.8986, 12.4769]   # Panteón
        ]
    },
    {
        "country": "Italia", "city": "Florencia", "locality": "Centro Histórico",
        "points_of_interest": ["Duomo", "Uffizi", "Ponte Vecchio", "Palazzo Pitti", "Piazzale Michelangelo"],
        "coordinates": [
            [43.7731, 11.2560],  # Duomo
            [43.7677, 11.2555],  # Uffizi
            [43.7679, 11.2530],  # Ponte Vecchio
            [43.7652, 11.2499],  # Palazzo Pitti
            [43.7629, 11.2651]   # Piazzale Michelangelo
        ]
    },
    {
        "country": "Italia", "city": "Venecia", "locality": "San Marco",
        "points_of_interest": ["Plaza San Marco", "Puente de Rialto", "Palacio Ducal", "Basílica San Marco", "Campanile"],
        "coordinates": [
            [45.4342, 12.3388],  # Plaza San Marco
            [45.4380, 12.3358],  # Puente Rialto
            [45.4341, 12.3405],  # Palacio Ducal
            [45.4343, 12.3398],  # Basílica
            [45.4342, 12.3387]   # Campanile
        ]
    },
    
    # REINO UNIDO
    {
        "country": "Reino Unido", "city": "Londres", "locality": "Westminster",
        "points_of_interest": ["Big Ben", "London Eye", "Torre de Londres", "Buckingham Palace", "British Museum"],
        "coordinates": [
            [51.4994, -0.1245],  # Big Ben
            [51.5033, -0.1196],  # London Eye
            [51.5081, -0.0759],  # Torre de Londres
            [51.5014, -0.1419],  # Buckingham
            [51.5194, -0.1270]   # British Museum
        ]
    },
    {
        "country": "Reino Unido", "city": "Edimburgo", "locality": "Old Town",
        "points_of_interest": ["Castillo de Edimburgo", "Royal Mile", "Arthur's Seat", "Holyrood Palace", "Princes Street"],
        "coordinates": [
            [55.9486, -3.1999],  # Castillo
            [55.9508, -3.1883],  # Royal Mile
            [55.9445, -3.1619],  # Arthur's Seat
            [55.9527, -3.1720],  # Holyrood
            [55.9533, -3.1946]   # Princes Street
        ]
    },
    
    # ALEMANIA
    {
        "country": "Alemania", "city": "Berlín", "locality": "Mitte",
        "points_of_interest": ["Puerta de Brandenburgo", "Muro de Berlín", "Isla de los Museos", "Reichstag", "Alexanderplatz"],
        "coordinates": [
            [52.5163, 13.3777],  # Brandenburgo
            [52.5075, 13.3903],  # Muro de Berlín
            [52.5211, 13.3979],  # Isla Museos
            [52.5186, 13.3762],  # Reichstag
            [52.5219, 13.4132]   # Alexanderplatz
        ]
    },
    {
        "country": "Alemania", "city": "Múnich", "locality": "Altstadt",
        "points_of_interest": ["Marienplatz", "Oktoberfest", "Englischer Garten", "Nymphenburg", "BMW Museum"],
        "coordinates": [
            [48.1374, 11.5755],  # Marienplatz
            [48.1314, 11.5495],  # Oktoberfest
            [48.1641, 11.6034],  # Englischer Garten
            [48.1584, 11.5035],  # Nymphenburg
            [48.1773, 11.5590]   # BMW Museum
        ]
    },
    
    # PAÍSES BAJOS
    {
        "country": "Países Bajos", "city": "Ámsterdam", "locality": "Centro",
        "points_of_interest": ["Rijksmuseum", "Casa de Ana Frank", "Vondelpark", "Canales", "Red Light District"],
        "coordinates": [
            [52.3600, 4.8852],   # Rijksmuseum
            [52.3752, 4.8840],   # Casa Ana Frank
            [52.3579, 4.8686],   # Vondelpark
            [52.3676, 4.9041],   # Canales
            [52.3740, 4.8977]    # Red Light District
        ]
    },
    
    # GRECIA
    {
        "country": "Grecia", "city": "Atenas", "locality": "Centro Histórico",
        "points_of_interest": ["Acrópolis", "Partenón", "Ágora Antigua", "Museo Nacional", "Plaka"],
        "coordinates": [
            [37.9715, 23.7257],  # Acrópolis
            [37.9717, 23.7269],  # Partenón
            [37.9753, 23.7224],  # Ágora
            [37.9888, 23.7320],  # Museo Nacional
            [37.9729, 23.7303]   # Plaka
        ]
    },
    
    # PORTUGAL
    {
        "country": "Portugal", "city": "Lisboa", "locality": "Baixa",
        "points_of_interest": ["Torre de Belém", "Monasterio dos Jerónimos", "Tranvía 28", "Castillo de São Jorge", "Rossio"],
        "coordinates": [
            [38.6921, -9.2160],  # Torre Belém
            [38.6979, -9.2064],  # Jerónimos
            [38.7139, -9.1417],  # Tranvía 28
            [38.7139, -9.1334],  # Castillo
            [38.7139, -9.1390]   # Rossio
        ]
    },
    {
        "country": "Portugal", "city": "Oporto", "locality": "Ribeira",
        "points_of_interest": ["Puente Dom Luís", "Librería Lello", "Torre dos Clérigos", "Ribeira", "Bodega Sandeman"],
        "coordinates": [
            [41.1407, -8.6115],  # Puente Dom Luís
            [41.1469, -8.6151],  # Librería Lello
            [41.1456, -8.6142],  # Torre Clérigos
            [41.1406, -8.6137],  # Ribeira
            [41.1365, -8.6132]   # Bodega Sandeman
        ]
    },
    
    # ESTADOS UNIDOS
    {
        "country": "Estados Unidos", "city": "Nueva York", "locality": "Manhattan",
        "points_of_interest": ["Estatua de la Libertad", "Central Park", "Times Square", "Empire State", "Brooklyn Bridge"],
        "coordinates": [
            [40.6892, -74.0445], # Estatua Libertad
            [40.7829, -73.9654], # Central Park
            [40.7580, -73.9855], # Times Square
            [40.7484, -73.9857], # Empire State
            [40.7061, -73.9969]  # Brooklyn Bridge
        ]
    },
    {
        "country": "Estados Unidos", "city": "San Francisco", "locality": "Downtown",
        "points_of_interest": ["Golden Gate", "Alcatraz", "Fisherman's Wharf", "Lombard Street", "Twin Peaks"],
        "coordinates": [
            [37.8199, -122.4783], # Golden Gate
            [37.8270, -122.4230], # Alcatraz
            [37.8081, -122.4177], # Fisherman's Wharf
            [37.8024, -122.4187], # Lombard Street
            [37.7544, -122.4477]  # Twin Peaks
        ]
    },
    {
        "country": "Estados Unidos", "city": "Los Ángeles", "locality": "Hollywood",
        "points_of_interest": ["Hollywood Sign", "Walk of Fame", "Santa Monica Pier", "Getty Center", "Griffith Observatory"],
        "coordinates": [
            [34.1341, -118.3215], # Hollywood Sign
            [34.1022, -118.3267], # Walk of Fame
            [34.0095, -118.4977], # Santa Monica
            [34.0781, -118.4741], # Getty Center
            [34.1184, -118.3004]  # Griffith Observatory
        ]
    },
    
    # CANADÁ
    {
        "country": "Canadá", "city": "Toronto", "locality": "Downtown",
        "points_of_interest": ["CN Tower", "Casa Loma", "Distillery District", "Harbourfront", "Royal Ontario Museum"],
        "coordinates": [
            [43.6426, -79.3871], # CN Tower
            [43.6781, -79.4094], # Casa Loma
            [43.6503, -79.3596], # Distillery District
            [43.6408, -79.3799], # Harbourfront
            [43.6677, -79.3948]  # ROM
        ]
    },
    {
        "country": "Canadá", "city": "Vancouver", "locality": "Downtown",
        "points_of_interest": ["Stanley Park", "Granville Island", "Grouse Mountain", "Gastown", "English Bay"],
        "coordinates": [
            [49.3017, -123.1442], # Stanley Park
            [49.2713, -123.1342], # Granville Island
            [49.3834, -123.0834], # Grouse Mountain
            [49.2839, -123.1094], # Gastown
            [49.2889, -123.1406]  # English Bay
        ]
    },
    
    # JAPÓN
    {
        "country": "Japón", "city": "Tokio", "locality": "Shibuya",
        "points_of_interest": ["Torre de Tokio", "Templo Senso-ji", "Shibuya Crossing", "Palacio Imperial", "Akihabara"],
        "coordinates": [
            [35.6586, 139.7454], # Torre Tokio
            [35.7148, 139.7967], # Senso-ji
            [35.6598, 139.7006], # Shibuya Crossing
            [35.6852, 139.7528], # Palacio Imperial
            [35.7022, 139.7743]  # Akihabara
        ]
    },
    {
        "country": "Japón", "city": "Kioto", "locality": "Gion",
        "points_of_interest": ["Kiyomizu-dera", "Fushimi Inari", "Bamboo Grove", "Kinkaku-ji", "Gion District"],
        "coordinates": [
            [34.9949, 135.7851], # Kiyomizu-dera
            [34.9671, 135.7727], # Fushimi Inari
            [35.0170, 135.6711], # Bamboo Grove
            [35.0394, 135.7292], # Kinkaku-ji
            [35.0033, 135.7753]  # Gion District
        ]
    },
    
    # CHINA
    {
        "country": "China", "city": "Pekín", "locality": "Centro",
        "points_of_interest": ["Gran Muralla", "Ciudad Prohibida", "Plaza Tiananmen", "Templo del Cielo", "Palacio de Verano"],
        "coordinates": [
            [40.4319, 116.5704], # Gran Muralla
            [39.9163, 116.3972], # Ciudad Prohibida
            [39.9042, 116.3976], # Tiananmen
            [39.8822, 116.4066], # Templo del Cielo
            [39.9999, 116.2754]  # Palacio Verano
        ]
    },
    {
        "country": "China", "city": "Shanghái", "locality": "Huangpu",
        "points_of_interest": ["The Bund", "Torre de la Perla Oriental", "Jardín Yuyuan", "Templo del Buda de Jade", "Nanjing Road"],
        "coordinates": [
            [31.2396, 121.4900], # The Bund
            [31.2454, 121.5014], # Torre Perla Oriental
            [31.2274, 121.4918], # Jardín Yuyuan
            [31.2422, 121.4449], # Templo Buda Jade
            [31.2354, 121.4759]  # Nanjing Road
        ]
    },
    
    # INDIA
    {
        "country": "India", "city": "Nueva Delhi", "locality": "Old Delhi",
        "points_of_interest": ["Red Fort", "India Gate", "Qutub Minar", "Lotus Temple", "Jama Masjid"],
        "coordinates": [
            [28.6562, 77.2410], # Red Fort
            [28.6129, 77.2295], # India Gate
            [28.5245, 77.1855], # Qutub Minar
            [28.5535, 77.2588], # Lotus Temple
            [28.6507, 77.2334]  # Jama Masjid
        ]
    },
    {
        "country": "India", "city": "Agra", "locality": "Centro",
        "points_of_interest": ["Taj Mahal", "Fuerte de Agra", "Tumba de Itimad-ud-Daulah", "Mehtab Bagh", "Fatehpur Sikri"],
        "coordinates": [
            [27.1751, 78.0421], # Taj Mahal
            [27.1795, 78.0211], # Fuerte Agra
            [27.1764, 78.0266], # Tumba Itimad
            [27.1729, 78.0422], # Mehtab Bagh
            [27.0937, 77.6615]  # Fatehpur Sikri
        ]
    },
    
    # AUSTRALIA
    {
        "country": "Australia", "city": "Sídney", "locality": "CBD",
        "points_of_interest": ["Opera House", "Harbour Bridge", "Bondi Beach", "Royal Botanic Gardens", "The Rocks"],
        "coordinates": [
            [-33.8568, 151.2153], # Opera House
            [-33.8523, 151.2108], # Harbour Bridge
            [-33.8915, 151.2767], # Bondi Beach
            [-33.8641, 151.2165], # Botanic Gardens
            [-33.8587, 151.2089]  # The Rocks
        ]
    },
    {
        "country": "Australia", "city": "Melbourne", "locality": "CBD",
        "points_of_interest": ["Federation Square", "Royal Botanic Gardens", "St. Kilda", "Queen Victoria Market", "Eureka Tower"],
        "coordinates": [
            [-37.8176, 144.9685], # Federation Square
            [-37.8304, 144.9796], # Botanic Gardens
            [-37.8677, 144.9811], # St. Kilda
            [-37.8076, 144.9568], # Queen Victoria Market
            [-37.8214, 144.9647]  # Eureka Tower
        ]
    },
    
    # BRASIL
    {
        "country": "Brasil", "city": "Río de Janeiro", "locality": "Copacabana",
        "points_of_interest": ["Cristo Redentor", "Pan de Azúcar", "Copacabana", "Ipanema", "Santa Teresa"],
        "coordinates": [
            [-22.9519, -43.2105], # Cristo Redentor
            [-22.9485, -43.1571], # Pan de Azúcar
            [-22.9711, -43.1822], # Copacabana
            [-22.9839, -43.2096], # Ipanema
            [-22.9133, -43.1889]  # Santa Teresa
        ]
    },
    {
        "country": "Brasil", "city": "São Paulo", "locality": "Centro",
        "points_of_interest": ["MASP", "Mercado Municipal", "Liberdade", "Vila Madalena", "Ibirapuera"],
        "coordinates": [
            [-23.5614, -46.6558], # MASP
            [-23.5431, -46.6291], # Mercado Municipal
            [-23.5581, -46.6344], # Liberdade
            [-23.5368, -46.6929], # Vila Madalena
            [-23.5873, -46.6580]  # Ibirapuera
        ]
    },
    
    # ARGENTINA
    {
        "country": "Argentina", "city": "Buenos Aires", "locality": "San Telmo",
        "points_of_interest": ["Plaza de Mayo", "La Boca", "Recoleta", "Puerto Madero", "San Telmo"],
        "coordinates": [
            [-34.6083, -58.3712], # Plaza de Mayo
            [-34.6345, -58.3634], # La Boca
            [-34.5881, -58.3960], # Recoleta
            [-34.6118, -58.3622], # Puerto Madero
            [-34.6208, -58.3731]  # San Telmo
        ]
    },
    
    # MÉXICO
    {
        "country": "México", "city": "Ciudad de México", "locality": "Centro Histórico",
        "points_of_interest": ["Zócalo", "Templo Mayor", "Palacio de Bellas Artes", "Xochimilco", "Frida Kahlo Museum"],
        "coordinates": [
            [19.4326, -99.1332], # Zócalo
            [19.4351, -99.1316], # Templo Mayor
            [19.4348, -99.1411], # Palacio Bellas Artes
            [19.2578, -99.1033], # Xochimilco
            [19.3551, -99.1620]  # Frida Kahlo Museum
        ]
    },
    {
        "country": "México", "city": "Cancún", "locality": "Zona Hotelera",
        "points_of_interest": ["Chichen Itza", "Playa Delfines", "Xcaret", "Isla Mujeres", "Cenote Dos Ojos"],
        "coordinates": [
            [20.6843, -88.5678], # Chichen Itza
            [21.1354, -86.7709], # Playa Delfines
            [20.5798, -87.1185], # Xcaret
            [21.2311, -86.7312], # Isla Mujeres
            [20.3159, -87.3539]  # Cenote Dos Ojos
        ]
    },
    
    # PERU
    {
        "country": "Perú", "city": "Cusco", "locality": "Centro Histórico",
        "points_of_interest": ["Machu Picchu", "Plaza de Armas", "San Blas", "Sacsayhuamán", "Mercado San Pedro"],
        "coordinates": [
            [-13.1631, -72.5450], # Machu Picchu
            [-13.5164, -71.9785], # Plaza de Armas
            [-13.5148, -71.9761], # San Blas
            [-13.5087, -71.9786], # Sacsayhuamán
            [-13.5186, -71.9812]  # Mercado San Pedro
        ]
    },
    
    # CHILE
    {
        "country": "Chile", "city": "Santiago", "locality": "Las Condes",
        "points_of_interest": ["Cerro San Cristóbal", "Plaza de Armas", "Mercado Central", "Barrio Bellavista", "Cerro Santa Lucía"],
        "coordinates": [
            [-33.4203, -70.6344], # Cerro San Cristóbal
            [-33.4378, -70.6504], # Plaza de Armas
            [-33.4350, -70.6516], # Mercado Central
            [-33.4256, -70.6344], # Barrio Bellavista
            [-33.4409, -70.6447]  # Cerro Santa Lucía
        ]
    },
    
    # COLOMBIA
    {
        "country": "Colombia", "city": "Cartagena", "locality": "Ciudad Amurallada",
        "points_of_interest": ["Ciudad Amurallada", "Castillo San Felipe", "Getsemaní", "Torre del Reloj", "Las Bóvedas"],
        "coordinates": [
            [10.4236, -75.5378], # Ciudad Amurallada
            [10.4217, -75.5442], # Castillo San Felipe
            [10.4264, -75.5412], # Getsemaní
            [10.4236, -75.5491], # Torre del Reloj
            [10.4248, -75.5472]  # Las Bóvedas
        ]
    },
    
    # MARRUECOS
    {
        "country": "Marruecos", "city": "Marrakech", "locality": "Medina",
        "points_of_interest": ["Jamaa el Fna", "Jardín Majorelle", "Koutoubia", "Bahía Palace", "Saadian Tombs"],
        "coordinates": [
            [31.6259, -7.9891], # Jamaa el Fna
            [31.6414, -8.0037], # Jardín Majorelle
            [31.6236, -7.9999], # Koutoubia
            [31.6214, -7.9844], # Bahía Palace
            [31.6212, -7.9879]  # Saadian Tombs
        ]
    },
    
    # TURQUÍA
    {
        "country": "Turquía", "city": "Estambul", "locality": "Sultanahmet",
        "points_of_interest": ["Hagia Sophia", "Mezquita Azul", "Topkapi Palace", "Gran Bazar", "Galata Tower"],
        "coordinates": [
            [41.0086, 28.9802], # Hagia Sophia
            [41.0055, 28.9769], # Mezquita Azul
            [41.0115, 28.9833], # Topkapi Palace
            [41.0109, 28.9675], # Gran Bazar
            [41.0256, 28.9742]  # Galata Tower
        ]
    },
    
    # EGIPTO
    {
        "country": "Egipto", "city": "El Cairo", "locality": "Giza",
        "points_of_interest": ["Pirámides de Giza", "Esfinge", "Museo Egipcio", "Khan el-Khalili", "Ciudadela de Saladino"],
        "coordinates": [
            [29.9773, 31.1325], # Pirámides Giza
            [29.9753, 31.1376], # Esfinge
            [30.0478, 31.2336], # Museo Egipcio
            [30.0472, 31.2622], # Khan el-Khalili
            [30.0287, 31.2602]  # Ciudadela Saladino
        ]
    },
    
    # TAILANDIA
    {
        "country": "Tailandia", "city": "Bangkok", "locality": "Rattanakosin",
        "points_of_interest": ["Gran Palacio", "Wat Pho", "Wat Arun", "Mercados Flotantes", "Khao San Road"],
        "coordinates": [
            [13.7500, 100.4915], # Gran Palacio
            [13.7468, 100.4929], # Wat Pho
            [13.7437, 100.4887], # Wat Arun
            [13.5321, 100.1744], # Mercados Flotantes
            [13.7585, 100.4979]  # Khao San Road
        ]
    }
]

def create_default_user():
    """Crear usuario por defecto para las rutas"""
    with app.app_context():
        # Verificar si ya existe un usuario admin
        admin_user = User.query.filter_by(role=UserRole.ADMIN).first()
        if not admin_user:
            # Crear usuario admin por defecto
            password_hash = bcrypt.generate_password_hash("admin123").decode('utf-8')
            admin_user = User(
                name="Administrador",
                email="admin@waypoint.com",
                password_hash=password_hash,
                role=UserRole.ADMIN,
                is_active=True
            )
            db.session.add(admin_user)
            db.session.commit()
            print(f"✅ Usuario admin creado: {admin_user.email}")
        
        # Crear algunos usuarios normales
        normal_users = [
            {"name": "María García", "email": "maria@waypoint.com", "password": "user123"},
            {"name": "Juan López", "email": "juan@waypoint.com", "password": "user123"},
            {"name": "Ana Martínez", "email": "ana@waypoint.com", "password": "user123"},
        ]
        
        created_users = [admin_user]
        for user_data in normal_users:
            existing_user = User.query.filter_by(email=user_data["email"]).first()
            if not existing_user:
                password_hash = bcrypt.generate_password_hash(user_data["password"]).decode('utf-8')
                user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    password_hash=password_hash,
                    role=UserRole.USER,
                    is_active=True
                )
                db.session.add(user)
                created_users.append(user)
        
        db.session.commit()
        return created_users

def create_routes(users):
    """Crear rutas por defecto"""
    with app.app_context():
        print(f"🗺️  Creando {len(ROUTES_DATA)} rutas...")
        
        for i, route_data in enumerate(ROUTES_DATA):
            # Verificar si ya existe una ruta similar
            existing_route = Route.query.filter_by(
                country=route_data["country"],
                city=route_data["city"],
                locality=route_data["locality"]
            ).first()
            
            if not existing_route:
                # Seleccionar usuario aleatoriamente
                user = random.choice(users)
                
                # Crear coordenadas JSON
                coordinates_json = json.dumps(route_data["coordinates"])
                points_json = json.dumps(route_data["points_of_interest"])
                
                # Crear ruta
                route = Route(
                    user_id=user.id,
                    country=route_data["country"],
                    city=route_data["city"],
                    locality=route_data["locality"],
                    points_of_interest=points_json,
                    coordinates=coordinates_json
                )
                
                db.session.add(route)
                print(f"  ✅ Ruta {i+1}: {route_data['city']}, {route_data['country']}")
            else:
                print(f"  ⚠️  Ruta ya existe: {route_data['city']}, {route_data['country']}")
        
        db.session.commit()
        print("🎉 ¡Rutas creadas exitosamente!")

def create_sample_votes():
    """Crear votos de ejemplo para las rutas"""
    with app.app_context():
        routes = Route.query.all()
        users = User.query.filter_by(role=UserRole.USER).all()
        
        if not users:
            print("⚠️  No hay usuarios normales, saltando creación de votos")
            return
        
        print(f"⭐ Creando votos para {len(routes)} rutas...")
        
        votes_created = 0
        for route in routes:
            # Crear entre 1-5 votos por ruta
            num_votes = random.randint(1, min(5, len(users)))
            selected_users = random.sample(users, num_votes)
            
            for user in selected_users:
                # Verificar si ya existe voto
                existing_vote = Vote.query.filter_by(user_id=user.id, route_id=route.id).first()
                if not existing_vote:
                    # Rating aleatorio con tendencia hacia ratings altos
                    rating = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 20, 35, 30])[0]
                    
                    vote = Vote(
                        user_id=user.id,
                        route_id=route.id,
                        rating=rating
                    )
                    db.session.add(vote)
                    votes_created += 1
        
        db.session.commit()
        print(f"✅ {votes_created} votos creados exitosamente!")

def main():
    """Función principal"""
    print("🚀 Iniciando generación de datos por defecto...")
    print("=" * 50)
    
    with app.app_context():
        # Crear tablas si no existen
        db.create_all()
        
        # Crear usuarios
        print("👥 Creando usuarios...")
        users = create_default_user()
        print(f"✅ {len(users)} usuarios disponibles")
        
        # Crear rutas
        create_routes(users)
        
        # Crear votos
        create_sample_votes()
        
        # Estadísticas finales
        total_routes = Route.query.count()
        total_votes = Vote.query.count()
        total_users = User.query.count()
        
        print("=" * 50)
        print("📊 ESTADÍSTICAS FINALES:")
        print(f"   👥 Usuarios: {total_users}")
        print(f"   🗺️  Rutas: {total_routes}")
        print(f"   ⭐ Votos: {total_votes}")
        print("=" * 50)
        print("🎉 ¡Datos generados exitosamente!")
        print("\n💡 Credenciales de acceso:")
        print("   Admin: admin@waypoint.com / admin123")
        print("   User: maria@waypoint.com / user123")
        print("   User: juan@waypoint.com / user123")
        print("   User: ana@waypoint.com / user123")

if __name__ == "__main__":
    main()