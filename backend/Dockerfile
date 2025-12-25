FROM node:18-alpine
WORKDIR /usr/app
COPY package*.json ./

# Agora ele vai instalar o sequelize-cli porque movemos para dependencies
RUN npm install --omit=dev

COPY . .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]