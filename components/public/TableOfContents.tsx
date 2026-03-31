'use client'

import { useEffect, useRef, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

interface Props {
  content: string
}

function extractHeadings(html: string): Heading[] {
  // DOMParser é client-only; o componente é 'use client' mas pode
  // ser invocado durante o pre-render do servidor em alguns cenários.
  if (typeof window === 'undefined') return []

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const nodes = doc.querySelectorAll('h2, h3')

  const headings: Heading[] = []

  nodes.forEach((node) => {
    const id = node.getAttribute('id')
    const text = node.textContent?.trim() ?? ''
    const level = node.tagName === 'H2' ? 2 : 3

    if (id && text) {
      headings.push({ id, text, level })
    }
  })

  return headings
}

export default function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Extrai headings do HTML após montar (client-only)
  useEffect(() => {
    const extracted = extractHeadings(content)
    setHeadings(extracted)
  }, [content])

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Pega o primeiro heading visível (mais próximo do topo)
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length > 0) {
        setActiveId(visible[0].target.id)
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0,
    })

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  // Só renderiza com 3 ou mais h2
  const h2Count = headings.filter((h) => h.level === 2).length
  if (h2Count < 3) return null

  return (
    // hidden em mobile, visível e sticky no desktop
    <nav
      className="toc hidden lg:block sticky top-6"
      aria-label="Índice do artigo"
    >
      <p className="toc__title">Neste artigo</p>
      <ul className="toc__list">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`toc__item toc__item--h${heading.level}${
              activeId === heading.id ? ' toc__item--active' : ''
            }`}
          >
            <a href={`#${heading.id}`} className="toc__link">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
