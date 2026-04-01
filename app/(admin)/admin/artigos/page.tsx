import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import type { ArticleStatus } from '@prisma/client'
import { ArticleListClient } from '@/components/admin/ArticleListClient'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Rascunho',
  REVIEW: 'Em revisão',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
}

const STATUS_STYLES: Record<ArticleStatus, { bg: string; color: string }> = {
  PUBLISHED: { bg: '#e8f9f3', color: '#00a86b' },
  DRAFT:     { bg: '#fef3c7', color: '#92400e' },
  REVIEW:    { bg: '#dbeafe', color: '#1e40af' },
  ARCHIVED:  { bg: '#f5f5f7', color: '#666666' },
}

const PAGE_SIZE = 20

interface Props {
  searchParams: {
    status?: string
    categoria?: string
    page?: string
    q?: string
  }
}

export default async function ArtigosPage({ searchParams }: Props) {
  const session = await auth()
  const isWriter = session?.user.role === 'WRITER'

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const skip = (page - 1) * PAGE_SIZE

  const statusFilter = searchParams.status as ArticleStatus | undefined
  const categoriaFilter = searchParams.categoria
  const q = (searchParams.q ?? '').trim()

  const where: Parameters<typeof prisma.article.findMany>[0]['where'] = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(categoriaFilter ? { category: { slug: categoriaFilter } } : {}),
    ...(isWriter ? { authorId: session!.user.id } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [articles, total, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({ orderBy: { order: 'asc' }, select: { name: true, slug: true } }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams()
    const merged = { status: statusFilter, categoria: categoriaFilter, q: q || undefined, page: '1', ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v) })
    return `/admin/artigos?${sp.toString()}`
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            Artigos
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
            {total} artigo{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        {session?.user.role !== 'VIEWER' && (
          <Link
            href="/admin/artigos/novo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: 'var(--color-primary)', color: '#fff',
              padding: '10px 18px', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s',
            }}
          >
            + Novo artigo
          </Link>
        )}
      </div>

      {/* Filtros */}
      <form method="get" action="/admin/artigos" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por título…"
          style={{
            flex: '1 1 200px', padding: '8px 12px', border: '1px solid var(--color-border)',
            borderRadius: '6px', fontSize: '13px', backgroundColor: 'var(--bg-card)',
          }}
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ''}
          style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', backgroundColor: 'var(--bg-card)' }}
        >
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as ArticleStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          name="categoria"
          defaultValue={categoriaFilter ?? ''}
          style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', backgroundColor: 'var(--bg-card)' }}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: '#fff',
            border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Filtrar
        </button>
        {(statusFilter || categoriaFilter || q) && (
          <Link href="/admin/artigos" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            ✕ Limpar
          </Link>
        )}
      </form>

      {/* Tabela Interativa de Artigos */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <ArticleListClient articles={articles} />
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
          {page > 1 && (
            <Link href={buildUrl({ page: String(page - 1) })} style={{ padding: '7px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)' }}>
              ← Anterior
            </Link>
          )}
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl({ page: String(page + 1) })} style={{ padding: '7px 14px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', textDecoration: 'none', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)' }}>
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
