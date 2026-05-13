import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import {
  useKetePost,
  useCreateKetePost,
  useUpdateKetePost,
  keteKeys,
} from '@/hooks/useKete'
import { dbService } from '@/services/firebase'
import { ConfirmModal, Spinner } from '@/components/common'
import { useToast } from '@/components/common/Toast'
import {
  EditorTopBar,
  FeaturedImageUpload,
  RichTextEditor,
} from '@/components/kete'
import { keteSchema } from '@/utils/schemas'
import { cn } from '@/utils/cn'
import type { KetePost, KeteVisibility } from '@/types'

type Mode = 'create' | 'edit'

export function KetePostEditor() {
  const { postId: routePostId } = useParams<{ postId?: string }>()
  const navigate = useNavigate()
  const { user, canPostKete, isAdminOrHost } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const mode: Mode = routePostId ? 'edit' : 'create'

  // Pre-allocate a stable doc ID for create mode so uploads have a folder
  const allocatedId = useMemo(
    () => (mode === 'create' ? dbService.allocateKetePostRef().id : null),
    [mode]
  )
  const postId = routePostId || allocatedId!

  const { data: existingPost, isLoading: loadingPost } = useKetePost(
    mode === 'edit' ? routePostId || null : null
  )

  const createPost = useCreateKetePost()
  const updatePost = useUpdateKetePost()

  const form = useForm({
    resolver: zodResolver(keteSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      published: false,
      visibility: 'public' as KeteVisibility,
    },
  })

  // Hydrate the form once the existing post arrives
  useEffect(() => {
    if (mode === 'edit' && existingPost) {
      form.reset({
        title: existingPost.title || '',
        excerpt: existingPost.excerpt || '',
        content: existingPost.content || '',
        featuredImage: existingPost.featuredImage || '',
        published: existingPost.published ?? false,
        visibility: existingPost.visibility ?? 'public',
      })
    }
  }, [mode, existingPost, form])

  // Permission gate
  useEffect(() => {
    if (!user) return
    if (!canPostKete) {
      showToast("You don't have permission to do that.", 'error')
      navigate('/kete', { replace: true })
      return
    }
    if (mode === 'edit' && existingPost) {
      const isAuthor = existingPost.authorId === user.id
      if (!isAuthor && !isAdminOrHost) {
        showToast("You don't have permission to edit this post.", 'error')
        navigate('/kete', { replace: true })
      }
    }
  }, [user, canPostKete, isAdminOrHost, mode, existingPost, navigate, showToast])

  // Edit-mode: post not found
  useEffect(() => {
    if (mode === 'edit' && !loadingPost && !existingPost) {
      showToast('That post no longer exists.', 'error')
      navigate('/kete', { replace: true })
    }
  }, [mode, loadingPost, existingPost, navigate, showToast])

  // Browser unload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [form.formState.isDirty])

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const handleBack = () => {
    if (form.formState.isDirty) setShowDiscardConfirm(true)
    else navigate('/kete')
  }

  const save = async (publish: boolean) => {
    if (!user) return
    const valid = await form.trigger()
    if (!valid) {
      showToast('Please fix the errors before saving.', 'error')
      return
    }
    const data = form.getValues()
    const basePayload = {
      title: data.title.trim(),
      excerpt: data.excerpt?.trim() || '',
      content: data.content,
      featuredImage: data.featuredImage || '',
      published: publish,
      visibility: data.visibility,
    }

    try {
      if (mode === 'create') {
        const newPost: Omit<KetePost, 'id' | 'createdAt' | 'updatedAt'> = {
          ...basePayload,
          authorId: user.id,
          authorName: user.displayName,
          authorPhotoURL: user.photoURL,
          publishedAt: publish ? new Date() : null,
        }
        await dbService.createKetePostWithId(allocatedId!, newPost)
        await queryClient.invalidateQueries({ queryKey: keteKeys.lists() })
        await queryClient.invalidateQueries({ queryKey: [...keteKeys.all, 'myDrafts'] })
        showToast(publish ? 'Post published' : 'Draft saved', 'success')
        navigate(publish ? `/kete/${allocatedId}` : '/kete', { replace: true })
      } else {
        await updatePost.mutateAsync({
          postId: routePostId!,
          updates: {
            ...basePayload,
            // Stamp publishedAt only when transitioning draft → published
            publishedAt:
              publish && !existingPost?.publishedAt ? new Date() : existingPost?.publishedAt,
          },
        })
        showToast(publish ? 'Post updated' : 'Draft saved', 'success')
        navigate(publish ? `/kete/${routePostId}` : '/kete', { replace: true })
      }
      form.reset(form.getValues()) // mark as not dirty
    } catch {
      showToast("Couldn't save. Check your connection and try again.", 'error')
    }
  }

  const isSaving = createPost.isPending || updatePost.isPending

  if (mode === 'edit' && loadingPost) {
    return <Spinner />
  }

  const publishLabel: 'Publish' | 'Update' =
    mode === 'edit' && existingPost?.published ? 'Update' : 'Publish'

  return (
    <>
      <EditorTopBar
        onBack={handleBack}
        onSaveDraft={() => save(false)}
        onPublish={() => save(true)}
        isDirty={form.formState.isDirty}
        isSaving={isSaving}
        publishLabel={publishLabel}
        visibility={form.watch('visibility') ?? 'public'}
        onVisibilityChange={(v) =>
          form.setValue('visibility', v, { shouldDirty: true })
        }
      />

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <FeaturedImageUpload
          postId={postId}
          value={form.watch('featuredImage') || ''}
          onChange={(url) =>
            form.setValue('featuredImage', url, { shouldDirty: true, shouldValidate: true })
          }
        />

        <div>
          <input
            type="text"
            placeholder="Post title"
            className={cn(
              'w-full text-3xl font-display text-forest border-none outline-none bg-transparent placeholder:text-text-lighter',
              form.formState.errors.title && 'placeholder:text-red-400'
            )}
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <span className="text-sm text-red-600 mt-1 block" role="alert">
              {form.formState.errors.title.message}
            </span>
          )}
        </div>

        <div>
          <textarea
            placeholder="Brief excerpt (optional)…"
            rows={2}
            className="w-full text-base italic text-text-light border-none outline-none bg-transparent resize-y placeholder:text-text-lighter"
            {...form.register('excerpt')}
          />
        </div>

        <div>
          <RichTextEditor
            postId={postId}
            value={form.watch('content') || ''}
            onChange={(html) =>
              form.setValue('content', html, { shouldDirty: true, shouldValidate: true })
            }
          />
          {form.formState.errors.content && (
            <span className="text-sm text-red-600 mt-1 block" role="alert">
              {form.formState.errors.content.message}
            </span>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false)
          navigate('/kete')
        }}
        title="Discard changes?"
        message="You have unsaved changes. Leave anyway?"
        confirmLabel="Discard"
        confirmVariant="danger"
      />
    </>
  )
}
