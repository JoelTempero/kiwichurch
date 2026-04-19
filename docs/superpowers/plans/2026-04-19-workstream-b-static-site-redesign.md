# Workstream B: Static Site Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all 7 static HTML pages to match the DESIGN.md visual contract — warm editorial aesthetic with Source Sans 3, updated palette tokens, layout variety, scroll reveal animations, and a shared header/footer pattern.

**Architecture:** The static site is vanilla HTML/CSS/JS — no build tools. All pages link `css/styles.css` and `js/main.js`. The CSS gets a full token rewrite (colors, fonts, shadows, radii) plus new component styles. Each page gets restructured HTML with editorial layout variety per DESIGN.md. The Kete rich text editor fix is a React portal change (DOMPurify + Quill integration). The homepage is a new file — `index-old.html` is an old SPA prototype, not a static page.

**Tech Stack:** Vanilla HTML5 + CSS3 + JS (static pages), Google Fonts (Cormorant Garamond + Source Sans 3), IntersectionObserver for scroll reveals, DOMPurify + Quill (portal Kete fix)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `css/styles.css` | **Rewrite** lines 1–38 (`:root` tokens), update typography (lines 75–100), update buttons (lines 105–174), update header (lines 196–395), update mobile nav (lines 397–473), update hero (lines 474–593), update sections (lines 594–700), update footer (lines 1557–1632), update responsive (lines 2174–2281) | Design tokens, component restyling |
| `css/styles.css` | **Add** new classes | `.reveal`, `.reveal.revealed`, `.card-hover-zoom`, `.section-muted`, `.section-forest`, `.pull-quote`, `.page-hero` (interior), staggered card grid |
| `js/main.js` | **Modify** | Update `initScrollReveal` for DESIGN.md motion specs, add reduced-motion media query handling |
| `homepage.html` | **Create** | New editorial homepage (hero with parallax, community intro, gatherings preview, kete preview, CTA) |
| `about.html` | **Rewrite body** | New editorial layout with section variety per DESIGN.md |
| `communities.html` | **Rewrite body** | New card grid with hover zoom, staggered reveals |
| `calendar.html` | **Rewrite body** | Updated layout with new tokens |
| `kete.html` | **Rewrite body** | Blog listing with new card design |
| `resources.html` | **Rewrite body** | Resource cards with editorial layout |
| `giving.html` | **Rewrite body** | Updated with new tokens and layout variety |
| `src/pages/KetePostPage.tsx` | **Modify** | Add DOMPurify sanitization for `dangerouslySetInnerHTML` |
| `src/components/kete/KeteForm.tsx` | **Modify** | Replace textarea with Quill rich text editor |

---

## Task 1: CSS Token & Typography Rewrite

**Files:**
- Modify: `css/styles.css:1-100`

Update `:root` custom properties to match DESIGN.md tokens and typography rules. This is the foundation — everything else depends on these tokens being correct.

- [ ] **Step 1: Update `:root` color tokens**

Replace lines 4–20 in `css/styles.css`:

```css
:root {
    /* Primary */
    --color-forest: #1c3d31;
    --color-forest-light: #2d5a4a;
    --color-forest-dark: #0f251e;
    /* Secondary */
    --color-sage: #7d9a87;
    --color-sage-light: #a8c4b0;
    /* Accent */
    --color-terracotta: #c17f59;
    --color-terracotta-light: #d4a07d;
    --color-gold: #d4a574;
    /* Surfaces */
    --color-parchment: #f5f1eb;
    --color-ivory: #faf8f4;
    --color-warm-sand: #ebe6dc;
    /* Text */
    --color-bark: #2c3530;
    --color-stone: #6b7c72;
    /* Borders */
    --color-clay: #e0dbd2;
    /* Semantic */
    --color-error: #b53333;
    --color-overlay: rgba(28, 61, 49, 0.85);

    /* Fonts — Source Sans 3 replaces Nunito Sans */
    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body: 'Source Sans 3', system-ui, -apple-system, sans-serif;

    /* Shadows — warm forest-tinted, never pure black */
    --shadow-whisper: 0 1px 3px rgba(44, 53, 48, 0.04);
    --shadow-card: 0 2px 8px rgba(44, 53, 48, 0.06);
    --shadow-raised: 0 4px 20px rgba(44, 53, 48, 0.10);
    --shadow-floating: 0 8px 40px rgba(44, 53, 48, 0.14);

    /* Radii — per DESIGN.md scale */
    --radius-subtle: 4px;
    --radius-standard: 6px;
    --radius-comfortable: 8px;
    --radius-card: 12px;
    --radius-large: 16px;
    --radius-section: 24px;

    /* Transitions */
    --transition-fast: 0.2s ease-out;
    --transition-base: 0.3s ease-out;
    --transition-slow: 0.5s ease-out;
    --transition-reveal: 0.6s ease-out;
}
```

- [ ] **Step 2: Update body and base styles**

Replace the `body` rule (around line 50–58):

```css
body {
    font-family: var(--font-body);
    font-size: 1rem;
    line-height: 1.70;
    color: var(--color-bark);
    background: var(--color-parchment);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
```

Update the noise overlay `body::before` — change `opacity: 0.02` to `opacity: 0.015` for subtlety on the new warmer background.

- [ ] **Step 3: Update typography rules**

Replace heading styles (around lines 79–89):

```css
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 400;
    line-height: 1.15;
    color: var(--color-forest);
}

h1 { font-size: clamp(2rem, 5vw, 3rem); letter-spacing: -0.01em; line-height: 1.15; }
h2 { font-size: clamp(1.75rem, 4vw, 2.25rem); line-height: 1.20; }
h3 { font-size: clamp(1.5rem, 3vw, 1.75rem); font-weight: 500; line-height: 1.25; }
h4 { font-size: clamp(1.25rem, 2vw, 1.375rem); font-weight: 500; line-height: 1.30; }
```

Update body text line-height in `p` rule to remove `margin-bottom` (sections handle spacing):

```css
p {
    margin-bottom: 1rem;
    line-height: 1.70;
}
```

- [ ] **Step 4: Add section label style**

Add after the heading rules:

```css
.section-label {
    display: inline-block;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-terracotta);
    margin-bottom: 1rem;
    line-height: 1.25;
}

.section-dark .section-label,
.section-forest .section-label {
    color: var(--color-gold);
}
```

