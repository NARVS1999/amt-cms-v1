---
wave: 1
depends_on: [2]
files_modified:
  - apps/backend/app/Http/Controllers/Api/BlogPostController.php
  - apps/backend/routes/api.php
  - apps/backend/app/Models/BlogPost.php
  - apps/backend/database/migrations/2026_07_21_000003_create_marketing_blog_posts_table.php
  - apps/frontend/app/admin/blog-posts/page.tsx
  - apps/frontend/lib/admin-api.ts
  - apps/frontend/components/BlogEditor.tsx
  - docs/SPEC.md
  - apps/backend/tests/Feature/BlogPostsTest.php
autonomous: true
requirements:
  - FR-3 (Manage Blog Posts — CRUD, rich text, publish toggle)
  - NFR-4 (Content Sanitization — HTMLPurifier)
---

# Plan 03-01: Tracer — Blog Admin API + Content Sanitization + Admin UX Polish

**Goal:** End-to-end tracer slice completing the blog backend: public endpoint filtering (published-only), admin endpoint (all posts), HTMLPurifier content sanitization on save, sort_order swap endpoint, and admin page UX polish (sort controls, reading time, auto-save indicator, excerpt auto-gen). Verifiable with `php artisan test --filter=BlogPostsTest` and `npx tsc --noEmit`.

**Review findings incorporated:**
- HIGH-1 (Public API bug): `GET /api/blog-posts` currently returns drafts — fix with `->where('is_published', true)`.
- HIGH-2 (Admin route missing): No `GET /api/admin/blog-posts` — admin uses public route which filters out drafts.
- MEDIUM-1 (Content sanitization): No HTMLPurifier on blog content — add in store/update per D-01/D-02/D-03.
- MEDIUM-2 (Sort order): No sort_order controls in admin — add swap endpoint + UI per D-17.
- MEDIUM-3 (Reading time): No reading time estimate — add below editor per D-15.
- MEDIUM-4 (Auto-save indicator): No visual indicator — add per D-20.
- LOW-1 (Excerpt auto-gen): No excerpt auto-generation — add per D-16.
- LOW-2 (Backfill): No content sanitization migration — add per D-04.

## Tasks

### Task 1: Fix public blog endpoint + add admin blog endpoint

<read_first>
- apps/backend/app/Http/Controllers/Api/BlogPostController.php
- apps/backend/routes/api.php
- apps/backend/app/Http/Resources/Api/BlogPostResource.php
- docs/SPEC.md §3.1 (GET /api/blog-posts)
- docs/ERROR-HANDLING.md §2.4 (Blog Posts)
</read_first>

<action>
1. **In `BlogPostController@index`:** Add `->where('is_published', true)` before `->orderBy`. Change sort to `published_at desc` (not `created_at desc`). This fixes the known bug where drafts appear in public API.
   ```php
   public function index()
   {
       $posts = QueryBuilder::for(BlogPost::class)
           ->allowedSorts(['published_at', 'sort_order'])
           ->allowedFilters([])
           ->with('media')
           ->where('is_published', true)
           ->orderBy('published_at', 'desc')
           ->paginate(15);

       return BlogPostResource::collection($posts);
   }
   ```

2. **Add `adminIndex()` method** to `BlogPostController`:
   ```php
   public function adminIndex()
   {
       $posts = BlogPost::with('media')
           ->orderBy('sort_order', 'asc')
           ->orderBy('published_at', 'desc')
           ->get();

       return $this->success(BlogPostResource::collection($posts));
   }
   ```
   Note: Uses `$this->success()` (admin pattern, flat collection) — NOT `BlogPostResource::collection()` directly (which auto-wraps in `{ data: [...] }` for paginated).

3. **Register routes** in `routes/api.php`:
   - Inside `auth:sanctum` group, add: `Route::get('/admin/blog-posts', [BlogPostController::class, 'adminIndex']);`
   - Keep existing public routes unchanged.
</action>

<acceptance_criteria>
- `GET /api/blog-posts` returns only published posts (no drafts)
- `GET /api/blog-posts` sorts by `published_at desc`
- `GET /api/admin/blog-posts` with auth token returns ALL posts (drafts + published), sorted by `sort_order asc, published_at desc`
- `GET /api/admin/blog-posts` without token → 401
- `php artisan test --filter=BlogPostsTest` — all existing + new tests pass
</acceptance_criteria>

### Task 2: Add HTMLPurifier content sanitization

<read_first>
- apps/backend/app/Http/Controllers/Api/BlogPostController.php
- apps/backend/composer.json
- docs/SPEC.md §3.3 (Blog Posts Admin store/update)
</read_first>

