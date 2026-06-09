# Flask Backend with Gunicorn
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
RUN pip install --no-cache-dir flask gunicorn

# Copy application files
COPY site_app.py /app/

# Create trips.json file
RUN echo '[]' > /app/trips.json

# Copy static files (optional, for serving assets)
COPY static /app/static/ 2>/dev/null || true

# Expose port
EXPOSE 5002

# Run Flask with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5002", "--workers", "2", "--timeout", "120", "site_app:app"]
