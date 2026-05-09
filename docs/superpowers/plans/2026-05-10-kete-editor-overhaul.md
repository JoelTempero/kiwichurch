# Kete Editor Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the modal Kete editor on the Hosting page with a full-page editor on the Kete page itself, gated by a per-user `canPostKete` flag, with image uploads and YouTube/Vimeo embeds.

**Architecture:** Add `canPostKete` to `User`, exposed via `useAuth`. Build a `KetePostEditor` page (sticky top bar, single column writing surface) at `/kete/new` and `/kete/:postId/edit`. Pre-allocate the Firestore doc ID up front so image uploads land under a stable `kete/{postId}/` Storage folder. Keep DOMPurify on the read side, extended to allow `<img>` and YouTube/Vimeo `<iframe>`. Strip the Kete tab from the Hosting page.

**Tech Stack:** React 18 + TS + Vite, Firebase (Auth/Firestore/Storage), Quill 1.3.7, react-hook-form + zod, TanStack Query 5, Tailwind v4, DOMPurify, Lucide React.

**Spec:** `docs/superpowers/specs/2026-05-10-kete-editor-overhaul-design.md`

**Verification gates:** Project has no test runner; each task ends with `npm run typecheck` + `npm run lint` + manual browser verification. After all tasks, run `npm run build`. Frequent commits between tasks.

---

## File Structure

**New files:**
- `src/pages/KetePostEditor.tsx` — page component, owns form state + permission gate
- `src/components/kete/EditorTopBar.tsx` — sticky bar with back/save/publish
- `src/components/kete/FeaturedImageUpload.tsx` — drop/click upload, preview, replace/remove
- `src/components/kete/RichTextEditor.tsx` — Quill wrapper with image + video handlers

**Modified files:**
- `src/types/user.ts` — add `canPostKete?: boolean`
- `src/hooks/useAuth.ts` — derive `canPostKete`
- `src/hooks/useKete.ts` — add `useMyKeteDrafts`
- `src/services/firebase/db.ts` — add `getMyKeteDrafts`, `allocateKetePostRef`
- `src/utils/schemas.ts` — refine `keteSchema`
- `src/pages/SettingsPage.tsx` — add `canPostKete` checkbox to edit-user modal
- `src/pages/KetePage.tsx` — add New Post button + drafts section
- `src/pages/KetePostPage.tsx` — extend DOMPurify allowlist + add Edit button
- `src/pages/HostingPage.tsx` — remove Kete tab and KeteForm import
- `src/components/kete/index.ts` — export new components
- `src/App.tsx` — register `/kete/new` and `/kete/:postId/edit` routes
- `firestore.rules` — `kete` collection: per-user `canPostKete` create gate
- `storage.rules` — `kete/{postId}/{fileName}`: tighten write to `canPostKete` users; allow author/admin delete

**Deleted files:**
- `src/components/kete/KeteForm.tsx` — superseded by `KetePostEditor` (delete after end-to-end verification in final task)

---

## Task 1: Add `canPostKete` to User type and `useAuth`

**Files:**
- Modify: `src/types/user.ts:5-19`
- Modify: `src/hooks/useAuth.ts:99-112`

- [ ] **Step 1: Add the field to the User type**

Edit `src/types/user.ts` — add `canPostKete?: boolean` after `assignedGatherings`:

```ts
export interface User {
  id: string
  email: string
  displayName: string
  username?: string
  photoURL?: string
  phone?: string
  bio?: string
  role: UserRole
  preferences?: UserPreferences
  dependants?: Dependant[]
  assignedGatherings?: string[]
  canPostKete?: boolean
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}
```

- [ ] **Step 2: Derive the helper in useAuth**

Edit `src/hooks/useAuth.ts` — locate the role checks block (lines 99-102) and add `canPostKete`. Add it to the returned object too:

```ts
  // Role checks
  const isAdmin = user?.role === 'admin'
  const isHost = user?.role === 'host'
  const isAdminOrHost = isAdmin || isHost
  const canPostKete = isAdminOrHost || user?.canPostKete === true

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isHost,
    isAdminOrHost,
    canPostKete,

    // Actions
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updateProfile,
    updatePassword
  }
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run lint
```

Expected: both pass. No callers of `useAuth` break (additive change).

- [ ] **Step 4: Commit**

