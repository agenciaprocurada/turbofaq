'use client'

import { useEffect } from 'react'

interface Props {
  articleId: string
}

/**
 * Componente invisível que registra uma visualização ao montar.
 * Não bloqueia o SSR — é inserido dentro do Server Component pai.
 */
export default function ViewsTracker({ articleId }: Props) {
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    }).catch(() => {
      // Falha silenciosa — contagem de views não é crítica
    })
  }, [articleId])

  return null
}
