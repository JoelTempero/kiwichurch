import { useEffect, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { storageService } from '@/services/firebase'
import { useToast } from '@/components/common/Toast'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  postId: string
  placeholder?: string
}

const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/

function parseEmbedUrl(url: string): string | null {
  const yt = url.match(YT_REGEX)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(VIMEO_REGEX)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

export function RichTextEditor({ value, onChange, postId, placeholder }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const onChangeRef = useRef(onChange)
  const postIdRef = useRef(postId)
  const { showToast } = useToast()
  const showToastRef = useRef(showToast)

  // Keep refs current so handlers see fresh values without re-init
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  useEffect(() => { postIdRef.current = postId }, [postId])
  useEffect(() => { showToastRef.current = showToast }, [showToast])

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return

    const imageHandler = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        try {
          const result = await storageService.uploadKeteImage(postIdRef.current, file)
          const quill = quillRef.current
          if (!quill) return
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, 'image', result.url, 'user')
          quill.setSelection(range.index + 1, 0)
        } catch (err) {
          showToastRef.current(
            err instanceof Error ? err.message : "Couldn't upload image. Try again.",
            'error'
          )
        }
      }
      input.click()
    }

    const videoHandler = () => {
      const url = window.prompt('YouTube or Vimeo URL')
      if (!url) return
      const embed = parseEmbedUrl(url.trim())
      if (!embed) {
        showToastRef.current('Only YouTube and Vimeo links are supported.', 'error')
        return
      }
      const quill = quillRef.current
      if (!quill) return
      const range = quill.getSelection(true)
      quill.insertEmbed(range.index, 'video', embed, 'user')
      quill.setSelection(range.index + 1, 0)
    }

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder || 'Write your post…',
      modules: {
        toolbar: {
          container: [
            ['bold', 'italic', 'underline'],
            [{ header: [2, 3, false] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'link'],
            ['image', 'video'],
            ['clean'],
          ],
          handlers: {
            image: imageHandler,
            video: videoHandler,
          },
        },
      },
    })

    if (value) quill.root.innerHTML = value

    quill.on('text-change', () => {
      onChangeRef.current(quill.root.innerHTML)
    })

    quillRef.current = quill
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="bg-white" />
}