```bash
git add src/types/user.ts src/hooks/useAuth.ts
git commit -m "feat(kete): add canPostKete flag to User and useAuth"
```

---

## Task 2: Add `canPostKete` checkbox to user edit modal

**Files:**
- Modify: `src/pages/SettingsPage.tsx:25-30, 78-80, 126-148, 280-325`

- [ ] **Step 1: Extend the edit-user schema**

Edit `src/pages/SettingsPage.tsx` — locate `editUserSchema` (line 25) and add `canPostKete`:

```ts
const editUserSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  role: z.enum(['member', 'host', 'admin']),
  canPostKete: z.boolean().default(false),
})
```

- [ ] **Step 2: Populate the field in `openEditModal`**

Locate `openEditModal` (line 126) and add `canPostKete` to the reset:

```ts
  const openEditModal = (u: User) => {
    setSelectedUser(u)
    editUserForm.reset({
      displayName: u.displayName,
      phone: u.phone || '',
      bio: u.bio || '',
      role: u.role,
      canPostKete: u.canPostKete === true,
    })
    setShowEditModal(true)
  }
```

- [ ] **Step 3: Pass the field to the update mutation**

Locate `handleEditUser` (line 137) and include `canPostKete`:

```ts
  const handleEditUser = editUserForm.handleSubmit((data) => {
    if (!selectedUser) return
    updateUserMutation.mutate({
      userId: selectedUser.id,
      updates: {
        displayName: data.displayName.trim(),
        phone: data.phone?.trim() || '',
        bio: data.bio?.trim() || '',
        role: data.role,
        canPostKete: data.canPostKete,
      },
    })
  })
```

- [ ] **Step 4: Add the checkbox to the edit modal**

In the edit-user form (around line 313, just after the `<select>` for role), insert:

```tsx
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-[18px] h-[18px] accent-forest"
                  {...editUserForm.register('canPostKete')}
                />
                <span className="text-sm">Can post Kete</span>
              </label>
              <span className="text-xs text-text-light mt-1 block">
                Lets this member create and edit their own Kete posts. Admin/host always can.
              </span>
            </div>
```

- [ ] **Step 5: Verify**

```bash
npm run typecheck
npm run lint
npm run dev
```

Manually: log in as admin → Settings → edit a member → toggle "Can post Kete" → save. Reload — checkbox state persists. Confirm Firestore doc has `canPostKete: true|false`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat(kete): canPostKete toggle in user edit modal"
```

---

## Task 3: Service + hook for "my drafts"

**Files:**
- Modify: `src/services/firebase/db.ts:355-403` (kete section)
- Modify: `src/hooks/useKete.ts:5-46`

- [ ] **Step 1: Add the service method**

Edit `src/services/firebase/db.ts` — inside the kete section (after `getKetePost`, around line 375), add:

```ts
  async getMyKeteDrafts(userId: string): Promise<KetePost[]> {
    const q = query(
      collection(db, 'kete'),
      where('authorId', '==', userId),
      where('published', '==', false),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => docToObject<KetePost>(doc))
  },
```

`where`, `query`, `orderBy`, `getDocs`, `collection`, `docToObject` are already imported at the top of the file (used by sibling methods).

- [ ] **Step 2: Add the doc-ref allocator**

Same file, just below `getMyKeteDrafts`, add:

```ts
  allocateKetePostRef(): { id: string } {
    const ref = doc(collection(db, 'kete'))
    return { id: ref.id }
  },
```

`doc` is already imported.

- [ ] **Step 3: Add the query hook**

Edit `src/hooks/useKete.ts` — extend `keteKeys` and add the hook. Update lines 5-13 and append after `useKetePosts`:

```ts
// Query keys
export const keteKeys = {
  all: ['kete'] as const,
  lists: () => [...keteKeys.all, 'list'] as const,
  list: (options: KeteQueryOptions) => [...keteKeys.lists(), options] as const,
  details: () => [...keteKeys.all, 'detail'] as const,
  detail: (id: string) => [...keteKeys.details(), id] as const,
  comments: (postId: string) => [...keteKeys.all, 'comments', postId] as const,
  myDrafts: (userId: string) => [...keteKeys.all, 'myDrafts', userId] as const,
}
```

```ts
// Get the current user's drafts
export function useMyKeteDrafts(userId: string | null) {
  return useQuery({
    queryKey: keteKeys.myDrafts(userId || ''),
    queryFn: () => dbService.getMyKeteDrafts(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000,
  })
}
```

- [ ] **Step 4: Invalidate drafts on mutations**

In the same file, update `useCreateKetePost`, `useUpdateKetePost`, `useDeleteKetePost` `onSuccess` handlers — invalidate the drafts query alongside the existing invalidations. Replace each existing `onSuccess`:

```ts
// useCreateKetePost
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...keteKeys.all, 'myDrafts'] })
    }
