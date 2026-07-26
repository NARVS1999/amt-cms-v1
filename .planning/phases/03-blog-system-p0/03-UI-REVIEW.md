# Phase 3 — UI Review

**Audited:** 2026-07-26
**Baseline:** UI-SPEC.md (03-UI-SPEC.md)
**Screenshots:** captured (dev server at localhost:3000)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | All declared copy matches spec; sort buttons missing aria-labels |
| 2. Visuals | 3/4 | Clean hierarchy; hero image missing max-height constraint from spec |
| 3. Color | 4/4 | All CSS custom properties, no hardcoded brand colors, 60/30/10 correct |
| 4. Typography | 3/4 | `prose prose-lg` on single post has no effect (Tailwind Typography not installed) |
| 5. Spacing | 4/4 | Consistent scale, one justified arbitrary value per spec |
| 6. Experience Design | 3/4 | Loading/empty/error states present; textarea label missing htmlFor; sort buttons lack aria-labels |

**Overall: 20/24**

---

## Top 3 Priority Fixes

1. **`prose prose-lg` classes have no effect on single post page** — Blog post content renders without heading styles, list formatting, or image constraints. Install `@tailwindcss/typography` or replace with explicit CSS for h2/h3, lists, images, and blockquotes. (`apps/frontend/app/(public)/blog/[slug]/page.tsx:80`)

2. **Excerpt textarea missing label association** — `<Label>Excerpt</Label>` has no `htmlFor` and `<textarea>` has no `id`, breaking screen reader association. Add `htmlFor="excerpt"` and `id="excerpt"`. (`apps/frontend/app/admin/blog-posts/page.tsx:447-448`)

3. **Sort order buttons missing aria-labels** — Spec declares `aria-label="Move up"` / `aria-label="Move down"` for sort buttons; current implementation has icon-only buttons with no accessible name. (`apps/frontend/app/admin/blog-posts/page.tsx:368-381`)

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**Matching spec (all declared copy verified):**
- "Blog" heading — `blog/page.tsx:28` ✓
- "Tips, guides, and industry updates" — `blog/page.tsx:31`, `LatestPosts.tsx:17` ✓
- "No posts published yet." — `blog/page.tsx:41` ✓
- "No posts yet. Create your first one." — `admin/blog-posts/page.tsx:325` ✓
- "Post not found" — `not-found.tsx:6` ✓
- "The post you're looking for doesn't exist or has been removed." — `not-found.tsx:8` ✓
- "← Back to Blog" — `not-found.tsx:14`, `[slug]/page.tsx:56` ✓
- "Latest Insights" — `LatestPosts.tsx:14` ✓
- "{N} min read" — `[slug]/page.tsx:76`, `admin/blog-posts/page.tsx:443` ✓
- "New Blog Post" — `admin/blog-posts/page.tsx:293` ✓
- "Delete Blog Post" confirmation — `admin/blog-posts/page.tsx:530-532` ✓
- "Last saved: {X} minutes ago" / "just now" — `admin/blog-posts/page.tsx:508-509` ✓
- "Unsaved changes" — `admin/blog-posts/page.tsx:507` ✓
- "View All Posts →" — `LatestPosts.tsx:38` ✓
- "Published" / "Draft" badges — `admin/blog-posts/page.tsx:350` ✓

**Findings:**
- **WARNING:** Sort order buttons (`ChevronUp`/`ChevronDown`) have no `aria-label` attributes. Spec declares `aria-label="Move up"` and `aria-label="Move down"`. Icon-only buttons are inaccessible to screen readers. (`admin/blog-posts/page.tsx:368-381`)
- Pagination buttons ("Previous", "Next", "Page X of Y") not in spec but are sensible defaults — no issue.

### Pillar 2: Visuals (3/4)

**Verified against spec:**
- BlogCard: image on top, title, excerpt (line-clamp-3), date at bottom ✓
- Single post: hero image, title, date·reading time, content below ✓
- Admin table: Title+excerpt, Author, Status, Image, Order, Published At, Updated, Actions ✓
- Admin modal: Title, Slug, Content (Quill), Excerpt, Featured Image, Published toggle ✓
- Reading time below editor ✓
- Sort order controls with ChevronUp/ChevronDown ✓
- Auto-save indicator below form actions ✓

**Findings:**
- **WARNING:** Hero image on single post page missing `max-h-[480px]` constraint. Spec declares `max-h 480px` for the hero image. Current code has `aspect-video` and `object-cover` but no max-height, so very tall images could overflow. (`[slug]/page.tsx:60-66`)
- BlogCard hover effect (scale-105 on image, shadow-md on card) provides good visual feedback ✓
- Loading state on blog listing shows "Loading posts..." text — functional but less polished than skeleton cards (minor).

### Pillar 3: Color (4/4)

**CSS custom property usage (no hardcoded brand colors in blog components):**
- `var(--color-foreground)` — headings, body text ✓
- `var(--color-muted-foreground)` — meta text, excerpts, dates ✓
- `var(--color-primary)` — CTAs, back-to-blog links ✓
- `var(--color-background)` — page backgrounds ✓
- `var(--color-muted)` — section backgrounds, placeholder images ✓
- `var(--color-border)` — card borders ✓
- `var(--color-status-published-bg/text)` — published badge ✓
- `var(--color-status-draft-bg/text)` — draft badge ✓

**60/30/10 distribution verified:**
- 60% dominant: white/`var(--color-background)` surfaces ✓
- 30% secondary: `var(--color-foreground)` text, card borders ✓
- 10% accent: `var(--color-primary)` on CTAs, nav links, "Published" badge ✓

