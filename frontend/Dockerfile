# 1. Build korak
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Nginx korak
FROM nginx:alpine
# Kopiraj buildane datoteke iz "build" stage-a
COPY --from=build /app/dist /usr/share/nginx/html

# Podesi Nginx da sluša na portu 8080
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

# OVO JE KLJUČNA PROMJENA:
# Nginx se pokreće direktno, ne preko npm-a!
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]