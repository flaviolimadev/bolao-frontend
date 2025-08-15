# 🐳 Guia Completo: Criando Dockerfiles para Projetos React/Vite

Este guia mostra como criar um Dockerfile funcional para projetos React/Vite, baseado na experiência bem-sucedida deste projeto.

## 📋 Pré-requisitos

- Projeto React/Vite funcionando localmente
- Docker instalado e funcionando
- Acesso ao repositório Git

## 🏗️ Estrutura do Projeto

```
projeto-react/
├── src/                    # Código fonte
├── public/                 # Arquivos estáticos
├── package.json            # Dependências
├── vite.config.ts          # Configuração do Vite
├── Dockerfile              # Dockerfile para produção
├── nginx.conf              # Configuração do Nginx
├── .dockerignore           # Arquivos a ignorar
└── docker-compose.yml      # Orquestração local (opcional)
```

## 🐳 Dockerfile Completo

### **Versão Multi-Stage (Recomendada)**

```dockerfile
# Multi-stage build para otimização
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY bun.lockb ./  # Se usar Bun
# COPY yarn.lock ./  # Se usar Yarn
# COPY pnpm-lock.yaml ./  # Se usar pnpm

# Instalar TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci
# RUN yarn install --frozen-lockfile  # Se usar Yarn
# RUN pnpm install --frozen-lockfile  # Se usar pnpm

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build
# RUN yarn build  # Se usar Yarn
# RUN pnpm build  # Se usar pnpm

# Stage de produção
FROM nginx:alpine AS production

# Instalar wget para health check
RUN apk add --no-cache wget

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta desejada
EXPOSE 82

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:82/health || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
```

### **Versão Simples (Para desenvolvimento)**

```dockerfile
# Dockerfile para desenvolvimento
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta de desenvolvimento
EXPOSE 8080

# Comando para iniciar em modo desenvolvimento
CMD ["npm", "run", "dev"]
```

## 🌐 Configuração do Nginx

### **nginx.conf para SPA React**

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Configurações de log
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Configurações de performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Configuração do servidor
    server {
        listen 82;  # Alterar para a porta desejada
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Configurações de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }

        # Cache para HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # Configuração para SPA (Single Page Application)
        location / {
            try_files $uri $uri/ /index.html;
            
            # Headers para CORS se necessário
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        }

        # Configuração para uploads (se necessário)
        location /uploads/ {
            alias /usr/share/nginx/html/uploads/;
            expires 1y;
            add_header Cache-Control "public";
        }

        # Configuração para health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Configuração para robots.txt
        location = /robots.txt {
            expires 1d;
            add_header Cache-Control "public";
        }

        # Configuração para favicon
        location = /favicon.ico {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Configuração de erro 404
        error_page 404 /index.html;
    }
}
```

## 🚫 Arquivo .dockerignore

```dockerignore
# Dependências
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
dist
build

# Arquivos de desenvolvimento
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Git
.git
.gitignore

# Docker
Dockerfile
.dockerignore
docker-compose*.yml

# Coolify
.coolify
```

## 🐙 Docker Compose (Opcional)

### **docker-compose.yml para Produção e Desenvolvimento**

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "82:82"  # Alterar para a porta desejada
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:82/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - app-network

  # Serviço opcional para desenvolvimento local
  frontend-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:3000
    volumes:
      - .:/app
      - /app/node_modules
    restart: unless-stopped
    networks:
      - app-network
    profiles:
      - dev

networks:
  app-network:
    driver: bridge
```

## 🚀 Comandos para Teste Local

### **Build da Imagem**
```bash
# Produção
docker build -t meu-projeto-frontend .

# Desenvolvimento
docker build -f Dockerfile.dev -t meu-projeto-frontend-dev .
```

### **Executar Container**
```bash
# Produção
docker run -p 82:82 meu-projeto-frontend

# Desenvolvimento
docker run -p 8080:8080 meu-projeto-frontend-dev
```

### **Usar Docker Compose**
```bash
# Produção
docker-compose up frontend

# Desenvolvimento
docker-compose --profile dev up frontend-dev
```

## 🔧 Configurações por Gerenciador de Pacotes

### **npm**
```dockerfile
COPY package*.json ./
RUN npm ci
RUN npm run build
```

### **Yarn**
```dockerfile
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
RUN yarn build
```

### **pnpm**
```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
RUN pnpm build
```

### **Bun**
```dockerfile
COPY package.json bun.lockb ./
RUN bun install
RUN bun run build
```

## 📝 Checklist de Verificação

### **Antes do Deploy**
- [ ] Dockerfile está na raiz do projeto
- [ ] nginx.conf está configurado corretamente
- [ ] .dockerignore está otimizado
- [ ] Porta no nginx.conf corresponde ao EXPOSE
- [ ] Health check endpoint está funcionando
- [ ] Build local está funcionando

### **Durante o Deploy**
- [ ] Build da imagem está funcionando
- [ ] Container está iniciando
- [ ] Health check está passando
- [ ] Aplicação está acessível
- [ ] Logs estão limpos

### **Após o Deploy**
- [ ] Frontend está carregando
- [ ] Funcionalidades estão funcionando
- [ ] API está conectando (se aplicável)
- [ ] Performance está adequada

## 🚨 Troubleshooting Comum

### **Erro: "vite: not found"**
**Solução**: Use `RUN npm ci` em vez de `RUN npm ci --only=production`

### **Erro: "host not found in upstream"**
**Solução**: Remova configurações de proxy desnecessárias do nginx.conf

### **Erro: "Connection refused" no health check**
**Solução**: Verifique se a porta no nginx.conf corresponde ao EXPOSE

### **Erro: "wget: not found"**
**Solução**: Adicione `RUN apk add --no-cache wget` no Dockerfile

### **Build muito lento**
**Solução**: Otimize o .dockerignore e use multi-stage build

## 🎯 Dicas de Otimização

1. **Use multi-stage build** para reduzir tamanho da imagem final
2. **Otimize o .dockerignore** para excluir arquivos desnecessários
3. **Use Alpine Linux** para imagens menores
4. **Configure cache adequado** no nginx para assets estáticos
5. **Use health checks** para monitoramento automático
6. **Configure logs** para facilitar debugging

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Vite Build](https://vitejs.dev/guide/build.html)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

---

**🎉 Com este guia, você conseguirá criar Dockerfiles funcionais para qualquer projeto React/Vite!**
