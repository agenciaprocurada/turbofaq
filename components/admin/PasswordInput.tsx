'use client'

import { useState } from 'react'

interface PasswordInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoComplete?: string
  placeholder?: string
  visiblePlaceholder?: string
  className?: string
}

export function PasswordInput({
  id,
  value,
  onChange,
  required,
  autoComplete = 'current-password',
  placeholder = '••••••••',
  visiblePlaceholder = '',
  className = 'form-input',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className={className}
        placeholder={showPassword ? visiblePlaceholder : placeholder}
        style={{ paddingRight: '44px' }}
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          fontSize: '18px',
          opacity: 0.7,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        {showPassword ? (
          // Olho riscado — ocultar
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          // Olho aberto — visualizar
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
