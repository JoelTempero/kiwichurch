# Group Files, Post Attachments & URL Embeds — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-group resources library (files + links with tags), image attachments on board posts, and URL embeds (YouTube/Vimeo players, link cards) in post text.

**Architecture:** New `resources` subcollection under each gathering doc. New Storage path for group resource files. Files tab added to GroupDetailPage alongside existing Board tab. URL embeds are client-side detection only (no server-side unfurling). Follows existing patterns: Firestore service methods in `db.ts`, Storage methods in `storage.ts`, TanStack Query hooks, Tailwind + Lucide UI components.

**Tech Stack:** React 18, TypeScript, Firebase (Firestore + Storage), TanStack Query 5, Zustand, Tailwind v4, Lucide React

**Spec:** `docs/superpowers/specs/2026-05-06-group-files-and-attachments.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/types/groupResource.ts` | GroupResource interface |
| Create | `src/utils/urlEmbed.ts` | URL detection, YouTube/Vimeo ID extraction, embed type classification |
| Create | `src/hooks/useGroupResources.ts` | TanStack Query hooks for group resources CRUD |
| Create | `src/components/groups/GroupResourcesList.tsx` | Files tab: search bar, tag filter, resource list |
| Create | `src/components/groups/GroupResourceItem.tsx` | Single resource row (file or link) |
| Create | `src/components/groups/ResourceUploadModal.tsx` | Modal for uploading a file with title/desc/tags |
| Create | `src/components/groups/ResourceLinkModal.tsx` | Modal for adding a link with title/desc/tags |
| Create | `src/components/groups/URLEmbed.tsx` | Renders URL embeds (YouTube player, Vimeo player, link card) |
| Modify | `src/services/firebase/db.ts` | Add group resource CRUD + subscription methods |
| Modify | `src/services/firebase/storage.ts` | Add `uploadGroupResource` method |
| Modify | `src/pages/GroupDetailPage.tsx` | Add Board/Files tab switching, post image attachment UI |
| Modify | `src/components/groups/BoardPost.tsx` | Render URL embeds below post content |
| Modify | `firestore.rules` | Add resources subcollection rules under gatherings |
| Modify | `storage.rules` | Add resources storage path rules |

---

### Task 1: GroupResource Type

**Files:**
- Create: `src/types/groupResource.ts`

- [ ] **Step 1: Create the type file**

```typescript
// src/types/groupResource.ts
import { Timestamp } from 'firebase/firestore'

export interface GroupResource {
  id: string
  gatheringId: string
  type: 'file' | 'link'
  title: string
  description?: string
  tags: string[]
  uploadedBy: string
  uploadedByName: string
  createdAt: Timestamp | Date
  // File-specific
  fileURL?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  storagePath?: string
  thumbnailURL?: string
  // Link-specific
  url?: string
  linkMeta?: {
    siteName?: string
    image?: string
    favicon?: string
  }
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS (no errors from new file)

- [ ] **Step 3: Commit**

```bash
git add src/types/groupResource.ts
git commit -m "feat: add GroupResource type for group files/links"
```

---

### Task 2: Firestore Security Rules

**Files:**
- Modify: `firestore.rules` (inside the `match /gatherings/{gatheringId}` block, after existing subcollections around line 163)

- [ ] **Step 1: Add resources subcollection rules**

Add this block inside the existing `match /gatherings/{gatheringId}` section, after the members/boardPosts subcollections:

```
    // Group resources (files + links)
    match /resources/{resourceId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isActive();
      allow update: if isAuthenticated() && isActive()
        && (resource.data.uploadedBy == request.auth.uid || isAdmin());
      allow delete: if isAuthenticated() && isActive()
        && (resource.data.uploadedBy == request.auth.uid || isAdmin() || isHost());
    }
```

- [ ] **Step 2: Verify rules compile**

Run: `firebase deploy --only firestore:rules --dry-run` or check the Firebase console rules editor.

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat: add Firestore rules for group resources collection"
```

---

### Task 3: Storage Rules

**Files:**
- Modify: `storage.rules` (after the existing gathering images block around line 87, before the messageBoards block around line 92)

