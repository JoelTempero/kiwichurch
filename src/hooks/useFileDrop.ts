import { useRef, useState } from 'react'

interface UseFileDropOptions {
  onFile: (file: File) => void
  accept?: (file: File) => boolean
  onReject?: (file: File) => void
}

export function useFileDrop({ onFile, accept, onReject }: UseFileDropOptions) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const counter = useRef(0)

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    counter.current++
    if (counter.current === 1) setIsDraggingOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    counter.current--
    if (counter.current <= 0) {
      counter.current = 0
      setIsDraggingOver(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    counter.current = 0
    setIsDraggingOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (accept && !accept(file)) {
      onReject?.(file)
      return
    }
    onFile(file)
  }

  return {
    isDraggingOver,
    dropHandlers: { onDragEnter, onDragLeave, onDragOver, onDrop },
  }
}
