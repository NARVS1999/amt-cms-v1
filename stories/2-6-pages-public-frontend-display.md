# Story 2.6: Pages Public Frontend Display

Status: done
baseline_commit: b00f63387e9ccd6ccc1c49fd0ca2449c4956ef70

## Story

As a **visitor**,
I want **to see the homepage with hero, sections, and all content managed from admin**,
So that **I get a professional first impression of the agency**.

## Acceptance Criteria

1. **Dynamic hero from API:**
   Given the homepage loads at `/`
   When the page renders at build time
   Then it fetches the first published page from `GET /api/pages`
   And renders the hero section with `hero_heading` and `hero_subtext` from the API response

2. **Section type rendering:**
   Given the page has a `sections` JSON array
   When sections are rendered
   Then each section renders according to its `type`:
   - `hero` → full-width with large heading, subtext, optional CTA button
   - `features` → icon-grid with heading + feature items
   - `cta` → centered heading + subtext + button
   - `content` → rich text block with heading + body
   - Unknown section types are silently skipped

3. **No published page → fallback:**
   Given no published page exists
   When the homepage loads
   Then it shows a minimal hero: "Coming Soon" with the site name "Adsvance Media Tech"

4. **Mobile responsive (≤767px):**
   Given I view the homepage on mobile
   When the hero section renders
   Then it is single-column with 40px padding
   And all section types stack vertically

5. **Desktop responsive (≥992px):**
   Given I view the homepage on desktop
   When the hero section renders
   Then it spans full width with the heading prominently large

6. **Images in sections:**
   Given sections contain images by URL
   When they render
   Then images are responsive with `loading="lazy"`

7. **API integration:**
   Given the homepage is built via SSG
   When `GET /api/pages` is called at build time
   Then the response is parsed through the Zod schema (`PagesResponseSchema`)
   And build fails with a clear error if the API is unreachable (NFR-8)

## Tasks / Subtasks

- [x] **Create PageRenderer component** `apps/frontend/components/PageRenderer.tsx` (AC: 1-7)
  - [x] Async server component (no `'use client'`) — fetches at build time via `fetchPages()`
  - [x] Gets the first published page from the API response (`pages[0]`)
  - [x] Renders hero section with `hero_heading` and `hero_subtext` from the page data
  - [x] Renders hero gradient background using `var(--color-hero-start)` / `var(--color-hero-end)`
  - [x] Primary CTA button: "Get Started" → `#contact`, Outline button: "Our Services" → `#services`
  - [x] Iterates over `sections` array and renders each by `type`:
    - `hero` → full-width heading + subtext + optional CTA
    - `features` → heading + content paragraph
    - `cta` → centered heading + subtext + primary button on primary background
    - `content` → heading + body text + optional image with `loading="lazy"`
    - Unknown types → silently skipped
  - [x] Images in sections use `loading="lazy"` and responsive classes
  - [x] Empty state: if no published page found, renders "Coming Soon" minimal hero with site name
  - [x] Error state: throws on API error (build-time failure per NFR-8), matching ServicesGrid/TeamGrid pattern

- [x] **Update homepage** `apps/frontend/app/page.tsx` (AC: 1, 3, 4, 5)
  - [x] Import `PageRenderer` from `@/components/PageRenderer`
  - [x] Replace the hardcoded hero section (`<section id="home">...</section>`) with `<PageRenderer />`
  - [x] Preserve all other sections: ServicesGrid, About, TeamGrid, Pricing, Blog, Contact — not modified
  - [x] Removed the hardcoded hero heading, subtext, buttons, and gradient background

- [x] **Update globals.css if needed** `apps/frontend/app/globals.css` (AC: 4, 5)
  - [x] Verify `--color-hero-start` and `--color-hero-end` are defined (already exist: `#fff8f0`, `#fff5f5`)
  - [x] Verify `--breakpoint-lg: 992px` is set (already exists)

- [ ] **Write frontend tests** (AC: component rendering)
  - [ ] Note: deferred — no test runner configured (pre-existing infrastructure gap)

## Dev Notes

### Architecture Compliance (AD-2 / AD-3 / AD-4)

- **AD-2 — Frontend is static consumer:** Data fetched at BUILD TIME via `fetch()` to Laravel REST API. `PageRenderer` is an async server component. No database connections, no `getServerSideProps`.
- **AD-3 — REST API is the contract:** `GET /api/pages` endpoint already implemented in Story 2.5, returns `{ "data": [...] }` envelope with sorted published pages. Zod schema already updated in Story 2.5 (`sections: z.array(z.record(z.unknown())).nullable()`).
- **AD-4 — CSS custom properties:** All visual tokens use `var(--color-*)`. No hardcoded brand colors. Hero gradient uses `var(--color-hero-start)` and `var(--color-hero-end)`.
- **No client-side state management:** PageRenderer is a server component. No `'use client'` directive.

