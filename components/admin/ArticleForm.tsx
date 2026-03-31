'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlugInput } from './SlugInput'
import { Editor } from './Editor'
import { saveArticle } from '@/app/(admin)/admin/artigos/actions'
import type { ArticleStatus } from '@prisma/client'

interface CategoriaCompact {
  id: string
  name: string
}

interface ArticleData {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  metaTitle: string
  metaDesc: string
  status: ArticleStatus
  featured: boolean
  categoryId: string
}

interface FormProps {
  article?: ArticleData
  categories: CategoriaCompact[]
  userRole: string
  authorId: string
}

export function ArticleForm({ article, categories, userRole, authorId }: FormProps) {
  const router = useRouter()
  const isWriter = userRole === 'WRITER'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<ArticleData>({
    id: article?.id,
    title: article?.title || '',
    slug: article?.slug || '',
    categoryId: article?.categoryId || (categories.length > 0 ? categories[0].id : ''),
    status: article?.status || 'DRAFT',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    metaTitle: article?.metaTitle || '',
    metaDesc: article?.metaDesc || '',
    featured: article?.featured || false,
  })

  function handleChange(field: keyof ArticleData, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await saveArticle({ ...formData, authorId })
      router.push('/admin/artigos')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar artigo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
      
      {/* Coluna Principal (Conteúdo, Título) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Título do artigo</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Como migrar seu site para a TurboCloud"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <SlugInput
              label="Slug (URL)"
              sourceValue={formData.title}
              initialSlug={formData.slug}
              onChange={(slug) => handleChange('slug', slug)}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Resumo / Excerpt</label>
            <textarea
              className="form-input"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={3}
              placeholder="Breve descrição do que se trata..."
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Conteúdo Principal</label>
            <Editor
              content={formData.content}
              onChange={(html) => handleChange('content', html)}
            />
          </div>
        </div>

        {/* SEO */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Otimização para SEO</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Meta Title (Opcional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="Deixe em branco para usar o título principal"
            />
          </div>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Meta Description (Opcional)</label>
            <textarea
              className="form-input"
              value={formData.metaDesc}
              onChange={(e) => handleChange('metaDesc', e.target.value)}
              rows={3}
              placeholder="Deixe em branco para usar o resumo"
            />
          </div>
        </div>
      </div>

      {/* Coluna Lateral (Publishing Options) */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0, position: 'sticky', top: '32px' }}>
        
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Configurações</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="DRAFT">Rascunho</option>
              <option value="REVIEW">Em revisão</option>
              {/* WRITER só enxerga/publica PUBLISHED se já era publicado (ele não pode mudar pra PUBLISHED) ou se ele fingir (mas o server bloqueia) */}
              <option value="PUBLISHED" disabled={isWriter && formData.status !== 'PUBLISHED'}>
                Publicado {isWriter ? '(Apenas Editores)' : ''}
              </option>
              {userRole !== 'WRITER' && <option value="ARCHIVED">Arquivado</option>}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Categoria</label>
            <select
              className="form-input"
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              required
            >
              <option value="" disabled>Selecione...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {userRole !== 'WRITER' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="featuredToggle"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="featuredToggle" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Destacar na página inicial
              </label>
            </div>
          )}

        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', color: '#dc2626', fontSize: '14px' }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>Erro</strong>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ 
              flex: 1, padding: '12px', backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', border: '1px solid var(--color-border)', 
              borderRadius: '8px', fontWeight: 600, cursor: 'pointer' 
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

      </div>
    </form>
  )
}
