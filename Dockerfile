# Static site served with Nginx
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