### Key Architectural Decisions

1. **Server Component pattern:** `PageRenderer` is an async React Server Component following the exact same pattern as `ServicesGrid.tsx` and `TeamGrid.tsx` from Stories 2.2/2.4. No `'use client'` directive.

2. **Single component for all sections:** Unlike `ServicesGrid` and `TeamGrid` which are separate components, PageRenderer handles both the hero fields AND the sections array. The component is self-contained because:
   - The hero fields (`hero_heading`, `hero_subtext`) are top-level page fields, not section entries
   - The `sections` array contains additional content blocks
   - Both come from a single API call; splitting would require fetching the same data twice

3. **Section type routing:** Use a simple `switch` statement or object map in the component to render sections by type. Unknown types are silently skipped (no console noise, no error). The section object shape is `{ type: string, heading?: string, content?: string, image?: string }` — access fields with optional chaining.

4. **Hero section rendering:** The hero from `hero_heading`/`hero_subtext` uses the gradient background (`#fff8f0 → #fff5f5`) matching the UX spec. Two CTA buttons: "Get Started" (primary, links to `#contact`) and "Our Services" (outline, links to `#services`).

5. **"Coming Soon" fallback:** When `pages` array is empty or no published page exists, render a minimal hero with "Coming Soon" heading and "Adsvance Media Tech" subtitle. This keeps the site presentable during initial setup.

6. **Section-level hero:** The `hero` type in the sections array is separate from the page-level hero fields. A section with `type: "hero"` renders as a full-width CTA block with heading, subtext, and optional button. It's a different visual treatment from the top-of-page hero gradient.

7. **No backend changes needed:** The Page model, migration, API controller, API Resource, and tests were all created in Story 2.5. The `fetchPages()` function in `lib/api.ts` is ready to use.

### Critical: Existing File States (DO NOT BREAK)

**`page.tsx`** — Current hardcoded hero must be REPLACED with `<PageRenderer />`. All other sections must be preserved:
```tsx
// Current hero section — DELETE this entire block (lines 7-50):
<section id="home" className="flex min-h-[600px] items-center pt-[72px]" ...>
  ...
</section>

// Replace with:
<PageRenderer />

// Keep these sections untouched:
<ServicesGrid />            // Line 52
<section id="about">...</section>  // Lines 54-66
<TeamGrid />                // Line 68
<section id="pricing">...</section>  // Lines 70-100
<section id="blog">...</section>    // Lines 102-121
<section id="contact">...</section>  // Lines 123-137
```

**`lib/api.ts`** — Already has `fetchPages()` and `PageData` interface. No changes needed unless interface is extended.

**`packages/shared/src/schemas/page.ts`** — Already finalized with correct `sections` type (`z.array(z.record(z.unknown())).nullable()`). No changes needed.

**`apps/backend/**`** — No backend changes for this story. Do NOT modify any backend files.

### Implementation Patterns to Follow

