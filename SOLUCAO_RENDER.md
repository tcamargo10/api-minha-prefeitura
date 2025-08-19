# Solução para o Erro no Render.com

## Problema Identificado

O erro `Cannot find module '/opt/render/project/src/dist/index.js'` indica que o build não está sendo executado corretamente no Render.com.

## Solução Implementada

### 1. Configuração Atualizada do render.yaml

```yaml
services:
  - type: web
    name: api-minha-prefeitura
    runtime: node
    buildCommand: npm run build:render
    startCommand: node dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
```

### 2. Script de Build Melhorado

No `package.json`, foi adicionado o script `build:render`:

```json
{
  "scripts": {
    "build:render": "npm ci && npx prisma generate && npx tsc"
  }
}
```

### 3. Passos para Resolver

#### Passo 1: Atualizar o Repositório
```bash
git add .
git commit -m "Fix: Corrigir configuração de build para Render.com"
git push origin master
```

#### Passo 2: Configurar Variáveis de Ambiente no Render.com

No painel do Render.com, configure as seguintes variáveis de ambiente:

1. **DATABASE_URL**: URL completa do banco PostgreSQL
   - Exemplo: `postgresql://user:password@host:port/database`

2. **JWT_SECRET**: Chave secreta para JWT (mínimo 32 caracteres)
   - Exemplo: `sua-chave-secreta-muito-longa-e-segura-aqui`

3. **NODE_ENV**: `production`

#### Passo 3: Verificar Build Command

No painel do Render.com, certifique-se de que o **Build Command** está configurado como:
```
npm run build:render
```

#### Passo 4: Verificar Start Command

Certifique-se de que o **Start Command** está configurado como:
```
node dist/index.js
```

### 4. Teste Local (Opcional)

Para testar localmente antes do deploy:

```bash
# Testar o build
npm run test:build

# Ou executar manualmente
npm ci
npx prisma generate
npx tsc
node dist/index.js
```

### 5. Logs Esperados

Após o deploy bem-sucedido, você deve ver nos logs:

```
✔ Generated Prisma Client
TypeScript compilation successful
Build completed successfully!
Server is running on http://0.0.0.0:3000
```

### 6. Troubleshooting

Se ainda houver problemas:

1. **Verifique os logs do build** no Render.com
2. **Confirme que DATABASE_URL está configurada**
3. **Verifique se o banco PostgreSQL está acessível**
4. **Teste localmente** com `npm run test:build`

### 7. Estrutura Final Esperada

Após o build bem-sucedido, a estrutura deve ser:

```
dist/
├── index.js
├── config.js
├── routes/
├── middleware/
└── schemas/
```

## Comandos de Verificação

```bash
# Verificar se o build funciona
npm run test:build

# Verificar se dist/index.js existe
ls -la dist/

# Testar execução
node dist/index.js
```

## Próximos Passos

1. Faça commit das alterações
2. Push para o repositório
3. Configure as variáveis de ambiente no Render.com
4. Faça o deploy
5. Verifique os logs para confirmar o sucesso
