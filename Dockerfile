

FROM node:20-slim



WORKDIR /app



COPY ./servidor/package*.json ./



RUN npm install --omit=dev



COPY ./servidor .



EXPOSE 3000





CMD ["node", "server.js"]
