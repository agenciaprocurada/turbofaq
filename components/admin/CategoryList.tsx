'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCategory, reorderCategories } from '@/app/(admin)/admin/categorias/actions'
import { SlugInput } from './SlugInput'

type CategoryItem = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  active: boolean
  order: number
  _count: { articles: number }
}

export function CategoryList({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItemIndex === null || draggedItemIndex === index) return

    const newCategories = [...categories]
    const draggedItem = newCategories[draggedItemIndex]

    // Swap elements
    newCategories.splice(draggedItemIndex, 1)
    newCategories.splice(index, 0, draggedItem)

    setDraggedItemIndex(index)
    setCategories(newCategories)
  }

  const handleDragEnd = async () => {
    setDraggedItemIndex(null)
    const newOrderIds = categories.map(c => c.id)
    try {
      await reorderCategories(newOrderIds)
      router.refresh()
    } catch {
      alert('Falha ao salvar a nova ordem')
      setCategories(initialCategories)
    }
  }

  // Modal Handlers
  const openModal = (category?: CategoryItem) => {
    setError('')
    if (category) {
      setEditingCategory(category)
    } else {
      setEditingCategory({ active: true, name: '', slug: '', description: '', icon: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    setSaving(true)
    setError('')

    try {
      await saveCategory({
        id: editingCategory.id,
        name: editingCategory.name!,
        slug: editingCategory.slug!,
        description: editingCategory.description ?? undefined,
        icon: editingCategory.icon ?? undefined,
        active: editingCategory.active ?? true
      })
      closeModal()
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="btn-primary" onClick={() => openModal()}>
          + Nova Categoria
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <p>Nenhuma categoria encontrada.</p>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {categories.map((category, index) => (
              <li
                key={category.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderBottom: index < categories.length - 1 ? '1px solid var(--color-border)' : 'none',
                  backgroundColor: draggedItemIndex === index ? 'var(--bg-secondary)' : 'transparent',
                  cursor: 'grab', transition: 'background-color 0.2s', opacity: draggedItemIndex === index ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '18px', cursor: 'grab', userSelect: 'none', padding: '0 4px' }}>
                    ⋮⋮
                  </div>
                  {category.icon && <div style={{ fontSize: '20px' }}>{category.icon}</div>}
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {category.name}
                      {!category.active && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Inativo
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      /{category.slug} — {category._count.articles} artigo(s)
                    </div>
                  </div>
                </div>

                <div style={{ flexShrink: 0, marginLeft: '16px' }}>
                  <button
                    onClick={() => openModal(category)}
                    style={{
                      padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: 'transparent', border: '1px solid var(--color-border)',
                      color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {editingCategory?.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '18px', color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '80px', flexShrink: 0 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Ícone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingCategory?.icon || ''}
                    onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, icon: e.target.value }) : null)}
                    placeholder="🚀"
                    maxLength={2}
                    style={{ textAlign: 'center', fontSize: '20px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Nome</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingCategory?.name || ''}
                    onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <SlugInput
                  label="Slug"
                  sourceValue={editingCategory?.name || ''}
                  initialSlug={editingCategory?.slug}
                  onChange={(slug) => setEditingCategory(prev => prev ? ({ ...prev, slug }) : null)}
                  disabled={!!editingCategory?.id} // Slug de categorias não deve mudar após criado, afeta SEO de todos artigos
                />
                {editingCategory?.id && (
                  <p style={{ fontSize: '12px', color: '#92400e', marginTop: '6px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
                    O slug da categoria não pode ser editado.
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Descrição</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={editingCategory?.description || ''}
                  onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={editingCategory?.active}
                    onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, active: e.target.checked }) : null)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Categoria ativa
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px', marginLeft: '24px' }}>
                  Apenas categorias ativas aparecem na busca e listagens públicas.
                </p>
              </div>

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
