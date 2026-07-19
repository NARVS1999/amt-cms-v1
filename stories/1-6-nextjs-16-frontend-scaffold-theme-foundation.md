# Story 1.6: Next.js 16 Frontend Scaffold & Theme Foundation

Status: review

baseline_commit: 7bd5c82e6a88c6242401616eab2d214dc0e4d40c

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **visitor**,
I want **to see the public site skeleton with proper layout, navigation, and theme foundation**,
So that **the site is visually consistent and ready for content**.

## Acceptance Criteria

**Given** Next.js 16 is installed with `output: 'export'` in `next.config.ts`
**When** I run `npm run build`
**Then** it produces an `out/` directory with static HTML/CSS/JS files

**Given** the frontend is scaffolded
**When** I check the project structure
**Then** it has `app/`, `components/`, `lib/` directories
**And** Tailwind CSS v4 is installed and configured

**Given** the `ThemeProvider` component is implemented
**When** it renders at build time
**Then** it fetches `GET /api/theme` and writes CSS custom properties on `:root`
**And** the following CSS vars are defined: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-border`, `--color-success`, `--color-error`, `--font-body`, `--font-heading`

**Given** the Tailwind config extends from CSS vars
**When** I use `bg-primary` or `text-primary` in any component
**Then** it resolves through `var(--color-primary)`

**Given** the public site layout is built
**When** I visit the homepage at `/`
**Then** it renders with Header (navbar), main content area, and Footer
**And** the Header includes: logo area, nav links (Home, Services, About, Pricing, Blog, Contact), and Login button
**And** the Footer includes: logo, company description, 3-column link grid, newsletter input, social icons, and back-to-top button

**Given** I view the site on mobile (≤767px)
**When** the nav links exceed the viewport
**Then** a hamburger menu appears instead of full nav links

**Given** I scroll past 300px on any page
**When** the back-to-top button appears
**Then** clicking it smooth-scrolls to the top of the page

**Given** the Laravel API is unreachable during `npm run build`
**When** the build process tries to fetch data
**Then** the build fails with a clear error message indicating the API is unreachable
**And** no broken/partial site is produced (NFR-8)

**UX-DR coverage:** UX-DR14 (Responsive breakpoints), UX-DR7 (Footer, Navbar), UX-DR13 (A11Y — skip-to-content link as first focusable element)

## Tasks / Subtasks

- [x] **Scaffold Next.js 16 frontend** (AC: SSG with `output: 'export'`)
  - [x] Configure `next.config.ts` with `output: 'export'` and `images.unoptimized: true`
  - [x] Added `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000/api`
  - [x] Installed Font Awesome Free: `npm install @fortawesome/fontawesome-free`
- [x] **Install and configure Tailwind CSS v4** (AC: CSS-first config)
  - [x] Tailwind v4 uses CSS-first config — extend via `@theme` in `app/globals.css`
  - [x] Configure `@theme` with CSS variable references for all colors and fonts
- [x] **Create ThemeProvider component** (AC: fetches `/api/theme`, writes CSS vars)
  - [x] Create `components/ThemeProvider.tsx`
  - [x] Build-time: fetch `GET /api/theme`, get theme settings
  - [x] Write CSS custom properties on `:root` via `<style>` tag
  - [x] Include all 12 CSS vars listed in AC
  - [x] Handle fallback defaults when API is unreachable (NFR-8)
- [x] **Create Base Layout** (AC: Header + Footer + main content)
  - [x] Create `app/layout.tsx` with skip-to-content link
  - [x] Create `app/globals.css` with Tailwind directives + CSS variable definitions
  - [x] Create `components/Header.tsx` with navbar
  - [x] Create `components/Footer.tsx` with full footer spec
- [x] **Build Header component** (AC: logo, nav links, login button, responsive)
  - [x] Nav links: Home, Services, About, Pricing, Blog, Contact — smooth-scroll links
  - [x] Login button linking to `/admin/login`
  - [x] Fixed/sticky navbar, 72px height
  - [x] Glassmorphism effect: `rgba(255,255,255,.97)` background
- [x] **Build Footer component** (AC: logo, description, links, newsletter, back-to-top)
  - [x] Dark footer (`#1A1A1A` background)
  - [x] Logo + company description
  - [x] 3-column link grid
  - [x] Newsletter input area (UI only)
  - [x] Social icons (Font Awesome)
  - [x] Back-to-top button
