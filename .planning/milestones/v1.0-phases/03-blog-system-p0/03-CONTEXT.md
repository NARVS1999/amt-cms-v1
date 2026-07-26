# Phase 3: Blog System (P0) - Context

**Gathered:** 2026-07-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Blog post CRUD with rich text editing — admin panel with Quill editor, auto-save, featured image upload, public API for blog listing and single post, and public-facing blog pages (listing + single post).

Covers: Content sanitization (HTMLPurifier), public API filtering (published only), admin blog UX polish (reading time, excerpt auto-gen, sort controls, auto-save indicator), blog integration with public site (homepage section, /blog listing, /blog/[slug] single post, header nav), SEO metadata (auto-generated OG tags), and Quill editor toolbar (minimal + media library for inline images).

Existing implementation from Phase 1-2 provides: BlogPost model, BlogPostController (full CRUD), BlogPostResource, BlogEditor component, admin blog page with table/modal/auto-save, shared Zod schema, admin API functions.

</domain>

<decisions>
## Implementation Decisions

### Content Sanitization
- **D-01:** Sanitize server-side on save — BlogPostController@store and update methods sanitize `$data['content']` before persisting. Clean data at the source. — **Reversibility:** costly — changing sanitization timing affects all existing content in the DB
- **D-02:** Standard HTMLPurifier — allows safe tags (p, h2, h3, strong, em, ul, ol, li, a, img, blockquote, code, pre). Strips `<script>`, `<iframe>`, event handlers. Quill default output is compatible. — **Reversibility:** reversible — can change allowlist without DB migration
- **D-03:** Sanitization logic lives inline in the controller methods — follows existing pattern of inline validation. — **Reversibility:** reversible — can refactor to model mutator later
- **D-04:** Add a one-time migration to backfill/sanitize all existing blog content in the DB. Ensures consistency. — **Reversibility:** one-way — existing content will be permanently modified
- **D-05:** If HTMLPurifier fails or produces unexpected output during save, reject with 422 validation error ("Content could not be processed."). Prevents saving potentially unsafe content. — **Reversibility:** reversible

### Public API Filtering
- **D-06:** Public GET `/api/blog-posts` filters by `is_published = true` only. Drafts are admin-only. Follows the pattern used by Pages. — **Reversibility:** costly — changes public API contract
- **D-07:** Add admin-specific route `GET /api/admin/blog-posts` that returns all posts (drafts + published). Consistent with Pages pattern (`/api/admin/pages`). — **Reversibility:** reversible — adding a new route is additive
- **D-08:** Default sort order for public blog posts is `published_at desc` (newest published first). — **Reversibility:** reversible
- **D-09:** Paginate public blog endpoint at 15 posts per page. SSG build fetches all pages in a loop to get all posts at build time. — **Reversibility:** reversible — can remove pagination later

### Blog Integration with Public Site
- **D-10:** Homepage shows a "Latest Posts" section with 3 blog cards (title, excerpt, featured image, date). Links to individual post pages. — **Reversibility:** reversible — section can be removed from homepage
- **D-11:** Dedicated `/blog` listing page with grid layout (2-3 columns). Shows all published posts with featured images. Paginated if needed. — **Reversibility:** reversible
- **D-12:** Single blog post page at `/blog/[slug]` — featured image hero, title, published date, full Quill content. Clean, readable layout. — **Reversibility:** reversible
- **D-13:** Blog link added to public site header navigation. — **Reversibility:** reversible
- **D-14:** Blog cards on both homepage and /blog listing show featured images. Falls back to placeholder if no image. — **Reversibility:** reversible

