/**
 * Funções que retornam objetos JSON-LD prontos para inserção via
 * <script type="application/ld+json">. Módulo puro — sem side-effects.
 */

interface ArticleInput {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  content: string
  publishedAt?: Date | null
  updatedAt: Date
  author: { name: string }
}

interface CategoryInput {
  name: string
  slug: string
  description?: string | null
}

interface ArticleListItem {
  title: string
  slug: string
  excerpt?: string | null
}

interface BreadcrumbItem {
  label: string
  href?: string
}

export function articleSchema(
  article: ArticleInput,
  category: CategoryInput,
  siteUrl: string,
) {
  const url = `${siteUrl}/ajuda/${category.slug}/${article.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? undefined,
    url,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author.name,
    },
    publisher: organizationSchema(siteUrl),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  }
}

export function categorySchema(
  category: CategoryInput,
  articles: ArticleListItem[],
  siteUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category.name,
    description: category.description ?? undefined,
    url: `${siteUrl}/ajuda/${category.slug}`,
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: article.title,
      description: article.excerpt ?? undefined,
      url: `${siteUrl}/ajuda/${category.slug}/${article.slug}`,
    })),
  }
}

export function organizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TurboCloud',
    url: 'https://turbocloud.com.br',
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
    },
    sameAs: ['https://turbocloud.com.br'],
  }
}

export function siteLinksSearchBoxSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/ajuda/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
