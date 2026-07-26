# UI Review — Phase 1.1: Foundation & Core Content

**Date:** 2026-07-26 (re-audit)
**Scope:** Public site homepage, admin panel shell, all implemented components
**Baseline:** `docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md` + `EXPERIENCE.md`

---

## Score Summary

| Pillar | Score | Grade |
|--------|-------|-------|
| Copywriting | 3/4 | B+ |
| Visuals | 3/4 | B+ |
| Color | 3/4 | B+ |
| Typography | 3/4 | B+ |
| Spacing | 4/4 | A |
| Experience Design | 3/4 | B+ |
| **Overall** | **19/24** | **B+** |

---

## 1. Copywriting — 3/4

**Strengths:**
- Public site voice is warm, confident, and non-corporate: "Need a business website?", "No coding required. We handle everything."
- Section headings are clear and benefit-oriented: "Our Services", "Meet Our Team", "Get in Touch"
- Admin panel microcopy is neutral and efficient per spec

**Issues:**
| # | Severity | Location | Finding |
|---|----------|----------|---------|
| C-1 | Medium | `Footer.tsx:35-38` | Services column hardcodes "Web Development", "UI/UX Design", "SEO Optimization", "Digital Marketing" — placeholder strings, not dynamic from API. Should pull from services data or be removed. |
| C-2 | Low | `Footer.tsx:47-49` | "FAQ", "Privacy Policy", "Terms of Service" are disabled placeholders with `cursor-not-allowed`. Should be removed or have proper coming-soon state. |
| C-3 | Low | `page.tsx:62` | Contact section says "Contact form and detailed information coming soon." — placeholder text visible to end users. |

---

## 2. Visuals — 3/4

**Strengths:**
- Service cards follow spec: 64px icon circle with primary→secondary gradient, hover lift with shadow, rounded-xl corners
- Pricing cards match spec: "Most Popular" ribbon badge, check/cross feature icons, primary border on popular variant
- Admin sidebar: 260px dark panel, active state with semi-transparent white bg, Lucide icons per spec
- Back-to-top: fixed position, primary bg, chevron icon, respects `prefers-reduced-motion`

**Issues:**
| # | Severity | Location | Finding |
|---|----------|----------|---------|
| V-1 | Medium | `ServicesGrid.tsx:17-21` | Featured service uses `border-t-2` with accent color. DESIGN.md spec says featured border should be primary (`#FF0000`), not accent (`#FFC107`). |
| V-2 | Medium | `Header.tsx:122-128` | Login button uses `rounded-lg`. DESIGN.md specifies pill radius (`50px`) for public buttons. Desktop login button should be pill-shaped. |
| V-3 | Low | `Footer.tsx:81-92` | Social icons use `#` hrefs with `onClick={e => e.preventDefault()}` — placeholder links visible as clickable but non-functional. Should be removed or use proper URLs. |
| V-4 | Low | `PricingTable.tsx:32` | Pricing card uses `rounded-xl` (12px). DESIGN.md specifies `rounded.public-site.md` = 10px. Minor mismatch. |

---

## 3. Color — 3/4

**Strengths:**
- CSS custom properties correctly implement all DESIGN.md tokens
- Primary red (`#FF0000`) is the single connective token across public and admin surfaces
- Admin sidebar colors match spec: `#1e1b2e` bg, `#a5a3b5` text, white active
- Success/error colors used correctly on pricing check/cross icons
- Header background uses `rgba(255, 255, 255, 0.97)` per spec

**Issues:**
| # | Severity | Location | Finding |
|---|----------|----------|---------|
| K-1 | Medium | `globals.css:15` | `--color-muted-foreground: #888888` — contrast ratio against `#FFFFFF` is 3.6:1, below WCAG AA 4.5:1 for normal text. Should darken to `#767676` (4.5:1) or `#595959` (7:1). |
| K-2 | Low | `globals.css:69` | shadcn `--primary` is `#FF0000` but shadcn's oklch system expects oklch values. Works but may cause inconsistency if shadcn components rely on oklch parsing. |
| K-3 | Low | `globals.css:163-165` | Duplicate `@keyframes toastSlideIn` definition (lines 147-156 and 163-165). |

---

## 4. Typography — 3/4