- [x] **Implement responsive mobile navigation** (AC: hamburger menu)
  - [x] Hamburger icon (3 lines → X on open, CSS transition)
  - [x] Slide-out drawer with overlay
  - [x] `aria-expanded` toggle, `role="dialog"`, `aria-modal="true"`
  - [x] Body scroll lock when open
  - [x] Visible at ≤767px, hidden at ≥768px
- [x] **Implement Back-to-Top button** (AC: appears after 300px scroll)
  - [x] Fixed position, primary background, chevron-up icon (Font Awesome)
  - [x] Hidden by default, visible after 300px scroll
  - [x] Click smooth-scrolls to top
  - [x] `aria-label="Back to top"`
- [x] **Create Homepage scaffold** (AC: placeholder sections for content)
  - [x] Create `app/page.tsx` with sections: Hero, Services, About, Pricing, Blog, Contact
  - [x] Each section has a placeholder heading and content area
  - [x] Sections use `id` attributes for smooth-scroll navigation
- [x] **Create 404 page** (AC: catch-all for unknown routes)
  - [x] Create `app/not-found.tsx` with "Page not found" + "Go Home" button
- [x] **Implement graceful build failure** (AC: NFR-8 — clear error when API unreachable)
  - [x] ThemeProvider throws/build-error when API call fails

## Dev Notes

### Architecture Compliance

**AD-2 — Frontend is a static consumer:**
- Next.js runs in SSG mode (`output: 'export'`) — all pages pre-built to static HTML
- All data fetched at build time via `fetch()` to the Laravel REST API
- No database connections, no server-side state, no `getServerSideProps`
- The built `out/` folder is a flat directory of HTML/CSS/JS served by Hostinger's Apache/Nginx
- No Node.js runtime on the server

**AD-3 — REST API is the contract:**
- All public data flows through `GET /api/*` endpoints
- Consistent JSON envelope: `{ "data": ... }` for success, `{ "message": "...", "errors": {...} }` for validation failures
- `packages/shared` contains Zod schemas mirroring the API response shapes

**AD-4 — Theme system uses CSS custom properties:**
- Theme settings stored as key-value pairs in `ThemeSetting` model
- Exposed via `GET /api/theme` as flat JSON object
- Next.js frontend writes these values into CSS custom properties on `:root` at build time
- Tailwind CSS extends `colors` and `fontFamily` from `var(--color-*)` and `var(--font-*)`
- **NO hardcoded brand colors in any component** — every visual token resolves through CSS variable

**AD-7 — Content flow is unidirectional:**
```
Admin writes → MySQL → REST API → Next.js build → Static HTML
```

### Critical Next.js 16 Configuration

```ts
// apps/frontend/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,  // Required for static export with next/image
  },
  // No rewrites, no headers (static export doesn't support them)
};

export default nextConfig;
```

**Key constraints:**
- `output: 'export'` is mandatory — this produces the flat `out/` directory
- `images.unoptimized: true` is required because `next/image` optimization needs a Node.js runtime
- No `rewrites`, `headers`, or middleware — static export does not support them
- Dynamic routes (`/blog/[slug]`) use `generateStaticParams` to pre-build all pages

### Tailwind CSS v4 Configuration (CRITICAL — v4 uses CSS-first config)

**Do NOT use the old `tailwind.config.js` format.** Tailwind v4 configures everything in CSS via `@import "tailwindcss"` and `@theme`:

```css
/* apps/frontend/app/globals.css */
@import "tailwindcss";
@import "@fortawesome/fontawesome-free/css/all.css";

@theme {
  /* Breakpoints — align lg with spec's 992px desktop threshold */
  --breakpoint-lg: 992px;

  /* Public Site Colors */
  --color-primary: var(--color-primary, #FF0000);
  --color-secondary: var(--color-secondary, #fb3d03);
  --color-accent: var(--color-accent, #FFC107);
  --color-background: var(--color-background, #FFFFFF);
  --color-foreground: var(--color-foreground, #333333);
  --color-muted: var(--color-muted, #f5f5f5);
  --color-muted-foreground: var(--color-muted-foreground, #888888);
  --color-border: var(--color-border, #f0f0f0);
  --color-success: var(--color-success, #22c55e);
  --color-error: var(--color-error, #ef4444);
  --color-hero-start: #fff8f0;
  --color-hero-end: #fff5f5;
  --color-footer-bg: #1A1A1A;
  --color-footer-text: #999999;

  /* Public Site Typography */
  --font-body: var(--font-body, 'Poppins'), sans-serif;
  --font-heading: var(--font-heading, 'Poppins'), sans-serif;
}
```

