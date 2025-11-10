# 🗺️ Waypoint - Discover, Create & Share Travel Routes

<div align="center">

![Waypoint Banner](https://img.shields.io/badge/Waypoint-Travel%20Routes-orange?style=for-the-badge)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-1.1.2-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet)](https://leafletjs.com/)

**A full-stack web application for discovering and creating custom travel routes with interactive maps, POI management, and community-driven ratings.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📖 About Waypoint

**Waypoint** is a modern travel route planning platform that empowers users to discover, create, and share custom travel routes enriched with Points of Interest (POIs). Whether you're planning a city tour, a hiking trail, or a food adventure, Waypoint provides the tools to create detailed, interactive routes that can be shared with the community.

### 🎯 Key Highlights

- **Interactive Map Creation**: Build routes by selecting POIs directly on an interactive Leaflet map with Nominatim geocoding
- **Smart POI Discovery**: Search and filter attractions, restaurants, parks, monuments, and more using OpenStreetMap data
- **Community-Driven**: Rate, favorite, and explore routes created by other travelers
- **Real-Time Weather**: Get weather forecasts for your selected destinations
- **Routing Options**: Calculate distances and visualize routes via car, bike, or walking
- **Dark Mode Support**: Seamless theme switching for optimal viewing in any environment
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

---

## ✨ Features

### 🗺️ Route Management

- **Create Custom Routes**: Add multiple POIs with categories (attractions, restaurants, cafes, parks, etc.)
- **Interactive Map Interface**: Drag-and-drop POIs, visualize routes with polylines
- **POI Details**: Store names, categories, descriptions, addresses, and images for each point
- **Route Editing**: Reorder, add, or remove POIs from existing routes
- **Smart Search**: Filter routes by city, country, or locality

### 👥 User Experience

- **User Authentication**: Secure registration and login with JWT tokens
- **User Profiles**: View your created routes, favorites, and statistics
- **Password Recovery**: Email-based password reset functionality
- **Role-Based Access**: Admin and user roles with different permissions
- **Guest Preview**: Non-authenticated users can browse trending routes (read-only)

### 📊 Social Features

- **Rating System**: Rate routes from 1-5 stars with visual feedback
- **Favorites**: Bookmark routes for quick access
- **Trending Routes**: Discover top-rated routes based on community ratings
- **Vote Statistics**: See average ratings and total votes for each route
- **Author Attribution**: Each route displays creator information

### 🌦️ Additional Features

- **Weather Widget**: Real-time weather data for selected cities
- **Popular Destinations**: Quick access to trending cities and countries
- **Image Integration**: Auto-fetch POI images from Unsplash API
- **Responsive Cards**: Beautiful route cards with all essential information
- **Problem Reporting**: Report issues with routes directly to admins
- **Smooth Animations**: Polished UI with attention-grabbing animations

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18.2 with Hooks (useState, useEffect, useReducer, useContext)
- **Build Tool**: Vite 4.4 for lightning-fast development
- **Routing**: React Router v6 for SPA navigation
- **Maps**: Leaflet + React-Leaflet for interactive maps
- **Geocoding**: Nominatim API for location search
- **Routing**: OpenRouteService for route calculations
- **Icons**: Lucide React for modern, customizable icons
- **Styling**: Bootstrap 5.3 + Custom CSS
- **State Management**: Context API (AuthContext, StoreContext)
- **HTTP Client**: Fetch API with custom service layer

### Backend

- **Framework**: Flask 1.1.2 (Python web microframework)
- **ORM**: SQLAlchemy 1.3.23 with Alembic migrations
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: JWT-based token system
- **Password Hashing**: Flask-Bcrypt
- **CORS**: Flask-CORS for cross-origin requests
- **API Documentation**: Flask-Swagger
- **Admin Panel**: Flask-Admin
- **Image Storage**: Cloudinary CDN integration
- **Environment Config**: python-dotenv

### External APIs

- **Nominatim**: Geocoding and reverse geocoding
- **OpenRouteService**: Route calculation (car, bike, walking)
- **OpenWeatherMap**: Real-time weather data
- **Unsplash**: POI image sourcing
- **OpenStreetMap**: POI data and location search

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 20+**
- **PostgreSQL** (recommended) or SQLite
- **Pipenv** for Python package management
- **npm** or **yarn** for Node packages

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/waypoint-app.git
cd waypoint-app
```

### 2️⃣ Backend Setup

#### Install Python Dependencies

```bash
pipenv install
```

#### Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/waypoint_db

# Flask
FLASK_APP=src/app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# JWT
JWT_SECRET_KEY=your-jwt-secret-key

# External APIs (optional)
CLOUDINARY_URL=cloudinary://your-cloudinary-credentials
OPENWEATHER_API_KEY=your-openweather-api-key
```

#### Database Setup

```bash
# Run migrations
pipenv run upgrade

# Seed database with test data (optional)
pipenv run python seed_routes.py
```

#### Start Backend Server

```bash
pipenv run start
```

The Flask API will run on `http://localhost:3001`

### 3️⃣ Frontend Setup

#### Install Node Dependencies

```bash
npm install
```

#### Start Development Server

```bash
npm run start
```

The React app will run on `http://localhost:3000`

---

## 📂 Project Structure

```
waypoint-app/
├── src/
│   ├── api/                    # Flask Backend
│   │   ├── routes/            # API endpoints
│   │   │   ├── register_login.py    # Auth routes
│   │   │   ├── routes.py            # Route CRUD
│   │   │   ├── api_map.py           # Route creation
│   │   │   ├── votes.py             # Rating system
│   │   │   ├── favorites.py         # Favorites
│   │   │   ├── weather.py           # Weather API
│   │   │   ├── profile.py           # User profile
│   │   │   └── external_api.py      # External integrations
│   │   ├── models.py          # Database models
│   │   ├── utils.py           # Helper functions
│   │   └── commands.py        # CLI commands
│   ├── front/                 # React Frontend
│   │   ├── pages/            # Route components
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── CreateRoute.jsx     # Route builder
│   │   │   ├── Explore.jsx         # Route discovery
│   │   │   ├── Trending.jsx        # Top routes
│   │   │   ├── Profile.jsx         # User dashboard
│   │   │   ├── RouteDetail.jsx     # Route view
│   │   │   ├── Login.jsx           # Authentication
│   │   │   └── Search.jsx          # Guest search
│   │   ├── components/       # Reusable components
│   │   │   ├── RouteCard.jsx
│   │   │   ├── RouteCardReadOnly.jsx
│   │   │   ├── WeatherWidget.jsx
│   │   │   ├── CreateRoute/        # Route creation
│   │   │   ├── Modals/             # Modal dialogs
│   │   │   ├── Navbars/            # Navigation
│   │   │   └── Profile/            # Profile components
│   │   ├── services/         # API service layer
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── assets/           # Static assets
│   └── app.py                # Flask app entry
├── migrations/               # Alembic migrations
├── public/                   # Static files
├── requirements.txt          # Python dependencies
├── package.json             # Node dependencies
└── vite.config.js           # Vite configuration
```

---

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| POST   | `/api/register`       | Register new user            |
| POST   | `/api/login`          | User login (returns JWT)     |
| POST   | `/api/reset-password` | Request password reset       |
| GET    | `/api/profile`        | Get user profile (protected) |

### Route Endpoints

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/api/routes`     | Get all routes            |
| GET    | `/api/routes/:id` | Get route by ID           |
| POST   | `/api/map/route`  | Create new route          |
| PUT    | `/api/routes/:id` | Update route (owner only) |
| DELETE | `/api/routes/:id` | Delete route (owner only) |

### Interaction Endpoints

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/api/votes`          | Rate a route (1-5 stars) |
| POST   | `/api/favorites`      | Toggle favorite          |
| GET    | `/api/user/favorites` | Get user favorites       |
| POST   | `/api/report-problem` | Report route issue       |

### External API Endpoints

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/api/search-locations` | Search locations via Nominatim |
| GET    | `/api/search-pois`      | Search POIs near location      |
| GET    | `/api/weather/:city`    | Get weather for city           |
| POST   | `/api/calculate-route`  | Calculate route polyline       |

---

## 🎨 Screenshots

### Route Creation

![Create Route](docs/assets/screenshot-create.png)
_Interactive map-based route creation with POI search and categorization_

### Route Discovery

![Explore Routes](docs/assets/screenshot-explore.png)
_Discover routes by location with filtering and weather integration_

### Profile Dashboard

![User Profile](docs/assets/screenshot-profile.png)
_Personal dashboard with created routes, favorites, and statistics_

---

## 🌟 Core Features Explained

### Route Creation Workflow

1. **Select Location**: Choose a country and city or search for any location
2. **Find POIs**: Search for attractions, restaurants, parks, etc. using OpenStreetMap data
3. **Add to Route**: Click POIs to add them to your route with automatic ordering
4. **Customize**: Add descriptions, reorder stops, upload custom images
5. **Visualize**: See your route rendered on the map with connecting lines
6. **Calculate Distance**: Get route distance for car, bike, or walking
7. **Save & Share**: Publish your route for the community to discover

### Rating System

- Users can rate any route from 1-5 stars
- Only one vote per user per route
- Average rating displayed with star visualization
- Total vote count shown on route cards
- Trending page ranks routes by rating + vote count

### Weather Integration

- Real-time weather data for any searched city
- Temperature, conditions, humidity, wind speed
- Animated weather widget with attention effects
- Automatic weather update when city is selected
- Weather icons matching current conditions

---

## 🧪 Development Commands

### Backend Commands

```bash
# Start Flask development server
pipenv run start

# Run database migrations
pipenv run upgrade

# Create new migration
pipenv run migrate

# Rollback migration
pipenv run downgrade

# Seed test users
flask insert-test-users 5

# Insert test routes
pipenv run python seed_routes.py
```

### Frontend Commands

```bash
# Start Vite dev server with HMR
npm run start

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Database (required)
DATABASE_URL=postgresql://user:pass@localhost:5432/waypoint

# Flask (required)
FLASK_APP=src/app.py
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# API Keys (optional but recommended)
OPENWEATHER_API_KEY=your-key
CLOUDINARY_URL=cloudinary://your-credentials
```

### Database URL Formats

| Database   | Connection String                         |
| ---------- | ----------------------------------------- |
| PostgreSQL | `postgresql://user:pass@host:5432/dbname` |
| MySQL      | `mysql://user:pass@host:3306/dbname`      |
| SQLite     | `sqlite:///database.db`                   |

---

## 🚀 Deployment

### Deploy to Render.com

This app is ready for deployment on Render with minimal configuration:

1. **Create Render Account**: Sign up at [render.com](https://render.com)
2. **Create PostgreSQL Database**: Note the internal database URL
3. **Create Web Service**: Connect your GitHub repository
4. **Configure Environment**:
   - Build Command: `pip install -r requirements.txt && npm install && npm run build`
   - Start Command: `gunicorn src.wsgi:app`
   - Add environment variables from `.env`
5. **Deploy**: Render will automatically deploy on every push to main

For detailed instructions, see [Render Deployment Guide](https://4geeks.com/docs/start/deploy-to-render-com).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- **Frontend**: Follow ESLint rules, use functional components with hooks
- **Backend**: Follow PEP 8, use type hints where possible
- **Commits**: Use conventional commits format
- **Documentation**: Update README for new features

---

## 📝 License

This project is licensed under the ISC License. See [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Egor Ulybin**

- GitHub: [@eulybin](https://github.com/eulybin)

---

## 🙏 Acknowledgments

- **4Geeks Academy** - Initial React-Flask template
- **OpenStreetMap** - Map data and POI information
- **Leaflet** - Interactive mapping library
- **Unsplash** - High-quality POI images
- **OpenRouteService** - Route calculation API
- **OpenWeatherMap** - Weather data API

---

## 📚 Additional Resources

- [Backend API Documentation](docs/BACKEND_SETUP_GUIDE.md)
- [Postman Testing Guide](docs/POSTMAN_TESTING_GUIDE.md)
- [Seed Data Documentation](SEED_DATA.md)
- [Interactive Map Documentation](src/front/components/CreateRoute/README_MAPA_INTERACTIVO.md)

---

<div align="center">

**Built with ❤️ using React, Flask, and PostgreSQL**

⭐ Star this repo if you find it helpful!

</div>
