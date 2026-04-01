import Link from 'next/link'

interface Props {
  name: string
  slug: string
  icon?: string | null
  description?: string | null
  articleCount: number
}

/** Ícone SVG padrão caso nenhum emoji/icon seja informado */
function DefaultIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

/** Detecta se a string é um emoji (caractere não-ASCII simples) */
function isEmoji(str: string) {
  return /\p{Emoji}/u.test(str) && str.length <= 4
}

export default function CategoryCard({
  name,
  slug,
  icon,
  description,
  articleCount,
}: Props) {
  const showEmoji = icon && isEmoji(icon)

  return (
    <Link href={`/ajuda/${slug}`} className="category-card">
      <div className="category-card__icon">
        {showEmoji ? icon : <DefaultIcon />}
      </div>
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
