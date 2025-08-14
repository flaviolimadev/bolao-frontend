# 🚀 Deploy do Frontend na Coolify

Este documento contém todas as instruções necessárias para fazer o deploy do frontend na Coolify na porta 82.

## 📋 Pré-requisitos

- Coolify configurado e funcionando
- Acesso ao repositório Git
- Docker instalado (para testes locais)

## 🐳 Arquivos Docker Criados

### 1. **Dockerfile** (Produção)
- Multi-stage build otimizado
- Node.js 18 Alpine para build
- Nginx Alpine para produção
- Porta 82 exposta
- Health checks configurados

### 2. **nginx.conf**
- Configuração otimizada para SPA React
- Gzip compression habilitado
- Cache para assets estáticos
- Headers de segurança
- Suporte a CORS
- Proxy para API backend

### 3. **.dockerignore**
- Otimiza o build excluindo arquivos desnecessários
- Reduz o tamanho da imagem final

### 4. **docker-compose.yml**
- Configuração para produção (porta 82)
- Configuração opcional para desenvolvimento (porta 8080)

## 🚀 Deploy na Coolify

### Passo 1: Configuração do Projeto
1. Acesse o painel da Coolify
2. Clique em "New Project"
3. Selecione "Application"
4. Escolha "Docker" como tipo

### Passo 2: Configuração do Git
1. **Repository**: URL do seu repositório Git
2. **Branch**: `main` ou `master`
3. **Docker Compose**: Não marque (usaremos Dockerfile)

### Passo 3: Configuração do Build
1. **Build Pack**: `Dockerfile`
2. **Dockerfile Path**: `Dockerfile` (está na raiz do projeto)
3. **Port**: `82`
4. **Health Check Path**: `/health`

### Passo 4: Variáveis de Ambiente
Configure as seguintes variáveis:

```bash
NODE_ENV=production
VITE_API_URL=http://seu-backend:3000
```

### Passo 5: Deploy
1. Clique em "Deploy"
2. Aguarde o build e deploy
3. Verifique os logs se houver erros

## 🔧 Configurações Importantes

### Porta
- **Produção**: 82 (conforme solicitado)
- **Desenvolvimento**: 8080

### Health Check
- Endpoint: `/health`
- Intervalo: 30s
- Timeout: 3s
- Retries: 3

### Volumes
- Uploads: `/usr/share/nginx/html/lovable-uploads/`
- Logs: `/var/log/nginx/`

## 🧪 Teste Local

### Build da Imagem
```bash
cd reflex-dashboard-build-main
docker build -t sistema-vendas-frontend .
```

### Executar Container
```bash
docker run -p 82:82 sistema-vendas-frontend
```

### Usar Docker Compose
```bash
# Produção
docker-compose up frontend

# Desenvolvimento
docker-compose --profile dev up frontend-dev
```

## 📊 Monitoramento

### Logs
- **Nginx**: `/var/log/nginx/access.log`
- **Nginx**: `/var/log/nginx/error.log`

### Health Check
- Endpoint: `http://localhost:82/health`
- Resposta esperada: `healthy`

### Métricas
- Porta 82 exposta
- Headers de segurança configurados
- Cache otimizado para performance

## 🚨 Troubleshooting

### Problema: Porta 82 não acessível
**Solução**: Verifique se a porta está sendo exposta corretamente no Dockerfile

### Problema: Build falha
**Solução**: Verifique se todas as dependências estão no package.json

### Problema: Arquivos estáticos não carregam
**Solução**: Verifique se o build foi gerado corretamente na pasta `dist`

### Problema: API não conecta
**Solução**: Verifique a variável `VITE_API_URL` e a configuração de proxy no nginx

## 🔒 Segurança

### Headers Configurados
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS
- Configurado para permitir todas as origens
- Métodos HTTP permitidos: GET, POST, PUT, DELETE, OPTIONS

## 📈 Performance

### Otimizações Implementadas
- Multi-stage build para reduzir tamanho da imagem
- Gzip compression para assets
- Cache para arquivos estáticos (1 ano)
- Cache para HTML (sem cache)
- Nginx otimizado para SPA

### Tamanho da Imagem
- **Builder**: ~1GB (temporário)
- **Produção**: ~50MB (final)

## 🎯 Próximos Passos

1. **Deploy na Coolify** seguindo os passos acima
2. **Configurar domínio** se necessário
3. **Configurar SSL** na Coolify
4. **Monitorar logs** e performance
5. **Configurar backup** se necessário

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs da Coolify
2. Teste localmente com Docker
3. Verifique a configuração do nginx
4. Consulte a documentação da Coolify

---

**🎉 Deploy configurado e pronto para uso na porta 82!**
