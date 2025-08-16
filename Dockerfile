FROM node:18-alpine AS build

WORKDIR /app

# Declarar as variáveis de ambiente como argumentos de build
ARG VITE_API_URL
ARG VITE_NODE_ENV

# Tornar as variáveis disponíveis durante o build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# Remover configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nossa configuração simples
COPY nginx-simple.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 82
CMD ["nginx", "-g", "daemon off;"]