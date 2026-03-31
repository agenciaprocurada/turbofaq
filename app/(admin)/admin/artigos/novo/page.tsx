import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ArticleForm } from '@/components/admin/ArticleForm'

export const dynamic = 'force-dynamic'

export default async function NovoArtigoPage() {
  const session = await auth()

  if (!session || session.user.role === 'VIEWER') {
    redirect('/admin/artigos')
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          Novo artigo
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
          Preencha os campos abaixo e salve como rascunho ou envie para revisão.
        </p>
      </div>

      <ArticleForm
        categories={categories}
        userRole={session.user.role}
        authorId={session.user.id}
      />
    </div>
  )
}
