import type { Metadata } from 'next'
import { fetchAllMedia } from './actions'
import { MediaGalleryClient } from '@/components/admin/MediaGalleryClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mídias | TurboCloud Admin',
}

export default async function MidiasPage() {
  const medias = await fetchAllMedia()

  const totalSize = medias.reduce((acc, m) => acc + m.size, 0)
  const totalSizeFormatted =
    totalSize > 1024 * 1024
      ? `${(totalSize / 1024 / 1024).toFixed(1)} MB`
      : `${(totalSize / 1024).toFixed(1)} KB`

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            Mídias
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
            {medias.length} arquivo{medias.length !== 1 ? 's' : ''} · {totalSizeFormatted} no total
          </p>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 14px' }}>
          📁 /uploads/images/
        </div>
      </div>

      {/* Galeria */}
      <MediaGalleryClient medias={medias} />
    </div>
  )
}