**Hardcoded colors in blog scope:** None (admin sidebar `rgba(255,255,255,0.08)` is outside blog scope).

### Pillar 4: Typography (3/4)

**Font sizes in blog scope:**
- `text-xs` — dates, meta, sort controls, auto-save indicator
- `text-sm` — body, labels, buttons, pagination, reading time, excerpt textarea
- `text-lg` — BlogCard title
- `text-3xl` — section headings (blog listing, latest posts, 404, single post on mobile)
- `text-4xl` — blog listing page heading, single post heading on md+

**Font weights:** `font-medium`, `font-semibold`, `font-bold` — 3 weights (within tolerance).

**Findings:**
- **BLOCKER:** Single post content uses `prose prose-lg` classes (`[slug]/page.tsx:80`) but `@tailwindcss/typography` is NOT installed in the project. These classes have zero effect — blog post content renders without heading sizes, list bullet styling, image max-width, blockquote formatting, or code block styling. The UI-SPEC declares "prose-like styling" with "h2/h3 styled, images max-w-full" which is unmet. Fix: install `@tailwindcss/typography` OR replace `prose prose-lg` with explicit CSS for content elements.
- Blog listing heading uses `text-4xl` while spec declares `text-3xl` for public headings — slight overshoot but acceptable for a page-level heading.

### Pillar 5: Spacing (4/4)

**Spacing scale compliance:**
- `py-20` (80px) — section padding ✓ (matches `3xl` = 64px intent for page-level spacing)
- `px-6` (24px) — container padding ✓ (matches `lg` = 24px)
- `gap-8` (32px) — card grid gaps ✓ (matches `xl` = 32px)
- `gap-4` (16px) — pagination gap ✓ (matches `md` = 16px)
- `mt-12`, `mt-10`, `mt-8`, `mt-6`, `mt-4`, `mt-3` — all multiples of 4 ✓
- `p-5` (20px) — BlogCard content padding (not on scale, but close to `lg` = 24px; acceptable for card internal spacing)
- `space-y-4`, `space-y-2` — admin modal spacing ✓

**Arbitrary values:**
- `max-w-[720px]` — single post content width. Directly specified in UI-SPEC ("Max-width 720px for content"). Justified.

### Pillar 6: Experience Design (3/4)

**State coverage:**
- Loading: Blog listing shows "Loading posts..." text ✓; Admin table shows 4 skeleton rows ✓
- Empty: Blog listing "No posts published yet." ✓; Admin "No posts yet. Create your first one." ✓; LatestPosts hides when 0 posts ✓
- Error: Blog 404 page with heading + back link ✓; Admin error banner for save failures ✓
- Destructive: AlertDialog confirmation for delete ✓
- Auto-save: "Last saved: just now" / "X minutes ago" / "Unsaved changes" ✓
- Disabled: Sort buttons disable at first/last row ✓; Pagination buttons disable at boundaries ✓; Save button disables while saving ✓

**Findings:**
- **WARNING:** Excerpt `<Label>` has no `htmlFor` attribute and `<textarea>` has no `id`. Screen readers cannot associate the label with the input. (`admin/blog-posts/page.tsx:447-448`)
- **WARNING:** Sort order buttons have no `aria-label`. Icon-only buttons are inaccessible to screen readers. (`admin/blog-posts/page.tsx:368-381`)
- Blog listing loading state uses text ("Loading posts...") rather than skeleton cards — functional but inconsistent with admin skeleton pattern (minor).

---

## Files Audited

| File | Lines | Role |
|------|-------|------|
| `apps/frontend/app/(public)/blog/page.tsx` | 92 | Blog listing page (SSG) |
| `apps/frontend/app/(public)/blog/[slug]/page.tsx` | 90 | Single blog post page (SSG) |
| `apps/frontend/app/(public)/blog/not-found.tsx` | 19 | Blog 404 page |
| `apps/frontend/components/BlogCard.tsx` | 46 | Blog card component |
| `apps/frontend/components/LatestPosts.tsx` | 44 | Homepage latest posts section |
| `apps/frontend/components/BlogEditor.tsx` | 57 | Quill editor wrapper |
| `apps/frontend/app/admin/blog-posts/page.tsx` | 543 | Admin blog posts page |
| `apps/frontend/lib/admin-api.ts` | 369 | Admin API functions |
| `apps/frontend/app/(public)/page.tsx` | 50 | Homepage (modified) |
| `apps/frontend/app/globals.css` | 166 | Theme tokens |

---

## UI REVIEW COMPLETE

**Phase:** 3 - Blog System (P0)
**Overall Score:** 20/24
**Screenshots:** captured

### Pillar Summary
| Pillar | Score |
|--------|-------|
| Copywriting | 3/4 |
| Visuals | 3/4 |
| Color | 4/4 |
| Typography | 3/4 |
| Spacing | 4/4 |
| Experience Design | 3/4 |

### Top 3 Fixes
1. Install `@tailwindcss/typography` or replace `prose prose-lg` with explicit CSS — blog post content has no heading/list/image styling
2. Add `htmlFor`/`id` to Excerpt label+textarea in admin form
3. Add `aria-label="Move up"` / `aria-label="Move down"` to sort order buttons

### File Created
`.planning/phases/03-blog-system-p0/03-UI-REVIEW.md`

### Recommendation Count
- Priority fixes: 3
- Minor recommendations: 2 (hero image max-height, blog listing loading skeleton)
