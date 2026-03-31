import type { ArticleStatus } from '@prisma/client'

interface ArticleRowMiniProps {
  title: string
  categoryName: string
  status: ArticleStatus
  views: number
  updatedAt: Date
  authorName: string
}

const statusConfig: Record<ArticleStatus, { label: string; bg: string; color: string }> = {
  PUBLISHED: { label: 'Publicado', bg: '#e8f9f3', color: '#00a86b' },
  DRAFT: { label: 'Rascunho', bg: '#fef3c7', color: '#92400e' },
  REVIEW: { label: 'Em revisão', bg: '#dbeafe', color: '#1e40af' },
  ARCHIVED: { label: 'Arquivado', bg: '#f5f5f7', color: '#666666' },
}

export function ArticleRowMini({
  title,
  categoryName,
  status,
  views,
  updatedAt,
  authorName,
}: ArticleRowMiniProps) {
  const { label, bg, color } = statusConfig[status]

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(updatedAt))

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color 0.1s ease',
      }}
    >
      {/* Título */}
      <td
        style={{
          padding: '12px 16px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          fontWeight: 500,
          maxWidth: '280px',
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={title}
        >
          {title}
        </div>
      </td>

      {/* Categoria */}
      <td
        style={{
          padding: '12px 16px',
          fontSize: '13px',
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
        }}
      >
        {categoryName}
      </td>

      {/* Status badge */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            lineHeight: 1.4,
            backgroundColor: bg,
            color,
          }}
        >
          {label}
        </span>
      </td>

      {/* Views */}
      <td
        style={{
          padding: '12px 16px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textAlign: 'right',
          whiteSpace: 'nowrap',
        }}
      >
        {views.toLocaleString('pt-BR')}
      </td>

      {/* Autor */}
      <td
        style={{
          padding: '12px 16px',
          fontSize: '13px',
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
        }}
      >
        {authorName}
      </td>

      {/* Atualizado em */}
      <td
        style={{
          padding: '12px 16px',
          fontSize: '13px',
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
        }}
      >
        {formattedDate}
      </td>
    </tr>
  )
}
