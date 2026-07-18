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

### Critical Next.js 16 Configuration

```ts
// next.config.ts
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

### Tailwind CSS v4 Configuration (CRITICAL — v4 uses CSS-first config)

**Do NOT use the old `tailwind.config.js` format.** Tailwind v4 configures everything in CSS via `@import "tailwindcss"` and `@theme`:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
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

### ThemeProvider Implementation

The ThemeProvider runs at build time. Since this is SSG (`output: 'export'`), there is no runtime theme switching — the theme is baked into the static HTML.

```tsx
// components/ThemeProvider.tsx
export async function ThemeProvider({ children }: { children: React.ReactNode }) {
  let theme: ThemeData | null = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/theme`, {
      // timeout to prevent hanging build
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    theme = json.data;
  } catch (err) {
    // NFR-8: Fail build with clear error message
    throw new Error(
      `Failed to fetch theme from API. The frontend build requires the Laravel API to be running.\n` +
      `Ensure PHP artisan serve is running at ${process.env.NEXT_PUBLIC_API_URL}\n` +
      `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  // Generate CSS custom properties string
  const cssVars = `
    --color-primary: ${theme.primary_color ?? '#FF0000'};
    --color-secondary: ${theme.secondary_color ?? '#fb3d03'};
    --color-accent: ${theme.accent_color ?? '#FFC107'};
    ...
    --font-body: '${theme.body_font ?? 'Poppins'}', sans-serif;
    --font-heading: '${theme.heading_font ?? 'Poppins'}', sans-serif;
  `;

  // Note: This is a Server Component — it runs at build time
  // The CSS vars are embedded in the static HTML via a <style> tag
  return (
    <html>
      <head>
        <style>{`:root { ${cssVars} }`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**⚠️ IMPORTANT:** Since this is SSG (`output: 'export'`), we cannot use `getStaticProps` or server-side data fetching in the traditional sense. The approach is:
- `ThemeProvider` should be a Server Component that fetches at build time
- Alternatively, use `generateStaticParams` or a build script
- For static export, the data fetching happens during `npm run build` — not at request time

### Public Site Visual Identity (MANDATORY — match DESIGN.md exactly)

**Colors:**
| Token | Value |
|-------|-------|
| Primary | `#FF0000` |
| Secondary | `#fb3d03` |
| Accent | `#FFC107` |
| Background | `#FFFFFF` |
| Foreground | `#333333` |
| Muted | `#f5f5f5` |
| Muted Foreground | `#888888` |
| Border | `#f0f0f0` |
| Success | `#22c55e` |
| Error | `#ef4444` |
| Hero gradient | `#fff8f0` → `#fff5f5` |
| Footer BG | `#1A1A1A` |
| Footer Text | `#999999` |

**Typography (Poppins):**
| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Display | 48px | 800 | 1.2 |
| Heading | 36px | 700 | 1.3 |
| Subheading | 20px | 600 | 1.4 |
| Body | 16px | 400 | 1.7 |
| Small | 13px | 400 | 1.5 |
| Label | 13px | 600, uppercase, 2px tracking | — |

**Responsive Breakpoints (UX-DR14):**
| Breakpoint | Behavior |
|------------|----------|
| `≥992px` | Full desktop: 2-col hero, 4-col services, 3-col pricing, full nav |
| `768-991px` | Tablet: single-col hero, 2-col services, 2-col footer |
| `≤767px` | Mobile: single column all, hamburger nav, 40px padding |

### Header Component Spec

```
┌─────────────────────────────────────────────────┐
│ [Logo]  Home  Services  About  Pricing  Blog  Contact  [Login] │
│              Sticky at top, 72px height                      │
│              bg: rgba(255,255,255,.97)                       │
│              bottom border: 1px solid #f0f0f0               │
└─────────────────────────────────────────────────┘
```

- Logo: dark logo variant (for light background header)
- Nav links: smooth-scroll to sections on homepage
- Blog link: navigates to `/blog` (separate page)
- Login button: outline button style → `/admin/login`
- Mobile (≤767px): hamburger icon replaces full nav

### Footer Component Spec

```
┌─────────────────────────────────────────────────┐
│  [Light Logo]                                    │
│  Company description                             │
│                                                  │
│  Quick Links  │  Services  │  Support           │
│  Home         │  Web Dev   │  FAQ               │
│  About        │  Design    │  Contact           │
│  Blog         │  SEO       │  Privacy           │
│                                                  │
│  [Newsletter Input] [Subscribe]                  │
│                                                  │
│  [Social Icons]                    © 2026        │
│  bg: #1A1A1A, text: #999999                     │
└─────────────────────────────────────────────────┘
```

- Logo: light logo variant (for dark footer background)
- 3-column link grid
- Newsletter input (UI only — no functionality yet)
- Font Awesome social icons
- Back-to-top button (fixed position, visible after 300px scroll)

### Icons (UX-DR15)

- **Public site:** Font Awesome Free 6.x ONLY
- **Admin (not this story):** Blade Heroicons
- **No emoji as UI icons** anywhere
- Import Font Awesome: `npm install @fortawesome/fontawesome-free`
- Use CSS classes: `<i class="fa-solid fa-code"></i>`

### Accessibility Floor (UX-DR13)

- ♿ **Skip-to-content link:** First focusable element, visible on focus
- ♿ **Landmark regions:** `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>` with `aria-label`
- ♿ **Mobile hamburger:** `aria-expanded` (true/false), `role="dialog"`, `aria-modal="true"`, focus trap
- ♿ **Back-to-top:** `aria-label="Back to top"`
- ♿ **Form labels (later stories):** Visible `<label>` elements required

### NFR-8 Graceful Build Failure

The build MUST fail with a clear error if the API is unreachable. Do NOT silently fall back to defaults during build — that would produce a broken site. The error message should:
1. Indicate the API URL that was unreachable
2. Suggest checking `php artisan serve`
3. Include the underlying error

### Testing Requirements

- `npm run build` produces `out/` directory with static files
- Homepage loads with Header, content area, Footer
- Desktop: full nav visible; Mobile (≤767px): hamburger visible
- Hamburger toggles drawer with overlay, focus trap works
- Back-to-top hidden initially, visible after 300px scroll, smooth-scrolls
- 404 page renders on unknown routes
- CSS vars are injected on `:root` via ThemeProvider
- Build fails with clear error when API is unreachable

### Non-Functional Constraints

- **AD-2:** SSG mode (`output: 'export'`) — no Node runtime on server
- **AD-4:** Theme via CSS custom properties — no hardcoded colors
- **NFR-1:** <200KB JS+CSS bundle, <2s load time
- **NFR-8:** Clear build failure when API unreachable
- **NFR-12:** WCAG 2.2 AA across all public surfaces
- **NFR-14:** Mobile-responsive (≤767px single column)
- **NFR-15:** Admin panel responsiveness (not this story)

### References

- [Source: docs/epics.md#Story-1.6] — Full AC
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-2---Frontend-is-a-static-consumer] — SSG rules
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-4---Theme-system-uses-CSS-custom-properties] — CSS var approach
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Frontend directory structure
- [Source: docs/ux-designs/DESIGN.md#Public-Site-Palette] — Color tokens
- [Source: docs/ux-designs/DESIGN.md#Typography] — Poppins typeface spec
- [Source: docs/ux-designs/DESIGN.md#Components] — Component visual specs
- [Source: docs/ux-designs/EXPERIENCE.md#Public-Site---Behavioral-Specs] — Nav, hamburger, back-to-top
- [Source: docs/ux-designs/EXPERIENCE.md#Accessibility-Floor] — A11Y requirements
- [Source: docs/project-context.md#Nextjs-16-SSG-Frontend] — Frontend rules
- [Source: docs/prds/addendum.md#Why-SSG] — SSG rationale

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
- 404 page with illustration and "Go Home" button.
- `npm run build` produces `out/` directory with static HTML/CSS/JS.

### File List

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