- [ ] **Step 5: Update link styles**

Replace `a` and `a:hover` (around lines 95–103):

```css
a {
    color: var(--color-forest);
    text-decoration: none;
    transition: color var(--transition-fast);
}

a:hover {
    color: var(--color-terracotta);
}
```

- [ ] **Step 6: Update Google Fonts link in all HTML files**

Replace the Nunito Sans font link with Source Sans 3 in every HTML file's `<head>`. The new link:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
```

Files to update: `about.html`, `communities.html`, `calendar.html`, `kete.html`, `resources.html`, `giving.html`, `homepage.html` (when created).

- [ ] **Step 7: Verify — open any static page in browser**

The page should now use Source Sans 3 for body text and the updated color palette. Headings should be Cormorant Garamond at weight 400. Background should be parchment `#f5f1eb`.

- [ ] **Step 8: Commit**

```bash
git add css/styles.css about.html communities.html calendar.html kete.html resources.html giving.html
git commit -m "style: rewrite CSS tokens to match DESIGN.md (Source Sans 3, warm palette, editorial shadows)"
```

---

## Task 2: Button & Component Restyling

**Files:**
- Modify: `css/styles.css:105-174` (buttons)
- Modify: `css/styles.css:1789-1818` (value cards)
- Modify: `css/styles.css:1850-1875` (giving cards)

- [ ] **Step 1: Rewrite button styles**

Replace `.btn` base (lines 109–124):

```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.75rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1.25;
    border: none;
    border-radius: var(--radius-standard);
    cursor: pointer;
    transition: all var(--transition-base);
    text-decoration: none;
}
```

Replace `.btn-primary` (lines 126–137):

```css
.btn-primary {
    background: var(--color-forest);
    color: var(--color-ivory);
}

.btn-primary:hover {
    background: var(--color-forest-light);
    color: var(--color-ivory);
}

.btn-primary:focus-visible {
    outline: 2px solid var(--color-sage);
    outline-offset: 2px;
}
```

Replace `.btn-secondary` (lines 139–150):

```css
.btn-secondary {
    background: transparent;
    color: var(--color-forest);
    border: 1px solid var(--color-clay);
}

.btn-secondary:hover {
    border-color: var(--color-forest);
    background: var(--color-ivory);
    color: var(--color-forest);
}
```

Replace `.btn-outline` (lines 152–162):

```css
.btn-outline {
    background: transparent;
    color: var(--color-forest);
    border: 1px solid var(--color-clay);
}

.btn-outline:hover {
    border-color: var(--color-forest);
    background: var(--color-ivory);
    color: var(--color-forest);
}
```

Add new `.btn-accent` (for hero CTAs):

```css
.btn-accent {
    background: var(--color-terracotta);
    color: var(--color-ivory);
}

.btn-accent:hover {
    background: var(--color-terracotta-light);
    color: var(--color-ivory);
}
```

Add `.btn-on-dark` (for forest sections):

```css
.btn-on-dark {
    background: rgba(250, 248, 244, 0.95);
    color: var(--color-forest);
    border: none;
}

.btn-on-dark:hover {
    background: #ffffff;
}
```

- [ ] **Step 2: Update card base styles**

Add a reusable card class (after buttons section):

```css
.card {
    background: var(--color-ivory);
    border: 1px solid var(--color-clay);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    transition: box-shadow var(--transition-base);
}

.card:hover {
    box-shadow: var(--shadow-raised);
}

.card-body {
    padding: 1.5rem;
}

.card-img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
}

.card-img-hover {
    overflow: hidden;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
}

.card-img-hover img {
    transition: transform 0.5s ease-out;
}

.card-img-hover:hover img {
    transform: scale(1.05);
}
```

- [ ] **Step 3: Update value cards to use new tokens**

Update `.value-card` (around line 1789):

```css
.value-card {
    padding: 2rem;
    background: var(--color-ivory);
    border: 1px solid var(--color-clay);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    text-align: center;
    transition: all var(--transition-base);
}

.value-card:hover {
    box-shadow: var(--shadow-raised);
    transform: translateY(-4px);
}

.value-icon {
    width: 64px;
    height: 64px;
    background: var(--color-sage-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
}

.value-icon svg {
    width: 32px;
    height: 32px;
    color: var(--color-forest);
}
```

- [ ] **Step 4: Update giving card styles**

Update `.giving-card` and `.bank-details` to use new tokens:

```css
.giving-card {
    background: var(--color-ivory);
    border: 1px solid var(--color-clay);
    border-radius: var(--radius-card);
    padding: 2rem;
    box-shadow: var(--shadow-card);
}

.bank-details {
    background: var(--color-parchment);
    border: 1px solid var(--color-clay);
    border-radius: var(--radius-comfortable);
    padding: 1.5rem;
    font-family: monospace;
    font-size: 1.125rem;
}

.bank-details dt {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-stone);
    margin-bottom: 0.25rem;
}

.bank-details dd {
    margin-bottom: 1rem;
    font-weight: 600;
    color: var(--color-forest);
}
```

- [ ] **Step 5: Commit**

```bash
git add css/styles.css
git commit -m "style: update buttons, cards, and component styles to DESIGN.md spec"
```

---

## Task 3: Header, Footer & Navigation Restyling

**Files:**
- Modify: `css/styles.css:196-473` (header + mobile nav)
- Modify: `css/styles.css:1557-1632` (footer)

- [ ] **Step 1: Update header styles**

Replace `.header` (line 200):

```css
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 1rem 2rem;
    transition: all var(--transition-base);
}
```

Replace `.header.scrolled` (line 210):

```css
.header.scrolled {
    background: var(--color-parchment);
    box-shadow: var(--shadow-whisper);
}
```

Remove the `backdrop-filter` and `-webkit-backdrop-filter` lines — DESIGN.md specifies solid parchment, not frosted glass.

Update `.header.scrolled .header-logo img` — change the filter to brightness/saturation that works with the forest green logo on parchment:

```css
.header.scrolled .header-logo img {
    filter: brightness(0) saturate(100%) invert(20%) sepia(15%) saturate(900%) hue-rotate(100deg) brightness(95%);
}
```

Update `.header.scrolled .nav-link` to use bark color:

