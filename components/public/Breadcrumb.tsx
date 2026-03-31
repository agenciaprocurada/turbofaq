import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="breadcrumb__item">
            {index > 0 && <span className="breadcrumb__separator">/</span>}
            {isLast || !item.href ? (
              <span className="breadcrumb__current">{item.label}</span>
            ) : (
              <Link href={item.href} className="breadcrumb__link">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