**How Tailwind v4 + CSS vars work together:**
1. `@theme` block registers design tokens with Tailwind
2. `--color-primary: var(--color-primary, #FF0000)` means: "Tailwind's `primary` color reads from the CSS custom property `--color-primary`, falling back to `#FF0000` if unset"
3. The ThemeProvider injects `--color-primary: #FF0000` on `:root` at build time
4. Components use `bg-primary` → Tailwind resolves to `background-color: var(--color-primary)` → browser reads `#FF0000` from `:root`
5. **No component ever hardcodes `#FF0000`** — they always use `bg-primary`, `text-primary`, etc.

### ThemeProvider Implementation

The ThemeProvider runs at build time. Since this is SSG (`output: 'export'`), there is no runtime theme switching — the theme is baked into the static HTML.

```tsx
// apps/frontend/components/ThemeProvider.tsx
import type { Theme } from '@amt/shared';
import { fetchTheme, ThemeData } from '@/lib/api';

function buildCssVars(theme: ThemeData): string {
  return `
    --color-primary: ${theme.primary_color ?? '#FF0000'};
    --color-secondary: ${theme.secondary_color ?? '#fb3d03'};
    --color-accent: ${theme.accent_color ?? '#FFC107'};
    --color-background: ${theme.background_color ?? '#FFFFFF'};
    --color-foreground: ${theme.foreground_color ?? '#333333'};
    --color-muted: ${theme.muted_color ?? '#f5f5f5'};
    --color-muted-foreground: ${theme.muted_foreground_color ?? '#888888'};
    --color-border: ${theme.border_color ?? '#f0f0f0'};
    --color-success: ${theme.success_color ?? '#22c55e'};
    --color-error: ${theme.error_color ?? '#ef4444'};
    --font-body: '${theme.body_font ?? 'Poppins'}', sans-serif;
    --font-heading: '${theme.heading_font ?? 'Poppins'}', sans-serif;
  `;
}

export async function ThemeProvider({ children }: { children: React.ReactNode }) {
  let cssVars: string;

  try {
    const theme = await fetchTheme();
    cssVars = buildCssVars(theme ?? {});
  } catch (err) {
    // NFR-8: Fail build with clear error message
    throw new Error(
      `Failed to fetch theme from API. The frontend build requires the Laravel API to be running.\n` +
      `Ensure PHP artisan serve is running at ${process.env.NEXT_PUBLIC_API_URL}\n` +
      `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  return (
    <>
      <style precedence="default" href="theme-vars">{`:root { ${cssVars} }`}</style>
      {children}
    </>
  );
}
```

**⚠️ IMPORTANT DESIGN DECISIONS:**

1. **ThemeProvider is a Server Component** — it runs during `npm run build`, not in the browser
2. **fetchTheme() returns `null` on failure** (in `lib/api.ts`), but ThemeProvider throws on failure (NFR-8)
3. **buildCssVars uses `??` fallbacks** — these are the default values from DESIGN.md, used when the API returns empty/null fields
4. **The `<style>` tag with `precedence="default"` and `href="theme-vars"`** ensures React deduplicates the style if the component re-renders
5. **All 12 CSS vars listed in the AC are defined** — `--color-primary` through `--font-heading`

**API client (`lib/api.ts`) pattern:**
```ts
export async function fetchTheme(): Promise<ThemeData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}/theme`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    if (!json || typeof json !== 'object' || !('data' in json)) {
      throw new Error('Unexpected API response shape');
    }
    return json.data as ThemeData;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
```

**Key API client patterns from Story 1.5 learnings:**
- Use `AbortController` + `setTimeout` for 5-second timeout (prevents hanging build)
- Always check `res.ok` before parsing JSON
- Wrap response in the `{ "data": ... }` envelope check
- Return `null` on failure (ThemeProvider handles the throw for NFR-8)

### Public Site Visual Identity (MANDATORY — match DESIGN.md exactly)

