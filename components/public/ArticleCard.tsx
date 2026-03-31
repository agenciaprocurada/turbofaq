import Link from 'next/link'

interface Props {
  title: string
  slug: string
  categorySlug: string
  categoryName: string
  excerpt?: string | null
  publishedAt?: Date | null
}

export default function ArticleCard({
  title,
  slug,
  categorySlug,
  categoryName,
  excerpt,
  publishedAt,
}: Props) {
  return (
    <Link href={`/ajuda/${categorySlug}/${slug}`} className="article-card">
      <div className="article-card__category">{categoryName}</div>
      <div className="article-card__title">{title}</div>
      {excerpt && <div className="article-card__excerpt">{excerpt}</div>}
      {publishedAt && (
        <time
          className="article-card__date"
          dateTime={publishedAt.toISOString()}
        >
          {publishedAt.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </time>
      )}
    </Link>
  )
}
