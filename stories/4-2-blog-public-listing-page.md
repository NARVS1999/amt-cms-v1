# Story 4.2: Blog Public Listing Page

Status: ready-for-dev

## Story

As a **visitor**,
I want **to browse published blog posts on `/blog`**,
So that **I can read agency updates and insights**.

## Acceptance Criteria

1. **Blog listing page at `/blog`:**
   Given I visit `/blog`
   When the page loads
   Then I see a heading "Blog" with subtitle line
   And a grid of blog post cards

2. **Blog card content:**
   Given a blog card renders
   When I inspect it
   Then it shows: featured image (16:9 aspect ratio container), title, excerpt (truncated 2 lines), published date (formatted "Month DD, YYYY"), and "Read More" link

3. **Card click navigates to `/blog/{slug}`:**
   Given I click a blog card or "Read More" link
   When I interact
   Then I navigate to `/blog/{slug}`

4. **Client-side pagination (6 per page):**
   Given there are more than 6 published posts
   When the listing renders
   Then pagination controls appear at the bottom: "Previous" and "Next" buttons
   And clicking "Next" shows the next 6 posts
   And clicking "Previous" shows the previous 6 posts
   And buttons are disabled at boundaries (no "Previous" on page 1, no "Next" on last page)

5. **Responsive grid:**
   Given I am on mobile (≤767px)
   When the listing renders
   Then cards stack in a single column
   Given I am on desktop (≥992px)
   Then cards display in a 3-column grid

6. **Empty state:**
   Given no published posts exist
   When the page loads
   Then I see a message: "No posts yet. Check back soon."

7. **No featured image fallback:**
   Given a post has no featured image
   When the card renders
   Then it shows a muted placeholder with a blog icon

8. **Card hover effect:**
   Given I hover over a blog card
   When CSS transitions apply
   Then the card lifts (translateY(-4px)) with shadow elevation
   And the image area maintains its proportions

9. **Public API only returns published posts:**
   Given the controller's public `index()` method is called
   When the query executes
   Then only posts with `is_published = true` are returned
   And results are sorted by `published_at` descending (newest first)
   And `content` is excluded from list responses

10. **Admin list remains unaffected:**
    Given the admin blog-posts page fetches from `GET /api/admin/blog-posts`
    When the admin index loads
    Then ALL posts (published + draft) are returned
    And ordering is by `created_at` descending

## Tasks / Subtasks

