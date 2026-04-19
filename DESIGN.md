# DESIGN.md — Kiwi Church

## 1. Visual Theme & Atmosphere

Warm, intimate, and unhurried — like being invited into someone's living room for a meal. The site reads as a literary invitation, not a church brochure. Drawing structural discipline from Claude/Anthropic (parchment canvas, warm neutrals, editorial pacing, serif-driven hierarchy) and photography-forward warmth from Airbnb (tactile cards, generous radius, immersive imagery).

The parchment canvas (`#f5f1eb`) gives everything the feel of quality paper rather than a screen. Serif headlines carry the gravitas of book titles. Real photography of community life — meals, bush walks, gatherings — does the emotional heavy lifting. Every gray has a warm olive-brown undertone; there are no cool blues or cold grays anywhere. The overall pace is generous and magazine-like: sections breathe, whitespace is deliberate, and the reader is never rushed.

This is a network of intentionally small communities. The design should feel intimate and grounded, not polished and corporate. Natural, not manufactured. Like a hand-written note, not a printed flyer.

**References:** Claude/Anthropic (structure, warmth, editorial pacing) + Airbnb (photography-forward, tactile warmth)

## 2. Color Palette & Roles

All neutrals carry warm olive-brown undertones. No cool grays.

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| primary | Forest | `#1c3d31` | Nav, headings, primary buttons, footer bg |
| on-primary | Ivory | `#faf8f4` | Text on forest green surfaces |
| secondary | Sage | `#7d9a87` | Section backgrounds, secondary buttons, tags |
| on-secondary | Bark | `#2c3530` | Text on sage surfaces |
| accent | Terracotta | `#c17f59` | Hero CTAs, section labels, warm highlight |
| on-accent | Ivory | `#faf8f4` | Text on terracotta buttons |
| background | Parchment | `#f5f1eb` | Page background — warm cream with yellow undertone |
| foreground | Bark | `#2c3530` | Primary body text — warm near-black |
| card | Ivory | `#faf8f4` | Card surfaces, elevated containers |
| card-foreground | Bark | `#2c3530` | Text on cards |
| muted | Warm Sand | `#ebe6dc` | Alternating section backgrounds, disabled states |
| muted-foreground | Stone | `#6b7c72` | Secondary text, captions, metadata |
| border | Clay | `#e0dbd2` | Borders, dividers, card outlines |
| destructive | Error Red | `#b53333` | Error states, validation |
| on-destructive | White | `#ffffff` | Text on error surfaces |
| ring | Sage | `#7d9a87` | Focus ring colour |

### Additional Accent Tokens
| Name | Hex | Usage |
|------|-----|-------|
| Gold | `#d4a574` | Section labels, decorative accent, overline text |
| Forest Light | `#2d5a4a` | Hover state for forest green, gradient endpoint |
| Forest Dark | `#0f251e` | Dark section backgrounds, deep overlay |
| Sage Light | `#a8c4b0` | Light tag backgrounds, subtle fills |
| Terracotta Light | `#d4a07d` | Hover for terracotta, lighter accent moments |

### Dark Section Palette
For forest-green-background sections (hero, featured content, footer):
- Background: Forest (`#1c3d31`) or Forest Dark (`#0f251e`)
- Text: Ivory (`#faf8f4`)
- Muted text: `rgba(250, 248, 244, 0.7)`
- Borders: `rgba(250, 248, 244, 0.15)`
- Accent: Gold (`#d4a574`)

## 3. Typography Rules

### Font Families
- **Display / Headings**: `'Cormorant Garamond', Georgia, serif`
- **Body / UI**: `'Source Sans 3', system-ui, -apple-system, sans-serif`

### Hierarchy

| Role | Font | Size (desktop) | Size (mobile) | Weight | Line Height | Letter Spacing |
|------|------|---------------|---------------|--------|-------------|----------------|
| Display / Hero | Cormorant Garamond | 4rem (64px) | 2.5rem (40px) | 400 | 1.10 | -0.02em |
| H1 | Cormorant Garamond | 3rem (48px) | 2rem (32px) | 400 | 1.15 | -0.01em |
| H2 / Section Title | Cormorant Garamond | 2.25rem (36px) | 1.75rem (28px) | 400 | 1.20 | normal |
| H3 | Cormorant Garamond | 1.75rem (28px) | 1.5rem (24px) | 500 | 1.25 | normal |
| H4 | Cormorant Garamond | 1.375rem (22px) | 1.25rem (20px) | 500 | 1.30 | normal |
| Section Label | Source Sans 3 | 0.8rem (12.8px) | 0.75rem (12px) | 500 | 1.25 | 0.12em |
| Body Large | Source Sans 3 | 1.125rem (18px) | 1rem (16px) | 400 | 1.75 | normal |
| Body | Source Sans 3 | 1rem (16px) | 1rem (16px) | 400 | 1.70 | normal |
| Body Small | Source Sans 3 | 0.875rem (14px) | 0.875rem (14px) | 400 | 1.60 | normal |
| Caption | Source Sans 3 | 0.8125rem (13px) | 0.8125rem (13px) | 400 | 1.50 | normal |
| Button | Source Sans 3 | 0.875rem (14px) | 0.875rem (14px) | 500 | 1.25 | 0.02em |
| Nav Link | Source Sans 3 | 0.875rem (14px) | 1rem (16px) | 500 | 1.00 | 0.04em |

