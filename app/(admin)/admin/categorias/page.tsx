import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CategoryList } from '@/components/admin/CategoryList'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  // Apenas SUPER_ADMIN e EDITOR podem gerenciar categorias (conforme README seção 7)
  const canManage = ['SUPER_ADMIN', 'EDITOR'].includes(session.user.role)

  if (!canManage) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Sem permissão</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Apenas Editores e Administradores podem gerenciar categorias.
        </p>
      </div>
    )
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { articles: true } }
    }
  })

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          Categorias
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
          Arraste para reordenar. A ordem definida aqui reflete na página inicial de Ajuda.
        </p>
      </div>

      <CategoryList initialCategories={categories} />
    </div>
  )
}
