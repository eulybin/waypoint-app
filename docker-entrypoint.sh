#!/bin/bash
set -e

echo "Starting Waypoint application..."

# Run database migrations
echo "Running database migrations..."
flask db upgrade

# Start nginx in the background
echo "Starting nginx..."
nginx

# Start Flask backend
echo "Starting Flask backend..."
exec gunicorn --bind 0.0.0.0:3001 --workers 4 --timeout 120 src.wsgi:app
