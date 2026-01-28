interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
}

export function Avatar({ src, name = '?', size = 'md', className = '' }: AvatarProps) {
  const pixels = sizeMap[size]
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{
        width: pixels,
        height: pixels,
        minWidth: pixels,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: src ? 'transparent' : 'var(--color-sage-light)',
        color: 'var(--color-forest)',
        fontWeight: 600,
        fontSize: pixels * 0.4
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials
      )}
    </div>
  )
}
