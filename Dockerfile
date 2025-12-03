
# Usa la versión más ligera de Node para producción
FROM node:20-slim AS builder

# Configura el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install --omit=dev

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto que tu app usa (probablemente 3000 si no lo cambiaste)
EXPOSE 3000

# Comando para iniciar la aplicación
# server.js es el archivo que inicia tu servidor Express
CMD ["node", "server.js"]