```css
.header.scrolled .nav-link {
    color: var(--color-bark);
}
```

Update `.header.scrolled .btn-outline` for the portal button:

```css
.header.scrolled .btn-outline {
    background: var(--color-forest);
    color: var(--color-ivory);
    border-color: var(--color-forest);
}
```

- [ ] **Step 2: Update nav link styles**

Replace `.nav-link` (line 262):

```css
.nav-link {
    padding: 0.5rem 1rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-ivory);
    border-radius: var(--radius-standard);
    transition: all var(--transition-fast);
}

.nav-link:hover {
    color: var(--color-ivory);
    background: rgba(250, 248, 244, 0.1);
}

.nav-link.active {
    color: var(--color-ivory);
    border-bottom: 2px solid var(--color-terracotta);
    border-radius: 0;
}

.header.scrolled .nav-link {
    color: var(--color-stone);
}

.header.scrolled .nav-link:hover {
    color: var(--color-forest);
}

.header.scrolled .nav-link.active {
    color: var(--color-forest);
    border-bottom-color: var(--color-terracotta);
}
```

- [ ] **Step 3: Update mobile nav**

Update `.mobile-nav` to use parchment background with large serif links per DESIGN.md:

```css
.mobile-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 200;
    background: var(--color-parchment);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
}

.mobile-nav.open {
    opacity: 1;
    visibility: visible;
}

.mobile-nav-link {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 400;
    color: var(--color-forest);
    text-decoration: none;
    padding: 0.5rem 1rem;
    min-height: 48px;
    display: flex;
    align-items: center;
    transition: color var(--transition-fast);
}

.mobile-nav-link:hover {
    color: var(--color-terracotta);
}

.mobile-nav-link.active {
    color: var(--color-terracotta);
}
```

- [ ] **Step 4: Update footer**

Replace `.footer` and related styles (lines 1560–1632):

```css
.footer {
    background: var(--color-forest);
    color: var(--color-ivory);
    padding: 5rem 2rem 0;
}

.footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 3rem;
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 3rem;
}

.footer-brand img {
    height: 60px;
    margin-bottom: 1rem;
}

.footer-brand p {
    color: rgba(250, 248, 244, 0.7);
    font-size: 0.9375rem;
}

.footer-title {
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-gold);
    margin-bottom: 1.5rem;
}

.footer-links {
    list-style: none;
}

.footer-links li {
    margin-bottom: 0.75rem;
}

.footer-links a {
    color: rgba(250, 248, 244, 0.7);
    font-size: 0.9375rem;
    transition: color var(--transition-fast);
}

.footer-links a:hover {
    color: var(--color-gold);
}

.footer-contact {
    color: rgba(250, 248, 244, 0.7);
    font-size: 0.9375rem;
}

.footer-contact a {
    color: rgba(250, 248, 244, 0.7);
}

.footer-contact a:hover {
    color: var(--color-gold);
}

.footer-bottom {
    background: var(--color-forest-dark);
    margin: 0 -2rem;
    padding: 1.5rem 2rem;
    text-align: center;
    color: rgba(250, 248, 244, 0.5);
    font-size: 0.8125rem;
}
```

- [ ] **Step 5: Update footer responsive styles**

In the `@media (max-width: 1024px)` block:

```css
.footer-content {
    grid-template-columns: repeat(2, 1fr);
}
```

In the `@media (max-width: 768px)` block:

```css
.footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
}
```

- [ ] **Step 6: Commit**

```bash
git add css/styles.css
git commit -m "style: update header, nav, and footer to DESIGN.md spec"
```

---

## Task 4: Section & Layout System Update

**Files:**
- Modify: `css/styles.css:594-700` (sections)
- Modify: `css/styles.css:2174-2240` (responsive)

- [ ] **Step 1: Update section styles**

Replace section styles (lines 624–700):

```css
/* Sections */
.section {
    padding: 6rem 2rem;
}

.section-sm {
    padding: 4rem 2rem;
}

.section-compact-top {
    padding-top: 2rem;
}

/* Section backgrounds — alternate per DESIGN.md */
.section-muted {
    background: var(--color-warm-sand);
}

.section-dark,
.section-forest {
    background: var(--color-forest);
    color: var(--color-ivory);
}

.section-dark h1, .section-dark h2, .section-dark h3,
.section-forest h1, .section-forest h2, .section-forest h3 {
    color: var(--color-ivory);
}

.section-dark p, .section-forest p {
    color: rgba(250, 248, 244, 0.7);
}

.section-sage {
    background: var(--color-sage-light);
}

/* Containers */
.container {
    max-width: 1200px;
    margin: 0 auto;
}

.container-sm {
    max-width: 720px;
    margin: 0 auto;
}

/* Section Headers */
.section-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-title {
    margin-bottom: 1rem;
}

.section-desc {
    font-size: 1.125rem;
    line-height: 1.75;
    color: var(--color-stone);
    max-width: 600px;
    margin: 0 auto;
}

.section-dark .section-desc,
.section-forest .section-desc {
    color: rgba(250, 248, 244, 0.7);
}
```

- [ ] **Step 2: Add interior page hero**

Replace `.about-hero` (lines 1748–1780) with a generic `.page-hero`:

```css
.page-hero {
    position: relative;
    padding: 10rem 2rem 5rem;
    background: var(--color-forest);
    text-align: center;
    overflow: hidden;
}

.page-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 1;
}

.page-hero-content {
    position: relative;
    z-index: 1;
}

.page-hero h1 {
    color: var(--color-ivory);
    margin-bottom: 1rem;
}

.page-hero p {
    color: rgba(250, 248, 244, 0.7);
    font-size: 1.25rem;
    max-width: 600px;
    margin: 0 auto;
    font-family: var(--font-display);
    font-style: italic;
}
```

- [ ] **Step 3: Add pull quote component**

```css
.pull-quote {
    max-width: 720px;
    margin: 0 auto;
    padding: 3rem 2rem;
    text-align: center;
}

.pull-quote blockquote {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-style: italic;
    font-weight: 400;
    color: var(--color-forest);
    line-height: 1.4;
    margin: 0;
}

.pull-quote cite {
    display: block;
    margin-top: 1.5rem;
    font-family: var(--font-body);
    font-size: 0.875rem;
    font-style: normal;
    color: var(--color-stone);
    letter-spacing: 0.02em;
}

.section-dark .pull-quote blockquote,
.section-forest .pull-quote blockquote {
    color: var(--color-ivory);
}

.section-dark .pull-quote cite,
.section-forest .pull-quote cite {
    color: rgba(250, 248, 244, 0.6);
}
```

