# Multi-stage build para otimização
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY bun.lockb ./

# Instalar dependências
RUN npm ci --only=production --silent

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção
FROM nginx:alpine AS production

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 82
EXPOSE 82

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:82/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