**Colors:**
| Token | Value | CSS Variable | Tailwind Usage |
|-------|-------|-------------|----------------|
| Primary | `#FF0000` | `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| Secondary | `#fb3d03` | `--color-secondary` | `bg-secondary`, `text-secondary` |
| Accent | `#FFC107` | `--color-accent` | `bg-accent`, `text-accent` |
| Background | `#FFFFFF` | `--color-background` | `bg-background` |
| Foreground | `#333333` | `--color-foreground` | `text-foreground` |
| Muted | `#f5f5f5` | `--color-muted` | `bg-muted` |
| Muted Foreground | `#888888` | `--color-muted-foreground` | `text-muted-foreground` |
| Border | `#f0f0f0` | `--color-border` | `border-border` |
| Success | `#22c55e` | `--color-success` | `text-success` |
| Error | `#ef4444` | `--color-error` | `text-error` |
| Hero Gradient Start | `#fff8f0` | `--color-hero-start` | Used in gradient |
| Hero Gradient End | `#fff5f5` | `--color-hero-end` | Used in gradient |
| Footer BG | `#1A1A1A` | `--color-footer-bg` | `bg-footer-bg` |
| Footer Text | `#999999` | `--color-footer-text` | `text-footer-text` |

**Additional foreground tokens (for button contrast):**
| Token | Value |
|-------|-------|
| Primary Foreground | `#FFFFFF` |
| Secondary Foreground | `#FFFFFF` |
| Accent Foreground | `#1A1A1A` |
| Card Foreground | `#1A1A1A` |

**Typography (Poppins — import from Google Fonts):**
| Role | Size | Weight | Line Height | CSS Class Pattern |
|------|------|--------|-------------|-------------------|
| Display | 48px | 800 | 1.2 | `text-5xl font-extrabold leading-tight` |
| Heading | 36px | 700 | 1.3 | `text-4xl font-bold leading-snug` |
| Subheading | 20px | 600 | 1.4 | `text-xl font-semibold` |
| Body | 16px | 400 | 1.7 | `text-base leading-relaxed` |
| Small | 13px | 400 | 1.5 | `text-[13px]` |
| Label | 13px | 600, uppercase, 2px tracking | — | `text-[13px] font-semibold uppercase tracking-widest` |

**Responsive Breakpoints (UX-DR14):**
| Breakpoint | Behavior | Tailwind Class |
|------------|----------|---------------|
| `≥992px` | Full desktop: 2-col hero, 4-col services, 3-col pricing, full nav | `lg:` |
| `768-991px` | Tablet: single-col hero, 2-col services, 2-col footer | `md:` |
| `≤767px` | Mobile: single column all, hamburger nav, 40px padding | Default (mobile-first) |

**⚠️ NOTE:** The `lg:` breakpoint is overridden to `992px` in `globals.css` via `--breakpoint-lg: 992px` because the spec uses 992px as the desktop threshold, not Tailwind's default 1024px.

**Layout & Spacing:**
- Max width: `1200px` center-aligned container (`max-w-7xl`)
- Section padding: `80px top/bottom` on desktop, `40px` on mobile (`py-20` / `py-10`)
- Content width: sections have `24px` padding on mobile (`px-6`)
- Grid: Services uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`; Pricing uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Public Site Component Specs

**Primary Button:**
```
bg: var(--color-primary)
color: #FFFFFF
border-radius: 50px (pill)
padding: 12px 28px
font-weight: 600
font-size: 14px
Hover: darken fill #d40000, translateY(-2px), add shadow
```

**Outline Button:**
```
bg: transparent
color: var(--color-primary)
border: 2px solid var(--color-primary)
border-radius: 50px (pill)
padding: 10px 24px
Hover: fill becomes primary, text becomes white
```

**Service Card:**
```
bg: #FFFFFF
border-radius: 10px
border: 1px solid var(--color-border)
Icon: 64px circle, gradient from primary → secondary
Hover: translateY(-6px), shadow, primary border tint
```

**Pricing Card:**
```
bg: #FFFFFF
border-radius: 10px
border: 1px solid var(--color-border)
"Most Popular" variant: 2px solid primary border + ribbon badge
Features: green check (fa-check) / red cross (fa-xmark)
```

**Blog Card:**
```
bg: #FFFFFF
border-radius: 10px
Image: 200px height
Hover: shadow lift, translateY(-4px)
```

**Footer:**
```
bg: #1A1A1A
color: #999999
Logo + description + 3-column link grid + newsletter input
Social icons: Font Awesome brands
```

**Mobile Hamburger:**
```
3 horizontal 2.5px lines, 24px wide
Transforms to X on open (CSS transition)
Slide-out drawer from right, 288px wide (w-72)
Overlay: bg-black/50, tap-to-close
```

**Back-to-Top:**
```
Fixed position: bottom-6 right-6
bg: var(--color-primary)
Icon: fa-chevron-up (Font Awesome)
Hidden by default, visible after 300px scroll
Smooth scroll to top on click
aria-label="Back to top"
```

### Header Component Spec

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo: "Adsvance" red + "Media" dark]                           │
│         Home  Services  About  Pricing  Blog  Contact  [Login]  │
│         Sticky at top, 72px height                               │
│         bg: rgba(255,255,255,.97)                                │
│         bottom border: 1px solid #f0f0f0                        │
│         z-index: 50                                              │
└─────────────────────────────────────────────────────────────────┘
```

