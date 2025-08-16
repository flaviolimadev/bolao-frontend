# Build stage
FROM node:18-alpine AS build

# Receber variável
ARG VITE_API_URL

# Debug
RUN echo "🔧 VITE_API_URL recebido: $VITE_API_URL"

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Build com variável
RUN VITE_API_URL="$VITE_API_URL" npm run build

# Production stage
FROM nginx:alpine

# Copiar build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar nginx config
COPY nginx-simple.conf /etc/nginx/conf.d/default.conf

# Copiar env.js template
COPY public/env.js /usr/share/nginx/html/env.js.tpl

# Definir variável no container
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Script simples para gerar env.js
RUN echo '#!/bin/sh' > /docker-entrypoint.d/99-env.sh && \
    echo 'if [ -n "$VITE_API_URL" ]; then' >> /docker-entrypoint.d/99-env.sh && \
    echo '  sed "s|\\${VITE_API_URL}|$VITE_API_URL|g" /usr/share/nginx/html/env.js.tpl > /usr/share/nginx/html/env.js' >> /docker-entrypoint.d/99-env.sh && \
    echo 'fi' >> /docker-entrypoint.d/99-env.sh && \
    chmod +x /docker-entrypoint.d/99-env.sh

EXPOSE 82

CMD ["nginx", "-g", "daemon off;"]