### Principles
- **Serif for soul, sans for service**: Cormorant Garamond carries all emotional/editorial content (headings, titles, pull quotes). Source Sans 3 handles functional text (body, navigation, buttons, captions).
- **Light serif weight**: All Cormorant Garamond headings use weight 400 (regular) — not bold. This creates an elegant, understated presence. H3/H4 use 500 for slight emphasis at smaller sizes.
- **Generous body line-height**: 1.70–1.75 for body text. Closer to book typesetting than web convention. Creates a relaxed, unhurried reading experience.
- **Section labels are uppercase sans**: Small, letter-spaced, in Terracotta (`#c17f59`) on light backgrounds and Gold (`#d4a574`) on dark backgrounds. The editorial "eyebrow" pattern — anchors the section without competing with the serif heading below it.

## 4. Component Stylings

### Buttons

**Primary (Forest)**
- Background: Forest (`#1c3d31`)
- Text: Ivory (`#faf8f4`)
- Padding: 0.75rem 1.75rem
- Radius: 6px
- Hover: Forest Light (`#2d5a4a`)
- Focus: 2px ring in Sage (`#7d9a87`), 2px offset

**Accent (Terracotta)**
- Background: Terracotta (`#c17f59`)
- Text: Ivory (`#faf8f4`)
- Padding: 0.75rem 1.75rem
- Radius: 6px
- Hover: Terracotta Light (`#d4a07d`)
- Use: Hero CTAs, high-emphasis actions only

**Secondary (Outline)**
- Background: transparent
- Text: Forest (`#1c3d31`)
- Border: 1px solid Clay (`#e0dbd2`)
- Padding: 0.75rem 1.75rem
- Radius: 6px
- Hover: border shifts to Forest, background Ivory

**Ghost**
- Background: transparent
- Text: Stone (`#6b7c72`)
- Padding: 0.5rem 1rem
- Hover: text shifts to Forest, background `rgba(28, 61, 49, 0.05)`

**On Dark (for forest green sections)**
- Background: `rgba(250, 248, 244, 0.95)`
- Text: Forest (`#1c3d31`)
- Radius: 6px
- Hover: background pure white

### Cards & Containers
- Background: Ivory (`#faf8f4`) on parchment surfaces
- Border: 1px solid Clay (`#e0dbd2`)
- Radius: 12px
- Shadow: `0 2px 8px rgba(44, 53, 48, 0.06)` — warm, barely-there
- Hover shadow: `0 4px 20px rgba(44, 53, 48, 0.10)` — subtle lift
- Photography fills card top edge-to-edge, 12px radius on top corners only
- Card body padding: 1.5rem

### Community/Gathering Cards
- Full-width photo header (aspect 16:9)
- Top-left: pill badge for "Featured" in gold background
- Card body: community name (H3 serif), rhythm (caption with clock icon), description (body small), location (caption with pin icon)
- Bottom border-top divider in clay

### Inputs & Forms
- Background: Parchment (`#f5f1eb`)
- Border: 1px solid Clay (`#e0dbd2`)
- Text: Bark (`#2c3530`)
- Placeholder: Stone (`#6b7c72`)
- Padding: 0.75rem 1rem
- Radius: 8px
- Focus: border shifts to Forest, 2px ring in Sage with 2px offset
- Label: Source Sans 3, 0.875rem, weight 500, Bark

### Navigation (Static Site)
- Sticky top, parchment background, bottom border in clay
- Logo: left-aligned, Kiwi Church wordmark or image
- Links: Source Sans 3, 0.875rem, weight 500, Stone colour, uppercase with 0.04em tracking
- Active link: Forest colour, bottom border 2px in terracotta
- Portal button: primary forest button, right-aligned
- Mobile: hamburger → full-screen overlay, parchment background, large serif nav links

### Footer
- Background: Forest (`#1c3d31`)
- Text: Ivory, muted at 70% opacity for secondary
- Links: Ivory, hover Gold
- Section titles: Gold, uppercase, letter-spaced
- Bottom bar: Forest Dark (`#0f251e`), copyright text at 50% opacity
- Layout: 4-column on desktop (brand, explore, connect, contact), stacks on mobile

## 5. Layout Principles

### Grid & Container
- Max content width: 1200px, centred with auto margins
- Narrow content: 720px max (`container-sm`) for prose sections
- Column grid: 12-column on desktop, padding 1.5rem (mobile) / 2rem (desktop)
- Gutter: 1.5rem standard, 2rem for card grids

