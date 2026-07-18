---
name: Adsvance Media Tech CMS
description: >
  A reusable, themeable CMS foundation built on Laravel 12 + Next.js 16 (SSG).
  Two distinct surfaces: the public marketing site (brand-red consumer look)
  and the Filament admin panel (dark-sidebar tool aesthetic). This DESIGN.md
  specifies both skins under a single brand identity.
colors:
  public-site:
    primary: '#FF0000'
    primary-foreground: '#FFFFFF'
    secondary: '#fb3d03'
    secondary-foreground: '#FFFFFF'
    accent: '#FFC107'
    accent-foreground: '#1A1A1A'
    background: '#FFFFFF'
    foreground: '#333333'
    muted: '#f5f5f5'
    muted-foreground: '#888888'
    border: '#f0f0f0'
    card: '#FFFFFF'
    card-foreground: '#1A1A1A'
    hero-bg-start: '#fff8f0'
    hero-bg-end: '#fff5f5'
    footer-bg: '#1A1A1A'
    footer-text: '#999999'
    success: '#22c55e'
    error: '#ef4444'
  admin:
    sidebar-bg: '#1e1b2e'
    sidebar-text: '#a5a3b5'
    sidebar-active: '#FFFFFF'
    sidebar-hover: 'rgba(255,255,255,.06)'
    surface-bg: '#f5f5f9'
    card-bg: '#FFFFFF'
    border: '#e8e7ef'
    primary: '#FF0000'
    primary-foreground: '#FFFFFF'
    foreground: '#222222'
    muted-foreground: '#888888'
typography:
  public-site:
    display:
      fontFamily: 'Poppins'
      fontSize: '48px'
      fontWeight: '800'
      lineHeight: '1.2'
    heading:
      fontFamily: 'Poppins'
      fontSize: '36px'
      fontWeight: '700'
      lineHeight: '1.3'
    subheading:
      fontFamily: 'Poppins'
      fontSize: '20px'
      fontWeight: '600'
      lineHeight: '1.4'
    body:
      fontFamily: 'Poppins'
      fontSize: '16px'
      fontWeight: '400'
      lineHeight: '1.7'
    small:
      fontFamily: 'Poppins'
      fontSize: '13px'
      fontWeight: '400'
      lineHeight: '1.5'
    label:
      fontFamily: 'Poppins'
      fontSize: '13px'
      fontWeight: '600'
      textTransform: 'uppercase'
      letterSpacing: '2px'
  admin:
    display:
      fontFamily: 'Inter'
      fontSize: '24px'
      fontWeight: '700'
      lineHeight: '1.3'
    heading:
      fontFamily: 'Inter'
      fontSize: '18px'
      fontWeight: '600'
      lineHeight: '1.4'
    body:
      fontFamily: 'Inter'
      fontSize: '14px'
      fontWeight: '400'
      lineHeight: '1.5'
    small:
      fontFamily: 'Inter'
      fontSize: '12px'
      fontWeight: '400'
      lineHeight: '1.4'
    label:
      fontFamily: 'Inter'
      fontSize: '11px'
      fontWeight: '600'
      textTransform: 'uppercase'
      letterSpacing: '0.5px'
rounded:
  public-site:
    sm: 6px
    md: 10px
    lg: 16px
    pill: 50px
    circle: 50%
  admin:
    sm: 6px
    md: 8px
    lg: 10px
    pill: 50px
spacing:
  scale: 4  # Tailwind 4-based scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
  page-max: 1200px
  content-narrow: 768px