### Admin Blog UX Polish
- **D-15:** Show reading time estimate below the Quill editor ("X min read"). Calculated as word count / 200. — **Reversibility:** reversible
- **D-16:** Excerpt field auto-generates from first ~300 chars of content. User can override. Empty excerpt is allowed (nullable). — **Reversibility:** reversible
- **D-17:** Add sort_order controls (up/down arrows) in admin blog table for manual post ordering. — **Reversibility:** reversible — field already exists in DB
- **D-18:** Featured image upload keeps current implementation: file input, preview thumbnail, remove button. Works well, no changes needed. — **Reversibility:** reversible
- **D-19:** Admin blog table shows title + truncated excerpt (not just title). Helps identify posts at a glance. — **Reversibility:** reversible
- **D-20:** Add visual indicator for auto-save state ("Unsaved changes" badge or "Last saved: X minutes ago" text). — **Reversibility:** reversible

### Blog Post URL & 404 Handling
- **D-21:** Individual blog post URL structure is `/blog/[slug]`. Standard, SEO-friendly. — **Reversibility:** costly — URLs may be bookmarked or linked externally
- **D-22:** Blog-specific 404 page for invalid slugs — "Post not found" message with link back to `/blog`. Uses existing not-found.tsx pattern. — **Reversibility:** reversible

### SEO Metadata
- **D-23:** Auto-generate meta description and Open Graph tags from excerpt and post data. No extra admin fields needed. Good enough for v1. — **Reversibility:** reversible — admin SEO fields can be added later
- **D-24:** Fallback to site logo/default image for `og:image` when post has no featured image. Ensures every post has an OG image. — **Reversibility:** reversible

### Quill Editor Toolbar
- **D-25:** Keep minimal toolbar as-is (bold, italic, headers, lists, link, image). Covers most blog writing needs without overwhelming. — **Reversibility:** reversible — toolbar can be expanded later
- **D-26:** Inline image uploads in Quill content use media library picker. Upload/select image, insert URL into content. Reuses existing infrastructure. — **Reversibility:** reversible

### Related Posts
- **D-27:** No related posts in v1. Keep single post page clean — just the post content. Related posts require additional logic (tag/category matching) that can be added later. — **Reversibility:** reversible

### Claude's Discretion
The following areas were identified but not discussed in detail. Claude has flexibility to choose standard/reasonable approaches:

- **Blog post metadata on admin table:** Admin table columns (title, author, status badge, image thumbnail, published date, updated date, actions). Follow existing patterns from services/team tables.
- **Blog post empty state:** When no posts exist, show "No posts yet. Create your first one." (already implemented in current code).
- **Blog post date formatting:** Use `toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })` — consistent with existing admin page.
- **Blog post content sanitization error message:** "Content could not be processed. Please check your content and try again." on 422.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### API & Schema
- `docs/SPEC.md` — Database schemas, API contracts, field definitions (marketing_blog_posts table)
- `docs/ERROR-HANDLING.md` §2.4 — Blog post edge cases (slug conflict, empty content, draft in public API, featured image handling)

### Architecture & Conventions
- `.planning/codebase/ARCHITECTURE.md` — Route structure, controller patterns, model conventions, API endpoints
- `.planning/codebase/CONVENTIONS.md` — Model skeleton, controller pattern, API patterns, admin-api.ts CRUD function pattern
- `.planning/codebase/STACK.md` — Dependencies, build commands, shadcn/ui components, Quill.js config
- `.planning/codebase/INTEGRATIONS.md` — Spatie Media Library config, auth flow, queue setup

### Prior Phase Context
- `.planning/phases/01-foundation-p0/01-CONTEXT.md` — API envelope decisions, media library UI patterns, admin layout
- `.planning/phases/01.1-loading-and-progress-ui/01.1-CONTEXT.md` — Loading states, toast/skeleton/spinner components, form feedback patterns

### Design Direction
- `.claude/skills/sketch-findings-amt-v2/SKILL.md` — Validated design decisions (pulse animation, form feedback, toast behavior)
- `.claude/skills/sketch-findings-amt-v2/references/form-feedback.md` — Form feedback CSS patterns