**Strengths:**
- Poppins loaded for public site, Inter for admin — correct per spec
- Font weights 400, 600, 700, 800 loaded — covers body, semibold, bold, extrabold usage
- Admin sidebar uses Inter with correct sizing (15px/600 for brand, 11px/600 uppercase for group labels)
- Section headings use `text-3xl font-bold` — consistent across all public sections

**Issues:**
| # | Severity | Location | Finding |
|---|----------|----------|---------|
| T-1 | Medium | `layout.tsx:25` | Google Fonts import loads weights 400, 600, 700, 800. `font-extrabold` (800) is used on pricing amounts (`PricingTable.tsx:62`). Verify 800 renders correctly — the import URL includes `wght@400;600;700;800` but the display heading spec calls for 800. |
| T-2 | Low | `globals.css:26-27` | `--font-body` and `--font-heading` both reference `'Poppins'` with fallback `sans-serif`. The CSS `var()` self-reference pattern is redundant — the fallback is never used since the variable is defined in the same block. |

---

## 5. Spacing — 4/4

**Strengths:**
- Consistent `py-20` section padding across all public sections (80px per spec)
- `px-6` content padding consistent across all containers
- `max-w-7xl` (1200px) max-width matches DESIGN.md `page-max: 1200px`
- Grid gaps (`gap-8`) consistent across services, team, and pricing grids
- Admin content area uses 32px padding per spec
- Card padding (`p-6` for service/team cards, `p-8` for pricing) is appropriate

**No spacing issues found.**

---

## 6. Experience Design — 3/4

**Strengths:**
- Skip-to-content link implemented with proper off-screen technique + visible on focus (`globals.css:117-145`)
- Mobile hamburger has `aria-expanded`, `aria-label`, focus trap, body scroll lock, Escape key support
- Back-to-top respects `prefers-reduced-motion` — scrolls instantly when reduced motion is preferred
- Mobile drawer has `role="dialog"`, `aria-modal="true"`, proper focus restoration on close
- Service/team/pricing sections hide entirely when data is empty (graceful empty state)

**Issues:**
| # | Severity | Location | Finding |
|---|----------|----------|---------|
| X-1 | Medium | `Footer.tsx:61-76` | Newsletter form has no `<form>` wrapper, no `onSubmit` handler, no API integration. "Subscribe" button does nothing. Missing field validation, success/error states, and `aria-live` announcements per EXPERIENCE.md. |
| X-2 | Medium | `page.tsx:53-65` | Contact section is a placeholder with no form. EXPERIENCE.md specifies: form with name/email/message, inline validation on blur, success message, rate limiting. None implemented. |
| X-3 | Low | `Header.tsx:109-116` | Desktop nav links lack active section highlighting. EXPERIENCE.md specifies: "Active section highlighted during scroll via Intersection Observer." Not implemented. |
| X-4 | Low | `globals.css:62-93` | Admin theme uses oklch color values for shadcn variables but public site uses hex. Mixed color systems could cause issues when theme settings (Epic 5) dynamically generate CSS. |

---

## Top Fixes (Priority Order)

1. **[X-1] Newsletter form non-functional** — Add `<form>` wrapper, API integration, validation, success/error states
2. **[X-2] Contact form missing** — Implement per EXPERIENCE.md Flow 3 spec
3. **[K-1] Muted foreground contrast** — Darken `#888888` to `#767676` for WCAG AA compliance
4. **[V-1] Featured service border color** — Change from accent to primary
5. **[V-2] Login button shape** — Change from `rounded-lg` to pill radius
6. **[C-1] Footer hardcoded services** — Remove or make dynamic
7. **[X-3] Active nav highlighting** — Add Intersection Observer for scroll-based highlighting

---

## What's Working Well

- CSS custom property architecture is clean and matches DESIGN.md tokens exactly
- Component structure follows spec: service cards with gradient icons, pricing cards with ribbons, team cards with initials fallback
- Accessibility foundation is solid: skip-to-content, focus traps, ARIA attributes, reduced motion support
- Responsive grid system works correctly (1→2→4 column progression)
- Admin sidebar matches spec: correct width, colors, group labels, active states
- Two-surface identity is maintained: public site is warm/inviting, admin is cold/efficient

---

*Reviewed against DESIGN.md (2026-07-18) and EXPERIENCE.md (2026-07-18)*
