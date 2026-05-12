# Kiwi Church Community Platform

Community platform for [Kiwi Church](https://kiwichurch-1ef0f.web.app), Christchurch NZ. Two surfaces in one repo:

- **Static public website** (root `.html` files): homepage, communities, calendar, kete (blog), resources.
- **React member portal** (`src/`): events + RSVPs, kete editor, groups + boards, directory, profile, direct messages, moderation, admin tools.

## Stack

React 18 · TypeScript · Vite 6 · Tailwind v4 · Firebase 11 (Auth, Firestore, Storage, Hosting) · Quill · vite-plugin-pwa.

## Quick start

```bash
git clone https://github.com/JoelTempero/kiwichurch.git
cd kiwichurch
npm install
cp .env.example .env       # then fill in any local-only flags
npm run dev                # http://localhost:5173
```

## Common commands

| Command            | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Vite dev server (HMR)                           |
| `npm run build`    | Type-check + production build to `dist/`        |
| `npm run preview`  | Serve `dist/` locally for smoke testing         |
| `npm run typecheck`| Type-check without emitting                     |
| `npm run lint`     | ESLint                                          |
| `firebase deploy`  | Deploy Hosting + Firestore + Storage rules      |
| `firebase emulators:start` | Local Firebase emulators (Auth/Firestore/Storage/Hosting) |

Set `VITE_USE_EMULATORS=true` in `.env` to point the dev app at the local emulator suite instead of production Firebase.

## Layout

```
src/
  components/          Feature components grouped by domain (auth, events, kete, groups, profile, directory, layout, common)
  hooks/               TanStack-Query-powered data hooks
  pages/               One page per route
  services/firebase/   Firestore, Storage, Auth client
  store/               Zustand stores (auth)
  types/               TypeScript types
  utils/               Helpers (cn, schemas, sanitize, recurrence, mentions, ...)
  styles/app.css       Tailwind theme tokens (the design contract)

css/                   Static-site stylesheets (NOT the portal's Tailwind)
js/                    Static-site JavaScript (sanitize.js for Kete render, main.js for header)
*.html (root)          Static public website pages — viteStaticCopy ships them to dist/

firestore.rules        Firestore security rules
storage.rules          Storage security rules
firebase.json          Hosting + emulator config
.firebaserc            Firebase project alias (kiwichurch-1ef0f)
```

A note on the two surfaces: at build time, `index.html` is renamed to `app.html` (`renameSpaEntry()` plugin). Firebase Hosting rewrites `/login`, `/home`, `/events`, etc. to `app.html` so the React SPA owns those routes. Everything else (`/`, `/communities`, `/calendar`, etc.) is plain static HTML.

## Design source of truth

`DESIGN.md` defines the visual contract for the static site: palette, typography, components, layout principles. Read it before touching UI on the public side. The portal intentionally diverges (Source Sans 3 only, serif h1 only, no shadows except modal overlays) and that divergence is noted in `CLAUDE.md`.

## Project status & handover

- `CLAUDE.md` — running session log + project context for AI assistance, also useful onboarding for new contributors.
- `HANDOVER.md` — bus-factor operational reference (Firebase ownership, DNS, domain, billing).
- `docs/council/` — multi-perspective audit reports.

## Tests

There are no automated tests yet. Verification happens via `npm run typecheck`, `npm run build`, and manual run-throughs against the deployed URL. Critical paths to manually test before any deploy:

1. Self-signup → pending state → admin approval flow.
2. Event RSVP with family members.
3. Recurring event create → edit single → edit-and-following → delete.
4. Kete post create → publish → public render at `/post.html?id=…`.
5. Profile privacy toggle round-trip (mirror writes to `/userProfiles`).