### Project Context
- `.planning/PROJECT.md` — Project goals, architecture decisions, success metrics
- `.planning/REQUIREMENTS.md` — FR-3 (Blog Posts CRUD)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/backend/app/Models/BlogPost.php` — Already has Spatie Media Library (`InteractsWithMedia`), `featured_image` collection with thumb conversion
- `apps/backend/app/Http/Controllers/Api/BlogPostController.php` — Full CRUD (index, show, store, update, destroy) with validation, auto-set published_at, featured image upload
- `apps/frontend/components/BlogEditor.tsx` — Quill.js wrapper (minimal toolbar: bold, italic, headers, lists, link, image)
- `apps/frontend/app/admin/blog-posts/page.tsx` — Complete admin page: table with skeleton loading, modal form, auto-save (30s), slug generation, featured image upload/preview, delete confirmation, published toggle
- `apps/frontend/lib/admin-api.ts` — BlogPostData interface, fetchBlogPosts, fetchBlogPost, createBlogPost, updateBlogPost, deleteBlogPost functions
- `packages/shared/src/schemas/blog-post.ts` — Zod schemas (BlogPostSchema, BlogPostsResponseSchema, BlogPostResponseSchema)
- `components/ui/` — shadcn primitives (button, card, input, table, alert-dialog, skeleton, spinner, toast)

### Established Patterns
- Admin forms use `'use client'` with `useState`/`useEffect`, token from `localStorage`, CRUD via `lib/admin-api.ts`
- API response pattern: `{ "data": ... }` envelope — parse `response.data` for resource data
- Validation errors (422) rendered inline below inputs (red text)
- Success/error toasts via `ToastProvider` + `useToast()` hook
- Destructive confirmations via `AlertDialog` for delete actions
- Button loading states with context-specific text ("Saving...") + disabled state
- Auto-save uses `setInterval` (30s) with content-only change detection

### Integration Points
- BlogPost model: `apps/backend/app/Models/BlogPost.php` — add HTMLPurifier sanitization in controller
- BlogPostController: `apps/backend/app/Http/Controllers/Api/BlogPostController.php` — sanitize in store/update, add adminIndex method
- Routes: `apps/backend/routes/api.php` — add `/api/admin/blog-posts` route
- Public pages: `apps/frontend/app/(public)/` — add /blog listing page, /blog/[slug] single post page, blog-specific not-found page
- Homepage: `apps/frontend/app/(public)/page.tsx` — add "Latest Posts" section with 3 cards
- Header: `apps/frontend/components/Header.tsx` — add Blog nav link
- Shared schema: `packages/shared/src/schemas/blog-post.ts` — may need updates if API response shape changes
- Zod schemas: `apps/frontend/lib/api.ts` — add fetchBlogPosts for public site (build-time fetch)

</code_context>

<specifics>
## Specific Ideas

- Reading time estimate: calculate as `Math.ceil(wordCount / 200)` where wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
- Excerpt auto-generation: take first 300 chars of content, strip HTML tags, add "..." if truncated
- Auto-save indicator: show "Last saved: X minutes ago" text below the editor, updating every 30s after save
- Blog card layout: consistent with existing services/team card patterns — image on top, title, excerpt, date
- Blog-specific 404: simple centered layout with "Post not found" message and "← Back to Blog" link

</specifics>

<deferred>
## Deferred Ideas

- Related posts (tag/category-based) — deferred to v1.1 or later
- Blog post tags/categories — requires model changes, admin UI, filtering logic
- RSS feed for blog — can be added as a separate phase
- Social sharing buttons on blog posts — frontend-only feature, separate phase
- Admin SEO fields (meta_title, meta_description) — auto-generation from excerpt is sufficient for v1
- Blog post search/filtering in admin — deferred to Phase 6 (Admin Panel)

</deferred>

---

*Phase: 3-Blog System (P0)*
*Context gathered: 2026-07-26*
