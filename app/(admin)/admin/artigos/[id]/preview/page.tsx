import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import Breadcrumb from '@/components/public/Breadcrumb'
import { addHeadingIds } from '@/lib/htmlUtils'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Visualização de Rascunho | TurboCloud Admin'
}

interface Props {
  params: { id: string }
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export default async function ArticlePreviewPage({ params }: Props) {
  const session = await auth()
  
  if (!session) {
    return <div>Não autorizado</div>
  }

  const article = await prisma.article.findUnique({
    where: {
      id: params.id,
    },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  })

  if (!article) notFound()

  const readingTime = estimateReadingTime(article.content)

  const contentWithIds = addHeadingIds(article.content)

  return (
    <div className="page-wrapper">
      <div style={{ backgroundColor: 'var(--color-danger)', color: '#fff', textAlign: 'center', padding: '12px', fontWeight: 'bold', fontSize: '14px', position: 'sticky', top: 0, zIndex: 9999 }}>
        ⚠️ MODO DE VISUALIZAÇÃO RESTRITA: VOCÊ ESTÁ VISUALIZANDO UM CONTEÚDO QUE PODE AINDA NÃO ESTAR PUBLICADO.
      </div>
      
      <Header />

      <main className="page-content">
        <div className="container">
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              {
                label: article.category.name,
                href: `/ajuda/${article.category.slug}`,
              },
              { label: article.title },
            ]}
          />

          <div className="article-layout">
            <div className="article-layout__main">
              <div className="article-header">
                <h1 className="article-header__title">{article.title}</h1>

                <div className="article-meta">
                  <span className="article-meta__item">
                    Por {article.author.name}
                  </span>
                  {article.updatedAt && (
                    <time
                      className="article-meta__item"
                    >
                      Última edição: {article.updatedAt.toLocaleDateString('pt-BR')}
                    </time>
                  )}
                  <span className="article-meta__item">
                    {readingTime} min de leitura
                  </span>
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                    Status Atual: {article.status}
                  </span>
                </div>
              </div>

              <div
                className="article-body article-content"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
