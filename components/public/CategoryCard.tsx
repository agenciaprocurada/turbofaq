import Link from 'next/link'

interface Props {
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  articleCount: number
}

export default function CategoryCard({
  name,
  slug,
  icon,
  description,
  articleCount,
}: Props) {
  return (
    <Link href={`/ajuda/${slug}`} className="category-card">
      {icon && <div className="category-card__icon">{icon}</div>}
      <div className="category-card__name">{name}</div>
      {description && (
        <div className="category-card__description">{description}</div>
      )}
      <div className="category-card__count">
        {articleCount} {articleCount === 1 ? 'artigo' : 'artigos'}
      </div>
    </Link>
  )
}
