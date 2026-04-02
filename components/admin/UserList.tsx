'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveUser } from '@/app/(admin)/admin/usuarios/actions'
import type { UserRole } from '@prisma/client'
import { PasswordInput } from '@/components/admin/PasswordInput'

type UserItem = {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: Date
  _count: { articles: number }
}

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  EDITOR: 'Editor',
  WRITER: 'Redator',
  VIEWER: 'Visualizador'
}

export function UserList({ initialUsers, currentUserId }: { initialUsers: UserItem[], currentUserId: string }) {
  const router = useRouter()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Partial<UserItem> & { password?: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openModal = (user?: UserItem) => {
    setError('')
    if (user) {
      setEditingUser({ ...user, password: '' })
    } else {
      setEditingUser({ name: '', email: '', role: 'WRITER', active: true, password: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setSaving(true)
    setError('')

    try {
      await saveUser({
        id: editingUser.id,
        name: editingUser.name!,
        email: editingUser.email!,
        role: editingUser.role as UserRole,
        active: editingUser.active ?? true,
        password: editingUser.password || undefined // Só envia a senha se preenchido
      })
      closeModal()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar o usuário.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="btn-primary" onClick={() => openModal()}>
          + Novo Usuário
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {['Nome', 'E-mail', 'Perfil', 'Status', 'Artigos', 'Data', ''].map((col, i) => (
                  <th key={i} style={{ padding: '12px 16px', textAlign: col === 'Artigos' ? 'right' : 'left', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid var(--color-border)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialUsers.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: index < initialUsers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name} {user.id === currentUserId && <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-primary-dark)', backgroundColor: 'var(--color-primary-light)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>VOCÊ</span>}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px' }}>
                      {roleLabel[user.role]}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {user.active ? (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>Ativo</span>
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#991b1b', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '6px' }}>Inativo</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>{user._count.articles}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openModal(user)}
                      style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {editingUser?.id ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '18px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Nome Completo</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingUser?.name || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>E-mail</label>
                <input
                  type="email"
                  className="form-input"
                  value={editingUser?.email || ''}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Perfil de Acesso</label>
                <select
                  className="form-input"
                  value={editingUser?.role || 'WRITER'}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value as UserRole } : null)}
                  required
                >
                  <option value="VIEWER">Visualizador (Leitura)</option>
                  <option value="WRITER">Redator (Cria rascunhos)</option>
                  <option value="EDITOR">Editor (Publica artigos)</option>
                  <option value="SUPER_ADMIN">Super Admin (Acesso total)</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  {editingUser?.id ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha de Acesso'}
                </label>
                <PasswordInput
                  value={editingUser?.password || ''}
                  onChange={(v) => setEditingUser(prev => prev ? { ...prev, password: v } : null)}
                  required={!editingUser?.id}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  visiblePlaceholder={editingUser?.id ? '(campo vazio = senha não alterada)' : ''}
                />
              </div>

              {editingUser?.id && editingUser.id !== currentUserId && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={editingUser?.active}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, active: e.target.checked } : null)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Acesso Ativo
                  </label>
                </div>
              )}

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', color: '#dc2626', fontSize: '14px', marginBottom: '20px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ flex: 1, opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
