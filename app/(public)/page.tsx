import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CategoryCard from '@/components/public/CategoryCard'
import ArticleCard from '@/components/public/ArticleCard'
import SearchBar from '@/components/public/SearchBar'
import JsonLd from '@/components/public/JsonLd'
import { buildHubMetadata } from '@/lib/seo'
import { siteLinksSearchBoxSchema } from '@/lib/schema'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajuda.turbocloud.com.br'

export async function generateMetadata(): Promise<Metadata> {
  return buildHubMetadata()
}

export default async function HubPage() {
  const [categories, featuredArticles] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      take: 8,
      include: {
        _count: {
          select: {
            articles: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', featured: true },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        category: { select: { slug: true, name: true } },
      },
    }),
  ])

  return (
    <div className="page-wrapper">
      <JsonLd data={siteLinksSearchBoxSchema(SITE_URL)} />
      <Header />

      <section className="hub-hero">
        <div className="container">
          <h1 className="hub-hero__title">Como podemos ajudar?</h1>
          <p className="hub-hero__subtitle">
            Tutoriais, documentações e respostas para suas dúvidas sobre
            hospedagem WordPress e VPS.
          </p>
          <div className="hub-hero__search">
            <SearchBar />
          </div>
        </div>
      </section>

      <main className="page-content">
        <div className="container">
          <section>
            <h2 className="section-title">Categorias</h2>
            {categories.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                Nenhuma categoria disponível ainda.
              </p>
            ) : (
              <div className="grid-categories">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    name={category.name}
                    slug={category.slug}
                    icon={category.icon}
                    description={category.description}
                    articleCount={category._count.articles}
                  />
                ))}
              </div>
            )}
          </section>

          {featuredArticles.length > 0 && (
            <section style={{ marginTop: '56px' }}>
              <h2 className="section-title">Artigos em destaque</h2>
              <div className="grid-articles">
                {featuredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    title={article.title}
                    slug={article.slug}
                    categorySlug={article.category.slug}
                    categoryName={article.category.name}
                    excerpt={article.excerpt}
                    publishedAt={article.publishedAt}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
