import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajuda.turbocloud.com.br'
const SITE_NAME = 'TurboCloud Ajuda'
const SITE_DESCRIPTION =
  'Base de conhecimento da TurboCloud — hospedagem WordPress de alta performance e VPS.'

interface ArticleSeoInput {
  title: string
  slug: string
  excerpt?: string | null
  metaTitle?: string | null
  metaDesc?: string | null
}

interface CategorySeoInput {
  name: string
  slug: string
  description?: string | null
}

export function buildArticleMetadata(
  article: ArticleSeoInput,
  category: CategorySeoInput,
): Metadata {
  const title = `${article.metaTitle ?? article.title} | ${SITE_NAME}`
  const description = article.metaDesc ?? article.excerpt ?? undefined
  const canonical = `${SITE_URL}/ajuda/${category.slug}/${article.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'article',
    },
    robots: { index: true, follow: true },
  }
}

export function buildCategoryMetadata(category: CategorySeoInput): Metadata {
  const title = `${category.name} | ${SITE_NAME}`
  const description =
    category.description ?? `Artigos e tutoriais sobre ${category.name} na TurboCloud.`
  const canonical = `${SITE_URL}/ajuda/${category.slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export function buildHubMetadata(): Metadata {
  const title = `Central de Ajuda | ${SITE_NAME}`
  const description =
    'Encontre tutoriais, documentações e respostas para as dúvidas mais frequentes sobre hospedagem WordPress e VPS na TurboCloud.'
  const canonical = `${SITE_URL}/ajuda`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}
