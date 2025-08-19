#!/bin/bash

# Script de build para o Render.com
echo "Starting build process..."

# Instalar dependências
echo "Installing dependencies..."
npm install

# Gerar cliente Prisma (com tratamento de erro)
echo "Generating Prisma client..."
if npx prisma generate; then
    echo "Prisma client generated successfully"
else
    echo "Warning: Prisma client generation failed, continuing with build..."
fi

# Compilar TypeScript
echo "Compiling TypeScript..."
if npx tsc; then
    echo "TypeScript compilation successful"
else
    echo "TypeScript compilation failed"
    exit 1
fi

# Verificar se o build foi bem-sucedido
if [ -f "dist/index.js" ]; then
    echo "Build completed successfully!"
    echo "Generated files:"
    ls -la dist/
else
    echo "Build failed! dist/index.js not found."
    exit 1
fi
