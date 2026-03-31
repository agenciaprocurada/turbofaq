'use client'

import { useState } from 'react'
import { discoverLinks, importArticle } from '@/app/actions/scraper'

export default function ScraperPanel({ categories }: { categories: { id: string; name: string }[] }) {
  const [url, setUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [links, setLinks] = useState<string[]>([])
  
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ title: string; success: boolean; error?: string }[]>([])

  async function handleDiscover(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return

    setIsSearching(true)
    setLinks([])
    setResults([])
    setProgress(0)
    
    try {
      const found = await discoverLinks(url)
      setLinks(found)
      if (found.length === 0) {
        alert('Nenhum link detectado ou válido para importação nessa URL.')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleImportAll() {
    if (!categoryId) {
      alert('Selecione uma categoria de destino primeiro.')
      return
    }
    
    if (!confirm(`Tem certeza que deseja importar ${links.length} itens como Rascunhos?`)) return

    setIsImporting(true)
    setResults([])
    setProgress(0)

    const finalResults = []

    for (let i = 0; i < links.length; i++) {
      const targetUrl = links[i]
      const res = await importArticle(targetUrl, categoryId)
      
      finalResults.push({
        title: res.success ? (res.title ?? targetUrl) : targetUrl,
        success: res.success,
        error: res.error
      })
      
      setResults([...finalResults])
      setProgress(Math.round(((i + 1) / links.length) * 100))
    }

    setIsImporting(false)
    alert('Importação concluída!')
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Forneça o link de uma categoria ou artigo do seu site antigo. O sistema mapeará tudo e copiará criando novos artigos como <strong>RASCUNHO</strong>.
      </p>

      <div className="card">
        <form onSubmit={handleDiscover} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '300px' }}>
            <label htmlFor="url">URL de Origem (Categoria ou Artigo)</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ajuda.staycloud.com.br/ajuda-category/dominio"
              className="input"
              required
              disabled={isSearching || isImporting}
            />
          </div>
          <button type="submit" className="button" disabled={isSearching || isImporting}>
            {isSearching ? 'Buscando...' : '🔍 Encontrar Artigos'}
          </button>
        </form>
      </div>

      {links.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>{links.length} Link(s) Detectados</h3>
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px' }}>
            {links.map((l, i) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid var(--border-color)' }}>
                {l}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ width: '300px' }}>
              <label>Categoria de Destino (para onde vão os artigos?)</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="input"
                disabled={isImporting}
              >
                <option value="">-- Selecione --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleImportAll} 
              className="button"
              style={{ backgroundColor: 'var(--color-primary)' }}
              disabled={isImporting || !categoryId}
            >
              {isImporting ? 'Importando...' : '⚡ Iniciar Importação em Massa'}
            </button>
          </div>

          {progress > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Progresso: {progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Resultados</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
            {results.map((res, i) => (
              <li key={i} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                {res.success ? (
                  <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
                ) : (
                  <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>✕</span>
                )}
                <div>
                  <strong>{res.title}</strong>
                  {!res.success && <div style={{ color: 'var(--text-secondary)' }}>Erro: {res.error}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