- **Logo:** "Adsvance" in `var(--color-primary)`, "Media" in `var(--color-foreground)`
- **Nav links:** smooth-scroll to sections on homepage (`#services`, `#about`, `#pricing`, `#contact`)
- **Blog link:** navigates to `/blog` (separate page, NOT a section anchor)
- **Login button:** outline button style → `/admin` (NOT `/admin/login` directly)
- **Mobile (≤767px):** hamburger icon replaces full nav → slide-out drawer from right
- **Desktop:** nav links visible at `md:` breakpoint (≥768px) — but spec says ≥992px. Use `hidden lg:flex` for desktop nav.
- **ARIA:** hamburger has `aria-expanded={mobileOpen}`, drawer has `role="dialog"`, `aria-modal="true"`, `aria-label="Mobile navigation"`

### Footer Component Spec

```
┌─────────────────────────────────────────────────────────────────┐
│  [Light Logo: "Adsvance" red + "Media" white]                   │
│  Company description paragraph                                   │
│                                                                  │
│  Quick Links      │  Services           │  Support               │
│  Home              │  Web Development    │  FAQ                   │
│  About             │  UI/UX Design       │  Contact Us            │
│  Blog              │  SEO Optimization   │  Privacy Policy        │
│  Contact           │  Digital Marketing  │  Terms of Service      │
│                                                                  │
│  ─────────────────────────────────────────────────────────────── │
│  [Newsletter Input] [Subscribe]     [Facebook] [Twitter] [LinkedIn] [Instagram] │
│                                                                  │
│                     © 2026 Adsvance Media Tech. All rights reserved. │
│  bg: #1A1A1A, text: #999999                                     │
└─────────────────────────────────────────────────────────────────┘
```

- **Logo:** light variant for dark background — "Adsvance" in `var(--color-primary)`, "Media" in white
- **3-column link grid:** Quick Links, Services, Support
- **Newsletter input:** UI only — no functionality in this story. Has visible `<label>` element.
- **Social icons:** Font Awesome brands (`fa-facebook-f`, `fa-twitter`, `fa-linkedin-in`, `fa-instagram`)
- **Back-to-top:** included in layout via `BackToTop` component (separate from footer)
- **Copyright:** dynamic year via `{new Date().getFullYear()}`
- **Responsive:** 4-col on desktop (`lg:grid-cols-4`), 2-col on tablet (`md:grid-cols-2`), single col on mobile

### Icons (UX-DR15)

- **Public site:** Font Awesome Free 6.x ONLY
- **Admin (not this story):** Lucide icons (shadcn/ui default)
- **No emoji as UI icons** anywhere in production
- **No celebration animations, confetti, or exclamation marks** in admin microcopy
- Import Font Awesome: `npm install @fortawesome/fontawesome-free`
- Import in CSS: `@import "@fortawesome/fontawesome-free/css/all.css";`
- Use CSS classes: `<i class="fa-solid fa-code"></i>`
- Common icons used in this story:
  - Hamburger: no Font Awesome — use CSS lines (3 spans)
  - Close: `fa-solid fa-xmark`
  - Chevron up: `fa-solid fa-chevron-up`
  - Arrow right: `fa-solid fa-arrow-right`
  - Check: `fa-solid fa-check` (pricing features)
  - Cross: `fa-solid fa-xmark` (pricing features)
  - Social: `fa-brands fa-facebook-f`, `fa-brands fa-twitter`, `fa-brands fa-linkedin-in`, `fa-brands fa-instagram`

### Accessibility Floor (UX-DR13 — WCAG 2.2 AA)

- ♿ **Skip-to-content link:** First focusable element on every public page, visible on focus. Positioned at `left: -9999px` off-screen, moves to `left: 0` on `:focus`.
- ♿ **Landmark regions:** `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>` with `aria-label` where appropriate (e.g., `<nav aria-label="Main navigation">`)
- ♿ **Mobile hamburger:** `aria-expanded` (true/false), `role="dialog"`, `aria-modal="true"`, focus trap inside drawer when open
- ♿ **Back-to-top:** `aria-label="Back to top"`
- ♿ **Form labels:** Visible `<label>` elements required — placeholders must NOT serve as labels
- ♿ **Footer newsletter:** Has `<label htmlFor="newsletter-email">` element
- ♿ **Color pickers (admin, not this story):** Hex text input as accessible alternative