components:
  # PUBLIC SITE
  public-button-primary:
    background: '{colors.public-site.primary}'
    foreground: '{colors.public-site.primary-foreground}'
    radius: '{rounded.public-site.pill}'
    padding: '12px 28px'
    font-weight: '600'
    font-size: '14px'
  public-button-outline:
    background: 'transparent'
    foreground: '{colors.public-site.primary}'
    border: '2px solid {colors.public-site.primary}'
    radius: '{rounded.public-site.pill}'
    padding: '10px 24px'
  public-service-card:
    background: '{colors.public-site.card}'
    radius: '{rounded.public-site.md}'
    border: '1px solid {colors.public-site.border}'
    icon-bg: 'linear-gradient(135deg, {colors.public-site.primary}, {colors.public-site.secondary})'
    icon-size: '64px'
  public-pricing-card:
    background: '{colors.public-site.card}'
    radius: '{rounded.public-site.md}'
    border: '1px solid {colors.public-site.border}'
    popular-border: '2px solid {colors.public-site.primary}'
    ribbon-bg: '{colors.public-site.primary}'
    check-color: '{colors.public-site.success}'
    cross-color: '{colors.public-site.error}'
  public-navbar:
    background: 'rgba(255,255,255,.97)'
    link-color: '#444444'
    link-active: '{colors.public-site.primary}'
    height: '72px'
  public-hero:
    gradient-start: '{colors.public-site.hero-bg-start}'
    gradient-end: '{colors.public-site.hero-bg-end}'
  public-footer:
    background: '{colors.public-site.footer-bg}'
    text: '{colors.public-site.footer-text}'
  public-blog-card:
    radius: '{rounded.public-site.md}'
    image-height: '200px'
  public-stat:
    background: '#fafafa'
    radius: '{rounded.public-site.md}'
    number-color: '{colors.public-site.primary}'
  # ADMIN PANEL
  admin-sidebar:
    background: '{colors.admin.sidebar-bg}'
    text: '{colors.admin.sidebar-text}'
    active-bg: 'rgba(255,255,255,.1)'
    active-text: '{colors.admin.sidebar-active}'
    hover-bg: '{colors.admin.sidebar-hover}'
    width: '260px'
    item-radius: '{rounded.admin.sm}'
  admin-stat-card:
    background: '{colors.admin.card-bg}'
    radius: '{rounded.admin.lg}'
    icon-radius: '{rounded.admin.sm}'
  admin-table:
    header-color: '#888888'
    row-hover: '#fafafa'
  admin-badge:
    background: '{colors.admin.primary}'
    foreground: '{colors.admin.primary-foreground}'
    radius: '{rounded.admin.pill}'
  admin-button-primary:
    background: '{colors.admin.primary}'
    foreground: '{colors.admin.primary-foreground}'
    radius: '{rounded.admin.sm}'
    padding: '10px 22px'
  admin-button-secondary:
    background: '{colors.admin.card-bg}'
    foreground: '#555555'
    border: '1px solid {colors.admin.border}'
    radius: '{rounded.admin.sm}'
  admin-field:
    radius: '{rounded.admin.sm}'
    border: '1.5px solid {colors.admin.border}'
    focus-ring: 'rgba(255,0,0,.08)'
---

## Brand & Style

