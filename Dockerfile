# Multi-stage build for Avalimo Voice
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_GEMINI_API_KEY
ENV GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
ENV API_KEY=${VITE_GEMINI_API_KEY}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage: serve static files with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
