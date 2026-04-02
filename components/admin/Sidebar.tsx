'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

interface SidebarProps {
  userName: string
  userRole: UserRole
  isSuperAdmin: boolean
}

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  EDITOR: 'Editor',
  WRITER: 'Redator',
  VIEWER: 'Visualizador',
}

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/artigos', label: 'Artigos', icon: '✎' },
  { href: '/admin/categorias', label: 'Categorias', icon: '⊞' },
  { href: '/admin/midias', label: 'Mídias', icon: '🖼️' },
  { href: '/admin/destaques', label: 'Destaques', icon: '⭐' },
  { href: '/admin/scraper', label: 'Importador', icon: '⚡' },
]

const superAdminLinks = [
  { href: '/admin/usuarios', label: 'Usuários', icon: '◉' },
]

export function Sidebar({ userName, userRole, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const allLinks = isSuperAdmin ? [...navLinks, ...superAdminLinks] : navLinks

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await signOut({ callbackUrl: '/admin/login' })
  }

  const sidebarContent = (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 800, lineHeight: 1 }}>
              T
            </span>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>TurboCloud</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>
              Admin
            </div>
          </div>
        </Link>
      </div>

      {/* Links de navegação */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {allLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive(link.href) ? 600 : 400,
                  color: isActive(link.href) ? '#fff' : 'rgba(255,255,255,0.65)',
                  backgroundColor: isActive(link.href) ? 'rgba(0,208,132,0.2)' : 'transparent',
                  borderLeft: isActive(link.href)
                    ? '3px solid var(--color-primary)'
                    : '3px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '16px', lineHeight: 1, opacity: 0.9 }}>{link.icon}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Rodapé: usuário + logout */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-primary)',
              marginTop: '2px',
              fontWeight: 500,
            }}
          >
            {roleLabel[userRole]}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
          }}
        >
          <span>⎋</span> Sair
        </button>
      </div>
    </nav>
  )

  return (
    <>
      {/* Sidebar fixa — desktop */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '260px',
          height: '100vh',
          backgroundColor: '#1a2332',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        className="admin-sidebar-desktop"
      >
        {sidebarContent}
      </aside>

      {/* Botão hamburguer — mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 60,
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: '#1a2332',
          border: 'none',
          color: '#fff',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="admin-sidebar-hamburger"
      >
        ☰
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 55,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '260px',
              height: '100vh',
              backgroundColor: '#1a2332',
              zIndex: 60,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              ✕
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* CSS responsivo */}
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-sidebar-hamburger { display: flex !important; }
          #admin-content { margin-left: 0 !important; padding: 24px 16px !important; }
        }
      `}</style>
    </>
  )
}