<action>
1. **Install HTMLPurifier** via Composer:
   ```bash
   cd apps/backend && composer require ezyang/htmlpurifier
   ```

2. **Add sanitization helper** to `BlogPostController` (private method):
   ```php
   private function sanitizeContent(string $content): string
   {
       $config = \HTMLPurifier_Config::createDefault();
       $config->set('HTML.Allowed', 'p,h2,h3,strong,em,ul,ol,li,a[href],img[src|alt],blockquote,code,pre');
       $config->set('Attr.AllowedFrameTargets', ['_blank']);
       $purifier = new \HTMLPurifier($config);
       return $purifier->purify($content);
   }
   ```

3. **In `store()` method:** Sanitize `$data['content']` before saving:
   ```php
   $data['content'] = $this->sanitizeContent($data['content']);
   ```

4. **In `update()` method:** Same sanitization before saving.

5. **Add validation error handling:** Wrap in try/catch — if purification fails, return 422:
   ```php
   try {
       $data['content'] = $this->sanitizeContent($data['content']);
   } catch (\Exception $e) {
       return $this->error('Content could not be processed. Please check your content and try again.', 422);
   }
   ```
</action>

<acceptance_criteria>
- `POST /api/blog-posts` with content containing `<script>alert('xss')</script>` → content saved without `<script>` tags
- `PUT /api/blog-posts/{id}` with content containing `<iframe>` → `<iframe>` stripped
- Safe tags (p, h2, h3, strong, em, ul, ol, li, a, img, blockquote, code, pre) preserved
- `composer require ezyang/htmlpurifier` completes without error
- `php artisan test --filter=BlogPostsTest` passes with sanitization tests
</acceptance_criteria>

### Task 3: Add sort_order swap endpoint

<read_first>
- apps/backend/app/Http/Controllers/Api/BlogPostController.php
- apps/backend/routes/api.php
- apps/backend/app/Models/BlogPost.php
</read_first>

<action>
1. **Add `swapSortOrder()` method** to `BlogPostController`:
   ```php
   public function swapSortOrder(Request $request, BlogPost $blogPost)
   {
       $data = $request->validate([
           'direction' => 'required|in:up,down',
       ]);

       $direction = $data['direction'] === 'up' ? -1 : 1;
       $currentOrder = $blogPost->sort_order;

       $neighbor = BlogPost::where('sort_order', $direction === -1
           ? '<' : '>', $currentOrder)
           ->orderBy('sort_order', $direction === -1 ? 'desc' : 'asc')
           ->first();

       if (!$neighbor) {
           return $this->error('Cannot move ' . $data['direction'] . ' further.', 422);
       }

       $neighborOrder = $neighbor->sort_order;
       $blogPost->update(['sort_order' => $neighborOrder]);
       $neighbor->update(['sort_order' => $currentOrder]);

       return $this->success(new BlogPostResource($blogPost->load('media')));
   }
   ```

2. **Register route** in `routes/api.php` inside `auth:sanctum` group:
   ```php
   Route::post('/blog-posts/{blogPost}/sort-order', [BlogPostController::class, 'swapSortOrder']);
   ```
</action>

<acceptance_criteria>
- `POST /api/blog-posts/1/sort-order` with `{ "direction": "down" }` swaps sort_order with next post
- `POST /api/blog-posts/1/sort-order` with `{ "direction": "up" }` swaps sort_order with previous post
- Moving first post up or last post down → 422 error
- `php artisan test --filter=BlogPostsTest` passes
</acceptance_criteria>

### Task 4: Add admin blog page UX polish (sort controls, reading time, auto-save indicator, excerpt auto-gen)

<read_first>
- apps/frontend/app/admin/blog-posts/page.tsx
- apps/frontend/lib/admin-api.ts
- apps/frontend/components/BlogEditor.tsx
- .planning/phases/03-blog-system-p0/03-UI-SPEC.md §Admin Panel
- .planning/phases/03-blog-system-p0/03-CONTEXT.md §Admin Blog UX Polish
</read_first>

<action>
1. **In `lib/admin-api.ts`:** Add new functions:
   ```typescript
   export async function fetchAdminBlogPosts(): Promise<{ data: BlogPostData[] }> {
     return request('/admin/blog-posts');
   }

   export async function swapBlogPostSortOrder(id: number, direction: 'up' | 'down'): Promise<{ data: BlogPostData }> {
     return request(`/blog-posts/${id}/sort-order`, {
       method: 'POST',
       body: JSON.stringify({ direction }),
     });
   }
   ```

