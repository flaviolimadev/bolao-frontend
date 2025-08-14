#!/bin/bash

# 🚀 Script de Build para Deploy na Coolify
# Porta 82 configurada

echo "🔨 Iniciando build do frontend..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script no diretório reflex-dashboard-build-main/"
    exit 1
fi

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf dist/
rm -rf node_modules/

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --silent

# Build da aplicação
echo "🏗️ Fazendo build da aplicação..."
npm run build

# Verificar se o build foi criado
if [ ! -d "dist" ]; then
    echo "❌ Erro: Build não foi criado. Verifique os logs acima."
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📁 Arquivos gerados em: dist/"
echo "🐳 Pronto para deploy na Coolify na porta 82!"

# Mostrar tamanho do build
echo "📊 Tamanho do build:"
du -sh dist/

# Listar arquivos principais
echo "📋 Arquivos principais:"
ls -la dist/
