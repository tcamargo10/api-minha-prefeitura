#!/bin/bash

# Script de build para o Render.com
echo "Starting build process..."

# Instalar dependências
echo "Installing dependencies..."
npm install

# Gerar cliente Prisma
echo "Generating Prisma client..."
npx prisma generate

# Compilar TypeScript
echo "Compiling TypeScript..."
npx tsc

# Verificar se o build foi bem-sucedido
if [ -f "dist/index.js" ]; then
    echo "Build completed successfully!"
    echo "Generated files:"
    ls -la dist/
else
    echo "Build failed! dist/index.js not found."
    exit 1
fi
