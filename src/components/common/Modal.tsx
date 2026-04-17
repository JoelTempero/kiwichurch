import { useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000] animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn(
          'bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4',
          sizeClasses[size]
        )}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
          <h3 id="modal-title" className="text-xl font-medium text-forest m-0">{title}</h3>
          <button
            className="p-1.5 rounded-md text-text-light hover:bg-cream hover:text-text-primary transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 pb-6">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