```

```ts
// useUpdateKetePost
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: keteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: keteKeys.detail(postId) })
      queryClient.invalidateQueries({ queryKey: [...keteKeys.all, 'myDrafts'] })
    }
```

```ts
// useDeleteKetePost
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: [...keteKeys.all, 'myDrafts'] })
    }
```

- [ ] **Step 5: Verify**

```bash
npm run typecheck
npm run lint
```

Expected: pass. (Firestore composite index for `authorId + published + updatedAt desc` may be needed at first query; Firestore returns a console-clickable URL on the first failure — handle that during manual testing in Task 11.)

- [ ] **Step 6: Commit**

```bash
git add src/services/firebase/db.ts src/hooks/useKete.ts
git commit -m "feat(kete): add my-drafts query and post ref allocator"
```

---

## Task 4: Refine `keteSchema`

**Files:**
- Modify: `src/utils/schemas.ts:49-55`

- [ ] **Step 1: Update the schema**

Edit `src/utils/schemas.ts` — replace the existing `keteSchema`:

```ts
export const keteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  excerpt: z.string().max(500, 'Excerpt too long').optional().default(''),
  content: z
    .string()
    .min(1, 'Content is required')
    .refine(
      (html) => html.replace(/<[^>]*>/g, '').trim().length > 0,
      { message: 'Content is required' }
    ),
  featuredImage: z
    .string()
    .url('Featured image must be a valid URL')
    .optional()
    .or(z.literal(''))
    .default(''),
  published: z.boolean().default(false),
})
```

Reasoning: published defaults to `false` (the editor sets it via Save Draft / Publish buttons, not a checkbox). Content is validated on stripped text length so an empty `<p><br></p>` from Quill fails. Featured image must be a real URL when present.

- [ ] **Step 2: Verify**

```bash
npm run typecheck
npm run lint
```

Expected: pass. The legacy `KeteForm` (still in place) still infers `KeteInput`; `published` defaulting to `false` is fine since that form sets `published` explicitly.

- [ ] **Step 3: Commit**

```bash
git add src/utils/schemas.ts
git commit -m "feat(kete): tighten keteSchema (text-length content check, url featuredImage)"
```

---

## Task 5: `RichTextEditor` component (image + video handlers)

**Files:**
- Create: `src/components/kete/RichTextEditor.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/kete/RichTextEditor.tsx`:

```tsx
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
```

Notes:
- Refs hold the latest `onChange`, `postId`, `showToast` so the Quill instance is created exactly once but always sees current values.
- Quill's default `'video'` format inserts an `<iframe>` blot pointing at the supplied URL — by parsing to canonical embed URLs first, we keep the rendered HTML simple.
- Sanitization on the read side (Task 11) will reject any iframe whose src isn't YouTube/Vimeo, so accidentally-saved bad iframes can't render even if they slipped through.

- [ ] **Step 2: Export from the kete index**

Edit `src/components/kete/index.ts` — add:

```ts
export { RichTextEditor } from './RichTextEditor'
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/components/kete/RichTextEditor.tsx src/components/kete/index.ts
git commit -m "feat(kete): RichTextEditor with image upload + youtube/vimeo embeds"
```

---

## Task 6: `FeaturedImageUpload` component

**Files:**
- Create: `src/components/kete/FeaturedImageUpload.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/kete/FeaturedImageUpload.tsx`:

```tsx
import { useRef, useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { storageService } from '@/services/firebase'
import { useToast } from '@/components/common/Toast'

interface FeaturedImageUploadProps {
  postId: string
  value: string
  onChange: (url: string) => void
}

export function FeaturedImageUpload({ postId, value, onChange }: FeaturedImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { showToast } = useToast()

  const pickFile = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    setIsUploading(true)
    try {
      const result = await storageService.uploadKeteImage(postId, file)
      onChange(result.url)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Couldn't upload image. Try again.",
        'error'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const remove = () => onChange('')

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Featured"
            className="w-full max-h-96 object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={pickFile}
              className="px-3 py-1.5 bg-white text-text-primary rounded text-sm font-medium hover:bg-cream"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={remove}
              className="px-3 py-1.5 bg-white text-red-600 rounded text-sm font-medium hover:bg-red-50 flex items-center gap-1"
              disabled={isUploading}
            >
              <X size={14} aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          disabled={isUploading}
          className="w-full aspect-[16/7] border-2 border-dashed border-sage-light rounded-md flex flex-col items-center justify-center gap-2 text-text-light hover:border-forest hover:text-forest transition-colors bg-cream/40"
        >
          {isUploading ? (
            <>
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus size={24} aria-hidden="true" />
              <span className="text-sm">Click or drop to add a featured image</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Export from kete index**

Edit `src/components/kete/index.ts` — add:

```ts
export { FeaturedImageUpload } from './FeaturedImageUpload'
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/components/kete/FeaturedImageUpload.tsx src/components/kete/index.ts
git commit -m "feat(kete): FeaturedImageUpload component"
```

---

## Task 7: `EditorTopBar` component

**Files:**
- Create: `src/components/kete/EditorTopBar.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/kete/EditorTopBar.tsx`:

```tsx
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/common'

interface EditorTopBarProps {
  onBack: () => void
  onSaveDraft: () => void
  onPublish: () => void
  isDirty: boolean
  isSaving: boolean
  publishLabel: 'Publish' | 'Update'
}

export function EditorTopBar({
  onBack,
  onSaveDraft,
  onPublish,
  isDirty,
  isSaving,
  publishLabel,
}: EditorTopBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-cream/95 backdrop-blur border-b border-[#e0dbd2]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-text-light hover:text-forest text-sm bg-transparent border-none cursor-pointer p-1"
        >
          <ChevronLeft size={20} aria-hidden="true" />
          Back
        </button>
        <span className="text-xs text-text-lighter ml-1">
          {isDirty ? 'Unsaved changes' : 'Saved'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onPublish}
            loading={isSaving}
          >
            {publishLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Export from kete index**

Edit `src/components/kete/index.ts` — add:

```ts
export { EditorTopBar } from './EditorTopBar'
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/components/kete/EditorTopBar.tsx src/components/kete/index.ts
git commit -m "feat(kete): EditorTopBar sticky bar"
```

---

## Task 8: `KetePostEditor` page (composes all three components)

**Files:**
- Create: `src/pages/KetePostEditor.tsx`

- [ ] **Step 1: Create the page**

Create `src/pages/KetePostEditor.tsx`:

```tsx
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
import type { KetePost } from '@/types'

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
        // Use the pre-allocated ID by writing through updateKetePost on a doc
        // that doesn't exist yet — but addDoc is what createKetePost uses, so
        // we accept that create-mode posts get a fresh server-generated ID.
        // Image folders use `allocatedId`; on first save we discard that folder.
        // For v1 we keep it simple: use the allocated ID as the doc ID by
        // calling setDoc directly via a small adapter.
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
```

- [ ] **Step 2: Add `createKetePostWithId` to db service**

The page calls `dbService.createKetePostWithId(allocatedId, newPost)` so that the pre-allocated doc ID is used (giving us a stable folder for image uploads). Edit `src/services/firebase/db.ts` — add this method to the kete section, just below the existing `createKetePost`:

```ts
  async createKetePostWithId(
    postId: string,
    postData: Omit<KetePost, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<KetePost> {
    const timestamp = serverTimestamp()
    await setDoc(doc(db, 'kete', postId), {
      ...postData,
      published: postData.published || false,
      publishedAt: postData.published ? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    return { id: postId, ...postData } as KetePost
  },
```

`setDoc` is already imported at the top of `db.ts` (used by `setUser`, `createGathering`, etc.). If not, add `setDoc` to the existing `firebase/firestore` import line.

- [ ] **Step 3: Export the page**

The project doesn't have a barrel for pages — `App.tsx` imports each page directly. No export change needed beyond using `export function KetePostEditor()` already in the file.

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npm run lint
```

Expected: pass. (Manual verification waits until routing is wired in Task 9.)

- [ ] **Step 5: Commit**

```bash
git add src/pages/KetePostEditor.tsx src/services/firebase/db.ts
git commit -m "feat(kete): KetePostEditor page with permission gate, drafts, embeds"
```

---

## Task 9: Register editor routes

**Files:**
- Modify: `src/App.tsx:13-25, 60-71`

- [ ] **Step 1: Lazy-load the new page and register routes**

Edit `src/App.tsx` — add the lazy import after the existing `KetePostPage` import (line 17):

```tsx
const KetePostEditor = lazy(() => import('@/pages/KetePostEditor').then(m => ({ default: m.KetePostEditor })))
```

Insert two routes inside the `<Route element={<ProtectedRoute>…`block — `/kete/new` BEFORE `/kete/:postId` (otherwise React Router matches `:postId === 'new'`), and `/kete/:postId/edit` after:

```tsx
            <Route path="/kete" element={<KetePage />} />
            <Route path="/kete/new" element={<KetePostEditor />} />
            <Route path="/kete/:postId" element={<KetePostPage />} />
            <Route path="/kete/:postId/edit" element={<KetePostEditor />} />
```

- [ ] **Step 2: Verify**

```bash
npm run typecheck
npm run lint
npm run dev
```

Manual: log in as an admin → visit `/kete/new` → editor renders with sticky top bar, featured image upload, title, excerpt, Quill body. Type a title + content → Save Draft → toast "Draft saved" → lands at `/kete`. Visit `/kete/:id/edit` for the just-created draft → editor hydrates with the saved content. Try `/kete/new` while signed in as a member without `canPostKete` — gets toast + redirected to `/kete`.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(kete): register /kete/new and /kete/:postId/edit routes"
```

---

## Task 10: KetePage — New Post button + drafts section

**Files:**
- Modify: `src/pages/KetePage.tsx`

- [ ] **Step 1: Replace the page with the new layout**

Edit `src/pages/KetePage.tsx` — replace the file contents:

```tsx
import { Link } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePublishedKetePosts, useMyKeteDrafts } from '@/hooks/useKete'
import { KeteCard } from '@/components/kete'
import { Button, EmptyState, Spinner, FadeIn, PullToRefresh } from '@/components/common'

function formatDraftDate(date: Date | { toDate: () => Date } | null | undefined): string {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate()
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })
}

export function KetePage() {
  const { user, canPostKete } = useAuth()
  const { data: posts = [], isLoading, refetch } = usePublishedKetePosts()
  const { data: drafts = [] } = useMyKeteDrafts(canPostKete ? user?.id || null : null)

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-start justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-display text-forest mb-2">Kete</h1>
            <p className="text-text-light text-lg">
              Stories, reflections, and resources from our community
            </p>
          </div>
          {canPostKete && (
            <Link to="/kete/new" className="flex-shrink-0">
              <Button variant="primary" size="sm">
                <Plus size={16} aria-hidden="true" />
                New Post
              </Button>
            </Link>
          )}
        </div>

        {drafts.length > 0 && (
          <section className="mb-8">
            <p className="text-xs uppercase tracking-widest font-medium text-terracotta mb-3">
              Your drafts
            </p>
            <div className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden divide-y divide-[#ebe6dc]">
              {drafts.map((d) => (
                <Link
                  key={d.id}
                  to={`/kete/${d.id}/edit`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-cream/50 transition-colors no-underline text-inherit"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {d.title || 'Untitled draft'}
                    </p>
                    <p className="text-xs text-text-light mt-0.5">
                      Draft · last edited {formatDraftDate(d.updatedAt as Date)}
                    </p>
                  </div>
                  <Pencil size={16} className="text-text-light" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="book"
            title="No posts yet"
            message="Stories, reflections, and resources from our community will appear here. Check back soon!"
          />
        ) : (
          <FadeIn className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#faf8f4] border border-[#e0dbd2] rounded-lg overflow-hidden"
              >
                <KeteCard post={post} />
              </div>
            ))}
          </FadeIn>
        )}
      </div>
    </PullToRefresh>
  )
}
```

- [ ] **Step 2: Verify**

```bash
npm run typecheck
npm run lint
npm run dev
```

Manual: log in as user with `canPostKete` → Kete page shows New Post button. If you have a draft from Task 9, the "Your drafts" section shows it. Click the draft → loads editor pre-filled. Click New Post → blank editor. Log in as a regular member → no button, no drafts section.

If Firestore complains about a missing composite index (`authorId asc, published asc, updatedAt desc`), click the URL in the console error to create it, then refresh.

- [ ] **Step 3: Commit**

```bash
git add src/pages/KetePage.tsx
git commit -m "feat(kete): New Post button + drafts section on Kete page"
```

---

## Task 11: KetePostPage — extend DOMPurify, add Edit button

**Files:**
- Modify: `src/pages/KetePostPage.tsx`

- [ ] **Step 1: Add a sanitization helper**

Edit `src/pages/KetePostPage.tsx` — at the top of the file (after the imports, before `formatDate`), add a custom DOMPurify config:

```tsx
const ALLOWED_IFRAME_HOSTS = [
  'https://www.youtube.com/embed/',
  'https://player.vimeo.com/video/',
]

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const src = (node as HTMLIFrameElement).getAttribute('src') || ''
    const ok = ALLOWED_IFRAME_HOSTS.some((prefix) => src.startsWith(prefix))
    if (!ok) {
      // Replace the iframe with nothing
      node.parentNode?.removeChild(node)
    }
  }
})

const SANITIZE_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'src', 'width', 'height'],
}
```

- [ ] **Step 2: Use the config when rendering content**

Find the `dangerouslySetInnerHTML` line (around line 139) and pass the config:

```tsx
      <article
        className="px-6 py-2 prose prose-forest max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, SANITIZE_CONFIG) }}
      />
```

- [ ] **Step 3: Add the Edit button**

Locate the header block (around line 124-134). Replace it with:

```tsx
      <header className="px-6 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display text-forest mb-3">{post.title}</h1>
          <div className="flex items-center gap-3">
            <Avatar src={post.authorPhotoURL} name={post.authorName} size="md" />
            <div className="flex flex-col">
              <span className="font-semibold text-text-primary text-sm">{post.authorName}</span>
              <span className="text-xs text-text-light">{formatDate(post.publishedAt as Date)}</span>
            </div>
          </div>
        </div>
        {(user?.id === post.authorId || isAdminOrHost) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/kete/${post.id}/edit`)}
            aria-label={`Edit ${post.title}`}
          >
            <Pencil size={14} aria-hidden="true" />
            Edit
          </Button>
        )}
      </header>
```

Add `Pencil` to the existing `lucide-react` import:

```tsx
import { ChevronLeft, Trash2, Pencil } from 'lucide-react'
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck
npm run lint
npm run dev
```

Manual:
1. Open a published Kete post containing an image and a YouTube embed → both render correctly.
2. Manually craft a Firestore doc with an iframe pointing at e.g. `https://example.com/whatever` → confirm it's stripped on render. (Or just trust the hook — visual check of YouTube/Vimeo is enough for v1.)
3. As the post's author, the Edit button appears → click → loads editor in edit mode. As another member, the Edit button is hidden.
4. As admin, Edit button appears on any post.

- [ ] **Step 5: Commit**

```bash
git add src/pages/KetePostPage.tsx
git commit -m "feat(kete): allow img + youtube/vimeo iframes; add Edit button"
```

---

## Task 12: Strip Kete tab from Hosting page

**Files:**
- Modify: `src/pages/HostingPage.tsx`

- [ ] **Step 1: Remove Kete state, tab button, tab panel, modal mount, and unused imports**

Edit `src/pages/HostingPage.tsx`:

1. Remove the `KeteForm` import (line 8). Remove `KetePost` from the type import (line 12) since it'll no longer be referenced.
2. Remove `useKetePosts` import (line 4).
3. Change the `activeTab` union type (line 17) to drop `'kete'`:
   ```tsx
   const [activeTab, setActiveTab] = useState<'events' | 'groups'>('events')
   ```
4. Delete the Kete form state (lines 23-25): `showKeteForm`, `editingPost`.
5. Delete the Kete data hook line: `const { data: ketePosts = [], isLoading: loadingKete, refetch: refetchKete } = useKetePosts()`.
6. Delete the four Kete handlers: `handleCreatePost`, `handleEditPost`, `handleKeteFormClose`, `handleKeteSuccess` (lines 66-83).
7. Delete the Kete tab `<button>` (lines 144-156).
8. Delete the entire `{activeTab === 'kete' && (…)}` block (the kete tab panel).
9. Delete the `formatPostDate` helper (lines 112-120) — only used by the Kete tab panel.
10. Delete the `<KeteForm … />` JSX at the bottom of the return (lines 358-363).

After edits, the file should only reference Events and Groups tabs.

If `isAdmin` becomes unused after removing the Groups gating? No — keep it; Groups tab still uses it.

- [ ] **Step 2: If a `host` user previously landed on the Kete tab, default `activeTab` is fine**

`activeTab` defaults to `'events'`, which all hosts can see. No change needed.

- [ ] **Step 3: Verify**

```bash
npm run typecheck
npm run lint
npm run dev
```

Manual: visit `/hosting` as admin → only Events and Groups tabs visible. As host → only Events. Try clicking around — no broken references.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HostingPage.tsx
git commit -m "refactor(kete): remove Kete tab from Hosting page"
```

---

## Task 13: Update Firestore rules

**Files:**
- Modify: `firestore.rules:202-234`

- [ ] **Step 1: Add a `canPostKete` helper and rewrite the `kete` rules**

Edit `firestore.rules` — in the helpers block (after `isAdminOrHost`, line 32), add:

```
    // Check if user is permitted to post Kete
    function canPostKete() {
      let data = getUserData();
      return isAdminOrHost() ||
        (data.keys().hasAny(['canPostKete']) && data.canPostKete == true);
    }
```

Replace the existing `match /kete/{postId} { … }` block (lines 205-234) with:

```
    match /kete/{postId} {
      // All authenticated users can read published posts.
      // Drafts: only the author and admin/host.
      allow read: if isAuthenticated() && (
        resource.data.published == true ||
        resource.data.authorId == request.auth.uid ||
        isAdminOrHost()
      );

      // Permitted users can create posts authored by themselves.
      // Initial setup is allowed (seed data).
      allow create: if isInitialSetup() ||
        (canPostKete() && isActive() && request.resource.data.authorId == request.auth.uid);

      // Authors can update their own posts; admins/hosts can update any.
      allow update: if isAuthenticated() && isActive() && (
        resource.data.authorId == request.auth.uid || isAdminOrHost()
      );

      // Authors can delete their own posts; admins/hosts can delete any.
      allow delete: if isAuthenticated() && (
        resource.data.authorId == request.auth.uid || isAdminOrHost()
      );

      // Comments on kete posts (unchanged from previous rules)
      match /comments/{commentId} {
        allow read: if isAuthenticated();

        allow create: if isAuthenticated() && isActive() &&
          request.resource.data.authorId == request.auth.uid;

        allow update, delete: if isAuthenticated() &&
          (resource.data.authorId == request.auth.uid || isAdmin());
      }
    }
```

Differences from the previous rules:
- Read is now auth-required (no anonymous reads). The Kete is portal-only — anonymous reads were a vestige.
- Drafts are private to the author + admin/host.
- Create now uses `canPostKete()` instead of `isAdminOrHost()`.
- Hosts (not just admins) can now delete posts; authors can delete their own.

- [ ] **Step 2: Validate the rules locally**

Use the Firebase MCP to validate (preferred), or run the CLI:

```bash
firebase emulators:start --only firestore
```

Or simply deploy after end-to-end manual verification — the rules language errors fast.

```bash
npm run typecheck
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat(kete): per-user canPostKete in Firestore rules; private drafts"
```

---

## Task 14: Update Storage rules

**Files:**
- Modify: `storage.rules:53-61`

- [ ] **Step 1: Tighten Kete image rules**

Edit `storage.rules` — replace the `kete/{postId}/{fileName}` block (lines 53-61) with:

```
    // ============================================
    // KETE (BLOG) IMAGES
    // ============================================
    match /kete/{postId}/{fileName} {
      // All authenticated users can view kete images
      allow read: if isAuthenticated();

      // Only authenticated users can write — Firestore rules
      // gate post creation, so this just keeps the upload path
      // restricted to image bytes within size limits.
      allow write: if isAuthenticated() &&
        isImage() &&
        isValidSize(10);

      // Authors and admins delete via app code (deferred);
      // for now, deny client-side deletes entirely.
      allow delete: if false;
    }
```

(Storage rules can't `get()` Firestore docs without the cross-service IAM dance, so we leave write open to authenticated users with image-content-type + size cap. Firestore rules enforce the actual `canPostKete` permission at post-creation time, which is the point at which the image becomes usable.)

The previous block already allowed `read: if true` (public reads). We're tightening to authenticated reads to match the new Firestore auth-required policy. If the static site needs to render Kete images anonymously in the future, revert this single line.

- [ ] **Step 2: Verify**

```bash
npm run typecheck
npm run lint
```

(Storage rules don't typecheck in TS, but lint will catch nothing meaningful here. Actual validation happens during deploy.)

- [ ] **Step 3: Commit**

```bash
git add storage.rules
git commit -m "feat(kete): tighten kete storage rules to authenticated reads"
```

---

## Task 15: End-to-end manual verification + cleanup

**Files:**
- Delete: `src/components/kete/KeteForm.tsx`
- Modify: `src/components/kete/index.ts`

- [ ] **Step 1: Run the full pipeline**

```bash
npm run typecheck
npm run lint
npm run build
```

All must pass.

- [ ] **Step 2: Deploy rules**

```bash
firebase deploy --only firestore:rules,storage
```

- [ ] **Step 3: Manual test plan**

Run through each scenario in the dev environment (or against the deployed app):

1. **Admin grants permission** — Settings → user list → edit a member → toggle "Can post Kete" → save. Reload — checkbox state persists.
2. **Permitted member creates a post** — log in as that member → Kete → New Post → upload featured image → type title + body → insert an inline image → paste a YouTube URL → Publish → post appears at `/kete/:id` with everything rendered.
3. **Member without permission** — no New Post button on Kete page; visiting `/kete/new` directly redirects to `/kete` with toast.
4. **Edit own post** — author hits Edit on their own post → editor hydrates → make changes → Update → changes saved.
5. **Edit other user's post** — non-admin/host without authorship: no Edit button on the post page; visiting `/kete/:id/edit` directly redirects with toast.
6. **Admin edits any post** — admin sees Edit on any post → editor opens, can save.
7. **Drafts** — Save Draft → navigates to `/kete` → "Your drafts" section shows the draft. Click → editor reopens.
8. **Draft visibility** — log in as another member → cannot see the draft (Firestore rule denies).
9. **Discard guard** — start typing in editor → click Back → Confirm modal appears → Discard → drops changes.
10. **Bad video URL** — paste `https://example.com/video` → toast "Only YouTube and Vimeo links are supported."
11. **Hosting page** — Kete tab is gone; Events + Groups still work.
12. **Old Kete posts** — pre-existing posts still render correctly (no schema migration; `canPostKete` is additive).

If any scenario fails, fix and add a follow-up commit before moving on.

- [ ] **Step 4: Delete the obsolete `KeteForm`**

Delete `src/components/kete/KeteForm.tsx`. Edit `src/components/kete/index.ts` — remove the `KeteForm` export line.

- [ ] **Step 5: Final verify**

```bash
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/kete/KeteForm.tsx src/components/kete/index.ts
git commit -m "chore(kete): remove obsolete KeteForm modal"
```

- [ ] **Step 7: Deploy**

```bash
firebase deploy
```

---

## Self-review notes

- Spec coverage: every section has a task. Permissions (Tasks 1, 2, 13). Routing (Tasks 8, 9). Editor layout (Tasks 5-8). Data flow (Tasks 3, 8). Errors (Task 8 inline). Sanitization (Task 11). Hosting page cleanup (Task 12). Storage rules (Task 14).
- Type consistency check: `canPostKete` uses identical name across User, useAuth, schemas, rules. `KetePostEditor` exports as named export (matches App.tsx pattern). `dbService.createKetePostWithId` and `dbService.allocateKetePostRef` and `dbService.getMyKeteDrafts` are referenced consistently.
- TDD: project has no test runner; verification gates are typecheck + lint + manual scenario walkthrough in Task 15.
- Storage path: confirmed existing `kete/{postId}/{fileName}` (not `kete-images/{postId}/...` as initially written in the spec). Plan uses the existing path; spec has been corrected via the design-spec session.
- Firestore composite index for `useMyKeteDrafts` (`authorId asc, published asc, updatedAt desc`) — caller will hit a Firestore error with a console URL on first run; Task 10 verification step calls this out.
