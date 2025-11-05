
import click
import json
import random
from api.models import db, User, Route, Vote, UserRole, bcrypt

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""
def setup_commands(app):
    
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("seed-routes")
    def seed_routes():
        """Comando para generar rutas turísticas por defecto"""
        print("🚀 Iniciando generación de rutas por defecto...")
        
        # Datos de rutas directamente en el comando
        routes_data = [
            # ESPAÑA
            {
                "country": "España", "city": "Madrid", "locality": "Centro",
                "points_of_interest": ["Museo del Prado", "Puerta del Sol", "Plaza Mayor", "Retiro", "Gran Vía"],
                "coordinates": [[40.4138, -3.6921], [40.4169, -3.7035], [40.4155, -3.7074], [40.4153, -3.6844], [40.4200, -3.7010]]
            },
            {
                "country": "España", "city": "Barcelona", "locality": "Eixample",
                "points_of_interest": ["Sagrada Familia", "Park Güell", "Casa Batlló", "Las Ramblas", "Barrio Gótico"],
                "coordinates": [[41.4036, 2.1744], [41.4145, 2.1527], [41.3916, 2.1649], [41.3829, 2.1771], [41.3825, 2.1769]]
            },
            {
                "country": "España", "city": "Sevilla", "locality": "Centro Histórico",
                "points_of_interest": ["Catedral de Sevilla", "Alcázar", "Barrio Santa Cruz", "Plaza de España", "Torre del Oro"],
                "coordinates": [[37.3859, -5.9930], [37.3838, -5.9903], [37.3844, -5.9891], [37.3713, -5.9868], [37.3819, -5.9962]]
            },
            # FRANCIA
            {
                "country": "Francia", "city": "París", "locality": "1er Arrondissement",
                "points_of_interest": ["Torre Eiffel", "Louvre", "Notre Dame", "Arco del Triunfo", "Montmartre"],
                "coordinates": [[48.8584, 2.2945], [48.8606, 2.3376], [48.8530, 2.3499], [48.8738, 2.2950], [48.8867, 2.3431]]
            },
            {
                "country": "Francia", "city": "Lyon", "locality": "Vieux Lyon",
                "points_of_interest": ["Basílica de Fourvière", "Traboules", "Place Bellecour", "Musée des Beaux-Arts", "Parc de la Tête d'Or"],
                "coordinates": [[45.7624, 4.8227], [45.7640, 4.8281], [45.7576, 4.8320], [45.7677, 4.8338], [45.7797, 4.8542]]
            },
            # ITALIA
            {
                "country": "Italia", "city": "Roma", "locality": "Centro Storico",
                "points_of_interest": ["Coliseo", "Foro Romano", "Vaticano", "Fontana di Trevi", "Panteón"],
                "coordinates": [[41.8902, 12.4922], [41.8925, 12.4853], [41.9029, 12.4534], [41.9009, 12.4833], [41.8986, 12.4769]]
            },
            {
                "country": "Italia", "city": "Florencia", "locality": "Centro Histórico",
                "points_of_interest": ["Duomo", "Uffizi", "Ponte Vecchio", "Palazzo Pitti", "Piazzale Michelangelo"],
                "coordinates": [[43.7731, 11.2560], [43.7677, 11.2555], [43.7679, 11.2530], [43.7652, 11.2499], [43.7629, 11.2651]]
            },
            {
                "country": "Italia", "city": "Venecia", "locality": "San Marco",
                "points_of_interest": ["Plaza San Marco", "Puente de Rialto", "Palacio Ducal", "Basílica San Marco", "Campanile"],
                "coordinates": [[45.4342, 12.3388], [45.4380, 12.3358], [45.4341, 12.3405], [45.4343, 12.3398], [45.4342, 12.3387]]
            },
            # REINO UNIDO
            {
                "country": "Reino Unido", "city": "Londres", "locality": "Westminster",
                "points_of_interest": ["Big Ben", "London Eye", "Torre de Londres", "Buckingham Palace", "British Museum"],
                "coordinates": [[51.4994, -0.1245], [51.5033, -0.1196], [51.5081, -0.0759], [51.5014, -0.1419], [51.5194, -0.1270]]
            },
            {
                "country": "Reino Unido", "city": "Edimburgo", "locality": "Old Town",
                "points_of_interest": ["Castillo de Edimburgo", "Royal Mile", "Arthur's Seat", "Holyrood Palace", "Princes Street"],
                "coordinates": [[55.9486, -3.1999], [55.9508, -3.1883], [55.9445, -3.1619], [55.9527, -3.1720], [55.9533, -3.1946]]
            },
            # ALEMANIA
            {
                "country": "Alemania", "city": "Berlín", "locality": "Mitte",
                "points_of_interest": ["Puerta de Brandenburgo", "Muro de Berlín", "Isla de los Museos", "Reichstag", "Alexanderplatz"],
                "coordinates": [[52.5163, 13.3777], [52.5075, 13.3903], [52.5211, 13.3979], [52.5186, 13.3762], [52.5219, 13.4132]]
            },
            {
                "country": "Alemania", "city": "Múnich", "locality": "Altstadt",
                "points_of_interest": ["Marienplatz", "Oktoberfest", "Englischer Garten", "Nymphenburg", "BMW Museum"],
                "coordinates": [[48.1374, 11.5755], [48.1314, 11.5495], [48.1641, 11.6034], [48.1584, 11.5035], [48.1773, 11.5590]]
            },
            # PAÍSES BAJOS
            {
                "country": "Países Bajos", "city": "Ámsterdam", "locality": "Centro",
                "points_of_interest": ["Rijksmuseum", "Casa de Ana Frank", "Vondelpark", "Canales", "Red Light District"],
                "coordinates": [[52.3600, 4.8852], [52.3752, 4.8840], [52.3579, 4.8686], [52.3676, 4.9041], [52.3740, 4.8977]]
            },
            # GRECIA
            {
                "country": "Grecia", "city": "Atenas", "locality": "Centro Histórico",
                "points_of_interest": ["Acrópolis", "Partenón", "Ágora Antigua", "Museo Nacional", "Plaka"],
                "coordinates": [[37.9715, 23.7257], [37.9717, 23.7269], [37.9753, 23.7224], [37.9888, 23.7320], [37.9729, 23.7303]]
            },
            # PORTUGAL
            {
                "country": "Portugal", "city": "Lisboa", "locality": "Baixa",
                "points_of_interest": ["Torre de Belém", "Monasterio dos Jerónimos", "Tranvía 28", "Castillo de São Jorge", "Rossio"],
                "coordinates": [[38.6921, -9.2160], [38.6979, -9.2064], [38.7139, -9.1417], [38.7139, -9.1334], [38.7139, -9.1390]]
            },
            {
                "country": "Portugal", "city": "Oporto", "locality": "Ribeira",
                "points_of_interest": ["Puente Dom Luís", "Librería Lello", "Torre dos Clérigos", "Ribeira", "Bodega Sandeman"],
                "coordinates": [[41.1407, -8.6115], [41.1469, -8.6151], [41.1456, -8.6142], [41.1406, -8.6137], [41.1365, -8.6132]]
            },
            # ESTADOS UNIDOS
            {
                "country": "Estados Unidos", "city": "Nueva York", "locality": "Manhattan",
                "points_of_interest": ["Estatua de la Libertad", "Central Park", "Times Square", "Empire State", "Brooklyn Bridge"],
                "coordinates": [[40.6892, -74.0445], [40.7829, -73.9654], [40.7580, -73.9855], [40.7484, -73.9857], [40.7061, -73.9969]]
            },
            {
                "country": "Estados Unidos", "city": "San Francisco", "locality": "Downtown",
                "points_of_interest": ["Golden Gate", "Alcatraz", "Fisherman's Wharf", "Lombard Street", "Twin Peaks"],
                "coordinates": [[37.8199, -122.4783], [37.8270, -122.4230], [37.8081, -122.4177], [37.8024, -122.4187], [37.7544, -122.4477]]
            },
            {
                "country": "Estados Unidos", "city": "Los Ángeles", "locality": "Hollywood",
                "points_of_interest": ["Hollywood Sign", "Walk of Fame", "Santa Monica Pier", "Getty Center", "Griffith Observatory"],
                "coordinates": [[34.1341, -118.3215], [34.1022, -118.3267], [34.0095, -118.4977], [34.0781, -118.4741], [34.1184, -118.3004]]
            },
            # CANADÁ
            {
                "country": "Canadá", "city": "Toronto", "locality": "Downtown",
                "points_of_interest": ["CN Tower", "Casa Loma", "Distillery District", "Harbourfront", "Royal Ontario Museum"],
                "coordinates": [[43.6426, -79.3871], [43.6781, -79.4094], [43.6503, -79.3596], [43.6408, -79.3799], [43.6677, -79.3948]]
            },
            {
                "country": "Canadá", "city": "Vancouver", "locality": "Downtown",
                "points_of_interest": ["Stanley Park", "Granville Island", "Grouse Mountain", "Gastown", "English Bay"],
                "coordinates": [[49.3017, -123.1442], [49.2713, -123.1342], [49.3834, -123.0834], [49.2839, -123.1094], [49.2889, -123.1406]]
            },
            # JAPÓN
            {
                "country": "Japón", "city": "Tokio", "locality": "Shibuya",
                "points_of_interest": ["Torre de Tokio", "Templo Senso-ji", "Shibuya Crossing", "Palacio Imperial", "Akihabara"],
                "coordinates": [[35.6586, 139.7454], [35.7148, 139.7967], [35.6598, 139.7006], [35.6852, 139.7528], [35.7022, 139.7743]]
            },
            {
                "country": "Japón", "city": "Kioto", "locality": "Gion",
                "points_of_interest": ["Kiyomizu-dera", "Fushimi Inari", "Bamboo Grove", "Kinkaku-ji", "Gion District"],
                "coordinates": [[34.9949, 135.7851], [34.9671, 135.7727], [35.0170, 135.6711], [35.0394, 135.7292], [35.0033, 135.7753]]
            },
            # CHINA
            {
                "country": "China", "city": "Pekín", "locality": "Centro",
                "points_of_interest": ["Gran Muralla", "Ciudad Prohibida", "Plaza Tiananmen", "Templo del Cielo", "Palacio de Verano"],
                "coordinates": [[40.4319, 116.5704], [39.9163, 116.3972], [39.9042, 116.3976], [39.8822, 116.4066], [39.9999, 116.2754]]
            },
            {
                "country": "China", "city": "Shanghái", "locality": "Huangpu",
                "points_of_interest": ["The Bund", "Torre de la Perla Oriental", "Jardín Yuyuan", "Templo del Buda de Jade", "Nanjing Road"],
                "coordinates": [[31.2396, 121.4900], [31.2454, 121.5014], [31.2274, 121.4918], [31.2422, 121.4449], [31.2354, 121.4759]]
            },
            # MÁS PAÍSES...
            {
                "country": "India", "city": "Nueva Delhi", "locality": "Old Delhi",
                "points_of_interest": ["Red Fort", "India Gate", "Qutub Minar", "Lotus Temple", "Jama Masjid"],
                "coordinates": [[28.6562, 77.2410], [28.6129, 77.2295], [28.5245, 77.1855], [28.5535, 77.2588], [28.6507, 77.2334]]
            },
            {
                "country": "India", "city": "Agra", "locality": "Centro",
                "points_of_interest": ["Taj Mahal", "Fuerte de Agra", "Tumba de Itimad-ud-Daulah", "Mehtab Bagh", "Fatehpur Sikri"],
                "coordinates": [[27.1751, 78.0421], [27.1795, 78.0211], [27.1764, 78.0266], [27.1729, 78.0422], [27.0937, 77.6615]]
            },
            {
                "country": "Australia", "city": "Sídney", "locality": "CBD",
                "points_of_interest": ["Opera House", "Harbour Bridge", "Bondi Beach", "Royal Botanic Gardens", "The Rocks"],
                "coordinates": [[-33.8568, 151.2153], [-33.8523, 151.2108], [-33.8915, 151.2767], [-33.8641, 151.2165], [-33.8587, 151.2089]]
            },
            {
                "country": "Australia", "city": "Melbourne", "locality": "CBD",
                "points_of_interest": ["Federation Square", "Royal Botanic Gardens", "St. Kilda", "Queen Victoria Market", "Eureka Tower"],
                "coordinates": [[-37.8176, 144.9685], [-37.8304, 144.9796], [-37.8677, 144.9811], [-37.8076, 144.9568], [-37.8214, 144.9647]]
            },
            {
                "country": "Brasil", "city": "Río de Janeiro", "locality": "Copacabana",
                "points_of_interest": ["Cristo Redentor", "Pan de Azúcar", "Copacabana", "Ipanema", "Santa Teresa"],
                "coordinates": [[-22.9519, -43.2105], [-22.9485, -43.1571], [-22.9711, -43.1822], [-22.9839, -43.2096], [-22.9133, -43.1889]]
            },
            {
                "country": "Brasil", "city": "São Paulo", "locality": "Centro",
                "points_of_interest": ["MASP", "Mercado Municipal", "Liberdade", "Vila Madalena", "Ibirapuera"],
                "coordinates": [[-23.5614, -46.6558], [-23.5431, -46.6291], [-23.5581, -46.6344], [-23.5368, -46.6929], [-23.5873, -46.6580]]
            },
            {
                "country": "Argentina", "city": "Buenos Aires", "locality": "San Telmo",
                "points_of_interest": ["Plaza de Mayo", "La Boca", "Recoleta", "Puerto Madero", "San Telmo"],
                "coordinates": [[-34.6083, -58.3712], [-34.6345, -58.3634], [-34.5881, -58.3960], [-34.6118, -58.3622], [-34.6208, -58.3731]]
            },
            {
                "country": "México", "city": "Ciudad de México", "locality": "Centro Histórico",
                "points_of_interest": ["Zócalo", "Templo Mayor", "Palacio de Bellas Artes", "Xochimilco", "Frida Kahlo Museum"],
                "coordinates": [[19.4326, -99.1332], [19.4351, -99.1316], [19.4348, -99.1411], [19.2578, -99.1033], [19.3551, -99.1620]]
            },
            {
                "country": "México", "city": "Cancún", "locality": "Zona Hotelera",
                "points_of_interest": ["Chichen Itza", "Playa Delfines", "Xcaret", "Isla Mujeres", "Cenote Dos Ojos"],
                "coordinates": [[20.6843, -88.5678], [21.1354, -86.7709], [20.5798, -87.1185], [21.2311, -86.7312], [20.3159, -87.3539]]
            },
            {
                "country": "Perú", "city": "Cusco", "locality": "Centro Histórico",
                "points_of_interest": ["Machu Picchu", "Plaza de Armas", "San Blas", "Sacsayhuamán", "Mercado San Pedro"],
                "coordinates": [[-13.1631, -72.5450], [-13.5164, -71.9785], [-13.5148, -71.9761], [-13.5087, -71.9786], [-13.5186, -71.9812]]
            },
            {
                "country": "Chile", "city": "Santiago", "locality": "Las Condes",
                "points_of_interest": ["Cerro San Cristóbal", "Plaza de Armas", "Mercado Central", "Barrio Bellavista", "Cerro Santa Lucía"],
                "coordinates": [[-33.4203, -70.6344], [-33.4378, -70.6504], [-33.4350, -70.6516], [-33.4256, -70.6344], [-33.4409, -70.6447]]
            },
            {
                "country": "Colombia", "city": "Cartagena", "locality": "Ciudad Amurallada",
                "points_of_interest": ["Ciudad Amurallada", "Castillo San Felipe", "Getsemaní", "Torre del Reloj", "Las Bóvedas"],
                "coordinates": [[10.4236, -75.5378], [10.4217, -75.5442], [10.4264, -75.5412], [10.4236, -75.5491], [10.4248, -75.5472]]
            },
            {
                "country": "Marruecos", "city": "Marrakech", "locality": "Medina",
                "points_of_interest": ["Jamaa el Fna", "Jardín Majorelle", "Koutoubia", "Bahía Palace", "Saadian Tombs"],
                "coordinates": [[31.6259, -7.9891], [31.6414, -8.0037], [31.6236, -7.9999], [31.6214, -7.9844], [31.6212, -7.9879]]
            },
            {
                "country": "Turquía", "city": "Estambul", "locality": "Sultanahmet",
                "points_of_interest": ["Hagia Sophia", "Mezquita Azul", "Topkapi Palace", "Gran Bazar", "Galata Tower"],
                "coordinates": [[41.0086, 28.9802], [41.0055, 28.9769], [41.0115, 28.9833], [41.0109, 28.9675], [41.0256, 28.9742]]
            },
            {
                "country": "Egipto", "city": "El Cairo", "locality": "Giza",
                "points_of_interest": ["Pirámides de Giza", "Esfinge", "Museo Egipcio", "Khan el-Khalili", "Ciudadela de Saladino"],
                "coordinates": [[29.9773, 31.1325], [29.9753, 31.1376], [30.0478, 31.2336], [30.0472, 31.2622], [30.0287, 31.2602]]
            },
            {
                "country": "Tailandia", "city": "Bangkok", "locality": "Rattanakosin",
                "points_of_interest": ["Gran Palacio", "Wat Pho", "Wat Arun", "Mercados Flotantes", "Khao San Road"],
                "coordinates": [[13.7500, 100.4915], [13.7468, 100.4929], [13.7437, 100.4887], [13.5321, 100.1744], [13.7585, 100.4979]]
            }
        ]
        
        # Crear usuarios si no existen
        admin_user = User.query.filter_by(role=UserRole.ADMIN).first()
        if not admin_user:
            password_hash = bcrypt.generate_password_hash("admin123").decode('utf-8')
            admin_user = User(
                name="Administrador",
                email="admin@waypoint.com",
                password_hash=password_hash,
                role=UserRole.ADMIN,
                is_active=True
            )
            db.session.add(admin_user)
            
        
        # Crear usuarios normales
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
        
        # Crear rutas
        print(f"🗺️ Creando {len(routes_data)} rutas...")
        routes_created = 0
        
        for i, route_data in enumerate(routes_data):
            existing_route = Route.query.filter_by(
                country=route_data["country"],
                city=route_data["city"],
                locality=route_data["locality"]
            ).first()
            
            if not existing_route:
                user = random.choice(created_users)
                coordinates_json = json.dumps(route_data["coordinates"])
                points_json = json.dumps(route_data["points_of_interest"])
                
                route = Route(
                    user_id=user.id,
                    country=route_data["country"],
                    city=route_data["city"],
                    locality=route_data["locality"],
                    points_of_interest=points_json,
                    coordinates=coordinates_json
                )
                
                db.session.add(route)
                routes_created += 1
                print(f"  ✅ Ruta {routes_created}: {route_data['city']}, {route_data['country']}")
        
        db.session.commit()
        
        # Crear votos
        routes = Route.query.all()
        users = User.query.filter_by(role=UserRole.USER).all()
        
        if users:
            votes_created = 0
            for route in routes:
                num_votes = random.randint(1, min(3, len(users)))
                selected_users = random.sample(users, num_votes)
                
                for user in selected_users:
                    existing_vote = Vote.query.filter_by(user_id=user.id, route_id=route.id).first()
                    if not existing_vote:
                        rating = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 20, 35, 30])[0]
                        vote = Vote(user_id=user.id, route_id=route.id, rating=rating)
                        db.session.add(vote)
                        votes_created += 1
            
            db.session.commit()
            print(f"⭐ {votes_created} votos creados")
        
        # Estadísticas finales
        total_routes = Route.query.count()
        total_votes = Vote.query.count()
        total_users = User.query.count()
        
        print("=" * 50)
        print("📊 ESTADÍSTICAS FINALES:")
        print(f"   👥 Usuarios: {total_users}")
        print(f"   🗺️ Rutas: {total_routes}")
        print(f"   ⭐ Votos: {total_votes}")
        print("=" * 50)
        print("🎉 ¡Rutas generadas exitosamente!")
    
    @app.cli.command("create-admin")
    @click.argument("name")
    @click.argument("email") 
    @click.argument("password")
    def create_admin_command(name, email, password):
        """Crear usuario administrador desde línea de comandos"""
        try:
            # Verificar si ya existe
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                print(f"❌ Ya existe un usuario con email: {email}")
                return
            
            # Crear admin
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            admin_user = User(
                name=name,
                email=email,
                password_hash=password_hash,
                role=UserRole.ADMIN,
                is_active=True
            )
            
            db.session.add(admin_user)
            db.session.commit()
            
            print(f"✅ Usuario admin creado exitosamente:")
            print(f"   Nombre: {name}")
            print(f"   Email: {email}")
            print(f"   Rol: ADMIN")
            
        except Exception as e:
            print(f"❌ Error al crear admin: {str(e)}")
            db.session.rollback()

    @app.cli.command("insert-test-data")
    def insert_test_data():
        """Generar todos los datos de prueba (usuarios, rutas y votos)"""
        print("🎯 Generando datos de prueba completos...")
        
        try:
            # Crear algunos usuarios de prueba
            print("👥 Creando usuarios de prueba...")
            test_users_data = [
                {"name": "Admin Principal", "email": "admin@waypoint.com", "password": "admin123", "role": UserRole.ADMIN},
                {"name": "María García", "email": "maria@waypoint.com", "password": "user123", "role": UserRole.USER},
                {"name": "Juan López", "email": "juan@waypoint.com", "password": "user123", "role": UserRole.USER},
                {"name": "Ana Martínez", "email": "ana@waypoint.com", "password": "user123", "role": UserRole.USER},
                {"name": "Carlos Ruiz", "email": "carlos@waypoint.com", "password": "user123", "role": UserRole.USER},
            ]
            
            created_users = []
            for user_data in test_users_data:
                existing_user = User.query.filter_by(email=user_data["email"]).first()
                if not existing_user:
                    password_hash = bcrypt.generate_password_hash(user_data["password"]).decode('utf-8')
                    user = User(
                        name=user_data["name"],
                        email=user_data["email"],
                        password_hash=password_hash,
                        role=user_data["role"],
                        is_active=True
                    )
                    db.session.add(user)
                    created_users.append(user)
                    print(f"  ✅ Usuario creado: {user_data['name']} ({user_data['email']})")
                else:
                    created_users.append(existing_user)
                    print(f"  ⚠️  Usuario ya existe: {user_data['email']}")
            
            db.session.commit()
            
            # Ejecutar seed de rutas
            print("\n🗺️  Ejecutando generación de rutas...")
            seed_routes.callback()
            
            print("\n🎉 ¡Datos de prueba generados exitosamente!")
            print("\n💡 Credenciales de acceso:")
            print("   Admin: admin@waypoint.com / admin123")
            print("   Users: maria@waypoint.com / user123")
            print("          juan@waypoint.com / user123")
            print("          ana@waypoint.com / user123")
            print("          carlos@waypoint.com / user123")
            
        except Exception as e:
            print(f"❌ Error generando datos de prueba: {str(e)}")
            db.session.rollback()

    @app.cli.command("reset-db")
    def reset_database():
        """Reiniciar base de datos (CUIDADO: Elimina todos los datos)"""
        response = input("⚠️  ¿Estás seguro de que quieres eliminar TODOS los datos? (yes/no): ")
        if response.lower() == 'yes':
            try:
                db.drop_all()
                db.create_all()
                print("✅ Base de datos reiniciada exitosamente")
                print("💡 Ejecuta 'flask insert-test-data' para crear datos de prueba")
            except Exception as e:
                print(f"❌ Error reiniciando base de datos: {str(e)}")
        else:
            print("❌ Operación cancelada")