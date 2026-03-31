FROM node:20-slim AS base

# Fase 1: Dependências
FROM base AS deps
RUN apt-get update -y && apt-get install -y openssl ca-certificates
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Fase 2: Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis fakes de build para passar nas rotas estáticas (caso o painel não as inejte no build)
ENV DATABASE_URL="postgresql://fake:fake@localhost:5432/fake"
ENV NEXT_PUBLIC_SUPABASE_URL="https://fake.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="fake"

# Gerar Prisma Client com os binários para Debian (node-slim)
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Fase 3: Runner
FROM base AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir -p /app/public/uploads/images
RUN chown -R nextjs:nodejs /app/public/uploads

EXPOSE 3000

CMD ["node", "server.js"]
