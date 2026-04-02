import type { Metadata } from 'next'
import { getHighlights, getPublishedArticlesForSelect } from './actions'
import { HighlightsClient } from '@/components/admin/HighlightsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Destaques | TurboCloud Admin',
}

export default async function DestaquesPage() {
  const [highlights, articles] = await Promise.all([
    getHighlights(),
    getPublishedArticlesForSelect(),
  ])

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          Destaques
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
          {highlights.length} destaque{highlights.length !== 1 ? 's' : ''} · Aparecem na seção "Mais pesquisados" da página inicial
        </p>
      </div>

      <HighlightsClient highlights={highlights} articles={articles} />
    </div>
  )
}
