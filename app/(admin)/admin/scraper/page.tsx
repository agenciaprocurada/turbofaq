import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ScraperPanel from '@/components/admin/ScraperPanel'

export const metadata = {
  title: 'Importador (Scraper) - TurboCloud Admin',
}

export default async function ScraperPage() {
  const session = await auth()
  
  if (!session || session.user.role === 'VIEWER') {
    redirect('/admin')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 className="admin-page-title">Importador de Artigos Rápido</h1>
      </div>

      <ScraperPanel categories={categories} />
    </div>
  )
}
