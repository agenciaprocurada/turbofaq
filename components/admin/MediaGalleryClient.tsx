'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MediaFile, deleteMedias, convertToWebp } from '@/app/(admin)/admin/midias/actions'

interface Props {
  medias: MediaFile[]
}

export function MediaGalleryClient({ medias }: Props) {
  const router = useRouter()
  const [selectedFrags, setSelectedFrags] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal de detalhe ao clicar na imagem
  const [activeMedia, setActiveMedia] = useState<MediaFile | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [convertResult, setConvertResult] = useState<{ newUrl: string; updatedArticles: number } | null>(null)
  const [convertError, setConvertError] = useState('')

  const toggleSelectAll = () => {
    if (selectedFrags.length === medias.length) {
      setSelectedFrags([])
    } else {
      setSelectedFrags(medias.map(m => m.pathFragment))
    }
  }

  const toggleSelect = (frag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedFrags.includes(frag)) {
      setSelectedFrags(selectedFrags.filter(x => x !== frag))
    } else {
      setSelectedFrags([...selectedFrags, frag])
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedFrags.length === 0) return
    if (!confirm(`Tem certeza que deseja APAGAR DEFINITIVAMENTE ${selectedFrags.length} imagens do servidor? Artigos que usarem essas imagens ficarão quebrados.`)) return

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

  const openDetail = (media: MediaFile) => {
    setActiveMedia(media)
    setConvertResult(null)
    setConvertError('')
  }

  const closeDetail = () => {
    setActiveMedia(null)
    setConvertResult(null)
    setConvertError('')
  }

  const handleConvert = async () => {
    if (!activeMedia) return
    if (!confirm(`Converter "${activeMedia.name}" para WebP 85%?\n\nO arquivo original será substituído e todos os artigos que usarem essa imagem serão atualizados automaticamente.`)) return

    setIsConverting(true)
    setConvertError('')
    try {
      const result = await convertToWebp(activeMedia.pathFragment)
      setConvertResult(result)
      router.refresh()
      // Fecha o modal após 2s para o usuário ver o resultado
      setTimeout(() => closeDetail(), 2500)
    } catch (err: any) {
      setConvertError(err.message)
    } finally {
      setIsConverting(false)
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

  const isAlreadyWebp = activeMedia?.pathFragment.toLowerCase().endsWith('.webp')

  return (
    <>
      {/* Barra de controles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={toggleSelectAll} className="btn-secondary">
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

      {/* Grid de imagens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {medias.map((media) => {
          const isSelected = selectedFrags.includes(media.pathFragment)
          return (
            <div
              key={media.pathFragment}
              onClick={() => openDetail(media)}
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
              {/* Checkbox de seleção */}
              <div
                onClick={(e) => toggleSelect(media.pathFragment, e)}
                style={{
                  position: 'absolute', top: '8px', left: '8px', zIndex: 10,
                  width: '22px', height: '22px',
                  backgroundColor: isSelected ? 'var(--color-danger)' : 'rgba(255,255,255,0.9)',
                  border: `2px solid ${isSelected ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '12px', color: '#fff',
                  transition: 'all 0.15s'
                }}
              >
                {isSelected && '✓'}
              </div>

              {/* Badge WebP */}
              {media.pathFragment.toLowerCase().endsWith('.webp') && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px', zIndex: 10,
                  backgroundColor: 'var(--color-primary)', color: '#fff',
                  fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px'
                }}>
                  WebP
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

      {/* Modal de detalhe / conversão */}
      {activeMedia && (
        <div
          onClick={closeDetail}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden'
            }}
          >
            {/* Preview */}
            <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#f0f0f0' }}>
              <Image
                src={activeMedia.url}
                alt={activeMedia.name}
                fill
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>

            {/* Infos + ações */}
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', wordBreak: 'break-all', marginBottom: '6px' }}>
                  {activeMedia.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', display: 'flex', gap: '16px' }}>
                  <span>{(activeMedia.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(activeMedia.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px', wordBreak: 'break-all' }}>
                  {activeMedia.url}
                </div>
              </div>

              {/* Resultado da conversão */}
              {convertResult && (
                <div style={{ backgroundColor: '#e8f9f3', border: '1px solid #00a86b', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
                  <strong style={{ color: '#00a86b' }}>✅ Convertido com sucesso!</strong>
                  <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                    {convertResult.updatedArticles} artigo(s) atualizado(s) com o novo caminho WebP.
                  </p>
                </div>
              )}

              {convertError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#dc2626' }}>
                  ⚠️ {convertError}
                </div>
              )}

              {/* Botões de ação */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleConvert}
                  disabled={isConverting || !!convertResult || isAlreadyWebp}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: isAlreadyWebp || convertResult ? 'var(--bg-secondary)' : 'var(--color-primary)',
                    color: isAlreadyWebp || convertResult ? 'var(--text-tertiary)' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: isConverting || convertResult || isAlreadyWebp ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isConverting
                    ? '⏳ Convertendo...'
                    : isAlreadyWebp
                    ? '✅ Já é WebP'
                    : convertResult
                    ? '✅ Concluído'
                    : '🔄 Converter para WebP (85%)'}
                </button>
                <button
                  onClick={closeDetail}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Fechar
                </button>
              </div>

              {!isAlreadyWebp && !convertResult && (
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '10px' }}>
                  O arquivo original será substituído pelo .webp. Todos os artigos que referenciam esta imagem serão atualizados automaticamente no banco de dados.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
