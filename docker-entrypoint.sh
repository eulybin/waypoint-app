#!/bin/bash
set -e

echo "Starting Waypoint application..."

# Run database migrations using Python script
echo "Running database migrations..."
export PYTHONPATH=/app/src:$PYTHONPATH
cd /app
python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app/src')
from app import app
from flask_migrate import upgrade

with app.app_context():
    upgrade()
    print("Migrations completed successfully")
PYTHON_SCRIPT

# Start nginx in the background
echo "Starting nginx..."
nginx

# Start Flask backend
echo "Starting Flask backend..."
cd /app/src
exec gunicorn --bind 0.0.0.0:3001 --workers 4 --timeout 120 wsgi:app
