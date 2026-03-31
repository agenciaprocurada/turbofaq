import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajuda.turbocloud.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/ajuda/busca'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
