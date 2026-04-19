# Workstream B: Static Website Redesign — Design Spec

## Overview
Redesign the 7 public-facing static HTML pages (homepage, about, communities, calendar, kete, resources, giving) plus integrate the Kete rich text editor (DOMPurify + Quill) in the portal.

## Design Direction
**Warm Editorial** — remixed from Claude/Anthropic + Airbnb. Full spec in `/DESIGN.md`.

## Personality
Intimate, grounded, natural, intentionally small communities networking together.

## Scope

### Static Pages (redesign)
1. **Homepage** (revitalise index-old.html → new homepage)
   - Hero with real photography + "Welcome to the table"
   - Who We Are section with 3 pillars (Relationships, Communities, Faith)
   - Upcoming events from Firebase
   - Communities preview
   - CTA: find a community / learn more
2. **About** — story, values, what to expect, photo gallery
3. **Communities** — intro, gathering cards from Firebase, CTA
4. **Calendar** — event listing from Firebase
5. **Kete** — blog listing from Firebase, individual post pages
6. **Resources** — categorised resource cards with search/filter
7. **Giving** — giving info and bank details

### Portal Integration
8. **Kete rich text editor** — integrate Quill with DOMPurify sanitisation
   - Replace plain textarea in KeteForm with Quill editor
   - Sanitise HTML output with DOMPurify before Firestore write
   - Sanitise HTML on render in KetePostPage (fix existing XSS risk)
   - Install DOMPurify package

### Shared Components
9. **Header/footer** — consistent across all static pages, matching DESIGN.md
10. **Login button** on static site linking to portal login

### Technical
- All pages use `css/styles.css` (rewrite to match DESIGN.md tokens)
- Source Sans 3 replaces Nunito Sans
- Keep existing Firebase data fetching (communities, events, kete posts)
- Add `.superpowers/` to `.gitignore`

## Design Contract
Full visual spec with colour palette, typography hierarchy, component styles, layout principles, responsive behaviour, and do's/don'ts lives at `/DESIGN.md`. All UI work must read and obey that file.

## Out of Scope
- Portal UI redesign (already using Tailwind, separate workstream)
- Cloud Functions
- Google Calendar integration
- Dark mode
- Member blocking
