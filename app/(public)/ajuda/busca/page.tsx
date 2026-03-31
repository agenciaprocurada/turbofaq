import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import Breadcrumb from '@/components/public/Breadcrumb'
import SearchBar from '@/components/public/SearchBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Busca | TurboCloud Ajuda',
  robots: { index: false, follow: false },
}

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  categoryId: string
}

interface Props {
  searchParams: { q?: string }
}

const MAIN_CATEGORIES = [
  { name: 'Primeiros Passos', slug: 'primeiros-passos' },
  { name: 'WordPress', slug: 'wordpress' },
  { name: 'Domínios e DNS', slug: 'dominios-dns' },
  { name: 'VPS e Projetos', slug: 'vps' },
  { name: 'Segurança e Backup', slug: 'seguranca-backup' },
  { name: 'E-mail', slug: 'email' },
]

export default async function BuscaPage({ searchParams }: Props) {
  const query = (searchParams.q ?? '').trim()

  let results: SearchResult[] = []

  if (query.length >= 2) {
    results = await prisma.$queryRaw<SearchResult[]>`
      SELECT id, title, slug, excerpt, "categoryId"
      FROM articles
      WHERE status = 'PUBLISHED'
      AND to_tsvector('portuguese', title || ' ' || content)
          @@ plainto_tsquery('portuguese', ${query})
      ORDER BY ts_rank(to_tsvector('portuguese', title || ' ' || content),
                       plainto_tsquery('portuguese', ${query})) DESC
      LIMIT 20
    `
  }

  const categoryIds = [...new Set(results.map((r) => r.categoryId))]
  const categories =
    categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, slug: true, name: true },
        })
      : []

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="page-wrapper">
      <Header />

      <main className="page-content">
        <div className="container" style={{ maxWidth: '800px' }}>
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              { label: 'Busca' },
            ]}
          />

          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            {query ? `Resultados para "${query}"` : 'Buscar artigos'}
          </h1>

          <div style={{ marginBottom: '32px' }}>
            <SearchBar defaultValue={query} />
          </div>

          {query.length > 0 && query.length < 2 && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Digite pelo menos 2 caracteres para buscar.
            </p>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div className="search-empty">
              <p className="search-empty__title">
                Nenhum resultado para &ldquo;{query}&rdquo;
              </p>
              <p className="search-empty__text">
                Tente outras palavras-chave ou navegue pelas categorias abaixo.
              </p>
              <div className="search-empty__categories">
                {MAIN_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/ajuda/${cat.slug}`}
                    className="btn-secondary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="search-results-count">
                {results.length} resultado
                {results.length !== 1 ? 's' : ''} encontrado
                {results.length !== 1 ? 's' : ''}
              </p>
              <div className="articles-list">
                {results.map((result) => {
                  const category = categoryMap.get(result.categoryId)
                  return (
                    <Link
                      key={result.id}
                      href={
                        category
                          ? `/ajuda/${category.slug}/${result.slug}`
                          : '#'
                      }
                      className="article-card"
                    >
                      {category && (
                        <div className="article-card__category">
                          {category.name}
                        </div>
                      )}
                      <div className="article-card__title">{result.title}</div>
                      {result.excerpt && (
                        <div className="article-card__excerpt">
                          {result.excerpt}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          {!query && (
            <div>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  fontSize: '15px',
                }}
              >
                Use a busca acima para encontrar artigos, tutoriais e
                documentações. Ou navegue pelas categorias:
              </p>
              <div className="search-empty__categories">
                {MAIN_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/ajuda/${cat.slug}`}
                    className="btn-secondary"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
