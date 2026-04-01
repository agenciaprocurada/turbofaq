'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ArticleStatus } from '@prisma/client'
import { deleteArticles } from '@/app/(admin)/admin/artigos/actions'

const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Rascunho',
  REVIEW: 'Em revisão',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
}

const STATUS_STYLES: Record<ArticleStatus, { bg: string; color: string }> = {
  PUBLISHED: { bg: '#e8f9f3', color: '#00a86b' },
  DRAFT:     { bg: '#fef3c7', color: '#92400e' },
  REVIEW:    { bg: '#dbeafe', color: '#1e40af' },
  ARCHIVED:  { bg: '#f5f5f7', color: '#666666' },
}

interface ArticleClientProps {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: ArticleStatus
  views: number
  updatedAt: Date
  category: { name: string; slug: string }
  author: { name: string | null }
}

export function ArticleListClient({ articles }: { articles: ArticleClientProps[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(articles.map(a => a.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Tem certeza que deseja DELETAR ${selectedIds.length} artigos permanentemente?`)) return
    
    setIsDeleting(true)
    try {
      await deleteArticles(selectedIds)
      setSelectedIds([])
      router.refresh()
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (articles.length === 0) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Nenhum artigo encontrado</p>
        <p>Ajuste os filtros ou crie um novo artigo.</p>
      </div>
    )
  }

  return (
    <div>
      {selectedIds.length > 0 && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 75, 75, 0.05)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)' }}>
            {selectedIds.length} artigo(s) selecionado(s)
          </span>
          <button 
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            style={{ padding: '6px 12px', backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isDeleting ? 'Excluindo...' : '🗑 Excluir Selecionados'}
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th style={{ padding: '10px 16px', width: '40px', borderBottom: '1px solid var(--color-border)' }}>
                <input 
                  type="checkbox" 
                  checked={articles.length > 0 && selectedIds.length === articles.length} 
                  onChange={toggleSelectAll} 
                />
              </th>
              {['Título', 'Categoria', 'Status', 'Autor', 'Views', 'Atualizado', 'Ações'].map((col, i) => (
                <th key={i} style={{
                  padding: '10px 16px', textAlign: col === 'Views' ? 'right' : 'left',
                  fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {articles.map((article, i) => {
              const st = STATUS_STYLES[article.status]
              const isSelected = selectedIds.includes(article.id)
              
              return (
                <tr
                  key={article.id}
                  style={{ 
                    borderBottom: i < articles.length - 1 ? '1px solid var(--color-border)' : 'none',
                    backgroundColor: isSelected ? 'rgba(0, 208, 132, 0.05)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelect(article.id)}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.title}
                    </div>
                    {article.excerpt && (
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {article.excerpt}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {article.category.name}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 600,
                      backgroundColor: st.bg, color: st.color,
                    }}>
                      {STATUS_LABELS[article.status]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {article.author.name}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {article.views.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    {article.updatedAt.toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/admin/artigos/${article.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                        fontWeight: 500, textDecoration: 'none',
                        border: '1px solid var(--color-border)',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                      }}
                    >
                      ✎ Editar
                    </Link>
                    
                    <Link
                      href={`/admin/artigos/${article.id}/preview`}
                      target="_blank"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                        fontWeight: 500, textDecoration: 'none',
                        border: '1px solid var(--color-primary)',
                        color: 'var(--color-primary)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      👁 Ver Rascunho
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
