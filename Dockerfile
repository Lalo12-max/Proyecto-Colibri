

FROM node:20-slim



WORKDIR /app



COPY ./servidor/package*.json ./



RUN npm install --omit=dev



COPY ./servidor .



EXPOSE 3000



server.js es el archivo que inicia tu servidor Express

CMD ["node", "server.js"]