**Focus trap implementation (Header):**
```tsx
// Focus trap for mobile drawer
useEffect(() => {
  if (!mobileOpen || !drawerRef.current) return;

  const drawer = drawerRef.current;
  const focusableSelectors = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
  const previouslyFocused = document.activeElement as HTMLElement;

  const focusableElements = drawer.querySelectorAll<HTMLElement>(focusableSelectors);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  drawer.addEventListener('keydown', handleKeyDown);
  return () => {
    drawer.removeEventListener('keydown', handleKeyDown);
    previouslyFocused?.focus(); // Restore focus when drawer closes
  };
}, [mobileOpen]);
```

### NFR-8 Graceful Build Failure

The build MUST fail with a clear error if the API is unreachable. Do NOT silently fall back to defaults during build — that would produce a broken site.

**Requirements for the error message:**
1. Indicate the API URL that was unreachable
2. Suggest checking `php artisan serve`
3. Include the underlying error message

**Implementation:**
```tsx
// ThemeProvider.tsx — catch block
catch (err) {
  throw new Error(
    `Failed to fetch theme from API. The frontend build requires the Laravel API to be running.\n` +
    `Ensure PHP artisan serve is running at ${process.env.NEXT_PUBLIC_API_URL}\n` +
    `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
  );
}
```

**Expected build output when API is down:**
```
Error occurred prerendering page "/"
Failed to fetch theme from API. The frontend build requires the Laravel API to be running.
Ensure PHP artisan serve is running at http://localhost:8000/api
Error: fetch failed
```

**⚠️ CRITICAL:** The `fetchTheme()` function in `lib/api.ts` catches errors and returns `null`. The ThemeProvider then receives `null` and builds CSS vars with defaults. BUT — the ThemeProvider should ALSO throw when `fetchTheme()` returns `null` if we want NFR-8 compliance. The current implementation only throws when `fetchTheme()` itself throws (network error, timeout). If the API returns a 404 or empty response, `fetchTheme()` returns `null` silently.

**Recommended fix for full NFR-8 compliance:**
```tsx
// ThemeProvider.tsx
const theme = await fetchTheme();
if (!theme) {
  throw new Error(
    `Failed to fetch theme from API. The frontend build requires the Laravel API to be running.\n` +
    `Ensure PHP artisan serve is running at ${process.env.NEXT_PUBLIC_API_URL}\n` +
    `No theme data returned from the API.`
  );
}
cssVars = buildCssVars(theme);
```

### Layout Architecture

```tsx
// apps/frontend/app/layout.tsx
export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Poppins for public site, Inter for admin panel */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <a href="#main-content" className="skip-to-content">Skip to content</a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Component hierarchy:**
```
RootLayout (Server Component)
├── <html lang="en">
│   ├── <head> (Google Fonts links)
│   └── <body>
│       ├── ThemeProvider (Server Component — fetches theme at build time)
│       │   ├── <style> (CSS custom properties on :root)
│       │   ├── Skip-to-content link (<a href="#main-content">)
│       │   ├── Header (Client Component — mobile hamburger state)
│       │   ├── <main id="main-content">
│       │   │   └── {children} (page content)
│       │   ├── Footer (Server Component — static markup)
│       │   └── BackToTop (Client Component — scroll listener)
```

**Client vs Server Components:**
- **Server Components:** ThemeProvider, Footer, layout.tsx
- **Client Components (`'use client'`):** Header (needs useState/useEffect for hamburger), BackToTop (needs useState/useEffect for scroll)

### Homepage Structure

```tsx
// apps/frontend/app/page.tsx
export default function HomePage() {
  return (
    <>
      <PageRenderer />     {/* Hero section from API */}
      <ServicesGrid />     {/* Services cards from API */}
      <section id="about"> {/* About section — static placeholder */}
      <TeamGrid />         {/* Team members from API */}
      <section id="pricing"> {/* Pricing cards — static placeholder */}
      <section id="blog">  {/* Blog preview — static placeholder */}
      <section id="contact"> {/* Contact — static placeholder */}
    </>
  );
}
```

**Section IDs for smooth-scroll navigation:**
- `#home` — hero/top of page
- `#services` — services grid
- `#about` — about section
- `#pricing` — pricing plans
- `#blog` — blog preview
- `#contact` — contact section