- [ ] **Step 4: Add scroll reveal CSS**

```css
/* Scroll Reveal — respects reduced motion */
.reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity var(--transition-reveal), transform var(--transition-reveal);
}

.reveal.revealed {
    opacity: 1;
    transform: translateY(0);
}

/* Staggered card reveals — max 0.3s total delay */
.reveal-stagger > .reveal:nth-child(1) { transition-delay: 0s; }
.reveal-stagger > .reveal:nth-child(2) { transition-delay: 0.1s; }
.reveal-stagger > .reveal:nth-child(3) { transition-delay: 0.2s; }
.reveal-stagger > .reveal:nth-child(n+4) { transition-delay: 0.3s; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .reveal {
        opacity: 1;
        transform: none;
        transition: none;
    }

    .card-img-hover:hover img {
        transform: none;
    }

    .hero-parallax {
        background-attachment: scroll !important;
    }
}
```

- [ ] **Step 5: Update responsive section padding**

In `@media (max-width: 768px)`:

```css
.section {
    padding: 4rem 1.5rem;
}

.page-hero {
    padding: 8rem 1.5rem 4rem;
}
```

- [ ] **Step 6: Commit**

```bash
git add css/styles.css
git commit -m "style: add section system, page hero, pull quotes, scroll reveal CSS"
```

---

## Task 5: Update js/main.js — Scroll Reveals & Reduced Motion

**Files:**
- Modify: `js/main.js:197-214`

- [ ] **Step 1: Update `initScrollReveal` function**

Replace the existing function (lines 197–214):

```javascript
function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('revealed');
        });
        return;
    }

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('revealed');
        });
    }
}
```

Key changes from current: `triggerOnce: true` via `unobserve`, reduced motion support, `-80px` rootMargin for earlier trigger.

- [ ] **Step 2: Commit**

```bash
git add js/main.js
git commit -m "feat: update scroll reveal with reduced motion support and triggerOnce"
```

---

## Task 6: Update Shared Header/Footer HTML in All Pages

**Files:**
- Modify: `about.html:72-111` (header) and `about.html:271-306` (footer)
- Modify: `communities.html:52-91` (header) and footer
- Modify: `calendar.html:52-91` (header) and footer
- Modify: `kete.html:71-110` (header) and footer
- Modify: `resources.html:223-262` (header) and footer
- Modify: `giving.html:52-91` (header) and footer

All pages share the same header and footer HTML. Update them all to match DESIGN.md.

- [ ] **Step 1: Define the new shared header HTML**

Every page uses this header (with the appropriate `active` class on the current nav link):

```html
<header class="header scrolled" id="header">
    <div class="header-inner">
        <a href="homepage.html" class="header-logo">
            <img src="KiwiChurch_Old_White_Shadow.png" alt="Kiwi Church Logo" id="header-logo-img">
        </a>

        <nav class="nav-desktop" id="nav-desktop" aria-label="Main navigation">
            <a href="homepage.html" class="nav-link">Home</a>
            <a href="about.html" class="nav-link">About</a>
            <a href="communities.html" class="nav-link">Communities</a>
            <a href="calendar.html" class="nav-link">Calendar</a>
            <a href="kete.html" class="nav-link">Kete</a>
            <a href="resources.html" class="nav-link">Resources</a>

            <a href="portal.html" class="btn btn-primary" style="margin-left: 0.5rem;">Portal</a>
        </nav>

        <button class="mobile-menu-btn" id="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Toggle mobile menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        </button>
    </div>
</header>

<!-- Mobile Navigation -->
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
    <a href="homepage.html" class="mobile-nav-link">Home</a>
    <a href="about.html" class="mobile-nav-link">About</a>
    <a href="communities.html" class="mobile-nav-link">Communities</a>
    <a href="calendar.html" class="mobile-nav-link">Calendar</a>
    <a href="kete.html" class="mobile-nav-link">Kete</a>
    <a href="resources.html" class="mobile-nav-link">Resources</a>
    <a href="portal.html" class="mobile-nav-link">Portal</a>
</nav>
```

Note: Interior pages use `class="header scrolled"` (always scrolled style — no transparent-to-solid transition). Only the homepage has the transparent header.

- [ ] **Step 2: Define the new shared footer HTML**

```html
<footer class="footer">
    <div class="footer-content">
        <div class="footer-brand">
            <img src="KiwiChurch_Old_White_Shadow.png" alt="Kiwi Church">
            <p>A network of small group Christian communities in Christchurch, New Zealand.</p>
        </div>
        <div class="footer-nav">
            <h4 class="footer-title">Explore</h4>
            <ul class="footer-links">
                <li><a href="about.html">About Us</a></li>
                <li><a href="communities.html">Communities</a></li>
                <li><a href="calendar.html">Calendar</a></li>
                <li><a href="kete.html">Kete</a></li>
            </ul>
        </div>
        <div class="footer-nav">
            <h4 class="footer-title">Connect</h4>
            <ul class="footer-links">
                <li><a href="resources.html">Resources</a></li>
                <li><a href="giving.html">Giving</a></li>
                <li><a href="portal.html">Member Portal</a></li>
            </ul>
        </div>
        <div class="footer-contact-section">
            <h4 class="footer-title">Contact</h4>
            <div class="footer-contact">
                <p>Christchurch, New Zealand</p>
                <p><a href="mailto:hello@kiwichurch.org.nz">hello@kiwichurch.org.nz</a></p>
            </div>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2025 Kiwi Church. All rights reserved.</p>
    </div>
</footer>
```

- [ ] **Step 3: Update about.html**

Replace the header (lines 72–111) and footer (lines 271–306) with the shared HTML above. Set `active` class on the About nav link. Change `class="about-hero"` to `class="page-hero"` and `class="about-hero-content"` to `class="page-hero-content"`.

- [ ] **Step 4: Update communities.html**

Same header/footer replacement. Set `active` on Communities nav link. Change `about-hero` → `page-hero`.

