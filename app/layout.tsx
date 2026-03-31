import type { Metadata } from 'next'
import './globals.css'
import JsonLd from '@/components/public/JsonLd'
import { organizationSchema, siteLinksSearchBoxSchema } from '@/lib/schema'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ajuda.turbocloud.com.br'

export const metadata: Metadata = {
  title: 'TurboCloud Ajuda',
  description: 'Base de conhecimento da TurboCloud — hospedagem WordPress de alta performance e VPS.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <JsonLd data={organizationSchema(SITE_URL)} />
        <JsonLd data={siteLinksSearchBoxSchema(SITE_URL)} />
        {children}
      </body>
    </html>
  )
}
