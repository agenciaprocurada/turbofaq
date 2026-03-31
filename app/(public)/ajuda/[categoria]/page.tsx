import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import Breadcrumb from '@/components/public/Breadcrumb'
import ArticleCard from '@/components/public/ArticleCard'
import JsonLd from '@/components/public/JsonLd'
import { buildCategoryMetadata } from '@/lib/seo'
import { categorySchema, breadcrumbSchema } from '@/lib/schema'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajuda.turbocloud.com.br'
const ARTICLES_PER_PAGE = 20

interface Props {
  params: { categoria: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.categoria },
  })

  if (!category) {
    return { title: 'Categoria não encontrada | TurboCloud Ajuda' }
  }

  return buildCategoryMetadata(category)
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.categoria, active: true },
  })

  if (!category) notFound()

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const skip = (page - 1) * ARTICLES_PER_PAGE

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { categoryId: category.id, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: ARTICLES_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    }),
    prisma.article.count({
      where: { categoryId: category.id, status: 'PUBLISHED' },
    }),
  ])

  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE)

  const breadcrumbItems = [
    { label: 'Início', href: SITE_URL },
    { label: 'Ajuda', href: `${SITE_URL}/ajuda` },
    { label: category.name, href: `${SITE_URL}/ajuda/${category.slug}` },
  ]

  return (
    <div className="page-wrapper">
      <JsonLd data={categorySchema(category, articles, SITE_URL)} />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      <Header />

      <main className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              { label: category.name },
            ]}
          />

          <div className="category-header">
            {category.icon && (
              <div className="category-header__icon">{category.icon}</div>
            )}
            <h1 className="category-header__title">{category.name}</h1>
            {category.description && (
              <p className="category-header__description">
                {category.description}
              </p>
            )}
            <p className="category-header__count">
              {total} {total === 1 ? 'artigo publicado' : 'artigos publicados'}
            </p>
          </div>

          {articles.length === 0 ? (
            <p
              style={{
                color: 'var(--text-secondary)',
                textAlign: 'center',
                padding: '48px 0',
              }}
            >
              Nenhum artigo publicado nesta categoria ainda.
            </p>
          ) : (
            <div className="articles-list">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  categorySlug={params.categoria}
                  categoryName={category.name}
                  excerpt={article.excerpt}
                  publishedAt={article.publishedAt}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Paginação">
              {page > 1 ? (
                <a
                  href={`/ajuda/${params.categoria}?page=${page - 1}`}
                  className="pagination__link"
                >
                  ← Anterior
                </a>
              ) : (
                <span className="pagination__link pagination__link--disabled">
                  ← Anterior
                </span>
              )}

              <span className="pagination__info">
                Página {page} de {totalPages}
              </span>

              {page < totalPages ? (
                <a
                  href={`/ajuda/${params.categoria}?page=${page + 1}`}
                  className="pagination__link"
                >
                  Próxima →
                </a>
              ) : (
                <span className="pagination__link pagination__link--disabled">
                  Próxima →
                </span>
              )}
            </nav>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
