import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Modal } from '@/components/common'
import { useCreateKetePost, useUpdateKetePost, useDeleteKetePost } from '@/hooks/useKete'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import { keteSchema } from '@/utils/schemas'
import { cn } from '@/utils/cn'
import type { KetePost } from '@/types'

interface KeteFormProps {
  post?: KetePost | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const inputBase = 'w-full px-3 py-3 border border-sage-light rounded-md font-body text-base transition-colors focus:outline-none focus:border-forest'
const inputError = 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600/20'

export function KeteForm({ post, isOpen, onClose, onSuccess }: KeteFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const createPost = useCreateKetePost()
  const updatePost = useUpdateKetePost()
  const deletePost = useDeleteKetePost()

  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditMode = !!post

  const form = useForm({
    resolver: zodResolver(keteSchema),
    defaultValues: {
      title: '', excerpt: '', content: '', featuredImage: '', published: true,
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (post) {
        form.reset({
          title: post.title || '', excerpt: post.excerpt || '',
          content: post.content || '', featuredImage: post.featuredImage || '',
          published: post.published ?? true,
        })
      } else {
        form.reset()
      }
    }
  }, [post, isOpen, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!user) return

    try {
      const postData = {
        ...data,
        authorId: post?.authorId || user.id,
        authorName: post?.authorName || user.displayName,
        authorPhotoURL: post?.authorPhotoURL || user.photoURL,
        publishedAt: data.published ? (post?.publishedAt || new Date()) : null,
      }

      if (isEditMode && post) {
        await updatePost.mutateAsync({ postId: post.id, updates: postData })
        showToast('Post updated', 'success')
      } else {
        await createPost.mutateAsync(postData)
        showToast('Post created', 'success')
      }

      onSuccess?.()
      onClose()
    } catch {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} post`, 'error')
    }
  })

  const handleDelete = async () => {
    if (!post) return

    setIsDeleting(true)
    try {
      await deletePost.mutateAsync(post.id)
      showToast('Post deleted', 'success')
      setShowDeleteConfirm(false)
      onSuccess?.()
      onClose()
    } catch {
      showToast('Failed to delete post', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (form.formState.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const { errors, isSubmitting } = form.formState

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? 'Edit Post' : 'Create Post'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-2" htmlFor="kete-title">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="kete-title"
              type="text"
              className={cn(inputBase, errors.title && inputError)}
              placeholder="Post title"
              {...form.register('title')}
            />
            {errors.title && (
              <span className="text-sm text-red-600 mt-1 block" role="alert">{errors.title.message}</span>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="kete-excerpt">Excerpt</label>
            <textarea
              id="kete-excerpt"
              className={cn(inputBase, 'resize-y min-h-[60px]')}
              placeholder="Brief summary shown on cards..."
              rows={2}
              {...form.register('excerpt')}
            />
            <span className="text-sm text-text-light mt-1 block">A short summary that appears on the post card</span>
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="kete-image">Featured Image URL</label>
            <input
              id="kete-image"
              type="url"
              className={inputBase}
              placeholder="https://example.com/image.jpg"
              {...form.register('featuredImage')}
            />
          </div>

          <div>
            <label className="block font-medium mb-2" htmlFor="kete-content">
              Content <span className="text-red-600">*</span>
            </label>
            <textarea
              id="kete-content"
              className={cn(inputBase, 'resize-y min-h-[200px]', errors.content && inputError)}
              placeholder="Write your post content here... HTML is supported."
              rows={12}
              {...form.register('content')}
            />
            {errors.content && (
              <span className="text-sm text-red-600 mt-1 block" role="alert">{errors.content.message}</span>
            )}
            <span className="text-sm text-text-light mt-1 block">HTML formatting is supported (bold, italic, links, etc.)</span>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-[18px] h-[18px] accent-forest" {...form.register('published')} />
              <span>Publish immediately</span>
            </label>
            <span className="text-sm text-text-light mt-1 block">Uncheck to save as draft</span>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-cream">
            <div className="flex gap-2">
              {isEditMode && (
                <Button type="button" variant="danger" onClick={() => setShowDeleteConfirm(true)} disabled={isSubmitting}>
                  Delete Post
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {isEditMode ? 'Save Changes' : (form.watch('published') ? 'Publish' : 'Save Draft')}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Post" size="sm">
        <div className="text-center">
          <p>Are you sure you want to delete "<strong>{post?.title}</strong>"?</p>
          <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
          <div className="flex justify-center gap-3 mt-6">
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>Yes, Delete Post</Button>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
