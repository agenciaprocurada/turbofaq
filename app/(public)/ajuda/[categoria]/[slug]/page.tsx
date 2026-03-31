import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import Breadcrumb from '@/components/public/Breadcrumb'
import ArticleCard from '@/components/public/ArticleCard'
import JsonLd from '@/components/public/JsonLd'
import ViewsTracker from '@/components/public/ViewsTracker'
import FeedbackWidget from '@/components/public/FeedbackWidget'
import TableOfContents from '@/components/public/TableOfContents'
import { buildArticleMetadata } from '@/lib/seo'
import { articleSchema, breadcrumbSchema } from '@/lib/schema'
import { addHeadingIds } from '@/lib/htmlUtils'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajuda.turbocloud.com.br'

interface Props {
  params: { categoria: string; slug: string }
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
      category: { slug: params.categoria },
    },
    include: { category: true },
  })

  if (!article) {
    return { title: 'Artigo não encontrado | TurboCloud Ajuda' }
  }

  return buildArticleMetadata(article, article.category)
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findFirst({
    where: {
      slug: params.slug,
      status: 'PUBLISHED',
      category: { slug: params.categoria },
    },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  })

  if (!article) notFound()

  const readingTime = estimateReadingTime(article.content)

  // Processa o HTML no servidor: adiciona ids nos headings para os
  // links do TableOfContents funcionarem como âncoras (#heading-id)
  const contentWithIds = addHeadingIds(article.content)

  const relatedArticles = await prisma.article.findMany({
    where: {
      categoryId: article.categoryId,
      status: 'PUBLISHED',
      id: { not: article.id },
    },
    orderBy: { views: 'desc' },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      category: { select: { slug: true, name: true } },
    },
  })

  const breadcrumbItems = [
    { label: 'Início', href: SITE_URL },
    { label: 'Ajuda', href: `${SITE_URL}/ajuda` },
    { label: article.category.name, href: `${SITE_URL}/ajuda/${params.categoria}` },
    { label: article.title, href: `${SITE_URL}/ajuda/${params.categoria}/${params.slug}` },
  ]

  return (
    <div className="page-wrapper">
      <JsonLd data={articleSchema(article, article.category, SITE_URL)} />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />

      {/* Registra view no cliente sem bloquear SSR */}
      <ViewsTracker articleId={article.id} />

      <Header />

      <main className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              {
                label: article.category.name,
                href: `/ajuda/${params.categoria}`,
              },
              { label: article.title },
            ]}
          />

          {/* Layout de duas colunas no desktop: conteúdo + TOC lateral */}
          <div className="article-layout">
            <div className="article-layout__main">
              <div className="article-header">
                <h1 className="article-header__title">{article.title}</h1>

                <div className="article-meta">
                  <span className="article-meta__item">
                    Por {article.author.name}
                  </span>
                  {article.publishedAt && (
                    <time
                      className="article-meta__item"
                      dateTime={article.publishedAt.toISOString()}
                    >
                      {article.publishedAt.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  )}
                  <span className="article-meta__item">
                    {readingTime} min de leitura
                  </span>
                </div>
              </div>

              <div
                className="article-body article-content"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              <FeedbackWidget articleId={article.id} />

              {relatedArticles.length > 0 && (
                <div className="related-articles">
                  <h2 className="related-articles__title">Artigos relacionados</h2>
                  <div className="grid-articles">
                    {relatedArticles.map((related) => (
                      <ArticleCard
                        key={related.id}
                        title={related.title}
                        slug={related.slug}
                        categorySlug={related.category.slug}
                        categoryName={related.category.name}
                        excerpt={related.excerpt}
                        publishedAt={related.publishedAt}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* TOC lateral — renderiza só se houver 3+ h2 (lógica interna ao componente) */}
            <aside className="article-layout__toc">
              <TableOfContents content={contentWithIds} />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
