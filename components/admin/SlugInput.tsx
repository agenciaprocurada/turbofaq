'use client'

import { useEffect, useState } from 'react'

interface SlugInputProps {
  label: string
  sourceValue: string
  initialSlug?: string
  onChange: (slug: string) => void
  disabled?: boolean
  prefix?: string
}

export function SlugInput({
  label,
  sourceValue,
  initialSlug = '',
  onChange,
  disabled = false,
  prefix,
}: SlugInputProps) {
  const [slug, setSlug] = useState(initialSlug)
  const [isManuallyEdited, setIsManuallyEdited] = useState(!!initialSlug)

  // Essa função deve ficar sincronizada com lib/slugify.ts para o client-side preview
  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
  }

  useEffect(() => {
    if (!isManuallyEdited && !initialSlug) {
      const generated = generateSlug(sourceValue)
      setSlug(generated)
      onChange(generated)
    }
  }, [sourceValue, isManuallyEdited, initialSlug, onChange])

  function handleManualChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsManuallyEdited(true)
    const val = generateSlug(e.target.value)
    setSlug(val)
    onChange(val)
  }

  return (
    <div>
      <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--color-border)', 
            borderRight: 'none',
            borderRadius: '6px 0 0 6px',
            color: 'var(--text-tertiary)',
            fontSize: '14px',
            flexShrink: 0
          }}>
            {prefix}
          </div>
        )}
        <input
          type="text"
          value={slug}
          onChange={handleManualChange}
          disabled={disabled}
          className="form-input"
          style={{ 
            ...(prefix ? { borderRadius: '0 6px 6px 0' } : {}),
            fontFamily: 'monospace',
            color: disabled ? 'var(--text-tertiary)' : 'var(--text-primary)'
          }}
        />
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
        O slug será a URL do artigo (ex: /ajuda/categoria/<strong>o-slug-aqui</strong>).
      </p>
    </div>
  )
}
