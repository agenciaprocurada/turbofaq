import Link from 'next/link'
import Image from 'next/image'

interface Highlight {
  id: string
  imageUrl: string
  article: {
    title: string
    slug: string
    category: { slug: string }
  }
}

interface Props {
  highlights: Highlight[]
}

export function HighlightsBanner({ highlights }: Props) {
  if (highlights.length === 0) return null

  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        Mais pesquisados
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(highlights.length, 3)}, 1fr)`,
        gap: '16px',
      }}
        className="highlights-grid"
      >
        {highlights.map((h) => (
          <Link
            key={h.id}
            href={`/ajuda/${h.article.category.slug}/${h.article.slug}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              aspectRatio: '16/9',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              className="highlight-card"
            >
              <Image
                src={h.imageUrl}
                alt={h.article.title}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              {/* Gradiente + título */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                padding: '32px 16px 16px',
              }}>
                <p style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '15px',
                  lineHeight: 1.3,
                  margin: 0,
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}>
                  {h.article.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .highlights-grid {
          grid-template-columns: repeat(${Math.min(3, 3)}, 1fr);
        }
        .highlight-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.18) !important;
        }
        @media (max-width: 768px) {
          .highlights-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .highlights-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  )
}
