'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import * as cheerio from 'cheerio'

function isValidArticleLink(href: string, baseUrl: string) {
  try {
    const url = new URL(href, baseUrl)
    // Mesma origem
    if (url.origin !== new URL(baseUrl).origin) return false
    // Ignorar lixos
    if (url.pathname === '/' || url.pathname.includes('/category/') || url.pathname.includes('/tag/') || url.pathname.includes('/author/')) return false
    if (href.includes('#') || href.includes('?')) return false
    return true
  } catch {
    return false
  }
}

/**
 * Rastreia a URL fornecida e retorna uma lista de links de artigos localizados.
 */
export async function discoverLinks(targetUrl: string) {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Não autorizado')
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      }
    })
    const html = await res.text()

    // Usar cheerio para extrair todos os links
    const $ = cheerio.load(html)
    const links = new Set<string>()

    // Deteção heurística
    $('body').find('a').each((_, el) => {
      const href = $(el).attr('href')
      if (href && isValidArticleLink(href, targetUrl)) {
        try {
          const absolute = new URL(href, targetUrl).href
          if (!absolute.includes('ajuda-category') && !absolute.includes('wp-admin')) {
             links.add(absolute)
          }
        } catch {}
      }
    })

    let finalList = Array.from(links)
    
    // Se a lista estiver vazia (porque talvez o próprio targetUrl seja um artigo), incluímos ele
    if (finalList.length === 0 && isValidArticleLink(targetUrl, targetUrl)) {
       finalList = [targetUrl]
    }

    return finalList

  } catch (err: any) {
    throw new Error('Falha ao rastrear a URL: ' + err.message)
  }
}

/**
 * Lê o conteúdo do artigo, formata e salva no banco de dados.
 */
export async function importArticle(targetUrl: string, categoryId: string) {
  const session = await auth()
  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Não autorizado')
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      }
    })
    const html = await res.text()

    const $ = cheerio.load(html)
    
    // Heurística do Título do Artigo
    const title = $('h1.entry-title').text() || $('article h1').text() || $('h1').first().text() || $('title').text()

    // Heurística de Conteúdo: entry-content, post-content ou pega o html inteiro do article
    let content = $('.entry-content').html() || $('.post-content').html() || $('article').html()
    if (!content) content = $('body').text() // Fallback super simples

    if (!title || !content) {
      throw new Error('Não foi possível extrair o conteúdo principal dessa página usando heurística leve.')
    }

    // Gerar um slug seguro
    let slug = slugify(title)
    
    // Garantir slug único
    const exists = await prisma.article.findUnique({ where: { slug } })
    if (exists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    // Gerar um resumo/excerpt automático se Readability não pegar
    let excerpt = $('meta[name="description"]').attr('content') || content.substring(0, 197).replace(/<[^>]*>?/gm, '') + '...'

    // Salvar como DRAFT (Rascunho) conforme a regra
    const created = await prisma.article.create({
      data: {
        title: title,
        slug,
        content: content, 
        excerpt,
        status: 'DRAFT',
        categoryId,
        authorId: session.user.id,
      }
    })

    return { success: true, articleId: created.id, title: created.title }

  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
