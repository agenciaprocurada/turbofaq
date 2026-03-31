import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajuda.turbocloud.com.br'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      select: { slug: true },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    }),
  ])

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/ajuda/${cat.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly',
  }))

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/ajuda/${article.category.slug}/${article.slug}`,
    lastModified: article.updatedAt,
    priority: 0.7,
    changeFrequency: 'monthly',
  }))

  return [
    {
      url: `${SITE_URL}/ajuda`,
      priority: 1.0,
      changeFrequency: 'weekly',
    },
    ...categoryEntries,
    ...articleEntries,
  ]
}