- [ ] **Step 1: Add resources storage path rules**

Add this block after the gathering images section:

```
    // Group resources (files uploaded to group library)
    match /gatherings/{gatheringId}/resources/{resourceId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated()
        && isAllowedType()
        && isValidSize(25);
      allow delete: if isAuthenticated();
    }
```

Note: `isAllowedType()` and `isValidSize()` are existing helper functions already defined at the top of `storage.rules`. The delete rule allows any authenticated user — Firestore rules handle the ownership check on the metadata doc.

- [ ] **Step 2: Verify rules compile**

Run: `firebase deploy --only storage --dry-run`

- [ ] **Step 3: Commit**

```bash
git add storage.rules
git commit -m "feat: add Storage rules for group resource files"
```

---

### Task 4: Storage Service — uploadGroupResource

**Files:**
- Modify: `src/services/firebase/storage.ts` (add new method after `uploadBoardAttachment` around line 172)

- [ ] **Step 1: Add uploadGroupResource method**

Add this method to the `storageService` object, after the existing `uploadBoardAttachment` method:

```typescript
async uploadGroupResource(
  gatheringId: string,
  resourceId: string,
  file: File,
  onProgress?: ProgressCallback
): Promise<UploadResult> {
  if (!isValidImage(file) && !isValidDocument(file)) {
    throw new Error('Please upload an image or document (PDF, DOC, XLS, PPT, TXT, CSV)')
  }
  if (!isValidSize(file, 25)) {
    throw new Error('File must be smaller than 25MB')
  }

  const fileName = generateFileName(file.name)
  const path = `gatherings/${gatheringId}/resources/${resourceId}/${fileName}`
  return this.uploadFile(path, file, onProgress)
},
```

Note: `generateFileName`, `isValidImage`, `isValidDocument`, `isValidSize`, `ProgressCallback`, and `UploadResult` are all already defined in this file.

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/firebase/storage.ts
git commit -m "feat: add uploadGroupResource to storage service"
```

---

### Task 5: DB Service — Group Resource CRUD

**Files:**
- Modify: `src/services/firebase/db.ts` (add new methods after the existing board post methods, around line 484)

- [ ] **Step 1: Add imports for GroupResource type**

At the top of `db.ts`, add the import alongside existing type imports:

```typescript
import { GroupResource } from '../../types/groupResource'
```

- [ ] **Step 2: Add group resource CRUD methods**

Add these methods to the `dbService` object:

```typescript
// --- Group Resources ---

async getGroupResources(gatheringId: string): Promise<GroupResource[]> {
  const resourcesRef = collection(db, 'gatherings', gatheringId, 'resources')
  const q = query(resourcesRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupResource))
},

async addGroupResource(
  gatheringId: string,
  data: Omit<GroupResource, 'id' | 'createdAt'>
): Promise<GroupResource> {
  const resourcesRef = collection(db, 'gatherings', gatheringId, 'resources')
  const docRef = await addDoc(resourcesRef, {
    ...data,
    createdAt: serverTimestamp(),
  })
  return { ...data, id: docRef.id, createdAt: new Date() } as GroupResource
},

async updateGroupResource(
  gatheringId: string,
  resourceId: string,
  updates: Partial<Pick<GroupResource, 'title' | 'description' | 'tags'>>
): Promise<void> {
  const docRef = doc(db, 'gatherings', gatheringId, 'resources', resourceId)
  await updateDoc(docRef, updates)
},

async deleteGroupResource(gatheringId: string, resourceId: string): Promise<void> {
  const docRef = doc(db, 'gatherings', gatheringId, 'resources', resourceId)
  await deleteDoc(docRef)
},

subscribeToGroupResources(
  gatheringId: string,
  callback: (resources: GroupResource[]) => void
): Unsubscribe {
  const resourcesRef = collection(db, 'gatherings', gatheringId, 'resources')
  const q = query(resourcesRef, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupResource))
    callback(resources)
  })
},
```

Note: `collection`, `query`, `orderBy`, `getDocs`, `addDoc`, `updateDoc`, `deleteDoc`, `doc`, `serverTimestamp`, `onSnapshot`, and `Unsubscribe` are all already imported in this file. Check existing imports and add any that are missing.

- [ ] **Step 3: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/firebase/db.ts
git commit -m "feat: add group resource CRUD methods to db service"
```

