import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--color-cream-dark)', color: 'var(--color-text)' },
  success: { bg: '#dcfce7', color: '#166534' },
  warning: { bg: '#fef3c7', color: '#92400e' },
  error: { bg: '#fee2e2', color: '#dc2626' },
  info: { bg: '#dbeafe', color: '#1d4ed8' }
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={`badge badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: styles.bg,
        color: styles.color
      }}
    >
      {children}
    </span>
  )
}
