# AvaLimo v2 — React SPA (new design) + Flask API backend
# Build context = repo ROOT (Coolify default).
# nginx serves the built React app on Coolify's port 5002 and proxies
# /api/*, /static/*, /deposit, /blog and legacy pages to the Flask backend.
FROM node:22-alpine AS build
WORKDIR /app
COPY webapp/package.json webapp/package-lock.json* webapp/bun.lock* ./
RUN (npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund)
COPY webapp/ .
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends nginx supervisor && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Flask backend (API + /deposit + /blog + legacy pages)
COPY site_app.py index.html page_content.json blog_posts.json build.info /app/
COPY auto_blog.py blog_cron.sh /app/
RUN echo '[]' > /app/trips.json

# New React site build output
COPY --from=build /app/dist /app/site

# Static assets (fleet images, favicon, hero video, landing pages)
COPY static /app/static

# nginx + supervisor config
COPY deploy/nginx-v2.conf /etc/nginx/sites-available/default
COPY deploy/supervisord-v2.conf /etc/supervisor/conf.d/supervisord-v2.conf
RUN mkdir -p /var/log/supervisor /var/log/nginx /var/lib/nginx

EXPOSE 5002
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord-v2.conf"]
