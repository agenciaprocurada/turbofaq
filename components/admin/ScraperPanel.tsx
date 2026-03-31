'use client'

import { useState } from 'react'
import { discoverLinks, importArticle } from '@/app/actions/scraper'

interface ScrapedLink {
  url: string
  selected: boolean
  categoryId: string
}

export default function ScraperPanel({ categories }: { categories: { id: string; name: string }[] }) {
  const [url, setUrl] = useState('')
  const [masterCategoryId, setMasterCategoryId] = useState('')
  const [links, setLinks] = useState<ScrapedLink[]>([])
  
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
      const foundUrls = await discoverLinks(url)
      
      const newLinks: ScrapedLink[] = foundUrls.map((u) => ({
        url: u,
        selected: true,
        categoryId: masterCategoryId
      }))
      
      setLinks(newLinks)
      if (foundUrls.length === 0) {
        alert('Nenhum link detectado ou válido para importação nessa URL.')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSearching(false)
    }
  }

  function handleToggleSelectAll() {
    const allSelected = links.every(l => l.selected)
    setLinks(links.map(l => ({ ...l, selected: !allSelected })))
  }

  function handleToggleRow(index: number) {
    const fresh = [...links]
    fresh[index].selected = !fresh[index].selected
    setLinks(fresh)
  }

  function handleChangeRowCategory(index: number, newCat: string) {
    const fresh = [...links]
    fresh[index].categoryId = newCat
    setLinks(fresh)
  }
  
  function applyMasterCategory() {
    if (!masterCategoryId) return
    setLinks(links.map(l => ({ ...l, categoryId: masterCategoryId })))
  }

  // Ajudinha de UI para extrair nome
  function getFriendlyName(fullUrl: string) {
    try {
      const u = new URL(fullUrl)
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts.length === 0) return fullUrl
      return decodeURIComponent(parts[parts.length - 1]).replace(/-/g, ' ').toUpperCase()
    } catch {
      return fullUrl
    }
  }

  async function handleImportSelected() {
    const selectedLinks = links.filter(l => l.selected)
    
    if (selectedLinks.length === 0) {
      alert('Selecione ao menos um artigo para importar.')
      return
    }
    
    const unmapped = selectedLinks.filter(l => !l.categoryId)
    if (unmapped.length > 0) {
      alert('Alguns artigos selecionados não possuem uma Categoria definida. Por favor, atribua a todos.')
      return
    }
    
    if (!confirm(`Você está prestes a importar ${selectedLinks.length} artigos como Rascunhos. Continuar?`)) return

    setIsImporting(true)
    setResults([])
    setProgress(0)

    const finalResults = []

    for (let i = 0; i < selectedLinks.length; i++) {
      const item = selectedLinks[i]
      const res = await importArticle(item.url, item.categoryId)
      
      finalResults.push({
        title: res.success ? (res.title ?? item.url) : item.url,
        success: res.success,
        error: res.error
      })
      
      setResults([...finalResults])
      setProgress(Math.round(((i + 1) / selectedLinks.length) * 100))
    }

    setIsImporting(false)
    alert('Importação concluída!')
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px', lineHeight: 1.6 }}>
        Adicione a URL origem (do seu site antigo/WordPress). Iremos investigar e listar todos os tutoriais contidos na página. Em seguida, decida quais deseja copiar, assinale a categoria correspondente e nós recriaremos tudo inteligentemente (limpo, sem menus e sem rodapés) como <strong>Rascunho</strong> na TurboCloud.
      </p>

      {/* Caixa de Busca */}
      <div className="card" style={{ padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <form onSubmit={handleDiscover} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '300px', margin: 0 }}>
              <label htmlFor="url" style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', display: 'block' }}>URL do Alvo a ser Rastreado</label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Exemplo: https://ajuda.staycloud.com.br/ajuda-category/dominio"
                className="input"
                style={{ padding: '12px 16px', fontSize: '15px' }}
                required
                disabled={isSearching || isImporting}
              />
            </div>
            <button type="submit" className="button" style={{ padding: '12px 24px', fontSize: '15px', height: '47px' }} disabled={isSearching || isImporting}>
              {isSearching ? 'Investigando...' : '🔍 Localizar URLs'}
            </button>
          </div>
          
        </form>
      </div>

      {/* Área de Ação e Tabela */}
      {links.length > 0 && (
        <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)' }}>{links.length}</span> Tutoriais localizados
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Filtre o que você quer absorver para o banco.</p>
            </div>
            
            {/* Categoria Master */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-secondary)', padding: '10px 16px', borderRadius: '8px' }}>
               <span style={{ fontSize: '13px', fontWeight: 600 }}>Ação em Lote:</span>
               <select 
                  value={masterCategoryId} 
                  onChange={(e) => setMasterCategoryId(e.target.value)}
                  className="input"
                  style={{ padding: '6px 12px', height: 'auto', minWidth: '180px' }}
                  disabled={isImporting}
               >
                 <option value="">-- Categoria Padrão --</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <button 
                 type="button"
                 onClick={applyMasterCategory}
                 className="button"
                 style={{ padding: '6px 12px', height: 'auto', fontSize: '12px', backgroundColor: 'var(--color-primary)' }}
                 disabled={isImporting || !masterCategoryId}
               >
                 Aplicar a Todos
               </button>
            </div>
          </div>

          {/* Tabela de Links Melhorada */}
          <div style={{ 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px' }}>
              <div style={{ width: '40px', textAlign: 'center' }}>
                 <input type="checkbox" checked={links.every(l => l.selected)} onChange={handleToggleSelectAll} disabled={isImporting} />
              </div>
              <div style={{ flex: 2 }}>Referência na URL</div>
              <div style={{ width: '220px' }}>Destino (Categoria local)</div>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {links.map((link, index) => (
                <div key={index} style={{ 
                   display: 'flex', 
                   padding: '12px 16px', 
                   borderBottom: '1px solid rgba(255,255,255,0.05)',
                   alignItems: 'center',
                   backgroundColor: link.selected ? 'rgba(0,208,132,0.02)' : 'transparent',
                   transition: 'background 0.2s ease',
                   opacity: link.selected ? 1 : 0.6
                }}>
                  <div style={{ width: '40px', textAlign: 'center' }}>
                     <input type="checkbox" checked={link.selected} onChange={() => handleToggleRow(index)} disabled={isImporting} />
                  </div>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                     <span style={{ fontSize: '14px', fontWeight: 600, color: link.selected ? '#fff' : 'var(--text-secondary)' }}>
                        {getFriendlyName(link.url)}
                     </span>
                     <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {link.url}
                     </span>
                  </div>
                  <div style={{ width: '220px' }}>
                    <select 
                      className="input"
                      style={{ padding: '6px 12px', height: 'auto', fontSize: '13px', width: '100%', borderColor: (!link.categoryId && link.selected) ? 'var(--color-danger)' : 'var(--border-color)' }}
                      value={link.categoryId}
                      onChange={(e) => handleChangeRowCategory(index, e.target.value)}
                      disabled={isImporting || !link.selected}
                    >
                      <option value="">Avisar/Não Cadastrar</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button 
              onClick={handleImportSelected} 
              className="button"
              style={{ backgroundColor: 'var(--color-primary)', padding: '14px 32px', fontSize: '15px', fontWeight: 'bold' }}
              disabled={isImporting || links.filter(l => l.selected).length === 0}
            >
              {isImporting ? '⏳ Puxando Conteúdos...' : `⚡ Importar ${links.filter(l => l.selected).length} itens como Rascunhos`}
            </button>
          </div>

          {progress > 0 && (
             <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Rastreamento e Importação em andamento...</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-primary)' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Relatório Final */}
      {results.length > 0 && (
        <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Auditoria da Importação
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((res, i) => (
              <li key={i} style={{ 
                padding: '12px 16px', 
                backgroundColor: res.success ? 'rgba(0, 208, 132, 0.05)' : 'rgba(255, 75, 75, 0.05)',
                borderLeft: `4px solid ${res.success ? 'var(--color-success)' : 'var(--color-danger)'}`,
                borderRadius: '4px',
                display: 'flex', 
                gap: '16px', 
                alignItems: 'center' 
              }}>
                {res.success ? (
                  <span style={{ color: 'var(--color-success)', fontWeight: 'bold', fontSize: '18px' }}>✓</span>
                ) : (
                  <span style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '18px' }}>✕</span>
                )}
                <div style={{ flex: 1 }}>
                  <strong style={{ color: res.success ? '#fff' : 'var(--text-secondary)' }}>{res.title}</strong>
                  {!res.success && (
                    <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>
                      <strong>Falha de código:</strong> {res.error}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