Adsvance Media Tech CMS serves two faces under one identity: a **public marketing site** (the consumer-facing brand for Adsvance's own services) and a **Filament admin panel** (the tool where staff manage content). The public skin inherits the legacy brand — bold red primary, warm accent amber, clean Poppins typography, card-based layouts with generous white space. The admin skin is a dark-sidebar productivity tool in Inter typeface — quiet, focused, utilitarian.

The brand promise — "empowering small businesses with an affordable, beautiful web presence" — threads both surfaces. The public site *demonstrates* what Adsvance sells; the admin panel *delivers* it. They share a color primary (#FF0000) as the single connective token; everything else adapts to context.

The CMS is not a WordPress competitor. It's a purpose-built, themeable foundation that proves itself on Adsvance's own site before being handed to clients. Visual restraint is the discipline: the public site is warm and inviting; the admin is cold and efficient. Both are clean. Neither has gratuitous decoration.

### Logo

Light and dark variants managed through the admin Theme Settings page:
- **Light logo** — white or light-toned for dark backgrounds (footer, dark sections)
- **Dark logo** — full-color or dark-toned for light backgrounds (header, hero, white sections)
- Admin panel uses a simplified icon-wordmark: 32px square mark + "Adsvance CMS"

---

## Colors

### Public Site Palette

The public site is defined by its bold red-primary heritage. Warm, energetic, accessible.

| Token | Light Value | Usage |
|-------|-------------|-------|
| Primary | `#FF0000` | Buttons, links, active nav, stat numbers, icon backgrounds |
| Secondary | `#fb3d03` | Gradients with primary, hover states, accent overlays |
| Accent | `#FFC107` | Highlight underlines, badge backgrounds, call-to-action highlights |
| Background | `#FFFFFF` | Page background, card surfaces |
| Foreground | `#333333` | Body text |
| Muted | `#f5f5f5` | Section alternates, pricing section, stat card backgrounds |
| Muted Foreground | `#888888` | Secondary text, descriptions, dates |
| Border | `#f0f0f0` | Card borders, dividers |
| Success | `#22c55e` | Pricing check icons |
| Error | `#ef4444` | Pricing cross icons, validation errors |
| Hero Gradient | `#fff8f0` → `#fff5f5` | Hero section background blend |
| Footer BG | `#1A1A1A` | Footer |
| Footer Text | `#999999` | Footer body text |

### Admin Panel Palette

The admin panel reads as a dark-tool sidebar + light content area — standard Filament aesthetic.

| Token | Value | Usage |
|-------|-------|-------|
| Sidebar BG | `#1e1b2e` | Narrow left panel |
| Sidebar Text | `#a5a3b5` | Inactive nav labels |
| Sidebar Active | `#FFFFFF` | Active nav item text |
| Surface BG | `#f5f5f9` | Main content area background |
| Card BG | `#FFFFFF` | Cards, tables, form sections |
| Border | `#e8e7ef` | Dividers, card outlines |
| Primary | `#FF0000` | Save buttons, badges, active indicators |
| Foreground | `#222222` | Primary text |
| Muted Foreground | `#888888` | Secondary labels, hints |

---

## Typography

### Public Site — Poppins (Google Fonts)

| Role | Size | Weight | Line Height | Used On |
|------|------|--------|-------------|---------|
| Display | 48px | 800 | 1.2 | Hero heading |
| Heading | 36px | 700 | 1.3 | Section titles |
| Subheading | 20px | 600 | 1.4 | Card titles, feature names |
| Body | 16px | 400 | 1.7 | Paragraphs, descriptions |
| Small | 13px | 400 | 1.5 | Dates, secondary info |
| Label | 13px | 600, uppercase, 2px tracking | — | "Services", "About Us" section labels |

### Admin Panel — Inter (Google Fonts)

| Role | Size | Weight | Line Height | Used On |
|------|------|--------|-------------|---------|
| Display | 24px | 700 | 1.3 | Page titles (e.g. "Dashboard") |
| Heading | 18px | 600 | 1.4 | Card headers, section titles |
| Body | 14px | 400 | 1.5 | Table cells, form labels, nav items |
| Small | 12px | 400 | 1.4 | Hints, timestamps, badges |
| Label | 11px | 600, uppercase, 0.5px tracking | — | Sidebar group labels, table headers |

---

## Layout & Spacing

### Public Site

- **Max width:** 1200px center-aligned container for all sections
- **Content width:** sections have 24px padding on mobile, center within 1200px
- **Section padding:** 80px top/bottom (40px on mobile)
- **Spacing scale:** Tailwind 4-based (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- **Grid:** Services grid uses `auto-fit, minmax(260px, 1fr)`; pricing uses `auto-fit, minmax(300px, 1fr)`
- **Single-column layout** on mobile; 2-column on tablet+ for hero, about, contact

### Admin Panel

- **Sidebar:** fixed 260px left panel, full viewport height
- **Content area:** fluid, with 32px padding (20px on mobile)
- **Stat cards:** auto-fill grid, min 220px
- **Dashboard grid:** 1.5fr + 1fr two-column layout on desktop; single column on tablet

---

## Elevation & Depth

### Public Site

- **Card hover:** `0 4px 20px rgba(0,0,0,.12)` — subtle lift on cards
- **Hero image:** `0 4px 20px rgba(0,0,0,.12)` with continuous float animation
- **Header:** 1px bottom border, no shadow — clean separation without depth
- **No elevation as hierarchy device** — content hierarchy comes from typography and color, not shadow

### Admin Panel

- **Stat cards:** `0 1px 3px rgba(0,0,0,.06)` — very flat, barely there
- **No card hover elevation** — the admin is a tool, not a browse surface
- **Tables** have no row shadow — clean horizontal lines only

---

## Shapes

### Public Site
| Token | Value | Used On |
|-------|-------|---------|
| `sm` | 6px | Input fields |
| `md` | 10px | Service cards, pricing cards, blog cards, stat cards |
| `lg` | 16px | Hero image |
| `pill` | 50px | Primary, outline, and CTA buttons |
| `circle` | 50% | Service icon containers, stat icons |

### Admin Panel
| Token | Value | Used On |
|-------|-------|---------|
| `sm` | 6px | Sidebar items, buttons, input fields, stat icons |
| `md` | 8px | Topbar buttons, search bar |
| `lg` | 10px | Cards, settings sections |
| `pill` | 50px | Badge counters |

---

## Components

### Public Site — Component Visual Specs

| Component | Visual Rules |
|-----------|-------------|
| **Primary Button** | `{colors.public-site.primary}` fill, white text, pill radius. Hover: darken fill `#d40000`, translateY(-2px), add shadow. |
| **Outline Button** | Transparent fill, `{colors.public-site.primary}` text + border. Hover: fill becomes primary, text becomes white. |
| **Service Card** | White card, `{rounded.public-site.md}` corner, 1px light border. Icon in `64px` circle with primary→secondary gradient. Hover: translateY(-6px), shadow, primary border tint. |
| **Pricing Card** | White stacked card with feature list. "Most Popular" variant: primary border + ribbon badge. Features use `{success}` check / `{error}` cross icons. |
| **Blog Card** | White card with `200px` image area, `{rounded.public-site.md}`. Hover: shadow lift, translateY(-4px). |
| **Footer** | `{footer-bg}` dark section. Logo + description + 3-column link grid + newsletter input. Social icons at bottom. `{footer-text}` for all body copy. |
| **Mobile Hamburger** | Three horizontal `2.5px` lines, `24px` wide. Transforms to X on open (CSS transition). |
| **Back-to-Top** | Fixed-position floating button, primary background, chevron-up icon. Appears on scroll past header. |

### Admin Panel — Component Visual Specs

| Component | Visual Rules |
|-----------|-------------|
| **Sidebar** | `260px` dark panel `{sidebar-bg}`. Active item: semi-transparent white bg + white text. Hover: subtle lighter bg. Group labels: 10px/uppercase/tracking/30% opacity white. |
| **Stat Card** | White card, `{rounded.admin.lg}`, 1px border. Icon in `44px` colored square (red for services, blue for posts, green for messages, amber for subscribers). |
| **Table** | Clean header: 11px uppercase gray, border-bottom. Rows: 13px body, alternating subtle bottom border. Hover: `#fafafa` tint. |
| **Badge** | Pill-shaped counter, primary red fill, white text, 11px, used on Messages nav item for unread count. |
| **Primary Button (admin)** | Primary fill, `{rounded.admin.sm}`, `10px 22px`. Hover: darken. Used for "Save Changes" and primary CTAs. |
| **Secondary Button (admin)** | White fill, gray border, `{rounded.admin.sm}`. Used for "Reset to Default" and secondary actions. |
| **Form Field** | `1.5px` border, `{rounded.admin.sm}`. Focus: primary border + `3px` rgba primary ring. |
| **Settings Section** | White card with header bar (icon + title + description). Collapsible pattern. |

---

## Do's and Don'ts

| Do | Don't |
|----|-------|
| Use `{colors.public-site.primary}` (#FF0000) as the single connective token between public and admin surfaces | Introduce a second brand color that competes with primary |
| Keep the public site warm (gradient hero, amber accents, generous white space) | Make the public site cold or tool-like — its job is to *sell* |
| Keep the admin panel cold and efficient (dark sidebar, flat cards, Inter typeface) | Over-decorate the admin panel — it's a tool, not a showcase |
| Use Poppins across the public site and Inter across the admin | Mix typefaces within the same surface |
| Inherit Filament's component defaults for things not listed here | Customize Filament's base components (Button, Card, Table, Modal) beyond what's in this spec |
| Font Awesome for all public site icons | Use emoji as UI icons anywhere in production |
| Heroicons (Blade) for all admin panel icons | Mix icon families within the same surface |
| Validate color contrast for all new token additions | Assume a hex value is WCAG AA-compliant without checking |