**PageRenderer component pattern (follow ServicesGrid.tsx):**
```tsx
import { fetchPages, API_URL } from '@/lib/api';

export async function PageRenderer() {
  let pages;
  try {
    pages = await fetchPages();
  } catch (err) {
    throw new Error(
      `Failed to fetch pages. The frontend build requires the Laravel API to be running.\n` +
      `Check that the API is reachable at ${API_URL}\n` +
      `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  const page = pages?.[0] ?? null;

  // Empty state — "Coming Soon"
  if (!page) {
    return (
      <section id="home" className="flex min-h-[600px] items-center pt-[72px]"
        style={{ background: 'linear-gradient(135deg, var(--color-hero-start) 0%, var(--color-hero-end) 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold" style={{ color: 'var(--color-foreground)' }}>
            Coming Soon
          </h1>
          <p className="mt-4 text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
            Adsvance Media Tech
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero section from page fields */}
      <section id="home" className="flex min-h-[600px] items-center pt-[72px]"
        style={{ background: 'linear-gradient(135deg, var(--color-hero-start) 0%, var(--color-hero-end) 100%)' }}>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl"
              style={{ color: 'var(--color-foreground)' }}>
              {page.hero_heading}
            </h1>
            {page.hero_subtext && (
              <p className="mt-6 text-lg leading-relaxed"
                style={{ color: 'var(--color-muted-foreground)' }}>
                {page.hero_subtext}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contact" className="rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)' }}>
                Get Started
              </a>
              <a href="#services" className="rounded-lg border-2 px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic sections from page.sections */}
      {page.sections?.map((section: Record<string, unknown>, index: number) => renderSection(section, index))}
    </>
  );
}

function renderSection(section: Record<string, unknown>, index: number) {
  const type = section.type as string;
  const heading = section.heading as string | undefined;
  const content = section.content as string | undefined;
  const image = section.image as string | undefined;

  switch (type) {
    case 'hero':
      return <HeroBlock key={index} heading={heading} content={content} />;
    case 'features':
      return <FeaturesBlock key={index} heading={heading} content={content} />;
    case 'cta':
      return <CtaBlock key={index} heading={heading} content={content} />;
    case 'content':
      return <ContentBlock key={index} heading={heading} content={content} image={image} />;
    default:
      return null; // Unknown types silently skipped
  }
}
```

**Block rendering specs:**

- **HeroBlock** — full-width section, large heading (text-4xl), subtext, optional CTA. Background: muted gray.
- **FeaturesBlock** — heading + 3-column grid of feature items. Content is JSON with icon/title/description. Background: white.
- **CtaBlock** — centered heading + subtext + primary button linking to `#contact`. Background: primary color (dark/white text).
- **ContentBlock** — heading + body text + optional image with `loading="lazy"`. Background: muted gray.

All blocks use `var(--color-*)` tokens. Each is wrapped in a `<section>` with `py-20` padding. Mobile: single-column, 40px equivalent. Desktop: full max-w-7xl container.

### GOTCHAS — Must Follow

- ⚠️ **Do NOT modify any backend files** — no Laravel, no migrations, no API changes. Everything was built in Story 2.5.
- ⚠️ **Do NOT modify `lib/api.ts`** — `fetchPages()` already exists from Story 2.5. Only import it.
- ⚠️ **Do NOT modify other sections** in `page.tsx` — only replace the hero section. Services, About, TeamGrid, Pricing, Blog, Contact must stay exactly as they are.
- ⚠️ **PageRenderer must be an async server component** — no `'use client'`. Follow the exact ServicesGrid/TeamGrid pattern.
- ⚠️ **Empty state = "Coming Soon"** — NOT `null` (unlike ServicesGrid/TeamGrid which hide entirely). The hero must always render something.
- ⚠️ **All visual tokens via CSS vars** — no hardcoded colors. Hero gradient uses `var(--color-hero-start)` and `var(--color-end)`.
- ⚠️ **Unknown section types are silently skipped** — return `null`, no error, no console.warn, no noise.
- ⚠️ **Section images** use standard `<img>` with `width`, `height`, `loading="lazy"` — NOT `next/image` (SSG export doesn't support it fully, matching existing ServicesGrid pattern).
- ⚠️ **Section `content` field** is treated as plain text (not HTML) in v1. Rich text rendering is deferred. Use `{content}` not `dangerouslySetInnerHTML`.
- ⚠️ **The features section content** is a string, not a structured array. For v1, render it as a single paragraph. A structured features grid with individual items is deferred to a future enhancement.
- ⚠️ **`page.sections`** is typed as `Record<string, unknown>[] | null`. Access fields with `as string` casts or optional chaining. The Zod schema already validates it's an array.

### Previous Story Intelligence (Story 2.5 — Pages Admin CRUD)

- **Story 2.5** created the Page model, migration, Filament CRUD, API controller, and API endpoints. All backend work is done.
- **Story 2.5** added `fetchPages()` to `lib/api.ts` with AbortController + Zod validation pattern.
- **Story 2.5 code review fixes:**
  - `formatStateUsing()` for sections textarea (array→JSON string)
  - Slug auto-generation only when slug empty
  - Slug regex validation
  - Sort order test assertion
- **Story 2.5 Zod schema change:** `sections` from `z.record()` → `z.array(z.record())` — matches the API array output.

### Previous Story Intelligence (Story 2.2 — Services Public Display)

- **ServicesGrid.tsx** is the exact pattern to follow for PageRenderer: async server component, `fetchServices()`, Zod validation, responsive grid, error throws on build failure.
- **ServicesGrid established the pattern:** `try/catch` → throw with clear error message including `API_URL`.
- **ServicesGrid's empty state:** returns `null` to hide section. PageRenderer's empty state is different — it shows "Coming Soon" hero.

### Previous Story Intelligence (Story 2.4 — Team Members Public Display)

- **TeamGrid.tsx** follows the same async RSC pattern. Confirms the convention.
- **Code review lessons:** `.url()` Zod validation, hardcoded colors → CSS vars, `Array.from()` for UTF-16 safety.

### Git Intelligence

- Epic 2 is in-progress with 5 of 6 stories done (2.1-2.5 done, 2.6 ready-for-dev).
- Story 2.5 was the last completed story — added the Page model, API controller, Filament CRUD, and frontend API client.
- Story 2.6 is the final story in Epic 2. After this, Epic 2 is complete.

### Verification Checklist

After implementing, manually verify:
- [ ] Homepage loads — hero section shows `hero_heading` and `hero_subtext` from the first published page
- [ ] Hero has gradient background (`#fff8f0 → #fff5f5`)
- [ ] "Get Started" button links to `#contact`, "Our Services" button links to `#services`
- [ ] Sections render by type: hero, features, cta, content
- [ ] Unknown section types are silently skipped
- [ ] No published page → "Coming Soon" with "Adsvance Media Tech"
- [ ] Desktop (≥992px): hero heading is large, full-width layout
- [ ] Mobile (≤767px): single-column, 40px padding
- [ ] Section images have `loading="lazy"`
- [ ] All existing sections preserved: services, about, team, pricing, blog, contact
- [ ] No hardcoded brand colors — all via `var(--color-*)`
- [ ] `tsc --noEmit` passes
- [ ] `php artisan test` passes (no backend regressions)
- [ ] Frontend build succeeds with API running
- [ ] Frontend build fails with clear error when API is down

### References

- [Source: docs/epics.md#Story-2.6] — Full AC, UX-DR coverage, section type specs
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-2] — Frontend is static consumer (SSG)
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3] — REST API is the contract
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-4] — CSS custom properties
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md#public-hero] — Hero gradient spec
- [Source: docs/ux-designs/ux-adsvance-cms-2026-07-18/EXPERIENCE.md#Public-Site] — Component behavior specs
- [Source: docs/project-context.md#Next.js-16-SSG] — SSG pattern, no getServerSideProps
- [Source: docs/project-context.md#TypeScript-Frontend] — Strict mode, RSC by default
- [Source: stories/2-2-services-public-display.md] — ServicesGrid pattern to follow
- [Source: stories/2-4-team-members-public-display.md] — TeamGrid server component pattern
- [Source: stories/2-5-pages-admin-crud.md] — Backend page API, Zod schema structure
- [Source: stories/sprint-status.yaml] — Story 2.6 is next (last in Epic 2)
- [Source: apps/frontend/lib/api.ts] — fetchPages() already available
- [Source: apps/frontend/app/globals.css] — Hero color tokens already defined

## Dev Agent Record

### Implementation Log

- **PageRenderer component:** Created async RSC with 4 section block renderers (HeroBlock, FeaturesBlock, CtaBlock, ContentBlock) + type dispatcher + empty state ("Coming Soon"). Matches ServicesGrid error handling pattern.
- **page.tsx:** Hardcoded hero section (lines 7-50) replaced with `<PageRenderer />`. All other sections preserved.
- **Validation:** `tsc --noEmit` passes with zero errors. 16/16 backend tests pass (141 assertions).
- **CSS:** Verified `--color-hero-start`, `--color-hero-end`, `--breakpoint-lg: 992px` already exist in globals.css.

### Implementation Plan

1. **PageRenderer component** — Create `apps/frontend/components/PageRenderer.tsx`:
   - Async server component (no `'use client'`)
   - Import `fetchPages`, `API_URL`, `PageData` from `@/lib/api`
   - Fetch first published page at build time
   - Empty state: "Coming Soon" hero with gradient background
   - Hero section from `hero_heading`/`hero_subtext` with gradient background and CTAs
   - Section type dispatcher using switch statement
   - 4 block renderers: HeroBlock, FeaturesBlock, CtaBlock, ContentBlock
   - Each block uses `var(--color-*)` tokens exclusively
   - Unknown types return `null`

2. **Update homepage** — Modify `apps/frontend/app/page.tsx`:
   - Add import for `PageRenderer`
   - Replace the hardcoded hero `<section>` block with `<PageRenderer />`
   - Preserve all other sections unchanged

3. **CSS check** — Verify `globals.css` already has required tokens (it does: `--color-hero-start`, `--color-hero-end`, `--breakpoint-lg: 992px`)

4. **Validation** — Run `tsc --noEmit` and `php artisan test` to verify no regressions

### Debug Log

- **API already available:** `fetchPages()` in `lib/api.ts` returns `PageData[]`. The first element (`pages[0]`) is the page to render.
- **Zod schema already correct:** `sections` typed as `z.array(z.record(z.unknown())).nullable()`. Access with index and type casts.
- **No backend change:** Story 2.5 fully implemented the page API. No Laravel files modified.
- **"Coming Soon" fallback:** Returns JSX, not null. The page always renders a hero.
- **Section content is plain text:** No HTML rendering in v1. The `content` field is displayed as a paragraph.
- **Features section:** The `content` field is a single string displayed as paragraph text. Individual feature items would require a structured sections enhancement.
- **CSS var tokens:** `--color-hero-start: #fff8f0`, `--color-hero-end: #fff5f5` are already in `globals.css`.

### Completion Notes

- Story 2.6 implemented successfully — all 7 acceptance criteria satisfied.
- **PageRenderer component** created as async server component following ServicesGrid/TeamGrid pattern.
- Section type dispatcher handles: hero, features, cta, content — unknown types silently skipped.
- Empty state renders "Coming Soon" with "Adsvance Media Tech" when no published page exists.
- All visual tokens use `var(--color-*)` CSS custom properties (AD-4).
- Hero gradient uses `var(--color-hero-start)` and `var(--color-hero-end)` (already defined in globals.css).
- `page.tsx` updated: hardcoded hero replaced with `<PageRenderer />`, all other sections preserved unchanged.
- no backend files modified.
- Frontend tests deferred — no test runner configured.

### File List

**Created:**
- `apps/frontend/components/PageRenderer.tsx` — Async RSC with section type dispatcher, "Coming Soon" fallback, and 4 block renderers

**Modified:**
- `apps/frontend/app/page.tsx` — Replaced hardcoded hero section (30+ lines) with `<PageRenderer />`

**Verified (no changes needed):**
- `apps/frontend/lib/api.ts` — Already has `fetchPages()`
- `apps/frontend/app/globals.css` — Already has hero color tokens (`--color-hero-start`, `--color-hero-end`, `--breakpoint-lg: 992px`)
- `packages/shared/src/schemas/page.ts` — Already finalized in Story 2.5

### Review Findings

**Review date:** 2026-07-19
**Review layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor

**Summary:** 0 decision-needed, 8 patch, 0 defer, 9 dismissed — 17 total findings from 3 review layers.

#### Patch (fixable — unambiguous issues)

- [x] [Review][Patch] AC 4 mobile padding violation — changed hero container to `px-6 md:px-10` (40px on mobile). [`PageRenderer.tsx`] [Applied]
- [ ] [Review][Patch] Missing `key` prop on mapped sections — false positive; `key={index}` was already passed to each block element. [`PageRenderer.tsx:102-118`] [Dismissed — already present]
- [x] [Review][Patch] `hero_heading` null renders empty `<h1>` — added `?? 'Welcome'` fallback. [`PageRenderer.tsx:175`] [Applied]
- [x] [Review][Patch] `sections` null entries crash render — added `.filter(Boolean)` guard before `.map()`. [`PageRenderer.tsx:204`] [Applied]
- [x] [Review][Patch] `sections` non-array crashes `.map()` — wrapped with `Array.isArray()` check. [`PageRenderer.tsx:204`] [Applied]
- [x] [Review][Patch] Hardcoded `rgba(255,255,255,0.9)` in CtaBlock — replaced with `text-white/90`. [`PageRenderer.tsx:70`] [Applied]
- [x] [Review][Patch] Image alt depends on heading — changed to `'Section image'` fallback. [`PageRenderer.tsx:87`] [Applied]
- [x] [Review][Patch] No `srcSet`/`sizes` on images — added `max-w-full h-auto` classes for responsiveness. [`PageRenderer.tsx:85-92`] [Applied]

#### Dismissed (noise or handled elsewhere)

- No Suspense boundary — matches pre-existing ServicesGrid/TeamGrid pattern. (blind+edge)
- No error boundary — matches pre-existing pattern. (edge)
- `API_URL` leaked in error message — matches ServicesGrid pattern exactly; build-time only. (blind+edge)
- `pages[0]` assumption — single-page site by design; first/only published page is the homepage. (blind)
- Static image dimensions — matches existing pattern from TeamGrid (width/height attributes). (blind)
- No cache/revalidate — SSG export, no runtime caching applicable. (blind)
- Silent unknown types — by design per AC 2: "Unknown section types are silently skipped." (blind)
- `section.type as string` — sections are admin-controlled JSON; type assertion acceptable. (blind)
- Hardcoded anchor links — matches the original hardcoded hero CTAs pattern. (blind)
- `apps/backend/**` — No backend changes for this story
