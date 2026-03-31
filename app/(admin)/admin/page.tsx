import { prisma } from '@/lib/prisma'
import { StatCard } from '@/components/admin/StatCard'
import { ArticleRowMini } from '@/components/admin/ArticleRowMini'
import { ArticleStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [statusCounts, topArticles, feedbackAgg, recentArticles] = await Promise.all([
    // Count de artigos por status
    prisma.article.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),

    // Top 5 por views
    prisma.article.findMany({
      orderBy: { views: 'desc' },
      take: 5,
      include: { category: true, author: true },
    }),

    // Soma de helpful + notHelpful dos publicados
    prisma.article.aggregate({
      where: { status: ArticleStatus.PUBLISHED },
      _sum: { helpful: true, notHelpful: true },
    }),

    // 10 mais recentemente atualizados
    prisma.article.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { category: true, author: true },
    }),
  ])

  // Organiza contagens por status
  const countByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count._all])
  ) as Partial<Record<ArticleStatus, number>>

  const published = countByStatus[ArticleStatus.PUBLISHED] ?? 0
  const draft = countByStatus[ArticleStatus.DRAFT] ?? 0
  const review = countByStatus[ArticleStatus.REVIEW] ?? 0
  const archived = countByStatus[ArticleStatus.ARCHIVED] ?? 0

  // Percentual de avaliações positivas
  const totalHelpful = feedbackAgg._sum.helpful ?? 0
  const totalNotHelpful = feedbackAgg._sum.notHelpful ?? 0
  const totalFeedback = totalHelpful + totalNotHelpful
  const helpfulPercent =
    totalFeedback > 0 ? Math.round((totalHelpful / totalFeedback) * 100) : null

  // Maior valor de views (para barra de progresso relativa)
  const maxViews = topArticles[0]?.views ?? 1

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '4px',
            letterSpacing: '-0.3px',
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
          Visão geral da base de conhecimento
        </p>
      </div>

      {/* Cards de métricas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        <StatCard
          label="Publicados"
          value={published}
          description="Visíveis ao público"
        />
        <StatCard
          label="Rascunhos"
          value={draft}
          description="Em edição"
        />
        <StatCard
          label="Em revisão"
          value={review}
          description="Aguardando aprovação"
        />
        <StatCard
          label="Arquivados"
          value={archived}
          description="Fora do ar"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        {/* Top 5 mais vistos */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            Top 5 mais vistos
          </h2>
          {topArticles.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
              Nenhum artigo ainda
            </p>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topArticles.map((article, index) => {
                const barWidth = maxViews > 0 ? (article.views / maxViews) * 100 : 0
                return (
                  <li key={article.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '6px',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'var(--color-primary-dark)',
                            width: '18px',
                            flexShrink: 0,
                            paddingTop: '1px',
                          }}
                        >
                          {index + 1}.
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={article.title}
                        >
                          {article.title}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          flexShrink: 0,
                        }}
                      >
                        {article.views.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {/* Barra de progresso relativa */}
                    <div
                      style={{
                        height: '4px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${barWidth}%`,
                          backgroundColor: 'var(--color-primary)',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Avaliações */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            Avaliações
          </h2>
          {totalFeedback === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
              Nenhuma avaliação ainda
            </p>
          ) : (
            <div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: 'var(--color-primary-dark)',
                  lineHeight: 1,
                  marginBottom: '8px',
                  letterSpacing: '-2px',
                }}
              >
                {helpfulPercent}%
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                }}
              >
                dos leitores acharam os artigos úteis
              </div>
              {/* Barra útil vs não útil */}
              <div
                style={{
                  height: '8px',
                  backgroundColor: '#fecaca',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${helpfulPercent ?? 0}%`,
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                }}
              >
                <span>👍 {totalHelpful.toLocaleString('pt-BR')} úteis</span>
                <span>👎 {totalNotHelpful.toLocaleString('pt-BR')} não úteis</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Atualizados recentemente */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Atualizados recentemente
          </h2>
        </div>
        {recentArticles.length === 0 ? (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-tertiary)',
              textAlign: 'center',
              padding: '32px',
            }}
          >
            Nenhum artigo ainda
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {['Título', 'Categoria', 'Status', 'Views', 'Autor', 'Atualizado'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 16px',
                        textAlign: col === 'Views' ? 'right' : 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => (
                  <ArticleRowMini
                    key={article.id}
                    title={article.title}
                    categoryName={article.category.name}
                    status={article.status}
                    views={article.views}
                    updatedAt={article.updatedAt}
                    authorName={article.author.name}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
