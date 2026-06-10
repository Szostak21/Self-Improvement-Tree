FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 8081
EXPOSE 19006

ENTRYPOINT ["./docker-entrypoint.sh"]