2. **In `admin/blog-posts/page.tsx`:**
   - Switch from `fetchBlogPosts()` to `fetchAdminBlogPosts()` for the table data load.
   - **Sort order column:** Add up/down arrow buttons (Lucide `ChevronUp`/`ChevronDown`) in a new "Order" column. Top row disables "up", bottom row disables "down". On click: call `swapBlogPostSortOrder(id, direction)`, reload list.
   - **Reading time estimate:** Below the Quill editor in the modal form, show `"{N} min read"` text. Calculate as `Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)`. Update on content change (debounced 500ms).
   - **Auto-save indicator:** Below form actions (right-aligned), show:
     - `"Last saved: just now"` — within 1 minute of last save
     - `"Last saved: {N} minutes ago"` — after 1 minute
     - `"Unsaved changes"` — when content differs from last saved (in error color)
   - **Excerpt auto-generation:** When creating a new post and the excerpt field is empty, auto-fill from first 300 chars of content (strip HTML tags). User can override. Empty excerpt still allowed (nullable).

3. **Table columns update:** New order: Title (+ truncated excerpt below), Author, Status, Image, Sort Order, Published At, Updated, Actions.
</action>

<acceptance_criteria>
- Admin blog table loads ALL posts (drafts + published) via `/api/admin/blog-posts`
- Sort order up/down arrows appear and function correctly
- Reading time shows below Quill editor and updates on content change
- Auto-save indicator shows correct state ("just now", "X minutes ago", "Unsaved changes")
- Excerpt auto-generates from content when creating new post
- `npx tsc --noEmit` passes
- `npm run build` succeeds
</acceptance_criteria>

### Task 5: Add feature tests for blog admin + sanitization

<read_first>
- apps/backend/tests/Feature/BlogPostsTest.php
- apps/backend/database/factories/Models/BlogPostFactory.php
</read_first>

<action>
1. **In `BlogPostsTest.php`, add tests:**
   - `test_public_index_filters_published_only()`: Create published + unpublished posts, GET `/api/blog-posts`, assert only published returned.
   - `test_admin_index_returns_all_posts()`: Create published + unpublished, auth as admin, GET `/api/admin/blog-posts`, assert both returned.
   - `test_admin_index_requires_auth()`: GET `/api/admin/blog-posts` without token → 401.
   - `test_store_sanitizes_content()`: POST with `<script>alert('xss')</script>` in content, assert saved content does not contain `<script>` tag.
   - `test_update_sanitizes_content()`: PUT with `<iframe>` in content, assert `<iframe>` stripped.
   - `test_swap_sort_order()`: Create 3 posts, swap post 1 down, assert sort_order values swapped.
   - `test_swap_sort_order_rejects_invalid_direction()`: POST with `{ "direction": "left" }` → 422.
   - `test_swap_sort_order_first_item_cannot_go_up()`: First post, swap up → 422.
</action>

<acceptance_criteria>
- `php artisan test --filter=BlogPostsTest` — all tests pass (existing + 8 new)
- Tests use `RefreshDatabase`, `HtmlPurifier` assertions, and follow existing patterns
</acceptance_criteria>

## Verification Criteria

1. `cd apps/backend && php artisan test --filter=BlogPostsTest` — all tests pass
2. `cd apps/frontend && npx tsc --noEmit` — no type errors
3. `cd apps/frontend && npm run build` — SSG export succeeds
4. Manual: Admin blog table shows ALL posts, sort arrows work, reading time shows, auto-save indicator updates
5. Manual: Public `/api/blog-posts` returns only published posts

## Artifacts This Phase Produces

**New API endpoints (in `routes/api.php`):**
- `GET /api/admin/blog-posts` — `BlogPostController@adminIndex` (auth:sanctum)
- `POST /api/blog-posts/{blogPost}/sort-order` — `BlogPostController@swapSortOrder` (auth:sanctum)

**Modified backend files:**
- `BlogPostController` — public `index()` filters published + sorts by published_at; new `adminIndex()`, `swapSortOrder()`, `sanitizeContent()` methods
- `routes/api.php` — 2 new routes inside `auth:sanctum`

**Modified frontend files:**
- `lib/admin-api.ts` — `fetchAdminBlogPosts()`, `swapBlogPostSortOrder()`
- `admin/blog-posts/page.tsx` — sort controls, reading time, auto-save indicator, excerpt auto-gen, admin API switch

**New dependency:**
- `ezyang/htmlpurifier` — Composer package for HTML content sanitization

**New tests:**
- `BlogPostsTest`: 8 new test methods (published filter, admin index, auth, sanitization × 2, sort swap × 3)
