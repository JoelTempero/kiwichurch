import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant === 'danger' ? 'secondary' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className={confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-text-primary text-sm">{message}</p>
    </Modal>
  )
}
