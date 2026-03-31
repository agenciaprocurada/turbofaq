FROM node:20-alpine AS base

# Fase 1: Instalando dependências (inclui pacotes para o Prisma funcionar no Alpine)
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Fase 2: Construindo o projeto (build)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar o cliente Prisma
RUN npx prisma generate

# Variáveis desnecessárias no Next.js (desativa telemetria para build mais rápido)
ENV NEXT_TELEMETRY_DISABLED 1

# Faz o build do Next.js no modo standalone (já configurado no seu next.config.js)
RUN npm run build

# Fase 3: Imagem de Produção (limpa e leve)
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia do builder os artefatos baseados no "output: standalone"
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# === Importante para o TurboFAQ ===
# Cria os diretórios de upload já com permissão para o usuário Next.js gravar imagens
RUN mkdir -p /app/public/uploads/images
RUN chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

# server.js entra em ação via recurso standalone do Next.js
CMD ["node", "server.js"]
