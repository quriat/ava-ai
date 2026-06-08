# Static site served with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/avalimo.conf

# Copy only website files to nginx html root
COPY index.html /usr/share/nginx/html/
COPY houston-airport-limo-service.html /usr/share/nginx/html/
COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/

# Copy directories
COPY blog /usr/share/nginx/html/blog/
COPY houston-airport-limo-service /usr/share/nginx/html/houston-airport-limo-service/
COPY static /usr/share/nginx/html/static/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