### File Structure

```
apps/frontend/
├── app/
│   ├── layout.tsx              # Root layout (Server Component)
│   ├── globals.css             # Tailwind v4 @theme + CSS vars
│   ├── page.tsx                # Homepage
│   ├── not-found.tsx           # 404 page
│   ├── favicon.ico
│   └── admin/                  # Admin panel (future stories)
│       ├── layout.tsx
│       ├── page.tsx
│       ├── login/page.tsx
│       ├── dashboard/page.tsx
│       ├── services/page.tsx
│       ├── team/page.tsx
│       ├── pages/page.tsx
│       └── media/page.tsx
├── components/
│   ├── ThemeProvider.tsx        # Build-time theme injection
│   ├── Header.tsx              # Navbar + mobile hamburger
│   ├── Footer.tsx              # Full footer
│   ├── BackToTop.tsx           # Scroll-to-top button
│   ├── PageRenderer.tsx        # Hero section renderer
│   ├── ServicesGrid.tsx        # Services cards grid
│   ├── TeamGrid.tsx            # Team members grid
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── table.tsx
│   │   └── alert-dialog.tsx
│   └── admin/                  # Admin components (future stories)
│       ├── sidebar.tsx
│       └── stats-overview.tsx
├── lib/
│   ├── api.ts                  # API client (fetchTheme, fetchServices, etc.)
│   ├── admin-api.ts            # Admin API client (authenticated)
│   └── utils.ts                # cn() utility for shadcn
├── public/                     # Static assets
├── next.config.ts              # output: 'export'
├── tsconfig.json
├── package.json
├── postcss.config.mjs
└── .env.local                  # NEXT_PUBLIC_API_URL
```

### Testing Requirements

**Build verification:**
- `npm run build` produces `out/` directory with static files
- `out/index.html` exists and contains the homepage content
- `out/404.html` exists for unknown routes
- `out/_next/static/` contains JS/CSS bundles

**Component verification:**
- Homepage loads with Header, content area, Footer
- Desktop: full nav visible; Mobile (≤767px): hamburger visible
- Hamburger toggles drawer with overlay, focus trap works
- Back-to-top hidden initially, visible after 300px scroll, smooth-scrolls
- 404 page renders on unknown routes with "Go Home" button
- CSS vars are injected on `:root` via ThemeProvider

**Accessibility verification:**
- Skip-to-content link is first focusable element
- Skip-to-content becomes visible on focus
- Mobile hamburger has `aria-expanded` attribute
- Mobile drawer has `role="dialog"` and `aria-modal="true"`
- Back-to-top has `aria-label="Back to top"`
- Footer newsletter has visible `<label>` element

