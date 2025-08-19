# Deploy no Render.com

## Configuração Atual

O projeto está configurado para ser deployado no Render.com com as seguintes configurações:

### Build Command
```bash
npm run build:render
```

### Start Command
```bash
node dist/index.js
```

### Variáveis de Ambiente Necessárias

1. **DATABASE_URL**: URL de conexão com o banco PostgreSQL
   - Formato: `postgresql://username:password@host:port/database`
   - Exemplo: `postgresql://user:pass@localhost:5432/minha_prefeitura`

2. **JWT_SECRET**: Chave secreta para assinatura de tokens JWT
   - Deve ser uma string longa e aleatória
   - Exemplo: `sua-chave-secreta-muito-longa-aqui`

3. **NODE_ENV**: Ambiente de execução
   - Valor: `production`

## Processo de Build

O script `build:render` executa os seguintes passos:

1. **npm ci**: Instala dependências de forma limpa
2. **npx prisma generate**: Gera o cliente Prisma
3. **npx tsc**: Compila o TypeScript para JavaScript

## Estrutura Esperada Após Build

Após o build bem-sucedido, a seguinte estrutura deve existir:

```
dist/
├── index.js          # Arquivo principal
├── index.d.ts        # Definições TypeScript
├── routes/           # Rotas compiladas
├── middleware/       # Middlewares compilados
└── schemas/          # Schemas compilados
```

## Troubleshooting

### Erro: "Cannot find module '/opt/render/project/src/dist/index.js'"

**Causa**: O build não foi executado corretamente ou o TypeScript não foi compilado.

**Solução**:
1. Verifique se o comando de build está sendo executado
2. Confirme que o arquivo `dist/index.js` existe após o build
3. Verifique os logs do build no Render.com

### Erro de Permissão no Prisma

**Causa**: Problemas de permissão ao gerar o cliente Prisma.

**Solução**:
1. Use `npm ci` em vez de `npm install`
2. Execute `npx prisma generate` explicitamente
3. Verifique se o DATABASE_URL está configurado

### Erro de Conexão com Banco

**Causa**: DATABASE_URL não configurado ou banco inacessível.

**Solução**:
1. Configure a variável DATABASE_URL no Render.com
2. Verifique se o banco PostgreSQL está acessível
3. Confirme se as credenciais estão corretas

## Logs Úteis

Para verificar se o build foi bem-sucedido, procure por estas mensagens nos logs:

```
✔ Generated Prisma Client
TypeScript compilation successful
Build completed successfully!
```

## Comandos de Debug

Se precisar debugar localmente:

```bash
# Testar build local
npm run build:render

# Verificar se dist/index.js existe
ls -la dist/

# Testar execução local
node dist/index.js
```