- [ ] **Update BlogPostController — split public vs admin index** (AC: #9, #10)
  - [ ] Modify `index()` to filter `->where('is_published', true)` and order by `published_at desc`
  - [ ] Add `adminIndex()` method that returns ALL posts ordered by `created_at desc` (existing behavior)
  - [ ] Add `use App\Models\BlogPost;` if not already present

- [ ] **Add admin blog-posts list route** (AC: #10)
  - [ ] In `routes/api.php` inside `auth:sanctum` group: `Route::get('/admin/blog-posts', [BlogPostController::class, 'adminIndex']);`

- [ ] **Add public fetch function in `lib/api.ts`** (AC: #1, #9)
  - [ ] Add `BlogPostData` interface matching `BlogPostResource` index shape (no `content` field — use Zod schema type but omit content for list)
  - [ ] Add `fetchBlogPosts(): Promise<BlogPostData[]>` function following same pattern as `fetchServices()` / `fetchTeamMembers()`:
        - 5s timeout via AbortController
        - Fetch `${API_URL}/blog-posts`
        - Zod schema parse via `BlogPostsResponseSchema`
        - Return `parsed.data`
        - Catch errors → return `[]` (fail gracefully at build time)

- [ ] **Create `components/BlogCard.tsx`** (AC: #2, #3, #7, #8)
  - [ ] Server component (no `'use client'`)
  - [ ] Props: `title`, `slug`, `excerpt`, `featured_image_url`, `published_at`
  - [ ] Card structure: Entire card is a clickable `<a href="/blog/${slug}">`
  - [ ] 16:9 aspect ratio image container using Tailwind `aspect-video` (or `aspect-[16/9]` in Tailwind v4)
  - [ ] Image: `<img>` with `loading="lazy"`, or placeholder div if no image (muted background + blog icon `<i className="fa-solid fa-newspaper" />`)
  - [ ] Date formatted as "Month DD, YYYY" (e.g., "January 15, 2026") using a simple date formatter (no date library)
  - [ ] Title: 18px font-semibold, excerpt: 14px `line-clamp-2` in muted-foreground
  - [ ] "Read More" link: primary color, small text, with arrow icon
  - [ ] Hover: `transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`
  - [ ] Border: `border border-[var(--color-border)]`, radius `rounded-xl`, bg `var(--color-background)`

- [ ] **Create `components/BlogListings.tsx` (Client Component)** (AC: #2, #3, #4, #5, #6, #7, #8)
  - [ ] `'use client'` — manages pagination state
  - [ ] Props: `posts: BlogPostData[]` (all published posts fetched server-side)
  - [ ] Local state: `currentPage` (number, starts at 1)
  - [ ] `POSTS_PER_PAGE = 6`
  - [ ] Compute `totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)`
  - [ ] Slice `posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)` for current page
  - [ ] Empty state: if `posts.length === 0` → show "No posts yet. Check back soon."
  - [ ] Grid: `grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3`
  - [ ] Pagination controls: Previous button (disabled on page 1), "Page X of Y" text, Next button (disabled on last page)
  - [ ] Previous/Next buttons styled with `var(--color-primary)` using outline-style, disabled at boundaries
  - [ ] `aria-live="polite"` region announces page change

- [ ] **Create `app/blog/page.tsx`** (AC: #1, #6)
  - [ ] Async server component
  - [ ] Fetch all published posts at build time via `fetchBlogPosts()`
  - [ ] Error handling: if fetch fails, throw meaningful error (same pattern as ServicesGrid/PricingTable)
  - [ ] Render heading "Blog" with subtitle, then `<BlogListings posts={posts} />`

- [ ] **Update admin-blog-posts page to use admin endpoint** (AC: #10)
  - [ ] In `apps/frontend/app/admin/blog-posts/page.tsx`, change `fetchBlogPosts()` call to use `fetchAdminBlogPosts()` (or equivalent that hits `GET /api/admin/blog-posts`)
  - [ ] Add `fetchAdminBlogPosts()` to `lib/admin-api.ts` hitting `/admin/blog-posts`

- [ ] **Write feature tests** (AC: #9, #10)
  - [ ] Create `tests/Feature/BlogPostsPublicTest.php`
  - [ ] Test: `GET /api/blog-posts` returns only published posts
  - [ ] Test: `GET /api/blog-posts` excludes draft posts
  - [ ] Test: `GET /api/blog-posts` sorted by `published_at` descending
  - [ ] Test: `GET /api/blog-posts` returns empty data when no published posts exist
  - [ ] Test: `GET /api/admin/blog-posts` (authenticated) returns ALL posts including drafts

## Dev Notes

### Architecture Compliance (AD-1 / AD-2 / AD-3 / AD-5)

- **AD-1 (Flat Laravel):** BlogPostController stays in `app/Http/Controllers/Api/`. No new model needed.
- **AD-2 (SSG only):** Blog listing page is an async server component. Fetches data at build time via `fetch()` to Laravel API. No `getServerSideProps`, no DB access from frontend.
- **AD-3 (REST API contract):** Response stays in `{ "data": [...] }` envelope. Pagination is client-side (all posts fetched at build time, paginated in-browser).
- **AD-5 (Admin is sole authority):** Only published posts returned by public endpoint. Admin index shows all posts.
- **NFR-1 (Performance):** Blog listing is pre-built static HTML. Client pagination JS is minimal (<2KB).

### Prior Art & Patterns (COPY THESE)

**Pattern from `PricingTable.tsx` / `ServicesGrid.tsx`:**
```typescript
// All public display components follow this exact pattern:
export async function ServicesGrid() {
  let services;
  try {
    services = await fetchServices();     // fetch from lib/api.ts
  } catch (err) {
    throw new Error(                       // meaningful build-time error
      `Failed to fetch services. ...` +
      `Check that the API is reachable at ${API_URL} ...`
    );
  }
  if (!services || services.length === 0) return null;  // empty = hide
  return (
    <section>...</section>                // responsive grid
  );
}
```

**Card hover pattern (from `PricingCard`/`ServiceCard`):**
```tsx
className="rounded-xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
style={{ borderColor: 'var(--color-border)' }}
```

**CSS var usage — NO hardcoded brand colors:**
```tsx
style={{ color: 'var(--color-foreground)' }}  // ✅ correct
style={{ color: 'var(--color-muted-foreground)' }}  // ✅ correct
// className="text-gray-500" ❌ wrong
// style={{ color: '#333' }} ❌ wrong
```

**Date formatting (no library):**
```typescript
// Use this exact pattern in BlogCard.tsx
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
```

### Key Architectural Decisions

1. **Client-side pagination (not server-side):** All published posts are fetched at build time. Pagination is handled client-side in `<BlogListings>` component (6 per page). This avoids complex SSG pagination pre-building for v1. When post count grows large, migrate to server-side pagination with pre-built pages.

2. **No `content` in list API response:** `BlogPostResource` already conditionally excludes `content` (only present in `show`). No change needed.

3. **Admin/public split:** Following the PageController pattern (`index` = public, `adminIndex` = auth). The existing `index()` will be changed to public-only. An `adminIndex()` method is added for the admin list.

4. **Sort order change:** Public list sorts by `published_at` descending (newest first). Admin list keeps `created_at` descending.

5. **`BlogPostData` in public `api.ts` vs admin `admin-api.ts`:** The public `BlogPostData` in `lib/api.ts` should NOT include `content` (since it's never returned by the list endpoint). The admin `BlogPostData` in `lib/admin-api.ts` DOES include `content` (for edit form). These are separate interfaces — the Zod schema (`BlogPostSchema`) includes `content` always, so parsing the list response through it will pass (extra fields are ignored by Zod's `strip` mode).

### Files to CREATE

| # | File | Purpose |
|---|------|---------|
| 1 | `apps/frontend/app/blog/page.tsx` | Blog listing page (async server component) |
| 2 | `apps/frontend/components/BlogCard.tsx` | Blog card component |
| 3 | `apps/frontend/components/BlogListings.tsx` | Client component with pagination state |

### Files to UPDATE

| # | File | Change |
|---|------|--------|
| 1 | `apps/backend/app/Http/Controllers/Api/BlogPostController.php` | Modify `index()` to filter published; add `adminIndex()` |
| 2 | `apps/backend/routes/api.php` | Add `Route::get('/admin/blog-posts', ...)` inside `auth:sanctum` group |
| 3 | `apps/frontend/lib/api.ts` | Add `BlogPostData` interface + `fetchBlogPosts()` |
| 4 | `apps/frontend/lib/admin-api.ts` | Add `fetchAdminBlogPosts()` hitting `/admin/blog-posts` |
| 5 | `apps/frontend/app/admin/blog-posts/page.tsx` | Switch to `fetchAdminBlogPosts()` |
| 6 | `apps/backend/tests/Feature/BlogPostsTest.php` | Add public-only filter tests (or create new test class) |

### Existing File States (DO NOT BREAK)

**`BlogPostController.php` — `index()` method (currently returns ALL posts):**
```php
public function index()
{
    $posts = BlogPost::query()
        ->with('media')
        ->orderBy('created_at', 'desc')
        ->get();
    return $this->success(BlogPostResource::collection($posts));
}
```
**Change to:** filter `->where('is_published', true)` and `->orderBy('published_at', 'desc')`.

**Add `adminIndex()`:**
```php
public function adminIndex()
{
    $posts = BlogPost::query()
        ->with('media')
        ->orderBy('created_at', 'desc')
        ->get();
    return $this->success(BlogPostResource::collection($posts));
}
```
(Move the current `index()` body into `adminIndex()`)

**`routes/api.php`** — Already has public routes. Add inside `auth:sanctum` group (after blog-post admin CRUD routes, around line 85):
```php
// Admin: list all blog posts (including drafts)
Route::get('/admin/blog-posts', [BlogPostController::class, 'adminIndex']);
```

**`admin-api.ts`** — Has `fetchBlogPosts()` hitting `/blog-posts`. Add `fetchAdminBlogPosts()`:
```typescript
export async function fetchAdminBlogPosts(): Promise<{ data: BlogPostData[] }> {
  return request('/admin/blog-posts');
}
```

**`app/admin/blog-posts/page.tsx`** — Currently uses `fetchBlogPosts()` (import from `admin-api.ts`). Change to `fetchAdminBlogPosts()` and update the import.

**`BlogPostResource.php`** — Already correct. Conditionally excludes `content` for index (when `getActionMethod() === 'show'`). No change needed.

**`BlogPostsTest.php`** — Current tests check basic structure. Add tests for:
- Published-only filter on public endpoint
- Draft posts excluded from public endpoint
- Admin endpoint returns all posts

### Existing Zod Schema Reference (`packages/shared/src/schemas/blog-post.ts`)

```typescript
export const BlogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),       // included in schema but not in list response
  excerpt: z.string().nullable(),
  featured_image_url: z.string().nullable(),
  published_at: z.string().nullable(),
  is_published: z.boolean().default(false),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
```
Zod strips unknown fields by default, so missing `content` on the list endpoint will NOT cause a parse error — Zod will set it to undefined, but since `content` is `z.string()` (not nullable), it may throw. **Fix:** In the public `BlogPostData` interface in `lib/api.ts`, make `content` optional:
```typescript
export interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  content?: string;       // optional — only present in show response
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
}
```

### BlogCard Visual Spec (from DESIGN.md)

- Card: White background, `rounded-xl`, 1px border (`var(--color-border)`)
- Image area: 200px height (`h-48`), 16:9 aspect ratio (`aspect-video`)
- Image: `object-cover`, `rounded-t-xl` (top corners only)
- No-image placeholder: muted bg (`var(--color-muted)`), centered `fa-newspaper` icon in muted-foreground
- Body: padding `p-5`
- Date: 12px, `var(--color-primary)`, uppercase
- Title: 18px, `font-semibold`, `var(--color-foreground)`
- Excerpt: 14px, `line-clamp-2`, `var(--color-muted-foreground)`
- Hover: `translateY(-4px)`, `shadow-lg`
- Entire card is `<a>` tag linking to `/blog/{slug}`

### Testing Standards

- Add tests to existing `BlogPostsTest.php` or create `BlogPostsPublicTest.php`
- Use `RefreshDatabase` trait (SQLite in-memory)
- Key tests:
  - Create 3 published + 2 draft posts → GET `/api/blog-posts` returns 3
  - Create 0 published posts → GET `/api/blog-posts` returns empty `data`
  - Verify sort order: create posts with different `published_at` values, verify newest first
  - GET `/api/admin/blog-posts` with auth → returns all 5 posts
- Run: `cd apps/backend && php artisan test --filter=BlogPosts`

### Verification Checklist

After implementing, manually verify:
- [ ] Visit `/blog` — heading "Blog" with subtitle
- [ ] With 7+ published posts — cards display in 3-col grid on desktop, 1-col on mobile
- [ ] Pagination shows 6 per page, Previous/Next works correctly
- [ ] Clicking a card navigates to `/blog/{slug}` (Story 4.3 will build this page)
- [ ] Post with no featured image shows placeholder icon
- [ ] Empty state: "No posts yet. Check back soon." when 0 published posts
- [ ] Hover effect: card lifts with shadow
- [ ] Date displays as "Month DD, YYYY" format
- [ ] Draft posts do NOT appear on `/blog`
- [ ] Admin blog-posts list still shows all posts
- [ ] `GET /api/blog-posts` returns only published, sorted newest first
- [ ] `GET /api/blog-posts` does NOT include `content` field in list items

### Previous Story Intelligence

- **Story 4.1** implemented full admin CRUD: BlogPost model (Spatie Media Library), migration, factory, resource, controller, routes, admin page, tests. IMPORTANT: The `index()` currently returns ALL posts (no `is_published` filter) — this story must fix that.
- **Story 4.1 code review fix (`addb5e7`):** Server-side `published_at` handling, 2MB file validation, "Saved." toast. All admin patterns are stable.
- **Story 4.1 Zod schema:** `BlogPostSchema` includes `content` as required. The public list API doesn't return `content`, so the public `BlogPostData` interface should make `content` optional.
- **Review patterns from Stories 2.2, 3.2, 2.4:** Public display stories follow the same pattern: async server component → fetch from `lib/api.ts` → render grid with cards. Blog is the first public display story to need client-side pagination.
- **Story 1.7** shared schemas: `BlogPostSchema` created in `packages/shared/src/schemas/blog-post.ts`. Reuse in public `api.ts` for Zod validation.

### Git Intelligence

- Most recent work: Story 4.1 (Blog Posts Admin CRUD) — `876b804` (main), `addb5e7` (review fixes), `5186138` (marked done)
- Previous public display stories: `3720857` (Story 3.2 Pricing), `fdc74ea` (marked done)
- Epic 4 has 2 remaining backlog stories: 4.2 (this one) and 4.3 (single post page)

### References

- [Source: docs/epics.md#Story-4.2] — Full AC, pagination spec, API endpoint, UX-DR coverage
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-2] — SSG only, no getServerSideProps
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3] — REST API `{ "data": ... }` envelope
- [Source: docs/project-context.md#Critical-Dont-Miss-Rules] — Published filtering at query level
- [Source: docs/ux-designs/DESIGN.md] — Blog Card visual specs (200px image, 10px radius, hover lift)
- [Source: docs/ux-designs/EXPERIENCE.md] — Blog card behavioral patterns (entire card clickable)
- [Source: stories/4-1-blog-posts-admin-crud.md] — Previous story, existing BlogPost implementation
- [Source: stories/2-2-services-public-display.md] — Pattern for public display story
- [Source: stories/3-2-pricing-plans-public-display.md] — Pricing public display for reference
- [Source: stories/sprint-status.yaml] — Epic 4 in-progress
