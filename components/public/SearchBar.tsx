'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  defaultValue?: string
}

export default function SearchBar({ defaultValue = '' }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const autoNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = useCallback(
    (query: string) => {
      const q = query.trim()
      if (!q) return
      router.push(`/ajuda/busca?q=${encodeURIComponent(q)}`)
    },
    [router],
  )

  // Auto-navega após 600ms de inatividade
  useEffect(() => {
    if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current)

    if (value.trim().length >= 2) {
      autoNavTimerRef.current = setTimeout(() => {
        navigate(value)
      }, 600)
    }

    return () => {
      if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current)
    }
  }, [value, navigate])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current)
      navigate(value)
    }
  }

  function handleClear() {
    if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current)
    setValue('')
  }

  return (
    <div className="search-bar" role="search">
      {/* Ícone de lupa */}
      <svg
        className="search-bar__icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar artigos, tutoriais..."
        className="search-bar__input form-input"
        aria-label="Buscar na central de ajuda"
        autoComplete="off"
      />

      {/* Botão limpar — só aparece quando há texto */}
      {value.length > 0 && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