---

### Task 6: useGroupResources Hook

**Files:**
- Create: `src/hooks/useGroupResources.ts`

- [ ] **Step 1: Create the hook file**

Follow the pattern from `src/hooks/useGatherings.ts` — TanStack Query for fetching, mutations for writes. Reference the existing `useBoardPosts` / `useCreateBoardPost` hooks for the exact pattern.

```typescript
// src/hooks/useGroupResources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { dbService } from '../services/firebase/db'
import { storageService } from '../services/firebase/storage'
import type { GroupResource } from '../types/groupResource'

export function useGroupResources(gatheringId: string | undefined) {
  return useQuery({
    queryKey: ['groupResources', gatheringId],
    queryFn: () => dbService.getGroupResources(gatheringId!),
    enabled: !!gatheringId,
  })
}

export function useGroupResourcesSubscription(gatheringId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!gatheringId) return

    const unsubscribe = dbService.subscribeToGroupResources(gatheringId, (resources) => {
      queryClient.setQueryData(['groupResources', gatheringId], resources)
    })

    return () => unsubscribe()
  }, [gatheringId, queryClient])
}

export function useAddGroupResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      data,
      file,
    }: {
      gatheringId: string
      data: Omit<GroupResource, 'id' | 'createdAt' | 'fileURL' | 'fileName' | 'fileSize' | 'fileType'>
      file?: File
    }) => {
      let fileFields = {}

      if (file && data.type === 'file') {
        // Generate a temporary ID for the storage path
        const tempId = crypto.randomUUID()
        const result = await storageService.uploadGroupResource(gatheringId, tempId, file)
        fileFields = {
          fileURL: result.url,
          fileName: result.fileName,
          fileSize: file.size,
          fileType: file.type,
          storagePath: result.path,
        }
      }

      return dbService.addGroupResource(gatheringId, {
        ...data,
        ...fileFields,
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupResources', variables.gatheringId] })
    },
  })
}

export function useUpdateGroupResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      resourceId,
      updates,
    }: {
      gatheringId: string
      resourceId: string
      updates: Partial<Pick<GroupResource, 'title' | 'description' | 'tags'>>
    }) => {
      return dbService.updateGroupResource(gatheringId, resourceId, updates)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupResources', variables.gatheringId] })
    },
  })
}

export function useDeleteGroupResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      gatheringId,
      resourceId,
      storagePath,
    }: {
      gatheringId: string
      resourceId: string
      storagePath?: string
    }) => {
      // Delete storage file if path is stored
      if (storagePath) {
        try {
          await storageService.deleteFile(storagePath)
        } catch (e) {
          console.warn('Could not delete storage file:', e)
        }
      }
      return dbService.deleteGroupResource(gatheringId, resourceId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groupResources', variables.gatheringId] })
    },
  })
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGroupResources.ts
git commit -m "feat: add useGroupResources TanStack Query hooks"
```

---

### Task 7: URL Embed Utility

**Files:**
- Create: `src/utils/urlEmbed.ts`

- [ ] **Step 1: Create the utility file**

```typescript
// src/utils/urlEmbed.ts

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g

export function extractUrls(text: string): string[] {
  return text.match(URL_REGEX) || []
}

export type EmbedType = 'youtube' | 'vimeo' | 'link'

export function getEmbedType(url: string): EmbedType {
  if (getYouTubeId(url)) return 'youtube'
  if (getVimeoId(url)) return 'vimeo'
  return 'link'
}

export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/urlEmbed.ts
git commit -m "feat: add URL embed utility (YouTube, Vimeo, link detection)"
```

---

### Task 8: URLEmbed Component

