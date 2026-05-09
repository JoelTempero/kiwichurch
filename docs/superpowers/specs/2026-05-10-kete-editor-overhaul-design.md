# Kete Editor Overhaul — Design Spec

**Date:** 2026-05-10
**Status:** Proposed

## Goal

Replace the current Kete editor (Quill modal launched from Hosting page, admin/host only, no media support) with a full-page editor on the Kete page itself. Add per-user posting permissions, image uploads, and YouTube/Vimeo video embeds.

## Why

Three problems with the current setup:

1. **Wrong location.** Editing lives in Hosting, which feels like an admin chore tab. Authoring belongs next to reading.
2. **Permission model too coarse.** Only admins/hosts can post. The client wants to grant individual members posting rights without making them hosts.
3. **Editor is barebones.** No images, no video, featured image is a URL paste. Authors can't write a real Kete post in this surface.

## Out of Scope

- Tags, categories, series UI (type fields exist; deferred)
- Autosave (manual save only for v1)
- Orphan image cleanup (admin sweep deferred — note in code)
- Video file uploads (URL embeds only)
- Image cropping / resizing
- Per-post comment moderation tools

---

## 1. Permissions & data model

**User type adds an optional flag:**

```ts
// src/types/user.ts
export interface User {
  // ...existing fields
  canPostKete?: boolean
}
```

Defaults to undefined → treated as `false`.

**`useAuth` exposes a derived helper:**

```ts
const canPostKete = isAdminOrHost || user?.canPostKete === true
```

**Admins toggle the flag** in the existing user edit modal on the Settings page (currently shows name, phone, bio, role — add a `Can post Kete` checkbox).

**Firestore rules (`kete` collection):**

- `create`: requester `canPostKete == true` OR is admin/host, AND `request.resource.data.authorId == request.auth.uid`
- `update` / `delete`: requester is the author OR is admin/host
- `read`:
  - `published == true` → any authenticated user
  - `published == false` (draft) → author or admin/host only

**Storage rules (`kete-images/{postId}/{filename}`):**

- `create`: requester `canPostKete == true` OR is admin/host
- `read`: any authenticated user
- `delete`: author of the parent post OR admin/host

---

## 2. Routing & page surfaces

**New routes (lazy-loaded, registered in `App.tsx`):**

- `/kete/new` — full-page editor, blank post
- `/kete/:postId/edit` — full-page editor, edits existing post (author or admin/host only)
- `/kete/:postId` — already exists (`KetePostPage`); add `Edit` button (visible to author or admin/host) linking to `/kete/:postId/edit`

**KetePage updates (`src/pages/KetePage.tsx`):**

- Header gets a `New Post` button next to the page title for users where `canPostKete === true`
- Above the published list, render a `Your drafts` section if the current user has any drafts (collapsed/hidden if none)
  - Each row links to `/kete/:id/edit`
- New hook `useMyKeteDrafts(userId)` queries `where('authorId', '==', uid), where('published', '==', false)`, ordered by `updatedAt desc`

**HostingPage updates (`src/pages/HostingPage.tsx`):**

- Remove the Kete tab and all its state (`showKeteForm`, `editingPost`, handlers)
- Remove the `KeteForm` modal mount and import
- Remaining tabs: Events (admin/host), Groups (admin only)
- If a non-admin host visits, only Events shows (existing behaviour)

**Editor page (`src/pages/KetePostEditor.tsx`):**

- Looks up post from `:postId` if present (edit mode); blank otherwise (create mode)
- Permission gate on mount:
  - If user lacks `canPostKete` → redirect to `/kete` with toast
  - In edit mode: if user is not the author AND not admin/host → redirect to `/kete` with toast
  - If post not found in edit mode → redirect to `/kete` with toast

---

## 3. Editor layout

Sticky top bar + single column writing surface:

```
┌── KetePostEditor ──────────────────────────────────┐
│  EditorTopBar (sticky)                             │
│    Back ← (with unsaved-changes guard)             │
│    [Save Draft]  [Publish / Update]                │
│                                                    │
│  FeaturedImageUpload                               │
│    Drop / click → upload → preview → replace/remove│
│                                                    │
│  Title input  (large, borderless, font-display)    │
│  Excerpt textarea  (small, italic, optional)       │
│                                                    │
│  RichTextEditor                                    │
│    Toolbar: B I U | H2 H3 | • ≡ | " | 🔗 📷 ▶      │
│    Body                                            │
└────────────────────────────────────────────────────┘
```

