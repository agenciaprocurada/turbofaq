import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UserList } from '@/components/admin/UserList'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  // Apenas SUPER_ADMIN pode gerenciar usuários
  if (session.user.role !== 'SUPER_ADMIN') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Sem permissão</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Apenas Administradores têm acesso a esta página.
        </p>
      </div>
    )
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      _count: { select: { articles: true } }
    }
  })

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          Usuários
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0 }}>
          Gerenciamento de acessos ao Painel Administrativo.
        </p>
      </div>

      <UserList initialUsers={users} currentUserId={session.user.id} />
    </div>
  )
}
