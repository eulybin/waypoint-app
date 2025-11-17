# Backend Dockerfile
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy Pipfile and Pipfile.lock
COPY Pipfile Pipfile.lock ./

# Install pipenv and dependencies
RUN pip install --no-cache-dir pipenv && \
    pipenv install --system --deploy

# Copy application code
COPY src/ ./src/
COPY migrations/ ./migrations/

# Expose port
EXPOSE 3001

# Run migrations and start server
CMD flask db upgrade && flask run -p 3001 -h 0.0.0.0
