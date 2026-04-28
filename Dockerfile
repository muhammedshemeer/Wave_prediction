# Use Python 3.10 slim image (Cache Buster: 2026-05-05 16:40)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies if needed (e.g., for some ML libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code and models
COPY app/ ./app/
COPY models/ ./models/

# Expose port 8000
EXPOSE 8000

# Command to run the application
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
