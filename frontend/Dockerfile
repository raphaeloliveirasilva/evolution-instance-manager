# Estágio 1: Build
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Produção (Nginx)
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script que gera o arquivo de configuração dinamicamente no startup
RUN echo '#!/bin/sh' > /docker-entrypoint.d/50-generate-env-config.sh && \
    echo 'echo "window._env_ = { VITE_API_URL: \"$VITE_API_URL\" };" > /usr/share/nginx/html/env-config.js' >> /docker-entrypoint.d/50-generate-env-config.sh && \
    chmod +x /docker-entrypoint.d/50-generate-env-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]