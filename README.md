# TurboCloud — Base de Conhecimento

> **Este arquivo é o contexto central do projeto. Leia-o inteiro antes de qualquer tarefa.**  
> Ele descreve o produto, a stack, as regras de desenvolvimento, o modelo de dados e os padrões obrigatórios.

---

## Índice

1. [O que é este projeto](#1-o-que-é-este-projeto)
2. [Stack e dependências](#2-stack-e-dependências)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Variáveis de ambiente](#4-variáveis-de-ambiente)
5. [Modelo de dados](#5-modelo-de-dados)
6. [Rotas públicas](#6-rotas-públicas)
7. [Área administrativa](#7-área-administrativa)
8. [Upload de imagens](#8-upload-de-imagens)
9. [SEO — regras obrigatórias](#9-seo--regras-obrigatórias)
10. [Design system](#10-design-system)
11. [Fases do projeto](#11-fases-do-projeto)
12. [Regras de desenvolvimento](#12-regras-de-desenvolvimento)
13. [Deploy](#13-deploy)
14. [Categorias de conteúdo](#14-categorias-de-conteúdo)

---

## 1. O que é este projeto

Portal de base de conhecimento público da **TurboCloud** (`turbocloud.com.br`), empresa brasileira de hospedagem WordPress de alta performance e VPS.

**URL de produção:** `https://ajuda.turbocloud.com.br`  
**Referência de mercado:** `https://ajuda.staycloud.com.br` (estrutura de categorias semelhante, stack diferente)

**O que o sistema faz:**
- Exibe artigos de documentação e tutoriais organizados por categoria para os clientes da TurboCloud
- Todo conteúdo é público e indexável pelo Google
- Uma área administrativa protegida permite que o time de suporte crie, edite e publique artigos sem conhecimento técnico
- Imagens dos artigos são salvas no disco da própria VPS e servidas pelo Nginx

**O que o sistema NÃO faz:**
- Não tem fórum ou comentários
- Não tem sistema de tickets (suporte é feito externamente)
- Não tem integração com o painel de cliente da TurboCloud (é um produto independente)

---

## 2. Stack e dependências

| Camada | Tecnologia | Versão | Observação |
|---|---|---|---|
| Framework | Next.js | 14 (App Router) | SSR obrigatório. Usar Server Components por padrão. |
| Linguagem | TypeScript | 5.x | Tipagem estrita. Sem `any`. |
| Banco de dados | Supabase (PostgreSQL) | Managed | Usar `DATABASE_URL` com pgBouncer e `DIRECT_URL` sem. |
| ORM | Prisma | 5.x | Schema em `prisma/schema.prisma`. Migrations versionadas. |
| Autenticação | NextAuth.js (Auth.js) | 5.x | Apenas Credentials Provider (e-mail + senha). |
| Editor de conteúdo | TipTap | 2.x | Rich text com saída em HTML sanitizado. |
| Estilização | Tailwind CSS | 3.x | Com tokens do design system (ver seção 10). |
| Deploy | VPS + PM2 + Nginx | — | Não é Vercel. Sistema de arquivos persistente disponível. |

**Instalar dependências:**
```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

---

## 3. Estrutura de pastas

```
turbocloud-ajuda/
├── app/
│   ├── (public)/                        # Rotas públicas — SSR obrigatório
│   │   ├── page.tsx                     # Hub /ajuda
│   │   ├── ajuda/
│   │   │   ├── [categoria]/
│   │   │   │   ├── page.tsx             # Listagem de categoria
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx         # Artigo individual
│   │   │   └── busca/
│   │   │       └── page.tsx             # Resultados de busca
│   ├── (admin)/                         # Rotas do painel admin — autenticação obrigatória
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Layout admin com sidebar
│   │   │   ├── page.tsx                 # Dashboard
│   │   │   ├── artigos/
│   │   │   │   ├── page.tsx             # Listagem de artigos
│   │   │   │   ├── novo/page.tsx        # Criar artigo
│   │   │   │   └── [id]/page.tsx        # Editar artigo
│   │   │   ├── categorias/page.tsx
│   │   │   └── usuarios/page.tsx        # Apenas SUPER_ADMIN
│   │   └── login/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── upload/route.ts              # POST — salva imagem no disco
│   │   ├── views/route.ts               # POST — incrementa contador de views
│   │   └── feedback/route.ts            # POST — voto "útil / não útil"
│   ├── sitemap.ts                       # Gerado automaticamente pelo Next.js
│   └── robots.ts
├── components/
│   ├── public/                          # Componentes das páginas públicas
│   │   ├── ArticleContent.tsx           # Renderiza HTML do TipTap (client)
│   │   ├── TableOfContents.tsx          # TOC lateral sticky (client)
│   │   ├── FeedbackWidget.tsx           # "Este artigo foi útil?" (client)
│   │   └── SearchBar.tsx                # Barra de busca (client para autocomplete)
│   └── admin/                          # Componentes do painel admin
│       ├── Editor.tsx                   # TipTap rich text (client)
│       ├── SlugInput.tsx                # Input com geração automática de slug
│       └── ImageUpload.tsx              # Upload de imagem para /api/upload
├── lib/
│   ├── prisma.ts                        # Singleton do Prisma Client
│   ├── auth.ts                          # Configuração do NextAuth
│   └── slugify.ts                       # Função de geração de slugs
├── middleware.ts                        # Protege rotas /admin/* sem sessão
├── public/
│   └── uploads/
│       └── images/                      # Imagens dos artigos (no .gitignore)
│           └── .gitkeep
├── prisma/
│   └── schema.prisma
├── next.config.js
├── .env.local                           # Nunca commitar
└── README.md                            # Este arquivo
```

---

## 4. Variáveis de ambiente

Criar `.env.local` na raiz. **Nunca commitar este arquivo.**

```env
# Supabase
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# NextAuth
NEXTAUTH_URL="https://ajuda.turbocloud.com.br"
NEXTAUTH_SECRET="[gerar: openssl rand -base64 32]"

# App
NEXT_PUBLIC_SITE_URL="https://ajuda.turbocloud.com.br"
```

---

## 5. Modelo de dados

Schema completo em `prisma/schema.prisma`. Referência rápida:

### Enums

```prisma
enum ArticleStatus {
  DRAFT      # rascunho — invisível ao público
  REVIEW     # aguardando aprovação do EDITOR
  PUBLISHED  # público e indexável
  ARCHIVED   # fora do ar, dados preservados
}

enum UserRole {
  SUPER_ADMIN  # acesso total
  EDITOR       # criar, editar, publicar, despublicar
  WRITER       # criar e editar os próprios artigos (publicar requer EDITOR)
  VIEWER       # leitura do admin apenas
}
```

### Models resumidos

**User** — `id, email, password (bcrypt), name, role, active, createdAt`  
**Category** — `id, name, slug, description, icon, order, active`  
**Article** — `id, title, slug, content (HTML), excerpt, metaTitle, metaDesc, status, views, helpful, notHelpful, featured, categoryId, authorId, publishedAt`

### Regras de banco

- `slug` é `@unique` tanto em Category quanto em Article
- `Article` tem índices em `[categoryId]`, `[slug]` e `[status]`
- Soft delete: artigos nunca são deletados permanentemente por WRITER/EDITOR — apenas `status = ARCHIVED`
- Apenas `SUPER_ADMIN` pode deletar permanentemente

---

## 6. Rotas públicas

### Regra mais importante: SSR obrigatório

**Todas as rotas do grupo `(public)` devem ser Server Components.** Nenhuma rota pública pode fazer `fetch` de dados no cliente. O HTML completo deve ser gerado no servidor.

```tsx
// ✅ CORRETO — Server Component, sem 'use client'
export default async function ArtigoPage({ params }) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } })
  return <article>{/* renderiza no servidor */}</article>
}

// ❌ ERRADO — nunca fazer isso em rotas públicas
'use client'
export default function ArtigoPage() {
  const [article, setArticle] = useState(null)
  useEffect(() => { fetch('/api/artigo').then(...) }, []) // quebra SSR e SEO
}
```

Componentes que precisam de interatividade (TOC com scroll spy, widget de feedback, contador de views) devem ser Client Components **isolados e pequenos**, importados dentro do Server Component pai. Eles nunca bloqueiam a renderização inicial.

### Mapa de rotas

| Rota | O que renderiza | Cache |
|---|---|---|
| `/ajuda` | Hub com grid de categorias e artigos em destaque | `revalidate: 3600` |
| `/ajuda/[categoria]` | Listagem de artigos da categoria com paginação | `revalidate: 3600` |
| `/ajuda/[categoria]/[slug]` | Artigo completo com breadcrumb, TOC e relacionados | `revalidate: 3600` |
| `/ajuda/busca?q=` | Resultados de busca full-text (noindex) | Sem cache |

### Slugs de categoria válidos

```
primeiros-passos
wordpress
dominios-dns
email
vps
seguranca-backup
faturamento
afiliados
```

---

## 7. Área administrativa

### Autenticação

NextAuth.js com Credentials Provider. O middleware em `middleware.ts` bloqueia qualquer rota `/admin/*` sem sessão ativa e redireciona para `/admin/login`.

```ts
// middleware.ts
export { default } from 'next-auth/middleware'
export const config = { matcher: ['/admin/:path*'] }
```

### Matriz de permissões

| Ação | SUPER_ADMIN | EDITOR | WRITER | VIEWER |
|---|---|---|---|---|
| Ver listagem de artigos | ✅ | ✅ | ✅ (próprios) | ✅ |
| Criar artigo | ✅ | ✅ | ✅ | ❌ |
| Editar artigo | ✅ | ✅ (qualquer) | ✅ (próprios) | ❌ |
| Publicar artigo | ✅ | ✅ | ❌ | ❌ |
| Alterar status inline | ✅ | ✅ | ❌ | ❌ |
| Deletar permanente | ✅ | ❌ | ❌ | ❌ |
| CRUD categorias | ✅ | Criar/editar | ❌ | ❌ |
| Reordenar categorias | ✅ | ✅ | ❌ | ❌ |
| CRUD usuários | ✅ | ❌ | ❌ | ❌ |
| Ver métricas/dashboard | ✅ | ✅ | Parcial | ✅ |

### Verificação de role em API Routes

```ts
// Padrão obrigatório em toda API Route do admin
const session = await getServerSession(authOptions)
if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
if (!['EDITOR', 'SUPER_ADMIN'].includes(session.user.role)) {
  return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
}
```

---

## 8. Upload de imagens

### Como funciona

Imagens são salvas **no disco da VPS** em `/public/uploads/images/[ano]/[mes]/`. Sem Supabase Storage, sem S3, sem CDN externo. O Nginx serve a pasta diretamente.

```
POST /api/upload
Content-Type: multipart/form-data
Body: { file: File }

Response: { url: "/uploads/images/2026/04/nome-abc123.webp" }
```

### Regras da API Route de upload

- Requer sessão autenticada (qualquer role exceto VIEWER)
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Tamanho máximo: **5MB**
- Nome gerado automaticamente: `[slug-do-nome-original]-[hash6chars].[ext]`
- Organização por `[ano]/[mes]/` para evitar pasta plana com milhares de arquivos

### Configuração Nginx para uploads

```nginx
location /uploads/ {
    alias /var/www/turbocloud-ajuda/public/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;

    # Nunca executar scripts — segurança obrigatória
    location ~* \.(php|sh|py|pl|cgi)$ {
        deny all;
    }
}
```

### Regras de manutenção

- `/public/uploads/images/*` está no `.gitignore` (apenas `.gitkeep` é commitado)
- **O backup da pasta deve ser incluído na rotina de backup do servidor** — esses arquivos não existem em nenhum outro lugar
- Um cron job mensal deve comparar arquivos na pasta com URLs armazenadas no banco para remover órfãos

---

## 9. SEO — regras obrigatórias

### generateMetadata em todas as rotas públicas

```tsx
// Padrão obrigatório em cada page.tsx público
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } })
  return {
    title: `${article.metaTitle || article.title} | TurboCloud Ajuda`,
    description: article.metaDesc || article.excerpt,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/ajuda/${params.categoria}/${params.slug}` },
    openGraph: { title: article.title, description: article.excerpt, images: [article.ogImage || '/og-default.png'] },
    robots: { index: true, follow: true },
  }
}
```

### Busca sempre com noindex

```tsx
// app/(public)/ajuda/busca/page.tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false }
}
```

### Schema.org por tipo de página

| Página | Schema |
|---|---|
| Hub `/ajuda` | `WebSite` + `SiteLinksSearchBox` |
| Categoria | `ItemList` |
| Artigo | `Article` + `BreadcrumbList` |
| Todas | `Organization` no layout raiz |

### Slugs — regras de geração

```ts
// lib/slugify.ts — usar esta função em todo o projeto
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')      // remove especiais
    .trim()
    .replace(/\s+/g, '-')              // espaços → hífens
    .replace(/-+/g, '-')               // hífens duplos → simples
    .slice(0, 60)                       // máximo 60 chars
}
```

Exemplos de slugs corretos:
- `como-migrar-site-para-turbocloud`
- `como-instalar-n8n-no-coolify`
- `restaurar-backup-com-1-clique`
- `configurar-dns-zone-editor-cpanel`

### Sitemap

`app/sitemap.ts` gera automaticamente. Prioridades:
- `1.0` → hub `/ajuda`
- `0.8` → páginas de categoria
- `0.7` → artigos individuais (`changeFreq: 'monthly'`)
- Excluídos: `/ajuda/busca`, `/admin/*`

### Core Web Vitals — metas de produção

| Métrica | Meta |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| TTFB | < 800ms |

---

## 10. Design system

Light mode. Fundo branco. Cor primária verde.

### Tokens CSS obrigatórios

```css
:root {
  --color-primary:       #00d084;
  --color-primary-light: #e8f9f3;
  --color-primary-dark:  #00a86b;

  --bg-primary:          #ffffff;
  --bg-secondary:        #f5f5f7;
  --bg-card:             #ffffff;

  --text-primary:        #1a1a1a;
  --text-secondary:      #444444;
  --text-tertiary:       #666666;

  --color-border:        #e0e0e0;
  --color-border-focus:  #00d084;

  --shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md:  0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg:  0 12px 32px rgba(0, 0, 0, 0.10);

  --radius:     8px;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Botão primário

```css
.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 600;
  border: none;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background-color: var(--color-primary-dark);
  box-shadow: 0 8px 20px rgba(0, 208, 132, 0.3);
  transform: translateY(-1px);
}
```

### Input

```css
.form-input {
  background-color: var(--bg-secondary);
  border: 2px solid var(--color-border);
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  width: 100%;
  transition: all 0.2s ease;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(0, 208, 132, 0.1);
}
```

### Badges de status

| Status | Background | Cor do texto |
|---|---|---|
| `PUBLISHED` | `#e8f9f3` | `#00a86b` |
| `DRAFT` | `#fef3c7` | `#92400e` |
| `REVIEW` | `#dbeafe` | `#1e40af` |
| `ARCHIVED` | `#f5f5f7` | `#666666` |

### Card de categoria (hover)

```css
.category-card {
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.category-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

---

## 11. Fases do projeto

### Fase 1 — MVP Público ✅ (prioridade máxima)

- Setup Next.js 14 + Supabase + Prisma
- Hub `/ajuda`, listagem de categoria, artigo e busca — todos SSR
- Sitemap XML, robots.txt, metadados, Schema.org
- Design system aplicado
- Deploy em VPS com Nginx

### Fase 2 — Área Administrativa

- Login/logout NextAuth.js
- Middleware de proteção `/admin/*`
- Dashboard com métricas
- CRUD de artigos com TipTap + upload de imagem
- CRUD de categorias com drag-and-drop para reordenação
- Gerenciamento de usuários (SUPER_ADMIN only)
- Preview de artigo antes de publicar

### Fase 3 — UX Avançada

- Autocomplete na busca (debounced, 2+ chars)
- Widget "Este artigo foi útil?" com contagem no admin
- Scroll spy no TOC lateral
- Contador de views (client-side, não bloqueia SSR)
- RSS Feed `/ajuda/feed.xml`

---

## 12. Regras de desenvolvimento

### Regras invioláveis

1. **SSR obrigatório em rotas públicas.** Server Components por padrão. `'use client'` apenas para componentes interativos pequenos e isolados.

2. **Nunca expor service_role key no cliente.** Toda operação de banco que requer privilégio elevado vai em Server Component ou API Route — nunca em Client Component.

3. **Validar role em toda API Route do admin.** Não confiar apenas no middleware — verificar `session.user.role` dentro de cada handler.

4. **Slugs via `slugify()` de `lib/slugify.ts`.** Nunca gerar slug manualmente inline. A função é a única fonte da verdade.

5. **Soft delete padrão.** Artigos nunca somem do banco. `status = ARCHIVED` é o delete para WRITER/EDITOR. Delete físico apenas por SUPER_ADMIN.

6. **Validar tipo e tamanho no servidor no upload.** Não confiar na validação do client. O `file.type` e `file.size` devem ser verificados na API Route antes de qualquer escrita em disco.

7. **`.env.local` nunca commitado.** O `.gitignore` já deve ter esse arquivo. Verificar antes de qualquer push.

8. **Imagens em `/public/uploads/` fora do Git.** Apenas `.gitkeep` é commitado. O conteúdo da pasta é responsabilidade do backup do servidor.

### Padrões de código

```ts
// Prisma Client — singleton obrigatório (lib/prisma.ts)
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

```ts
// Busca full-text em português
const results = await prisma.$queryRaw`
  SELECT id, title, slug, excerpt, "categoryId"
  FROM articles
  WHERE status = 'PUBLISHED'
  AND to_tsvector('portuguese', title || ' ' || content)
      @@ plainto_tsquery('portuguese', ${query})
  ORDER BY ts_rank(to_tsvector('portuguese', title || ' ' || content),
                   plainto_tsquery('portuguese', ${query})) DESC
  LIMIT 20
`
```

### O que não fazer

- ❌ `fetch('/api/...')` dentro de Server Components em rotas públicas
- ❌ `useEffect` para carregar dados de artigos ou categorias
- ❌ Gradientes, dark mode ou cores fora do design system
- ❌ Slugs com acentos, espaços ou caracteres especiais
- ❌ Artigos com `status = DRAFT` visíveis em qualquer rota pública
- ❌ Qualquer rota `/admin/*` acessível sem `session` válida
- ❌ `console.log` com dados de sessão, tokens ou senhas em produção

---

## 13. Deploy

O deploy é em **VPS com PM2 + Nginx**. Não é Vercel — o sistema de arquivos é persistente.

### next.config.js

```js
const nextConfig = {
  output: 'standalone',           // modo standalone para VPS
  api: {
    bodyParser: { sizeLimit: '6mb' }  // suporta upload de imagens até 5MB
  },
  images: {
    domains: ['ajuda.turbocloud.com.br'],
  },
}
module.exports = nextConfig
```

### Build e start

```bash
npm run build
pm2 start npm --name "turbocloud-ajuda" -- start
pm2 save
```

### Nginx — configuração completa

```nginx
server {
    listen 80;
    server_name ajuda.turbocloud.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name ajuda.turbocloud.com.br;

    ssl_certificate     /etc/letsencrypt/live/ajuda.turbocloud.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ajuda.turbocloud.com.br/privkey.pem;

    # Uploads servidos diretamente pelo Nginx (sem passar pelo Node.js)
    location /uploads/ {
        alias /var/www/turbocloud-ajuda/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        location ~* \.(php|sh|py|pl|cgi)$ { deny all; }
    }

    # Tudo o mais vai para o Next.js
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 14. Categorias de conteúdo

Estas são as 8 categorias fixas do sistema. Os slugs são definitivos e não devem ser alterados após o go-live (quebra URLs indexadas).

| # | Nome | Slug | Prioridade |
|---|---|---|---|
| 1 | Primeiros Passos | `primeiros-passos` | Alta |
| 2 | WordPress | `wordpress` | Alta |
| 3 | Domínios e DNS | `dominios-dns` | Alta |
| 4 | E-mail | `email` | Média |
| 5 | VPS e Projetos | `vps` | Alta |
| 6 | Segurança e Backup | `seguranca-backup` | Alta |
| 7 | Faturamento | `faturamento` | Média |
| 8 | Afiliados | `afiliados` | Baixa |

Seed inicial em `prisma/seed.ts` deve criar essas 8 categorias com `order` de 1 a 8 antes do primeiro deploy.

---

*Documento mantido pelo time TurboCloud. Atualizar este README sempre que houver mudança de stack, modelo de dados ou decisão de arquitetura.*
