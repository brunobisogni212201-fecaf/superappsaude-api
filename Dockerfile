# Builder - Compila o NestJS e gera Prisma
FROM node:22-alpine AS builder

# Instala openssl no builder (Requisito obrigatório do Prisma no Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Copia pacotes e a pasta do banco de dados
COPY package*.json ./
COPY prisma ./prisma

# Evita que o Prisma tente rodar o generate no 'npm ci'
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1

# Instala as dependências limpas
RUN npm ci

# Copia o código fonte
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Compila o NestJS
RUN npm run build

# Verifica se o build gerou os arquivos corretos
RUN ls -la dist/ && \
    test -f dist/main.js || (echo "ERRO: dist/main.js não foi gerado pelo build!" && exit 1)

# Imagem de Produção Leve
FROM node:22-alpine AS production
WORKDIR /app

# Re-instalamos dependência vital do Prisma para o linux
RUN apk add --no-cache openssl

# Copiamos apenas o necessário para rodar
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Cloud Run define PORT dinamicamente - usa 8080 como default
ENV PORT=8080
EXPOSE ${PORT}

# Verifica que dist/main.js existe na imagem final
RUN test -f dist/main.js || (echo "ERRO: dist/main.js não existe na imagem!" && exit 1)

CMD ["node", "dist/main"]
