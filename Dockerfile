# Multi-stage build para otimização
FROM node:18-alpine AS builder

# 🔧 ARGs para variáveis de ambiente
ARG VITE_API_URL

# Definir diretório de trabalho
WORKDIR /app

# Tornar a variável disponível como ENV no processo de build
ENV VITE_API_URL=${VITE_API_URL}

# 🔧 Debug: mostrar valor da variável
RUN echo "🔧 VITE_API_URL recebido: $VITE_API_URL"

# Copiar arquivos de dependências
COPY package*.json ./
COPY bun.lockb ./

# Instalar TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# 🔧 Build da aplicação com variáveis de ambiente
RUN echo "🔧 Iniciando build com VITE_API_URL: $VITE_API_URL" && \
    VITE_API_URL="$VITE_API_URL" npm run build

# Stage de produção
FROM nginx:alpine AS production

# Permitir fallback do valor também no estágio de produção
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Instalar wget e envsubst para injetar env em runtime
RUN apk add --no-cache wget gettext

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar env.js template e processar com envsubst em runtime de container
COPY public/env.js /usr/share/nginx/html/env.js.tpl

# Entry-point para substituir variável no env.js na inicialização
COPY docker-entrypoint.d/99-env.sh /docker-entrypoint.d/99-env.sh
RUN chmod +x /docker-entrypoint.d/99-env.sh

# Expor porta 82
EXPOSE 82

# Health check corrigido
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:82/health || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