**NFR-8 verification:**
- Stop the Laravel API (`php artisan serve` not running)
- Run `npm run build`
- Build fails with clear error message indicating API URL and suggesting `php artisan serve`
- No `out/` directory is produced (or it's incomplete — build aborts)

### Non-Functional Constraints

| Constraint | Requirement | How Met |
|-----------|-------------|---------|
| **AD-2** | SSG mode (`output: 'export'`) — no Node runtime on server | `next.config.ts` has `output: 'export'` |
| **AD-4** | Theme via CSS custom properties — no hardcoded colors | All components use `var(--color-*)` via Tailwind classes |
| **NFR-1** | <200KB JS+CSS bundle, <2s load time | SSG static files, Font Awesome tree-shaken via CSS import |
| **NFR-8** | Clear build failure when API unreachable | ThemeProvider throws with descriptive error |
| **NFR-10** | Zero-cost software mandate — all packages free/open-source | Next.js, React, Tailwind, Font Awesome Free — all MIT/CC |
| **NFR-12** | WCAG 2.2 AA across all public surfaces | Skip-to-content, landmarks, ARIA, focus trap, visible labels |
| **NFR-14** | Mobile-responsive (≤767px single column) | Tailwind responsive classes, hamburger nav, stacking grid |

### Previous Story Intelligence (Story 1.5)

Story 1.5 (Public REST API) learnings applied to this story:
- **Controller pattern:** Use `use App\Traits\ApiResponse` trait for consistent JSON responses
- **API client pattern (frontend):** Centralized API client in `apps/frontend/lib/api.ts` with `AbortController` + timeout
- **Response envelope:** Always `{ "data": ... }` — check for `json.data` before accessing
- **Error handling:** `fetchTheme()` returns `null` on failure; ThemeProvider throws for NFR-8
- **Architecture pivot complete:** Filament/DDD → Next.js/shadcn + flat Laravel

### References

- [Source: docs/epics.md#Story-1.6] — Full AC (lines 448-493)
- [Source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md#AD-2---Frontend-is-a-static-consumer] — SSG rules
- [Source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md#AD-4---Theme-system-uses-CSS-custom-properties] — CSS var approach
- [Source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md#Structural-Seed] — Frontend directory structure
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md#Public-Site-Palette] — Color tokens
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md#Typography] — Poppins typeface spec
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md#Components] — Component visual specs
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/EXPERIENCE.md#Public-Site---Behavioral-Specs] — Nav, hamburger, back-to-top
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/EXPERIENCE.md#Accessibility-Floor] — A11Y requirements
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/EXPERIENCE.md#Responsive-amp-Platform] — Breakpoint behavior
- [Source: docs/project-context.md#Nextjs-16-SSG-Frontend] — Frontend rules
- [Source: docs/project-context.md#Critical-Implementation-Rules] — Architecture invariants
- [Source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/addendum.md] — SSG rationale

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Next.js 16 scaffolded in `apps/frontend` with TypeScript, App Router, static export (`output: 'export'`).
- Tailwind CSS v4 configured via CSS-first `@theme` block — NO old `tailwind.config.js`.
- ThemeProvider fetches `GET /api/theme` at build time and injects CSS vars on `:root`.
- App layout: skip-to-content link, Header, main, Footer, BackToTop.
- Header: sticky 72px, glassmorphism, nav links (Home, Services, About, Pricing, Blog, Contact), Login button, hamburger mobile drawer.
- Footer: dark (#1A1A1A), logo, 3-column links, newsletter input, Font Awesome social icons.
- BackToTop: visible after 300px scroll, smooth-scroll to top, aria-label.
- Homepage: Hero (gradient), Services (4 cards), About, Pricing (3 plans), Blog, Contact sections.
- 404 page with "Page Not Found" and "Go Home" button.
- `npm run build` produces `out/` directory with static HTML/CSS/JS.
- Font Awesome Free 6.x installed and imported via CSS.
- Google Fonts (Poppins, Inter) loaded via `<link>` tags in layout head.
- shadcn/ui components installed: button, card, input, label, table, alert-dialog.
- Admin panel scaffolded at `/admin/*` routes (Stories 1.2-1.4).
- **NFR-8 Fix Applied:** ThemeProvider now throws build error when `fetchTheme()` returns `null` (API unreachable or empty response). Previously it silently fell back to defaults.

### File List

**Created by this story:**
- `apps/frontend/package.json`
- `apps/frontend/next.config.ts`
- `apps/frontend/tsconfig.json`
- `apps/frontend/.env.local`
- `apps/frontend/postcss.config.mjs`
- `apps/frontend/app/layout.tsx`
- `apps/frontend/app/globals.css`
- `apps/frontend/app/page.tsx`
- `apps/frontend/app/not-found.tsx`
- `apps/frontend/components/ThemeProvider.tsx`
- `apps/frontend/components/Header.tsx`
- `apps/frontend/components/Footer.tsx`
- `apps/frontend/components/BackToTop.tsx`
- `apps/frontend/lib/api.ts`

**Created by other stories (admin panel):**
- `apps/frontend/app/admin/layout.tsx`
- `apps/frontend/app/admin/page.tsx`
- `apps/frontend/app/admin/login/page.tsx`
- `apps/frontend/app/admin/dashboard/page.tsx`
- `apps/frontend/app/admin/services/page.tsx`
- `apps/frontend/app/admin/team/page.tsx`
- `apps/frontend/app/admin/pages/page.tsx`
- `apps/frontend/app/admin/media/page.tsx`
- `apps/frontend/components/admin/sidebar.tsx`
- `apps/frontend/components/admin/stats-overview.tsx`
- `apps/frontend/components/ui/button.tsx`
- `apps/frontend/components/ui/card.tsx`
- `apps/frontend/components/ui/input.tsx`
- `apps/frontend/components/ui/label.tsx`
- `apps/frontend/components/ui/table.tsx`
- `apps/frontend/components/ui/alert-dialog.tsx`
- `apps/frontend/components/PageRenderer.tsx`
- `apps/frontend/components/ServicesGrid.tsx`
- `apps/frontend/components/TeamGrid.tsx`
- `apps/frontend/lib/admin-api.ts`
- `apps/frontend/lib/utils.ts`
