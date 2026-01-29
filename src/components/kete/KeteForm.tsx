import { useState, useEffect } from 'react'
import { Button, Modal } from '@/components/common'
import { useCreateKetePost, useUpdateKetePost, useDeleteKetePost } from '@/hooks/useKete'
import { useToast } from '@/components/common/Toast'
import { useAuth } from '@/hooks/useAuth'
import type { KetePost } from '@/types'

interface KeteFormProps {
  post?: KetePost | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  title: string
  excerpt: string
  content: string
  featuredImage: string
  published: boolean
}

const initialFormData: FormData = {
  title: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  published: true
}

export function KeteForm({ post, isOpen, onClose, onSuccess }: KeteFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const createPost = useCreateKetePost()
  const updatePost = useUpdateKetePost()
  const deletePost = useDeleteKetePost()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const isEditMode = !!post

  // Populate form when editing
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featuredImage: post.featuredImage || '',
        published: post.published ?? true
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [post, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    setIsSaving(true)
    try {
      const postData = {
        ...formData,
        authorId: post?.authorId || user.id,
        authorName: post?.authorName || user.displayName,
        authorPhotoURL: post?.authorPhotoURL || user.photoURL,
        publishedAt: formData.published ? (post?.publishedAt || new Date()) : null
      }

      if (isEditMode && post) {
        await updatePost.mutateAsync({
          postId: post.id,
          updates: postData
        })
        showToast('Post updated', 'success')
      } else {
        await createPost.mutateAsync(postData)
        showToast('Post created', 'success')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} post`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return

    setIsDeleting(true)
    try {
      await deletePost.mutateAsync(post.id)
      showToast('Post deleted', 'success')
      setShowDeleteConfirm(false)
      onSuccess?.()
      onClose()
    } catch (error) {
      showToast('Failed to delete post', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    const hasChanges = isEditMode
      ? JSON.stringify(formData) !== JSON.stringify({
          title: post?.title || '',
          excerpt: post?.excerpt || '',
          content: post?.content || '',
          featuredImage: post?.featuredImage || '',
          published: post?.published ?? true
        })
      : formData.title || formData.content

    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditMode ? 'Edit Post' : 'Create Post'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="kete-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="kete-title">
              Title <span className="form-required">*</span>
            </label>
            <input
              id="kete-title"
              type="text"
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Post title"
              required
            />
            {errors.title && (
              <span className="form-error" role="alert">{errors.title}</span>
            )}
          </div>

          {/* Excerpt */}
          <div className="form-group">
            <label className="form-label" htmlFor="kete-excerpt">
              Excerpt
            </label>
            <textarea
              id="kete-excerpt"
              className="form-textarea"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              placeholder="Brief summary shown on cards..."
              rows={2}
            />
            <span className="form-hint">A short summary that appears on the post card</span>
          </div>

          {/* Featured Image */}
          <div className="form-group">
            <label className="form-label" htmlFor="kete-image">
              Featured Image URL
            </label>
            <input
              id="kete-image"
              type="url"
              className="form-input"
              value={formData.featuredImage}
              onChange={(e) => handleChange('featuredImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label" htmlFor="kete-content">
              Content <span className="form-required">*</span>
            </label>
            <textarea
              id="kete-content"
              className={`form-textarea ${errors.content ? 'form-input-error' : ''}`}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Write your post content here... HTML is supported."
              rows={12}
              required
            />
            {errors.content && (
              <span className="form-error" role="alert">{errors.content}</span>
            )}
            <span className="form-hint">HTML formatting is supported (bold, italic, links, etc.)</span>
          </div>

          {/* Published Toggle */}
          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => handleChange('published', e.target.checked)}
              />
              <span>Publish immediately</span>
            </label>
            <span className="form-hint">Uncheck to save as draft</span>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <div className="form-actions-left">
              {isEditMode && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                >
                  Delete Post
                </Button>
              )}
            </div>
            <div className="form-actions-right">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSaving}>
                {isEditMode ? 'Save Changes' : (formData.published ? 'Publish' : 'Save Draft')}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Post"
        size="sm"
      >
        <div className="delete-confirm">
          <p>Are you sure you want to delete "<strong>{post?.title}</strong>"?</p>
          <p className="delete-confirm-warning">This action cannot be undone.</p>
          <div className="modal-actions">
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Yes, Delete Post
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
