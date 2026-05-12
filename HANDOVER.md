# Handover Reference — Kiwi Church Community Platform

The operational facts a new developer or stand-in caretaker needs. Joel: fill in the `TODO` markers below before treating this as complete.

## Firebase

- **Project**: `kiwichurch-1ef0f` (see `.firebaserc`)
- **Hosting URL**: https://kiwichurch-1ef0f.web.app
- **Owner accounts**:
  - TODO — primary owner (Joel's Google account)
  - TODO — second owner needed (Darryl Tempero, or a `admin@kiwichurch.org.nz` Workspace account). Currently the project has a bus factor of 1; this is a blocker for the church owning their platform.
- **Billing account**: TODO
- **Deploy**: `firebase deploy` from a CLI authenticated to one of the owner accounts. Targets `dist/`.
- **Security rules**: `firestore.rules`, `storage.rules` — deploy with `firebase deploy --only firestore:rules,storage:rules`.

## GitHub repository

- **Remote**: `github.com/JoelTempero/kiwichurch.git`
- **Owner**: Joel Tempero's personal account.
- **TODO**: Transfer to a Sidequest Digital or Kiwi Church organisation, or add the church as a collaborator with at least read access. Currently the church does not own its own source code.
- Stale branches: `design-revision`, `claude/build-firebase-portal-VCtD1` — review and prune.

## Domain & DNS

- Current hosting URL is the default Firebase subdomain (`kiwichurch-1ef0f.web.app`).
- **Custom domain**: TODO — if/when one is connected (`kiwichurch.nz`?), document:
  - Registrar
  - DNS provider
  - SSL renewal (auto via Firebase if connected via Firebase Hosting)

## Email accounts referenced

These are visible on the static homepage / footer contact form. Both should be replaced with routing aliases (e.g. `hello@kiwichurch.org.nz`) so individual personal addresses aren't on a public site — see the 2026-05-12 council audit (Social Engineer faction).

- `d.tempero@xtra.co.nz` — Darryl Tempero, minister (personal address)
- `kiwichurchcomms@gmail.com` — Julie, comms

## Operational tasks that currently need Firebase Console access

(All run under the primary owner login until Cloud Functions land.)

1. Delete orphaned Kete images (`kete/{postId}/...` where the matching Firestore doc was discarded mid-edit).
2. Hard-delete users (Auth + Firestore `users/{uid}` + `userProfiles/{uid}` + `usernames/{username}`).
3. Edit / delete group resource files (storage `delete: if false` for everyone, including admins, on shared paths).
4. Approve/deactivate users via Firestore — though Settings page UI handles `status: pending → active` for normal cases.

## Admin runbook for common tasks

- **Approve a new signup**: Settings → Users → user shows up with a yellow row and "Approve" button → click it. (See `PendingApprovalGate` for the pending UX.)
- **Promote a user**: Settings → Users → edit pencil → change role.
- **Grant Kete posting rights**: Settings → Users → edit → toggle "Can post Kete".
- **Moderate content**: `/moderation` route, admins/hosts only.
- **Push a hotfix**: edit, `npm run build`, `firebase deploy --only hosting`.
- **Roll back rules**: `firebase deploy --only firestore:rules` from a prior git commit.

## Known gaps / deferred items

(See `CLAUDE.md` for the running list. Highlights:)

- No Cloud Functions yet → no FCM push, no server-side rate limiting, no orphan cleanup.
- No automated tests. Verification = typecheck + manual run-through.
- `App Check` not configured (post-launch hardening from the 2026-05-02 council audit).
- Image pipeline: hero JPGs are unoptimised (~880 KB) — needs AVIF + responsive srcset.
- Main bundle still loads Firestore on `/login` (`vite.config.ts` has no `manualChunks` yet).
