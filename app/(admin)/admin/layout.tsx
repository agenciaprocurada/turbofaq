import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // A página de login está dentro deste layout — renderiza sem verificação de sessão
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Segunda camada de segurança além do middleware
  const session = await auth()
  if (!session) {
    redirect('/admin/login')
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        userName={session.user.name}
        userRole={session.user.role}
        isSuperAdmin={isSuperAdmin}
      />
      {/* Área de conteúdo — margem compensa a sidebar fixa de 260px */}
      <main
        style={{
          flex: 1,
          marginLeft: '260px',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          padding: '32px',
        }}
        id="admin-content"
      >
        {children}
      </main>
    </div>
  )
}
