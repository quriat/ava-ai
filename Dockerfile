# Flask backend with Nginx reverse proxy
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir flask gunicorn

# Copy application files
COPY site_app.py /app/
COPY index.html /app/static/
COPY houston-airport-limo-service.html /app/static/
COPY robots.txt /app/static/
COPY sitemap.xml /app/static/
COPY blog /app/static/blog/
COPY houston-airport-limo-service /app/static/houston-airport-limo-service/
COPY static /app/static/static/
COPY nginx.conf /etc/nginx/sites-enabled/avalimo

# Create trips.json file
RUN touch /app/trips.json && echo '[]' > /app/trips.json

# Expose port
EXPOSE 5002

# Run Flask with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--workers", "2", "site_app:app"]
