FROM node:18-alpine
WORKDIR /app
RUN npm install -g json-server
COPY db.json .
# Umjesto 3001, koristimo $PORT koji Cloud Run postavi
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "json-server --watch db.json --host 0.0.0.0 --port $PORT"]