**Files:**
- Create: `src/components/groups/URLEmbed.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/groups/URLEmbed.tsx
import { ExternalLink } from 'lucide-react'
import { extractUrls, getEmbedType, getYouTubeId, getVimeoId, getDomain } from '../../utils/urlEmbed'

interface URLEmbedProps {
  text: string
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full pt-[56.25%] mt-2 rounded-lg overflow-hidden">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function VimeoEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full pt-[56.25%] mt-2 rounded-lg overflow-hidden">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://player.vimeo.com/video/${videoId}`}
        title="Vimeo video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function LinkCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
    >
      <ExternalLink className="h-4 w-4 shrink-0" />
      <span className="truncate">{getDomain(url)}</span>
    </a>
  )
}

export default function URLEmbed({ text }: URLEmbedProps) {
  const urls = extractUrls(text)
  if (urls.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {urls.map((url, i) => {
        const type = getEmbedType(url)
        if (type === 'youtube') {
          const id = getYouTubeId(url)
          return id ? <YouTubeEmbed key={i} videoId={id} /> : <LinkCard key={i} url={url} />
        }
        if (type === 'vimeo') {
          const id = getVimeoId(url)
          return id ? <VimeoEmbed key={i} videoId={id} /> : <LinkCard key={i} url={url} />
        }
        return <LinkCard key={i} url={url} />
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/groups/URLEmbed.tsx
git commit -m "feat: add URLEmbed component (YouTube, Vimeo, link cards)"
```

---

### Task 9: GroupResourceItem Component

**Files:**
- Create: `src/components/groups/GroupResourceItem.tsx`

- [ ] **Step 1: Create the component**

This renders a single resource row. Look at existing list item patterns in the codebase (e.g. `EventCard`, `GatheringCard`) for styling cues. Use Tailwind + Lucide icons. Follow the flat row style from the portal design revision (no shadow cards).

```tsx
// src/components/groups/GroupResourceItem.tsx
import { FileText, Image, Link2, Download, Trash2, Pencil, File, FileSpreadsheet } from 'lucide-react'
import { formatTimeAgo } from '../../utils/formatTime'
import type { GroupResource } from '../../types/groupResource'

interface GroupResourceItemProps {
  resource: GroupResource
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

function getFileIcon(fileType?: string) {
  if (!fileType) return <File className="h-5 w-5" />
  if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-emerald-600" />
  if (fileType === 'application/pdf') return <FileText className="h-5 w-5 text-red-600" />
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv'))
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />
  return <FileText className="h-5 w-5 text-blue-600" />
}

export default function GroupResourceItem({
  resource,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: GroupResourceItemProps) {
  const isLink = resource.type === 'link'

  return (
    <div className="flex items-start gap-3 border-b border-stone-100 py-3 last:border-b-0">
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {isLink ? (
          <Link2 className="h-5 w-5 text-stone-500" />
        ) : resource.fileType?.startsWith('image/') && resource.fileURL ? (
          <img
            src={resource.fileURL}
            alt=""
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          getFileIcon(resource.fileType)
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {isLink ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1a3a2f] hover:underline"
              >
                {resource.title}
              </a>
            ) : (
              <a
                href={resource.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1a3a2f] hover:underline"
              >
                {resource.title}
              </a>
            )}
            <p className="text-xs text-stone-500">
              {resource.uploadedByName} &middot; {formatTimeAgo(resource.createdAt)}
              {resource.fileSize && ` · ${(resource.fileSize / 1024 / 1024).toFixed(1)}MB`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-1">
            {!isLink && resource.fileURL && (
              <a
                href={resource.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
            {canEdit && (
              <button
                onClick={onEdit}
                className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {resource.description && (
          <p className="mt-1 text-sm text-stone-600">{resource.description}</p>
        )}

        {resource.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/groups/GroupResourceItem.tsx
git commit -m "feat: add GroupResourceItem component"
```

---

### Task 10: ResourceUploadModal Component

**Files:**
- Create: `src/components/groups/ResourceUploadModal.tsx`

- [ ] **Step 1: Create the modal component**

Follow the pattern from existing modals in the codebase (e.g. `ConfirmModal`, `ReportModal`). Use `react-hook-form` + `zod` for form validation (matching the project's form convention in `src/utils/schemas.ts`). Use the existing `Modal` component from `src/components/common/Modal.tsx`.

```tsx
// src/components/groups/ResourceUploadModal.tsx
import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import Modal from '../common/Modal'
import { isValidImage, isValidDocument, isValidSize } from '../../services/firebase/storage'

interface ResourceUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; tags: string[]; file: File }) => void
  isLoading?: boolean
}

export default function ResourceUploadModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ResourceUploadModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setTitle('')
    setDescription('')
    setTagsInput('')
    setFile(null)
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!isValidImage(selected) && !isValidDocument(selected)) {
      setError('Please upload an image or document (PDF, DOC, XLS, PPT, TXT, CSV)')
      return
    }
    if (!isValidSize(selected, 25)) {
      setError('File must be smaller than 25MB')
      return
    }

    setError('')
    setFile(selected)
    if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ''))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    onSubmit({ title: title.trim(), description: description.trim(), tags, file })
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload File">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* File picker */}
        <div>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-stone-300 px-4 py-6 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-600 transition-colors"
          >
            <Upload className="h-5 w-5" />
            {file ? file.name : 'Choose a file'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
        />

        {/* Tags */}
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (comma-separated, e.g. worship, minutes)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
        />

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !file}
            className="rounded-lg bg-[#1a3a2f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90 disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
```

Note: `isValidImage`, `isValidDocument`, and `isValidSize` are already exported from the storage service — check the exact export pattern and adjust the import if they're methods on `storageService` rather than standalone exports.

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/groups/ResourceUploadModal.tsx
git commit -m "feat: add ResourceUploadModal component"
```

---

### Task 11: ResourceLinkModal Component

**Files:**
- Create: `src/components/groups/ResourceLinkModal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
// src/components/groups/ResourceLinkModal.tsx
import { useState } from 'react'
import Modal from '../common/Modal'

interface ResourceLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description: string; tags: string[]; url: string }) => void
  isLoading?: boolean
}

export default function ResourceLinkModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ResourceLinkModalProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [error, setError] = useState('')

  const reset = () => {
    setUrl('')
    setTitle('')
    setDescription('')
    setTagsInput('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }
    try {
      new URL(url.trim())
    } catch {
      setError('Please enter a valid URL')
      return
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    onSubmit({
      title: title.trim() || url.trim(),
      description: description.trim(),
      tags,
      url: url.trim(),
    })
    handleClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* URL */}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          required
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional — defaults to URL)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
        />

        {/* Tags */}
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (comma-separated, e.g. worship, video)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
        />

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-[#1a3a2f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Add Link'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/groups/ResourceLinkModal.tsx
git commit -m "feat: add ResourceLinkModal component"
```

---

### Task 12: GroupResourcesList Component

**Files:**
- Create: `src/components/groups/GroupResourcesList.tsx`

- [ ] **Step 1: Create the component**

This is the main Files tab content. It wires together the search bar, tag filter, resource list, and modals.

```tsx
// src/components/groups/GroupResourcesList.tsx
import { useState, useMemo } from 'react'
import { Search, Upload, Link2, FolderOpen } from 'lucide-react'
import { useGroupResources, useGroupResourcesSubscription, useAddGroupResource, useDeleteGroupResource } from '../../hooks/useGroupResources'
import { useAuthStore } from '../../store/authStore'
import GroupResourceItem from './GroupResourceItem'
import ResourceUploadModal from './ResourceUploadModal'
import ResourceLinkModal from './ResourceLinkModal'
import Modal from '../common/Modal'
import ConfirmModal from '../common/ConfirmModal'
import { useToast } from '../../hooks/useToast'
import type { GroupResource } from '../../types/groupResource'

interface GroupResourcesListProps {
  gatheringId: string
  isAdminOrHost: boolean
}

export default function GroupResourcesList({ gatheringId, isAdminOrHost }: GroupResourcesListProps) {
  const { user } = useAuthStore()
  const { data: resources = [], isLoading } = useGroupResources(gatheringId)
  useGroupResourcesSubscription(gatheringId)
  const addResource = useAddGroupResource()
  const deleteResource = useDeleteGroupResource()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GroupResource | null>(null)
  const [editTarget, setEditTarget] = useState<GroupResource | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState('')
  const updateResource = useUpdateGroupResource()

  // Collect all unique tags from resources
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    resources.forEach((r) => r.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [resources])

  // Filter resources by search + tag
  const filtered = useMemo(() => {
    let result = resources
    if (selectedTag) {
      result = result.filter((r) => r.tags.includes(selectedTag))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.fileName?.toLowerCase().includes(q)
      )
    }
    return result
  }, [resources, selectedTag, searchQuery])

  const handleUpload = async (data: { title: string; description: string; tags: string[]; file: File }) => {
    if (!user) return
    try {
      await addResource.mutateAsync({
        gatheringId,
        data: {
          gatheringId,
          type: 'file',
          title: data.title,
          description: data.description || undefined,
          tags: data.tags,
          uploadedBy: user.id,
          uploadedByName: user.displayName || 'Unknown',
        },
        file: data.file,
      })
      showToast('File uploaded', 'success')
    } catch (e) {
      showToast('Failed to upload file', 'error')
      console.error(e)
    }
  }

  const handleAddLink = async (data: { title: string; description: string; tags: string[]; url: string }) => {
    if (!user) return
    try {
      await addResource.mutateAsync({
        gatheringId,
        data: {
          gatheringId,
          type: 'link',
          title: data.title,
          description: data.description || undefined,
          tags: data.tags,
          uploadedBy: user.id,
          uploadedByName: user.displayName || 'Unknown',
          url: data.url,
        },
      })
      showToast('Link added', 'success')
    } catch (e) {
      showToast('Failed to add link', 'error')
      console.error(e)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteResource.mutateAsync({
        gatheringId,
        resourceId: deleteTarget.id,
        storagePath: deleteTarget.storagePath,
      })
      showToast('Resource deleted', 'success')
    } catch (e) {
      showToast('Failed to delete resource', 'error')
      console.error(e)
    }
    setDeleteTarget(null)
  }

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-stone-500">Loading files...</div>
  }

  return (
    <div>
      {/* Actions bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#1a3a2f] px-3 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90"
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <button
          onClick={() => setShowLinkModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          <Link2 className="h-4 w-4" />
          Add Link
        </button>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedTag === null
                ? 'bg-[#1a3a2f] text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-[#1a3a2f] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Resource list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-stone-400">
          <FolderOpen className="h-10 w-10" />
          <p className="text-sm">
            {resources.length === 0 ? 'No files shared yet' : 'No files match your search'}
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((resource) => (
            <GroupResourceItem
              key={resource.id}
              resource={resource}
              canEdit={user?.id === resource.uploadedBy || isAdminOrHost}
              canDelete={user?.id === resource.uploadedBy || isAdminOrHost}
              onEdit={() => {
                setEditTarget(resource)
                setEditTitle(resource.title)
                setEditDescription(resource.description || '')
                setEditTags(resource.tags.join(', '))
              }}
              onDelete={() => setDeleteTarget(resource)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ResourceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUpload}
        isLoading={addResource.isPending}
      />
      <ResourceLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSubmit={handleAddLink}
        isLoading={addResource.isPending}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Edit modal — reuses Modal component for inline title/desc/tags editing */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Resource">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!editTarget) return
            try {
              await updateResource.mutateAsync({
                gatheringId,
                resourceId: editTarget.id,
                updates: {
                  title: editTitle.trim(),
                  description: editDescription.trim() || undefined,
                  tags: editTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
                },
              })
              showToast('Resource updated', 'success')
              setEditTarget(null)
            } catch {
              showToast('Failed to update resource', 'error')
            }
          }}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Title"
            required
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
          <input
            type="text"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-[#1a3a2f] focus:outline-none focus:ring-1 focus:ring-[#1a3a2f]"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditTarget(null)} className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">Cancel</button>
            <button type="submit" disabled={updateResource.isPending} className="rounded-lg bg-[#1a3a2f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a3a2f]/90 disabled:opacity-50">
              {updateResource.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
```

Note: Check the exact import path for `ConfirmModal` and `useToast` — look at how other components import them. The `useAuthStore` import matches the Zustand store pattern.

- [ ] **Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/groups/GroupResourcesList.tsx
git commit -m "feat: add GroupResourcesList component (search, tags, file list)"
```

---

### Task 13: GroupDetailPage — Add Board/Files Tabs

**Files:**
- Modify: `src/pages/GroupDetailPage.tsx`

- [ ] **Step 1: Add imports and state**

Add these imports at the top of `GroupDetailPage.tsx`:

```typescript
import GroupResourcesList from '../components/groups/GroupResourcesList'
```

Add a tab state variable alongside the existing state (around line 26-32):

```typescript
const [activeTab, setActiveTab] = useState<'board' | 'files'>('board')
```

- [ ] **Step 2: Add tab switcher UI**

Find where the board content section begins (around line 202, look for the section that contains the post creation form and posts list). Add a tab bar above the existing board content:

```tsx
{/* Tab switcher */}
<div className="mb-4 flex border-b border-stone-200">
  <button
    onClick={() => setActiveTab('board')}
    className={`px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === 'board'
        ? 'border-b-2 border-[#1a3a2f] text-[#1a3a2f]'
        : 'text-stone-500 hover:text-stone-700'
    }`}
  >
    Board
  </button>
  <button
    onClick={() => setActiveTab('files')}
    className={`px-4 py-2 text-sm font-medium transition-colors ${
      activeTab === 'files'
        ? 'border-b-2 border-[#1a3a2f] text-[#1a3a2f]'
        : 'text-stone-500 hover:text-stone-700'
    }`}
  >
    Files
  </button>
</div>
```

- [ ] **Step 3: Wrap existing board content in tab condition**

Wrap the existing message board section (post form + posts list) in:

```tsx
{activeTab === 'board' && (
  // ... existing board content (form + posts)
)}

{activeTab === 'files' && (
  <GroupResourcesList
    gatheringId={gathering.id}
    isAdminOrHost={isAdminOrHost}
  />
)}
```

Check how `isAdminOrHost` is derived in this component — it's likely from `useAuthStore` or passed via hooks. Pass the same value to `GroupResourcesList`.

- [ ] **Step 4: Verify types compile and test in browser**

Run: `npm run typecheck`
Then: `npm run dev` and navigate to a group page. Verify:
- Two tabs appear (Board / Files)
- Board tab shows existing message board
- Files tab shows empty state with search bar and Upload/Add Link buttons
- Upload modal opens and closes
- Link modal opens and closes

- [ ] **Step 5: Commit**

```bash
git add src/pages/GroupDetailPage.tsx
git commit -m "feat: add Board/Files tabs to GroupDetailPage"
```

---

### Task 14: Post Image Attachments

**Files:**
- Modify: `src/pages/GroupDetailPage.tsx` (the post creation form section, around lines 208-298)

- [ ] **Step 1: Add image attachment state and handler**

Add state variables for the image attachment:

```typescript
const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
const attachmentRef = useRef<HTMLInputElement>(null)
```

Add a handler for selecting an image:

```typescript
const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showToast('Only images can be attached to posts', 'error')
    return
  }
  setAttachmentFile(file)
  setAttachmentPreview(URL.createObjectURL(file))
}

const clearAttachment = () => {
  setAttachmentFile(null)
  if (attachmentPreview) URL.revokeObjectURL(attachmentPreview)
  setAttachmentPreview(null)
  if (attachmentRef.current) attachmentRef.current.value = ''
}
```

Add `useRef` to the React imports if not already there. Import `Image, X` from `lucide-react` if not already imported.

- [ ] **Step 2: Update handleCreatePost to upload image**

Find the existing `handleCreatePost` function (around line 80-125). Modify it to upload the attachment before creating the post:

```typescript
// Inside handleCreatePost, before the createBoardPost call:
let attachmentURL: string | undefined
let attachmentType: string | undefined
let attachmentName: string | undefined

if (attachmentFile) {
  const tempId = crypto.randomUUID()
  const result = await storageService.uploadBoardAttachment(gathering.id, tempId, attachmentFile)
  attachmentURL = result.url
  attachmentType = attachmentFile.type
  attachmentName = attachmentFile.name
}

// Then include in the post data:
// attachmentURL, attachmentType, attachmentName
```

Import `storageService` at the top:
```typescript
import { storageService } from '../services/firebase/storage'
```

After successful post creation, call `clearAttachment()`.

- [ ] **Step 3: Add image button and preview to the form JSX**

In the post creation form, add a hidden file input and an image button next to the submit button:

```tsx
{/* Hidden file input */}
<input
  ref={attachmentRef}
  type="file"
  accept="image/*"
  onChange={handleAttachmentChange}
  className="hidden"
/>

{/* Image preview */}
{attachmentPreview && (
  <div className="relative mt-2 inline-block">
    <img src={attachmentPreview} alt="Preview" className="h-20 rounded-lg object-cover" />
    <button
      type="button"
      onClick={clearAttachment}
      className="absolute -right-1 -top-1 rounded-full bg-stone-800 p-0.5 text-white hover:bg-stone-700"
    >
      <X className="h-3 w-3" />
    </button>
  </div>
)}
```

Add an image button in the buttons row (near the submit button):

```tsx
<button
  type="button"
  onClick={() => attachmentRef.current?.click()}
  className="rounded p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
  title="Attach image"
>
  <Image className="h-5 w-5" />
</button>
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev` and navigate to a group's board tab. Verify:
- Image button appears in post form
- Clicking opens file picker (images only)
- Preview shows below the textarea
- X button clears the preview
- Submitting a post with image uploads and displays the image in the post

- [ ] **Step 5: Commit**

```bash
git add src/pages/GroupDetailPage.tsx
git commit -m "feat: add image attachment support to board posts"
```

---

### Task 15: URL Embeds in BoardPost

**Files:**
- Modify: `src/components/groups/BoardPost.tsx`

- [ ] **Step 1: Import URLEmbed and add to post rendering**

Add the import:

```typescript
import URLEmbed from './URLEmbed'
```

Find where the post content text is rendered (look for the section that displays `post.content`). Add the URLEmbed component immediately after the content text:

```tsx
{/* Post content */}
<p>...</p>

{/* URL embeds */}
<URLEmbed text={post.content} />
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. Create a post containing a YouTube URL (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`). Verify:
- YouTube embed renders as a responsive video player below the post text
- Regular URLs render as link cards with the domain name
- Posts without URLs render normally (no extra whitespace)

- [ ] **Step 3: Commit**

```bash
git add src/components/groups/BoardPost.tsx
git commit -m "feat: add URL embeds to board posts (YouTube, Vimeo, link cards)"
```

---

### Task 16: Admin Deletion Verification

**Files:**
- Possibly modify: `src/pages/KetePostPage.tsx` or `src/components/kete/` (only if fix needed)

- [ ] **Step 1: Check Kete post deletion UI for admin**

Read the KetePostPage component and search for the delete button/logic. Verify that admin users see a delete button on posts they didn't author. Check:
- Is there a `canDelete` check that includes admin role?
- Does the Firestore rule for kete posts allow admin deletion?

If admin CAN delete via rules but the UI doesn't show the button, add the `isAdminOrHost` check to the delete button visibility.

- [ ] **Step 2: Test in browser if changes were made**

If you modified the UI, run `npm run dev` and verify an admin account sees the delete option on other users' kete posts.

- [ ] **Step 3: Commit (only if changes were made)**

```bash
git add src/pages/KetePostPage.tsx  # or whichever file was changed
git commit -m "fix: show delete button on kete posts for admins"
```

---

### Task 17: Final Build Verification

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS with no errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: PASS — clean build with no errors

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS or only pre-existing warnings

- [ ] **Step 4: Test the full flow in browser**

Run: `npm run dev` and test:
1. Navigate to a group → see Board/Files tabs
2. Files tab: upload a file → appears in list with correct icon
3. Files tab: add a link → appears in list with link icon
4. Files tab: add tags → tag filter pills appear, filtering works
5. Files tab: search → filters by title
6. Files tab: delete a resource → confirm modal → removed
7. Board tab: attach image to a post → preview shows → post displays image
8. Board tab: post a YouTube URL → embed player renders
9. Board tab: post a regular URL → link card renders

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: address any issues found during testing"
```
