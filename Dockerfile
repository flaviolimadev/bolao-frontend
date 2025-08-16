# Build stage
FROM node:20-alpine AS builder

# Receber variável de ambiente
ARG VITE_API_URL

# Debug
RUN echo "🔧 VITE_API_URL: $VITE_API_URL"

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Build com variável
RUN VITE_API_URL="$VITE_API_URL" npm run build

# Production stage
FROM nginx:alpine

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar template env.js
COPY public/env.js /usr/share/nginx/html/env.js.tpl

# Definir variável no container
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Script de inicialização
RUN echo '#!/bin/sh' > /docker-entrypoint.d/99-env.sh && \
    echo 'envsubst "$VITE_API_URL" < /usr/share/nginx/html/env.js.tpl > /usr/share/nginx/html/env.js' >> /docker-entrypoint.d/99-env.sh && \
    chmod +x /docker-entrypoint.d/99-env.sh

EXPOSE 82

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-cache --tries=1 --spider http://127.0.0.1:82/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