### New components in `src/components/kete/`

**`KetePostEditor.tsx`** (page component)
- Owns form state via `react-hook-form` + `zod` resolver
- Pre-allocates a Firestore doc ID upfront in create mode (via `doc(collection(db, 'ketePosts'))`) so image uploads have a stable folder before save
- Permission gate
- Composes the three components below

**`EditorTopBar.tsx`**
- Sticky at top, white background, bottom border
- Back arrow (triggers unsaved-changes confirm if dirty)
- Right side: `Save Draft` button + primary `Publish` button (label flips to `Update` when editing an already-published post)
- Visual dirty-state indicator (subtle "unsaved" text near buttons when form is dirty)

**`FeaturedImageUpload.tsx`**
- Empty state: dashed-border drop zone, "Click or drop to add a featured image"
- Filled state: image preview at correct aspect ratio, hover overlay with `Replace` and `Remove` buttons
- Uploads to `kete-images/{postId}/featured-{uuid}.{ext}`
- Writes the resulting URL into form field `featuredImage`
- Loading spinner during upload; toast on failure

**`RichTextEditor.tsx`**
- Replaces / wraps the existing `QuillEditor`
- Quill toolbar config:
  ```js
  [
    ['bold', 'italic', 'underline'],
    [{ header: [2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['image', 'video'],   // custom handlers
    ['clean'],
  ]
  ```
- **Image handler:** intercepts default Quill image button, opens file picker, uploads to `kete-images/{postId}/inline-{uuid}.{ext}`, inserts `<img src=...>` at the current cursor position. Skips Quill's default base64 inline behaviour.
- **Video handler:** prompts for URL via a small modal/popover. Parses and accepts only YouTube and Vimeo URLs (regex check on host); rejects others with toast "Only YouTube and Vimeo links are supported." On accept, inserts an `<iframe>` blot pointing at the canonical embed URL (`youtube.com/embed/{id}`, `player.vimeo.com/video/{id}`).

### Form schema (`src/utils/schemas.ts`)

Existing `keteSchema` covers most of this; minor changes:

- `title`: required, min 1, max 200
- `excerpt`: optional, max 500
- `featuredImage`: optional, must be a URL when present (uploads write a URL here)
- `content`: required, min 1 (Quill HTML — validate on stripped text length, not raw HTML length)
- `published`: boolean (set by which save button was clicked, not a user-facing checkbox in the new UI)

### Sanitization (`KetePostPage`)

Extend the existing DOMPurify config to allow:

- `img` with `src`, `alt`
- `iframe` with `src`, `width`, `height`, `frameborder`, `allowfullscreen`, `allow`

Add a DOMPurify hook that constrains `iframe.src` to:

- `https://www.youtube.com/embed/*`
- `https://player.vimeo.com/video/*`

Any other iframe src gets stripped.

---

## 4. Data flow

### Create flow

1. User hits `/kete/new`
2. `KetePostEditor` mounts; pre-allocates a Firestore doc ID via `doc(collection(db, 'kete'))` (no write yet)
3. User uploads featured image → file goes to Storage at `kete-images/{postId}/featured-{uuid}.{ext}`; download URL written to `featuredImage` form field
4. User inserts inline images → each uploads to `kete-images/{postId}/inline-{uuid}.{ext}`; `<img>` blot inserted at cursor
5. User pastes a video URL → parsed, validated, inserted as iframe blot
6. User clicks `Save Draft`:
   - `setDoc` on pre-allocated ID with `published: false`, `publishedAt: null`
   - Toast "Draft saved", navigate to `/kete`
7. User clicks `Publish`:
   - `setDoc` with `published: true`, `publishedAt: serverTimestamp()`
   - Toast "Post published", navigate to `/kete/:id`

### Edit flow

Same as create except:
- Doc ID is the existing post's ID
- `setDoc` is `updateDoc` (or `setDoc` with `merge: true`)
- Pre-existing inline image URLs in content stay as-is
- New uploads go under the same `kete-images/{postId}/` folder
- `Update` button preserves `publishedAt` if already published; sets it on first publish from draft

