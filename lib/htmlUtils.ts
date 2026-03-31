import { slugify } from '@/lib/slugify'

/**
 * Adiciona atributos `id` nos headings h2 e h3 do HTML do artigo,
 * baseando o id no texto do heading passado pelo slugify.
 * Usado no servidor antes de renderizar o conteúdo para que os links
 * do TableOfContents (âncoras #heading-id) funcionem.
 */
export function addHeadingIds(html: string): string {
  return html.replace(
    /<(h[23])([^>]*)>(.*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      // Se já tem um id, não sobrescreve
      if (/\bid\s*=/.test(attrs)) return match

      // Extrai texto puro removendo tags internas (negrito, code, etc.)
      const text = inner.replace(/<[^>]+>/g, '')
      const id = slugify(text)

      if (!id) return match

      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`
    },
  )
}
