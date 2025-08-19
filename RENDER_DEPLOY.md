# Deploy no Render.com

## Configuração Necessária

### 1. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Render.com:

- `DATABASE_URL`: URL da conexão com o banco PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)
- `NODE_ENV`: production

### 2. Build Command

O build command configurado é: `npm run build`

Este comando:
1. Instala as dependências
2. Gera o cliente Prisma
3. Compila o TypeScript para JavaScript
4. Verifica se o build foi bem-sucedido

### 3. Start Command

O start command configurado é: `npm start`

Este comando executa: `node dist/index.js`

### 4. Estrutura de Arquivos

Após o build, a estrutura deve ser:
```
dist/
├── index.js
├── routes/
├── middleware/
├── schemas/
└── ...
```

### 5. Troubleshooting

Se o deploy falhar:

1. Verifique se a variável `DATABASE_URL` está configurada corretamente
2. Verifique se o banco PostgreSQL está acessível
3. Verifique os logs do build para identificar erros de compilação
4. Certifique-se de que todas as dependências estão no `package.json`

### 6. Logs Úteis

Para verificar se o build foi bem-sucedido, procure por:
```
Build completed successfully!
Generated files:
```

### 7. Banco de Dados

Certifique-se de que:
- O banco PostgreSQL está criado
- As migrações foram executadas
- A URL de conexão está correta