- [ ] **Step 5: Update calendar.html**

Same. Set `active` on Calendar. Change `about-hero` → `page-hero`.

- [ ] **Step 6: Update kete.html**

Same. Set `active` on Kete. Change `about-hero` → `page-hero`.

- [ ] **Step 7: Update resources.html**

Same. Set `active` on Resources. Change `about-hero` → `page-hero`.

- [ ] **Step 8: Update giving.html**

Same. No active on nav (Giving isn't in the main nav). Change `about-hero` → `page-hero`.

- [ ] **Step 9: Add `giving.html` link to footer**

The current footer is missing a Giving link. The new footer template above includes it.

- [ ] **Step 10: Update `index.html` home link**

In all nav links, `href="index.html"` should become `href="homepage.html"` since `index.html` is the React portal.

- [ ] **Step 11: Commit**

```bash
git add about.html communities.html calendar.html kete.html resources.html giving.html
git commit -m "refactor: standardize header/footer HTML across all static pages"
```

---

## Task 7: Create New Homepage (homepage.html)

**Files:**
- Create: `homepage.html`

The homepage is the editorial centrepiece. It needs layout variety: hero → intro prose → gatherings preview → pull quote → kete preview → CTA.

- [ ] **Step 1: Create `homepage.html`**

```html
<!DOCTYPE html>
<html lang="en-NZ">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>Kiwi Church — Welcome to the Table</title>
    <meta name="description" content="Kiwi Church is a network of small group Christian communities in Christchurch, New Zealand. Faith lived around tables, not in rows.">
    <meta name="keywords" content="Kiwi Church, Christchurch church, house church NZ, small group church, Christian community">
    <meta name="author" content="Kiwi Church">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://kiwichurch.org.nz/">

    <!-- Theme & App Meta -->
    <meta name="theme-color" content="#1c3d31">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Kiwi Church">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://kiwichurch.org.nz/">
    <meta property="og:title" content="Kiwi Church — Welcome to the Table">
    <meta property="og:description" content="A network of small group Christian communities in Christchurch, New Zealand.">
    <meta property="og:image" content="https://kiwichurch.org.nz/images/og-image.jpg">
    <meta property="og:locale" content="en_NZ">
    <meta property="og:site_name" content="Kiwi Church">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Kiwi Church — Welcome to the Table">
    <meta name="twitter:description" content="A network of small group Christian communities in Christchurch, New Zealand.">

    <!-- Favicon & Icons -->
    <link rel="icon" type="image/png" href="icons/icon-192.png">
    <link rel="apple-touch-icon" href="icons/icon-192.png">
    <link rel="manifest" href="manifest.json">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">

    <!-- Stylesheet -->
    <link rel="stylesheet" href="css/styles.css">

    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Church",
        "name": "Kiwi Church",
        "description": "A network of small group Christian communities in Christchurch, New Zealand",
        "url": "https://kiwichurch.org.nz",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Christchurch",
            "addressCountry": "NZ"
        }
    }
    </script>
</head>
<body>
    <!-- Header — transparent, transitions to solid on scroll -->
    <header class="header" id="header">
        <div class="header-inner">
            <a href="homepage.html" class="header-logo">
                <img src="KiwiChurch_Old_White_Shadow.png" alt="Kiwi Church Logo" id="header-logo-img">
            </a>

            <nav class="nav-desktop" id="nav-desktop" aria-label="Main navigation">
                <a href="homepage.html" class="nav-link active">Home</a>
                <a href="about.html" class="nav-link">About</a>
                <a href="communities.html" class="nav-link">Communities</a>
                <a href="calendar.html" class="nav-link">Calendar</a>
                <a href="kete.html" class="nav-link">Kete</a>
                <a href="resources.html" class="nav-link">Resources</a>

                <a href="portal.html" class="btn btn-primary" style="margin-left: 0.5rem;">Portal</a>
            </nav>

            <button class="mobile-menu-btn" id="mobile-menu-btn" onclick="toggleMobileMenu()" aria-label="Toggle mobile menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
        </div>
    </header>

    <!-- Mobile Navigation -->
    <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
        <a href="homepage.html" class="mobile-nav-link active">Home</a>
        <a href="about.html" class="mobile-nav-link">About</a>
        <a href="communities.html" class="mobile-nav-link">Communities</a>
        <a href="calendar.html" class="mobile-nav-link">Calendar</a>
        <a href="kete.html" class="mobile-nav-link">Kete</a>
        <a href="resources.html" class="mobile-nav-link">Resources</a>
        <a href="portal.html" class="mobile-nav-link">Portal</a>
    </nav>

    <main id="main">
        <!-- Hero — full viewport, gentle parallax -->
        <section class="hero" aria-labelledby="hero-heading">
            <div class="hero-bg hero-parallax" style="background: linear-gradient(180deg, rgba(15, 37, 30, 0.5) 0%, rgba(28, 61, 49, 0.7) 50%, rgba(28, 61, 49, 0.85) 100%), url('images/hero-community.jpg') center/cover no-repeat; background-attachment: fixed;">
            </div>
            <div class="hero-content">
                <img src="KiwiChurch_Old_White_Shadow.png" alt="" class="hero-logo" aria-hidden="true">
                <h1 id="hero-heading" class="hero-title" style="font-size: clamp(2.5rem, 6vw, 4rem);">Welcome to the Table</h1>
                <p class="hero-subtitle">Faith lived in community, around tables, sharing life together</p>
                <div class="hero-actions">
                    <a href="communities.html" class="btn btn-accent">Find a Community</a>
                    <a href="about.html" class="btn btn-on-dark">Our Story</a>
                </div>
            </div>
        </section>

        <!-- Intro prose — centred narrow, parchment bg -->
        <section class="section" aria-labelledby="intro-heading">
            <div class="container-sm reveal">
                <div class="section-header">
                    <span class="section-label">Who We Are</span>
                    <h2 class="section-title" id="intro-heading">More than a Sunday service</h2>
                </div>
                <div style="font-size: 1.125rem; line-height: 1.75;">
                    <p>Kiwi Church is a network of intentionally small communities meeting in homes across Christchurch. We share meals, wrestle with honest questions, and walk through life together.</p>
                    <p>We're not trying to be the biggest church in town. We're trying to be a community where everyone is known, everyone belongs, and everyone has a seat at the table.</p>
                </div>
            </div>
        </section>

        <!-- Communities preview — warm sand bg, card grid -->
        <section class="section section-muted" aria-labelledby="communities-heading">
            <div class="container">
                <div class="section-header reveal">
                    <span class="section-label">Our Communities</span>
                    <h2 class="section-title" id="communities-heading">Find your people</h2>
                    <p class="section-desc">Each community has its own personality and rhythm, but we're united by shared values.</p>
                </div>

                <div class="features-grid reveal-stagger" id="home-communities-grid">
                    <!-- Populated by JavaScript or static cards -->
                </div>

                <div style="text-align: center; margin-top: 3rem;" class="reveal">
                    <a href="communities.html" class="btn btn-secondary">Explore All Communities</a>
                </div>
            </div>
        </section>

        <!-- Pull quote — dark forest interlude -->
        <section class="section section-forest" aria-label="Quote">
            <div class="pull-quote reveal">
                <blockquote>
                    "For where two or three gather in my name, there am I with them."
                </blockquote>
                <cite>— Matthew 18:20</cite>
            </div>
        </section>

        <!-- From the Kete — parchment bg, asymmetric -->
        <section class="section" aria-labelledby="kete-heading">
            <div class="container">
                <div class="section-header reveal">
                    <span class="section-label">From the Kete</span>
                    <h2 class="section-title" id="kete-heading">Stories, reflections & resources</h2>
                    <p class="section-desc">Thoughts and reflections from our community — a basket of things worth sharing.</p>
                </div>

                <div class="features-grid reveal-stagger" id="home-kete-grid">
                    <!-- Populated by JavaScript or static cards -->
                </div>

                <div style="text-align: center; margin-top: 3rem;" class="reveal">
                    <a href="kete.html" class="btn btn-secondary">Read the Kete</a>
                </div>
            </div>
        </section>

        <!-- CTA — warm sand bg -->
        <section class="section section-muted" aria-labelledby="cta-heading">
            <div class="container-sm" style="text-align: center;">
                <div class="reveal">
                    <span class="section-label">Join Us</span>
                    <h2 class="section-title" id="cta-heading">There's a seat at the table for you</h2>
                    <p class="section-desc" style="margin-bottom: 2.5rem;">Whether you're exploring faith for the first time or looking for a new spiritual home, you're welcome here.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="communities.html" class="btn btn-primary">Find a Community</a>
                        <a href="about.html" class="btn btn-secondary">Learn More</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-brand">
                <img src="KiwiChurch_Old_White_Shadow.png" alt="Kiwi Church">
                <p>A network of small group Christian communities in Christchurch, New Zealand.</p>
            </div>
            <div class="footer-nav">
                <h4 class="footer-title">Explore</h4>
                <ul class="footer-links">
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="communities.html">Communities</a></li>
                    <li><a href="calendar.html">Calendar</a></li>
                    <li><a href="kete.html">Kete</a></li>
                </ul>
            </div>
            <div class="footer-nav">
                <h4 class="footer-title">Connect</h4>
                <ul class="footer-links">
                    <li><a href="resources.html">Resources</a></li>
                    <li><a href="giving.html">Giving</a></li>
                    <li><a href="portal.html">Member Portal</a></li>
                </ul>
            </div>
            <div class="footer-contact-section">
                <h4 class="footer-title">Contact</h4>
                <div class="footer-contact">
                    <p>Christchurch, New Zealand</p>
                    <p><a href="mailto:hello@kiwichurch.org.nz">hello@kiwichurch.org.nz</a></p>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 Kiwi Church. All rights reserved.</p>
        </div>
    </footer>

    <div class="toast-container" id="toast-container" aria-live="polite"></div>

    <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add homepage-specific CSS for parallax hero**

Add to `css/styles.css` after the hero section:

```css
.hero-parallax {
    background-attachment: fixed;
}

@media (max-width: 768px) {
    .hero-parallax {
        background-attachment: scroll;
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add homepage.html css/styles.css
git commit -m "feat: create editorial homepage with hero, community preview, pull quote, and kete preview"
```

---

## Task 8: Redesign about.html with Editorial Layout Variety

**Files:**
- Modify: `about.html:112-269` (main content)

Apply the "no two sections alike" rule. Current layout: hero → centred prose → card grid → centred prose → image grid. New layout: page hero → centred prose → staggered values (not a grid) → two-column image+text → dark pull quote.

- [ ] **Step 1: Rewrite about.html main content**

Replace `<main>` content (lines 112–269):

```html
<main id="main">
    <!-- Page Hero -->
    <section class="page-hero" aria-labelledby="about-heading">
        <div class="page-hero-content">
            <h1 id="about-heading">About Kiwi Church</h1>
            <p>A desire for faith, meaning, community and authentic relationship</p>
        </div>
    </section>

    <!-- Our Story — centred narrow prose, parchment bg -->
    <section class="section" aria-labelledby="story-heading">
        <div class="container-sm reveal">
            <div class="section-header">
                <span class="section-label">Our Story</span>
                <h2 class="section-title" id="story-heading">How We Began</h2>
            </div>

            <div style="font-size: 1.125rem; line-height: 1.75;">
                <p>Kiwi Church grew out of a simple conviction: that faith is best lived in community, around tables, sharing life together.</p>
                <p>We started as a small group of people who wanted something different from the typical Sunday service. We wanted authentic relationships, honest conversations about faith and doubt, and a community that felt more like family than institution.</p>
                <p>Today, we're a network of small gatherings meeting in homes across Christchurch. Each community has its own personality and rhythm, but we're united by shared values and a commitment to following Jesus together in real, everyday life.</p>
                <p>We're not trying to be the biggest church in town. We're trying to be a community where everyone is known, everyone belongs, and everyone has a seat at the table.</p>
            </div>
        </div>
    </section>

    <!-- Values — warm sand bg, card grid with staggered reveal -->
    <section class="section section-muted" aria-labelledby="values-heading">
        <div class="container">
            <div class="section-header reveal">
                <span class="section-label">What We Value</span>
                <h2 class="section-title" id="values-heading">Our Core Values</h2>
                <p class="section-desc">These values shape how we gather, how we relate, and how we live out our faith.</p>
            </div>

            <div class="values-grid reveal-stagger">
                <article class="value-card reveal">
                    <div class="value-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <h3>Authentic Community</h3>
                    <p>We believe in being real with each other — sharing our struggles, celebrating our joys, and walking through life together.</p>
                </article>

                <article class="value-card reveal">
                    <div class="value-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                            <line x1="6" y1="1" x2="6" y2="4"></line>
                            <line x1="10" y1="1" x2="10" y2="4"></line>
                            <line x1="14" y1="1" x2="14" y2="4"></line>
                        </svg>
                    </div>
                    <h3>Table Fellowship</h3>
                    <p>Sharing meals isn't just hospitality — it's how we practice communion. Around the table, we remember Jesus and nourish each other.</p>
                </article>

                <article class="value-card reveal">
                    <div class="value-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <h3>Honest Questions</h3>
                    <p>We welcome doubt, hard questions, and wrestling with faith. We believe God is big enough for our questions.</p>
                </article>

                <article class="value-card reveal">
                    <div class="value-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                    </div>
                    <h3>Safe Space</h3>
                    <p>Everyone is welcome at our table. We're committed to creating environments where people can be themselves without judgment.</p>
                </article>

                <article class="value-card reveal">
                    <div class="value-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                    </div>
                    <h3>Living Faith</h3>
                    <p>We're interested in faith that transforms everyday life — not just Sunday beliefs, but Monday through Saturday practice.</p>
                </article>

                <article class="value-card reveal">
                    <div class="value-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
                    <h3>Generous Love</h3>
                    <p>We practice radical hospitality and generosity — with our homes, our resources, and our hearts.</p>
                </article>
            </div>
        </div>
    </section>

    <!-- What to Expect — parchment bg, prose -->
    <section class="section" aria-labelledby="expect-heading">
        <div class="container-sm reveal">
            <div class="section-header">
                <span class="section-label">First Visit</span>
                <h2 class="section-title" id="expect-heading">What to Expect</h2>
            </div>

            <div style="font-size: 1.125rem; line-height: 1.75;">
                <p><strong>Our gatherings are informal and welcoming.</strong> There's no dress code, no pressure to participate in ways you're not comfortable with, and no expectation that you'll agree with everything.</p>
                <p><strong>Most of our communities share a meal together.</strong> This might be a potluck dinner, a simple shared lunch, or morning tea. The food isn't fancy — it's about the fellowship.</p>
                <p><strong>We make space for conversation.</strong> Rather than passive listening, we engage with scripture, ideas, and each other through discussion. Your voice matters.</p>
                <p><strong>Kids are welcome.</strong> Many of our gatherings are family-friendly. We believe children are part of the community, not separate from it.</p>
                <p><strong>You can come as you are.</strong> Wherever you're at on your faith journey — curious, skeptical, committed, or confused — there's a place for you.</p>
            </div>
        </div>
    </section>

    <!-- Pull quote — dark forest interlude -->
    <section class="section section-forest" aria-label="Quote">
        <div class="pull-quote reveal">
            <blockquote>
                "They broke bread in their homes and ate together with glad and sincere hearts."
            </blockquote>
            <cite>— Acts 2:46</cite>
        </div>
    </section>
</main>
```

Note: The "photo gallery placeholder" section has been removed. DESIGN.md says "never put placeholder boxes where photos should go — use a real photo or leave the space empty."

- [ ] **Step 2: Commit**

```bash
git add about.html
git commit -m "redesign: about page with editorial layout variety and scroll reveals"
```

---

## Task 9: Redesign Remaining Pages

**Files:**
- Modify: `communities.html` (body content)
- Modify: `calendar.html` (body content)
- Modify: `kete.html` (body content)
- Modify: `resources.html` (body content + remove inline styles)
- Modify: `giving.html` (body content)

Each page follows the same pattern: page-hero → content sections with alternating backgrounds and `reveal` classes. The content itself is preserved — only the layout and class names change.

- [ ] **Step 1: Update communities.html main content**

Replace `<main>` content. Change `about-hero` → `page-hero`. Add `reveal` classes to sections. Use `section-muted` for alternating backgrounds. The gatherings grid already works with the existing JS — just add `reveal-stagger` to the grid container and `reveal` to the intro section.

```html
<main id="main">
    <section class="page-hero" aria-labelledby="communities-heading">
        <div class="page-hero-content">
            <h1 id="communities-heading">Communities & Gatherings</h1>
            <p>Find your place around the table</p>
        </div>
    </section>

    <section class="section" aria-labelledby="intro-heading">
        <div class="container-sm reveal">
            <div class="section-header">
                <span class="section-label">Our Network</span>
                <h2 class="section-title" id="intro-heading">Small by design</h2>
            </div>
            <div style="font-size: 1.125rem; line-height: 1.75;">
                <p>We believe the best community happens when everyone has a seat at the table — literally. Our gatherings are intentionally small so that every person is known and every voice is heard.</p>
                <p>Each community has its own personality, rhythm, and character. Some gather weekly, others fortnightly. Some share dinner, others start with morning tea. All are welcome to visitors.</p>
            </div>
        </div>
    </section>

    <section class="section section-muted" aria-labelledby="gatherings-heading">
        <div class="container">
            <div class="section-header reveal">
                <span class="section-label">Gatherings</span>
                <h2 class="section-title" id="gatherings-heading">Find a Community</h2>
            </div>
            <div class="features-grid reveal-stagger" id="gatherings-grid">
                <!-- Populated by JavaScript -->
            </div>
        </div>
    </section>

    <section class="section section-forest" aria-labelledby="connect-heading">
        <div class="container-sm" style="text-align: center;">
            <div class="reveal">
                <span class="section-label">Get Connected</span>
                <h2 id="connect-heading" style="color: var(--color-ivory);">Ready to visit?</h2>
                <p style="color: rgba(250, 248, 244, 0.7); margin-bottom: 2rem;">Get in touch and we'll help you find the right community for you.</p>
                <a href="mailto:hello@kiwichurch.org.nz" class="btn btn-on-dark">Get in Touch</a>
            </div>
        </div>
    </section>
</main>
```

- [ ] **Step 2: Update calendar.html main content**

Same pattern: `page-hero` → calendar section with updated token classes. The calendar JS functionality stays the same. Change `about-hero` → `page-hero`. Add `reveal` to the calendar container.

- [ ] **Step 3: Update kete.html main content**

Change `about-hero` → `page-hero`. Add `reveal` classes. Update `section-sage` → `section-muted` where used. The search/filter and blog grid JS stays the same.

- [ ] **Step 4: Update resources.html**

This file has inline styles in the `<head>` (lines 51–222). Move those to `css/styles.css` as proper classes, then update the body content with `page-hero`, `reveal` classes, and alternating backgrounds. Remove `section-compact-top` in favor of proper section spacing.

- [ ] **Step 5: Update giving.html main content**

Change `about-hero` → `page-hero`. Update `section-sage` → `section-muted`. Add `reveal` classes to all sections. The bank details and giving card content stays the same.

- [ ] **Step 6: Commit**

```bash
git add communities.html calendar.html kete.html resources.html giving.html css/styles.css
git commit -m "redesign: all interior pages with editorial layout, scroll reveals, and alternating sections"
```

---

## Task 10: Kete Rich Text Editor Fix (Portal)

**Files:**
- Modify: `src/pages/KetePostPage.tsx`
- Modify: `src/components/kete/KeteForm.tsx` (if it exists, otherwise the form component that creates kete posts)

- [ ] **Step 1: Install DOMPurify**

```bash
npm install dompurify
npm install -D @types/dompurify
```

- [ ] **Step 2: Find and update KetePostPage.tsx**

Add DOMPurify import and sanitize the HTML content:

```typescript
import DOMPurify from 'dompurify';
```

Find the `dangerouslySetInnerHTML` usage and wrap it:

```typescript
// Before:
dangerouslySetInnerHTML={{ __html: post.content }}

// After:
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
```

- [ ] **Step 3: Find the Kete form component**

Search for the textarea that creates kete posts. It may be in `KeteForm.tsx`, `KetePage.tsx`, or embedded in another component. The goal is to replace the plain `<textarea>` with a Quill rich text editor.

Look for patterns like:
- `<textarea` in kete-related files
- `register('content')` in react-hook-form usage
- The form that submits to `addKetePost` or similar

- [ ] **Step 4: Integrate Quill editor**

Replace the textarea with a Quill editor instance. Quill 1.3.7 is already installed. Create a simple wrapper:

```typescript
import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function QuillEditor({ value, onChange, placeholder }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder || 'Write something...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'header': [2, 3, false] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'blockquote'],
          ['clean']
        ]
      }
    });

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on('text-change', () => {
      onChange(quill.root.innerHTML);
    });

    quillRef.current = quill;
  }, []);

  return <div ref={containerRef} />;
}
```

- [ ] **Step 5: Wire QuillEditor into the Kete form**

Replace the textarea `register('content')` with the QuillEditor component, using `setValue` from react-hook-form to update the content field.

- [ ] **Step 6: Run typecheck and build**

```bash
npm run typecheck
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/ package.json package-lock.json
git commit -m "fix: sanitize kete HTML with DOMPurify and add Quill rich text editor"
```

---

## Task 11: Final CSS Cleanup & Old Token Migration

**Files:**
- Modify: `css/styles.css`

Sweep through the full CSS file and replace any remaining old token references with new ones.

- [ ] **Step 1: Search and replace old color tokens**

| Old token | New token |
|-----------|-----------|
| `--color-cream` | `--color-parchment` (for backgrounds) or `--color-ivory` (for surfaces) |
| `--color-cream-dark` | `--color-warm-sand` |
| `--color-text` | `--color-bark` |
| `--color-text-light` | `--color-stone` |
| `--color-white` | `#ffffff` or `var(--color-ivory)` depending on context |
| `--shadow-sm` | `--shadow-whisper` or `--shadow-card` |
| `--shadow-md` | `--shadow-raised` |
| `--shadow-lg` | `--shadow-floating` |
| `--shadow-xl` | Remove — use `--shadow-floating` |
| `--radius-sm` | `--radius-comfortable` |
| `--radius-md` | `--radius-card` |
| `--radius-lg` | `--radius-large` or `--radius-section` |
| `--radius-xl` | `--radius-section` |