### Hooks and services

- Extend `src/services/firebase/db.ts`:
  - `db.kete.allocateNewPostRef()` → returns `{ id, ref }` for pre-allocation
  - Existing `createKetePost`, `updateKetePost`, `deleteKetePost` already cover save/delete
  - `getMyDrafts(userId)` → returns array of unpublished posts authored by `userId`
- Extend `src/services/firebase/storage.ts`:
  - `uploadKeteImage(postId, file, kind: 'featured' | 'inline')` → returns download URL
- Extend `src/hooks/useKete.ts`:
  - `useMyKeteDrafts(userId)` query hook

---

## 5. Errors & edge cases

| Failure | Behaviour |
|---|---|
| Image upload fails | Toast "Couldn't upload image. Try again." Image not inserted. Form stays dirty. |
| Save fails (Firestore error) | Toast "Couldn't save. Check your connection and try again." Form stays dirty. No navigation. |
| Video URL not YouTube/Vimeo | Toast "Only YouTube and Vimeo links are supported." No iframe inserted. |
| Permission denied (token expired etc.) | Toast "You don't have permission to do that." Redirect to `/kete`. |
| Post not found in edit mode | Toast "That post no longer exists." Redirect to `/kete`. |
| User navigates away with dirty form | `ConfirmModal`: "Discard changes?" Plus `beforeunload` listener for tab close/refresh. |
| User uploads images then discards | Files orphan in Storage. Admin sweep deferred (note in code). |
| Two devices edit same post | Last write wins. No conflict resolution for v1. |

---

## 6. Files touched

**New:**
- `src/pages/KetePostEditor.tsx`
- `src/components/kete/EditorTopBar.tsx`
- `src/components/kete/FeaturedImageUpload.tsx`
- `src/components/kete/RichTextEditor.tsx`

**Modified:**
- `src/types/user.ts` — add `canPostKete?: boolean`
- `src/hooks/useAuth.ts` — derive `canPostKete`
- `src/hooks/useKete.ts` — add `useMyKeteDrafts`
- `src/services/firebase/db.ts` — add `allocateNewPostRef`, `getMyDrafts`
- `src/services/firebase/storage.ts` — add `uploadKeteImage`
- `src/utils/schemas.ts` — refine `keteSchema`
- `src/pages/KetePage.tsx` — add New Post button, drafts section
- `src/pages/KetePostPage.tsx` — extend DOMPurify allowlist, add Edit button
- `src/pages/HostingPage.tsx` — remove Kete tab + state + KeteForm import
- `src/pages/SettingsPage.tsx` (or wherever the user edit modal lives) — add Can post Kete checkbox
- `src/App.tsx` — register `/kete/new` and `/kete/:postId/edit` routes
- `firestore.rules` — update `kete` collection rules
- `storage.rules` — add `kete-images/` rules

**Removed:**
- `src/components/kete/KeteForm.tsx` — superseded by `KetePostEditor`. Delete after migration is verified.

---

## 7. Acceptance criteria

- [ ] Admin can toggle `canPostKete` on a member from the user edit modal
- [ ] Member with `canPostKete = true` sees `New Post` on Kete page; member without it does not
- [ ] Member with `canPostKete` cannot edit other members' posts (UI + rules enforce)
- [ ] Admin/host can edit any post
- [ ] Editor opens at `/kete/new`, saves draft, navigates to `/kete`, draft appears in `Your drafts` section
- [ ] Editor opens at `/kete/:id/edit`, updates post, navigates back
- [ ] Featured image uploads successfully and renders on KeteCard + post page
- [ ] Inline image uploads successfully and renders inside the post body
- [ ] YouTube and Vimeo URL embeds render as iframes; other URLs are rejected
- [ ] Sanitization strips non-allowed iframes from rendered HTML
- [ ] Unsaved-changes guard fires on back button and tab close
- [ ] Hosting page no longer shows a Kete tab
- [ ] All existing Kete posts render correctly (back-compat: no schema changes to KetePost)
- [ ] Typecheck passes, build passes, lint clean
