'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { saveHighlight, deleteHighlight, uploadHighlightImage } from '@/app/(admin)/admin/destaques/actions'

type Article = { id: string; title: string; slug: string; category: { slug: string } }
type Highlight = {
  id: string
  imageUrl: string
  order: number
  active: boolean
  article: Article
}

interface Props {
  highlights: Highlight[]
  articles: Article[]
}

const emptyForm = { imageUrl: '', articleId: '', order: 0, active: true }

export function HighlightsClient({ highlights, articles }: Props) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, order: highlights.length })
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (h: Highlight) => {
    setEditingId(h.id)
    setForm({ imageUrl: h.imageUrl, articleId: h.article.id, order: h.order, active: h.active })
    setError('')
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const url = await uploadHighlightImage(fd)
      setForm(prev => ({ ...prev, imageUrl: url }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.imageUrl) { setError('Faça upload de uma imagem primeiro.'); return }
    if (!form.articleId) { setError('Selecione um artigo.'); return }
    setSaving(true)
    setError('')
    try {
      await saveHighlight({ id: editingId ?? undefined, ...form })
      setIsModalOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este destaque?')) return
    await deleteHighlight(id)
    router.refresh()
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="btn-primary" onClick={openCreate}>+ Novo Destaque</button>
      </div>

      {highlights.length === 0 ? (
        <div style={{ padding: '64px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--text-tertiary)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Nenhum destaque criado</p>
          <p>Crie um destaque para aparecer na página inicial.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {highlights.map((h) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '18px', color: 'var(--text-tertiary)', minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>#{h.order + 1}</div>
              <div style={{ position: 'relative', width: '120px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                <Image src={h.imageUrl} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h.article.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  /ajuda/{h.article.category.slug}/{h.article.slug}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', backgroundColor: h.active ? '#e8f9f3' : '#f5f5f7', color: h.active ? '#00a86b' : '#666' }}>
                  {h.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => openEdit(h)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  ✎ Editar
                </button>
                <button onClick={() => handleDelete(h.id)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-danger)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--color-danger)' }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{editingId ? 'Editar Destaque' : 'Novo Destaque'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-tertiary)' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Upload de imagem */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Imagem do Destaque
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ position: 'relative', width: '100%', height: '160px', border: '2px dashed var(--color-border)', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}
                >
                  {form.imageUrl ? (
                    <Image src={form.imageUrl} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <>
                      <span style={{ fontSize: '32px' }}>🖼️</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Clique para enviar imagem</span>
                    </>
                  )}
                  {uploading && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                      ⏳ Enviando...
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                {form.imageUrl && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, imageUrl: '' }))} style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    ✕ Remover imagem
                  </button>
                )}
              </div>

              {/* Artigo */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Artigo de Destino</label>
                <select
                  className="form-input"
                  value={form.articleId}
                  onChange={e => setForm(p => ({ ...p, articleId: e.target.value }))}
                  required
                >
                  <option value="">Selecione um artigo publicado...</option>
                  {articles.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              {/* Ordem */}
              <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Posição (ordem)</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    value={form.order}
                    onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', paddingBottom: '12px' }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} style={{ width: '16px', height: '16px' }} />
                  Ativo
                </label>
              </div>

              {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1, justifyContent: 'center' }}>
                  {saving ? 'Salvando...' : 'Salvar Destaque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