- [ ] **Step 2: Remove the old `.about-hero` styles**

These are now replaced by `.page-hero`. Delete the `.about-hero` block (lines ~1748-1780).

- [ ] **Step 3: Remove dead/duplicate styles**

Search for any styles that reference old class names no longer used in the HTML. Remove them.

- [ ] **Step 4: Update scrollbar and selection styling**

```css
::-webkit-scrollbar-track {
    background: var(--color-parchment);
}

::selection {
    background: var(--color-sage);
    color: #ffffff;
}
```

- [ ] **Step 5: Verify — open each page in browser**

Check: about, communities, calendar, kete, resources, giving, homepage. Verify:
- Parchment background everywhere
- Source Sans 3 body text
- Cormorant Garamond headings at weight 400
- Section labels in terracotta/gold
- Alternating section backgrounds
- Scroll reveals trigger once
- Mobile nav works
- Footer uses forest green bg with gold section titles

- [ ] **Step 6: Commit**

```bash
git add css/styles.css
git commit -m "chore: migrate remaining old CSS tokens to DESIGN.md spec"
```

---

## Task 12: Firebase Hosting Rewrite for Homepage

**Files:**
- Modify: `firebase.json`

The homepage needs to be served at `/` but `index.html` is the React portal. Update Firebase Hosting config to serve `homepage.html` at the root for non-portal traffic.

- [ ] **Step 1: Check current firebase.json**

Read `firebase.json` and find the hosting config.

- [ ] **Step 2: Update rewrites**

Add a rewrite rule so `/` serves `homepage.html`:

This is tricky because the React portal at `index.html` needs SPA rewrites for its routes. The static pages are served directly by filename. The homepage needs to be the landing page.

Options:
1. Rename `homepage.html` → serve at `/` via rewrite
2. Keep current setup and use a redirect

The simplest approach: in the build step, copy `homepage.html` as the root landing page. Or configure Firebase hosting to serve `homepage.html` for the root URL.

Check if there's already a rewrite in firebase.json. If the SPA rewrite sends everything to `index.html`, we need to add explicit rules for static pages.

- [ ] **Step 3: Commit**

```bash
git add firebase.json
git commit -m "config: update Firebase Hosting to serve homepage at root"
```
