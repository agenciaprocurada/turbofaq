interface StatCardProps {
  label: string
  value: number | string
  description?: string
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          fontSize: '36px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: '8px',
          letterSpacing: '-1px',
        }}
      >
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: description ? '4px' : 0,
        }}
      >
        {label}
      </div>
      {description && (
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{description}</div>
      )}
    </div>
  )
}
