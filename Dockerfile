# Multi-stage build for Avalimo Voice
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage: serve static files with nginx
FROM nginx:alpine

# gettext is not installed on purpose: entrypoint.sh only uses shell expansion and sed.
# (An `apk add` here was the single point of failure for the 2026-11-03 failed deploy.)

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/deploy/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
