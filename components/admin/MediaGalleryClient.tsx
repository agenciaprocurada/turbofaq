'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MediaFile, deleteMedias } from '@/app/(admin)/admin/midias/actions'

interface Props {
  medias: MediaFile[]
}

export function MediaGalleryClient({ medias }: Props) {
  const router = useRouter()
  const [selectedFrags, setSelectedFrags] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelectAll = () => {
    if (selectedFrags.length === medias.length) {
      setSelectedFrags([])
    } else {
      setSelectedFrags(medias.map(m => m.pathFragment))
    }
  }

  const toggleSelect = (frag: string) => {
    if (selectedFrags.includes(frag)) {
      setSelectedFrags(selectedFrags.filter(x => x !== frag))
    } else {
      setSelectedFrags([...selectedFrags, frag])
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFrags.length === 0) return
    if (!confirm(`Tem certeza que deseja APAGAR DEFINITIVAMENTE ${selectedFrags.length} imagens de seu servidor? Artigos que usarem essas imagens ficarão quebrados.`)) return
    
    setIsDeleting(true)
    try {
      await deleteMedias(selectedFrags)
      setSelectedFrags([])
      router.refresh()
    } catch (err: any) {
      alert('Erro: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (medias.length === 0) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🖼️</div>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Nenhuma mídia encontrada</p>
        <p>A pasta de uploads de imagens está vazia.</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={toggleSelectAll} 
          className="btn-secondary"
        >
          {selectedFrags.length === medias.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </button>

        {selectedFrags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)' }}>
              {selectedFrags.length} selecionado(s)
            </span>
            <button 
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              style={{ padding: '10px 20px', backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
            >
              {isDeleting ? 'Excluindo...' : '🗑 Excluir Selecionados'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {medias.map((media) => {
          const isSelected = selectedFrags.includes(media.pathFragment)
          return (
            <div 
              key={media.pathFragment}
              onClick={() => toggleSelect(media.pathFragment)}
              style={{
                position: 'relative',
                backgroundColor: 'var(--bg-card)',
                border: isSelected ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 0 0 4px rgba(220, 38, 38, 0.1)' : 'var(--shadow-sm)',
                transition: 'all 0.15s'
              }}
            >
              {isSelected && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, width: '24px', height: '24px', backgroundColor: 'var(--color-danger)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  ✓
                </div>
              )}
              
              <div style={{ position: 'relative', width: '100%', height: '160px', backgroundColor: '#f0f0f0' }}>
                <Image 
                  src={media.url}
                  alt={media.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
              <div style={{ padding: '12px', wordBreak: 'break-all' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                  {media.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{(media.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(media.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