### Section Rhythm
- Vertical padding: 6rem top/bottom on desktop, 4rem on mobile
- **Alternating backgrounds**: parchment → warm sand → parchment → forest dark. No two adjacent sections share the same background colour.
- **Layout variety**: No two sections on the same page should use the same layout pattern. Mix: centred prose, split image/text, card grid, full-bleed photo, staggered columns, pull quote, testimonial strip.

### Whitespace Philosophy
- Magazine-like pacing. Every section should feel like turning a page.
- Let photography and content breathe — avoid dense information packing.
- Minimum 1.5rem gap between text elements, 2rem between content groups.
- Hero sections get maximum vertical space (min-height: 70vh on homepage).

### Border Radius Scale
- Subtle: 4px (small tags, inline badges)
- Standard: 6px (buttons, small interactive elements)
- Comfortable: 8px (inputs, form elements)
- Card: 12px (cards, images, containers)
- Large: 16px (featured cards, hero images)
- Section: 24px (hero image containers on interior pages)

## 6. Depth & Elevation

| Level | Shadow | Use |
|-------|--------|-----|
| Flat | none | Default state, inline elements |
| Whisper | `0 1px 3px rgba(44, 53, 48, 0.04)` | Subtle lift, nav bar |
| Card | `0 2px 8px rgba(44, 53, 48, 0.06)` | Cards, containers, dropdowns |
| Raised | `0 4px 20px rgba(44, 53, 48, 0.10)` | Card hover, active modals |
| Floating | `0 8px 40px rgba(44, 53, 48, 0.14)` | Overlays, mobile nav |

All shadows use warm forest-tinted rgba — never pure black.

### Z-Index Scale
- Nav/header: 100
- Mobile nav overlay: 200
- Modal backdrop: 300
- Modal content: 400
- Toast notifications: 500

## 7. Do's and Don'ts

### Do
1. Use real photography of Kiwi Church community life — meals, walks, gatherings. Never stock photos.
2. Let sections breathe with generous whitespace. When in doubt, add more space.
3. Alternate section backgrounds to create rhythm (parchment → warm sand → parchment → dark).
4. Use section labels (uppercase, letter-spaced, terracotta/gold) to anchor every major section.
5. Keep serif headlines at regular weight (400). The elegance comes from the typeface, not bold weight.
6. Ensure every page has layout variety — no two sections should use the same visual pattern.

### Don't
1. Never use pure black (`#000000`) — always use Bark (`#2c3530`) or Forest (`#1c3d31`).
2. Never use cool gray — every neutral must have a warm undertone.
3. Never centre-align body text on desktop. Left-align prose, centre only headings and section labels.
4. Never use gradients on buttons — they're flat with solid colours.
5. Never put placeholder boxes where photos should go — use a real photo or leave the space empty.
6. Never use more than two typefaces (Cormorant Garamond + Source Sans 3).
7. Never make the site feel like a megachurch — this is small, intentional, human-scale.

## 8. Responsive Behavior

### Breakpoints
- Mobile: < 768px
- Tablet: 768px–1024px
- Desktop: > 1024px

### Type Scale
- Desktop → Mobile: Display drops from 4rem to 2.5rem, H1 from 3rem to 2rem, H2 from 2.25rem to 1.75rem. Body stays at 1rem.

### Navigation
- Desktop: sticky horizontal nav with inline links
- Mobile (< 768px): hamburger → full-screen overlay with large serif links and generous touch targets (min 48px)

### Layout
- Card grids: 3-column desktop → 2-column tablet → 1-column mobile
- Split image/text sections: side-by-side desktop → stacked mobile (image first)
- Footer: 4-column desktop → 2-column tablet → stacked mobile
- Section padding: 6rem desktop → 4rem mobile

### Image Behavior
- Hero images: cover/fill with object-fit: cover
- Card images: maintain 16:9 aspect ratio, crop to fit
- Full-bleed sections: extend edge-to-edge, no side padding
- On mobile, all images are full-width within their container

## 9. Agent Prompt Guide

This is a small network of Christian house churches in Christchurch, New Zealand. The aesthetic is intimate, grounded, and warm-editorial. Use the colour and type tokens in DESIGN.md verbatim. Page background is always Parchment (`#f5f1eb`). Cormorant Garamond for all headings at weight 400 — never bold. Source Sans 3 for body and UI text. Forest green (`#1c3d31`) for primary actions and dark sections. Terracotta (`#c17f59`) for CTAs and section labels. Every gray and neutral must have a warm undertone — no cool blues or pure blacks. Alternate section backgrounds (parchment / warm sand / dark forest) to create rhythm. Real photography only — no stock photos, no placeholder gradients. Each page must have layout variety: no two sections can share the same pattern. The site should feel like an invitation into someone's home, not a corporate church website. Think literary magazine, not billboard. Generous whitespace, magazine pacing, sections that breathe.

## Changelog
- 2026-04-19: Initial version — remixed from Claude/Anthropic (warmth, editorial pacing) + Airbnb (photography-forward, tactile warmth). Personality: intimate, grounded, natural, intentionally small.
