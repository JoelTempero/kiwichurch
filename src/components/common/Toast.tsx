import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

type ToastType = 'default' | 'success' | 'error' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const typeClasses: Record<ToastType, string> = {
  default: 'bg-forest',
  success: 'bg-green-800',
  error: 'bg-red-600',
  warning: 'bg-amber-600'
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'default') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[2000] flex flex-col gap-2 md:bottom-8 md:right-8 md:left-auto md:translate-x-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 text-white rounded-md shadow-lg animate-in slide-in-from-bottom-4',
              typeClasses[toast.type]
            )}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <span>{toast.message}</span>
            <button
              className="p-0.5 hover:opacity-80 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                removeToast(toast.id)
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
