FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Kopiraj build iz prethodnog koraka
COPY --from=build /app/dist /usr/share/nginx/html
# Podesi Nginx da sluša na portu 8080 (koji Cloud Run očekuje)
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]