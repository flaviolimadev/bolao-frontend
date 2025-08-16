FROM node:18-alpine AS build

WORKDIR /app

# Declarar as variáveis de ambiente como argumentos de build
ARG VITE_API_URL
ARG VITE_NODE_ENV

# Debug: mostrar valores recebidos
RUN echo "🔧 VITE_API_URL: $VITE_API_URL"
RUN echo "🔧 VITE_NODE_ENV: $VITE_NODE_ENV"

# Tornar as variáveis disponíveis durante o build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_NODE_ENV=$VITE_NODE_ENV

COPY package*.json ./
RUN npm install
COPY . .

# Build com variáveis explícitas
RUN VITE_API_URL="$VITE_API_URL" npm run build

FROM nginx:alpine

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Remover configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nossa configuração simples
COPY nginx-simple.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

# Copiar template env.js
COPY public/env.js /usr/share/nginx/html/env.js.tpl

# Definir variável no container de produção
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Script de inicialização para gerar env.js
RUN echo '#!/bin/sh' > /docker-entrypoint.d/99-env.sh && \
    echo 'envsubst "$VITE_API_URL" < /usr/share/nginx/html/env.js.tpl > /usr/share/nginx/html/env.js' >> /docker-entrypoint.d/99-env.sh && \
    chmod +x /docker-entrypoint.d/99-env.sh

EXPOSE 82

CMD ["nginx", "-g", "daemon off;"]