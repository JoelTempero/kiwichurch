# Group Files, Post Attachments & URL Embeds

## Overview

Add a group resources library (files + links), image attachments on board posts, and URL embeds in post text. Addresses the client brief requirements for file storage in groups and media sharing.

DM attachments are out of scope — text-only for now.

## 1. Group Resources Library

### Data Model

**Firestore path:** `gatherings/{gatheringId}/resources/{resourceId}`

**Storage path:** `gatherings/{gatheringId}/resources/{resourceId}/{filename}`

```typescript
interface GroupResource {
  id: string
  gatheringId: string
  type: 'file' | 'link'
  title: string
  description?: string
  tags: string[]
  uploadedBy: string
  uploadedByName: string
  createdAt: Timestamp
  // File-specific
  fileURL?: string
  fileName?: string
  fileSize?: number
  fileType?: string
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

Tags are freeform string arrays on each resource doc. No separate tags collection — the UI shows "used tags" derived from existing resources for filtering.

### Security Rules

**Firestore:**

```
match /gatherings/{gatheringId}/resources/{resourceId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && isActive();
  allow update: if isAuthenticated() && isActive()
    && (resource.data.uploadedBy == request.auth.uid || isAdmin());
  allow delete: if isAuthenticated() && isActive()
    && (resource.data.uploadedBy == request.auth.uid || isAdmin() || isHost());
}
```

**Storage:**

```
match /gatherings/{gatheringId}/resources/{resourceId}/{fileName} {
  allow read: if request.auth != null;
  allow write: if request.auth != null
    && request.resource.size < 25 * 1024 * 1024;
}
```

- Any authenticated member can read and upload
- Only uploader or admin can edit metadata (title, tags, description)
- Uploader, admin, or host can delete
- 25MB per file limit

### Allowed File Types

- Images: jpg, png, gif, webp
- Documents: pdf, doc/docx, xls/xlsx, ppt/pptx, txt, csv

### UI: Files Tab on GroupDetailPage

GroupDetailPage gets two tabs: **Board** (default, existing) and **Files** (new).

**Files tab layout:**
- Search bar — filters by title, description, filename
- Tag filter bar — horizontal pills showing all tags used in this group, "All" default
- "Upload File" + "Add Link" buttons
- Resource list sorted by date (newest first)

**ResourceItem display:**
- File type icon (image thumbnail for images, doc/pdf/spreadsheet icons for documents, link icon for URLs)
- Title
- Uploader name + date
- Tags as small pills
- Actions: download/open (files open in new tab), edit (own or admin), delete (own or admin/host)

### UI Components

- `GroupResourcesList` — files tab content (search, tag filter, list)
- `GroupResourceItem` — single resource row
- `ResourceUploadModal` — file picker, title input, description textarea, tags input (comma-separated or pill UI)
- `ResourceLinkModal` — URL input, title, description, tags

### Service Layer

**New methods in `db.ts`:**
- `getGroupResources(gatheringId)` — fetch all resources
- `addGroupResource(gatheringId, data)` — create resource doc
- `updateGroupResource(gatheringId, resourceId, data)` — edit title/tags/description
- `deleteGroupResource(gatheringId, resourceId)` — delete doc + storage file if type is 'file'
- `subscribeToGroupResources(gatheringId, callback)` — real-time subscription

**New method in `storage.ts`:**
- `uploadGroupResource(gatheringId, resourceId, file, onProgress?)` — upload to resources storage path

**New hook: `useGroupResources.ts`**
- `useGroupResources(gatheringId)` — TanStack Query
- `useGroupResourcesSubscription(gatheringId, callback)` — real-time
- `useAddGroupResource()` — mutation (file upload + Firestore doc)
- `useUpdateGroupResource()` — mutation
- `useDeleteGroupResource()` — mutation (storage + Firestore)

## 2. Post Image Attachments

The BoardPost type already has `attachmentURL`, `attachmentType`, and `attachmentName` fields. The storage service has `uploadBoardAttachment()`. The BoardPost component already renders attachments.

**What's needed:**
- Add an image attachment button to the post creation form (camera/image icon)
- On click: file picker filtered to images only
- Preview the selected image before posting
- On submit: upload via `uploadBoardAttachment()`, save URL to post doc
- Images only — no documents on posts (those go in the files area)

This is mostly wiring up existing infrastructure with a small UI addition.

## 3. URL Embeds in Posts

When a board post contains URLs, render them as embedded content below the post text.

**New utility: `src/utils/urlEmbed.ts`**
- `extractUrls(text: string): string[]` — regex to find URLs in text
- `getEmbedType(url: string): 'youtube' | 'vimeo' | 'link'` — classify URL
- `getYouTubeId(url: string): string | null` — extract video ID
- `getVimeoId(url: string): string | null` — extract video ID

**Rendering in BoardPost:**
- YouTube/Vimeo URLs → responsive iframe embed player
- Other URLs → simple link card (clickable URL with domain name, styled as a card)
- No server-side unfurling for v1 — client-side URL detection only
- Multiple URLs in one post each get their own embed

## 4. Admin Content Deletion

Already working for board posts and comments:
- `BoardPost.tsx`: `canDelete = user?.id === post.authorId || isAdminOrHost`
- Comments: same admin/host check
- Firestore rules enforce this server-side

**Verification needed:** Kete post deletion UI — confirm admin sees delete button on others' posts. Fix if missing.

Group resources get the same pattern via the new rules above.

No new work — verification pass during implementation.

## Out of Scope

- DM file/image attachments (future work)
- Video file uploads (use link embeds instead)
- Folder/directory structure (tags cover organisation)
- Server-side link unfurling / og:image scraping (v1 is client-side only)
- Cross-group resource search
- Drag-and-drop upload (future enhancement)
