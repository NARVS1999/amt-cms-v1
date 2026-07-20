# Story 4.1: Blog Posts Admin CRUD

Status: done

## Story

As an **admin user (John)**,
I want **to create, edit, publish/unpublish, and delete blog posts with Quill rich text editing and featured images**,
So that **I can manage the blog content entirely from the admin panel**.

## Acceptance Criteria

1. **Blog posts list page:**
   Given I am logged into the admin panel
   When I navigate to `/admin/blog-posts`
   Then I see a resource list with columns: Title, Author, Status (Published/Draft), Featured Image thumbnail, Published At, Updated

2. **Create blog post:**
   Given I click "New Blog Post"
   When I fill in Title, Slug (auto-generated from title, editable), Content (Quill rich text editor), Excerpt (textarea), Featured Image (file upload), Is Published (toggle), Published At (datetime picker, conditional — only shown when Is Published is true)
   Then clicking Save creates the post
   And a toast shows "Saved."
   And if Is Published is true and Published At is empty, Published At is set to now

3. **Quill rich text editor:**
   Given I am editing a blog post
   When I type content in the Quill editor
   Then the toolbar includes: bold, italic, headings (h2/h3), ordered/unordered lists, link, image
   And every 30 seconds the draft is auto-saved to the database
   And a subtle indicator shows "Draft saved" on each auto-save

4. **Slug management:**
   Given I enter a blog post title
   When the slug field auto-populates from the title (slugified)
   Then I can override it by typing in the slug field
   And duplicate slugs are rejected with validation error

5. **Featured image upload:**
   Given I upload a featured image
   When the file is selected
   Then it uploads via Spatie Media Library
   And file validation enforces: 2MB max, JPG/PNG/WebP/SVG only
   And a preview thumbnail is shown after upload

6. **Edit blog post:**
   Given I click an existing blog post
   When I edit any field
   Then clicking Save updates the record
   And the Quill content reflects the saved state

7. **Published/Draft toggle:**
   Given I toggle a post from Published to Draft
   When I save
   Then the post no longer appears in the public API response

8. **Delete blog post:**
   Given I click Delete on a post
   When the confirmation modal appears
   Then clicking "Delete" removes the post and associated media permanently

9. **Empty state:**
   Given the list is empty
   When the page loads
   Then I see: "No posts yet. Create your first one."

10. **Loading state:**
    Given the list is loading
    When the page first loads
    Then skeleton rows matching the column structure appear

**Fields:**
- title (required, max 255)
- slug (required, unique, auto-generated from title, admin-overridable)
- content (required, rich text — Quill HTML)
- excerpt (textarea, optional, max 300 chars)
- featured_image (single file, Spatie Media Library collection `featured_image`)
- is_published (boolean, default false)
- published_at (datetime, nullable, auto-set to now on first publish)

## Tasks / Subtasks

- [ ] **Create migration** `marketing_blog_posts` table
  - [ ] Create `2026_07_21_000001_create_marketing_blog_posts_table.php`
  - [ ] Columns: id (bigIncrements), title (string 255), slug (string 255 unique), content (longText), excerpt (text nullable), is_published (boolean default false), published_at (datetime nullable), sort_order (integer default 0, for future reorder support), timestamps
  - [ ] Add unique index on `slug`

- [ ] **Create BlogPost model** `app/Models/BlogPost.php`
  - [ ] Extends Model, use HasFactory
  - [ ] Table: `marketing_blog_posts`
  - [ ] Fillable: title, slug, content, excerpt, is_published, published_at
  - [ ] Casts: is_published => boolean, published_at => datetime
  - [ ] Add `newFactory()` method pointing to `Database\Factories\Models\BlogPostFactory`
  - [ ] Spatie Media Library: register `featured_image` single-file collection (accepts JPG, PNG, WebP, SVG)

- [ ] **Create BlogPost factory** `database/factories/Models/BlogPostFactory.php`
  - [ ] Namespace: `Database\Factories\Models`
  - [ ] Default state: title (faker sentence), slug (faker slug), content (faker paragraphs), excerpt (faker sentence), is_published (false), published_at (null)

- [ ] **Create BlogPostResource** `app/Http/Resources/Api/BlogPostResource.php`
  - [ ] Returns: id, title, slug, content, excerpt, featured_image_url (via Spatie `getFirstMediaUrl('featured_image')`), is_published, published_at, created_at, updated_at
  - [ ] Conditionally include content only for `show` route (exclude from index list to keep response lean)

- [ ] **Create StoreBlogPostRequest** `app/Http/Requests/StoreBlogPostRequest.php`
  - [ ] Rules: title (required, max:255), slug (required, max:255, unique:marketing_blog_posts,slug — ignore current ID on update), content (required), excerpt (nullable, max:300), is_published (boolean), published_at (nullable, date)
  - [ ] Custom validation: if is_published is true and published_at is null, set published_at to now in controller

- [ ] **Update BlogPostController** with full CRUD
  - [ ] `index()` — return all posts (admin view, includes unpublished) ordered by created_at desc, wrapped in BlogPostResource collection with `$this->success()`
  - [ ] `show(string $slug)` — return post by slug, 404 if not found
  - [ ] `store(StoreBlogPostRequest $request)` — create post, handle Spatie featured image upload if present, return HTTP 201 with `$this->success(resource, 201)`
  - [ ] `update(StoreBlogPostRequest $request, BlogPost $blogPost)` — update post, replace featured image if new file uploaded, handle auto-set published_at
  - [ ] `destroy(BlogPost $blogPost)` — delete post (Spatie cascades media on delete)

- [ ] **Add admin CRUD routes** in `routes/api.php` (inside `auth:sanctum` group)
  - [ ] `Route::post('/blog-posts', [BlogPostController::class, 'store']);`
  - [ ] `Route::put('/blog-posts/{blogPost}', [BlogPostController::class, 'update']);`
  - [ ] `Route::delete('/blog-posts/{blogPost}', [BlogPostController::class, 'destroy']);`

- [ ] **Update StatsController** — replace `'blog_posts' => 0` with `'blog_posts' => $this->safeCount(BlogPost::class)`
  - [ ] Add `use App\Models\BlogPost;` import

- [ ] **Create admin blog-posts page** `apps/frontend/app/admin/blog-posts/page.tsx`
  - [ ] Admin page with table list: Title, Status (Published/Draft badge), Featured Image thumbnail, Published At, Updated
  - [ ] "New Blog Post" button opening modal form
  - [ ] Form fields: title (Input), slug (Input, auto-populated), content (Quill rich text editor), excerpt (textarea), featured_image (file upload with preview), is_published (toggle), published_at (datetime input, conditional on is_published)
  - [ ] Delete with confirmation modal
  - [ ] Auto-save draft every 30s via PUT request (track `lastAutoSave` timestamp)
  - [ ] Loading skeleton state
  - [ ] Empty state: "No posts yet. Create your first one."

- [ ] **Add BlogPost API functions** to `apps/frontend/lib/admin-api.ts`
  - [ ] `BlogPostData` interface matching Zod schema + `featured_image_url`
  - [ ] `fetchBlogPosts()`, `createBlogPost()`, `updateBlogPost()`, `deleteBlogPost()`

- [ ] **Update sidebar** to link Blog to `/admin/blog-posts`
  - [ ] In `components/admin/sidebar.tsx`, change `{ href: '#', label: 'Blog', icon: FileText }` to `{ href: '/admin/blog-posts', label: 'Blog', icon: FileText }`

- [ ] **Write feature tests**
  - [ ] Create `tests/Feature/BlogPostsTest.php`
  - [ ] Test: GET /api/blog-posts returns HTTP 200 with `{ "data": [...] }` envelope
  - [ ] Test: GET /api/blog-posts returns only published posts (once Story 4.1.1 implements filtering — for now test basic structure)
  - [ ] Test: GET /api/blog-posts/{slug} returns single post by slug
  - [ ] Test: GET /api/blog-posts/nonexistent-slug returns HTTP 404
  - [ ] Test: Empty state returns empty data array
  - [ ] Test: Correct sort order (created_at desc) in response

## Dev Notes

### Architecture Compliance (AD-1 / AD-3 / AD-5 / AD-6)

- **API Controller:** `app/Http/Controllers/Api/BlogPostController.php` (already exists as stub)
- **Model:** `app/Models/BlogPost.php` (flat namespace per AD-1)
- **Migration:** `database/migrations/YYYY_MM_DD_HHMMSS_create_marketing_blog_posts_table.php`
- **Resource:** `app/Http/Resources/Api/BlogPostResource.php`
- **Request:** `app/Http/Requests/StoreBlogPostRequest.php`
- **Media:** All file uploads go through Spatie Media Library (AD-6). BlogPost model registers a `featured_image` single-file media collection.
- **Content sanitization (NFR-4):** Rich text content will be sanitized via HTMLPurifier before public render. Sanitization is applied in the public display layer (Story 4.2/4.3), NOT at admin save. Store raw HTML as-is from Quill.

### Key Architectural Decisions

1. **No reorder for blog posts:** Unlike services/team/pricing, blog posts are sorted by `published_at` descending (most recent first). No drag-and-drop reordering. A `sort_order` column is included for future use but is NOT part of this story's UI.

2. **AdminIndex vs PublicIndex:** The `index()` method in this story returns ALL posts (including unpublished) because it serves the admin panel. The public endpoint (Story 4.2) will need a separate public index that filters `is_published = true`. Currently only `GET /api/blog-posts` exists — this story updates it for admin use. When Story 4.2 adds the public listing, a separate method or parameter will differentiate.

3. **Slug at API route level:** The existing route `GET /api/blog-posts/{slug}` uses slug (not ID) for the `show` method. This works because Laravel's route model binding can resolve by a custom column. In `index()` and `show()`, same route patterns are preserved.

4. **Auto-save draft:** The Quill auto-save feature works by dispatching a PUT request to the update endpoint every 30 seconds while editing. The frontend tracks `lastAutoSave` timestamp and debounces. The indicator "Draft saved" is shown for 2 seconds after each auto-save.

5. **published_at auto-set:** When saving with `is_published = true` and `published_at = null`, the controller sets `published_at` to `now`. If the post is already published and `is_published` remains true, `published_at` is NOT overwritten.

6. **Featured image via Spatie:** The BlogPost model registers a single-file `featured_image` media collection. On the frontend, the `featured_image_url` is exposed via the BlogPostResource by calling `$this->getFirstMediaUrl('featured_image')`. The Zod schema mirrors this as `featured_image_url: string | null`.

7. **Sidebar update:** The Blog nav item currently points to `'#'`. Update to `/admin/blog-posts`.

8. **StatsController update:** Replace hardcoded `'blog_posts' => 0` with real count using `safeCount()`.

### Files to CREATE

| # | File | Purpose |
|---|------|---------|
| 1 | `apps/backend/database/migrations/2026_07_21_000001_create_marketing_blog_posts_table.php` | Create marketing_blog_posts table |
| 2 | `apps/backend/app/Models/BlogPost.php` | Eloquent model for blog posts |
| 3 | `apps/backend/database/factories/Models/BlogPostFactory.php` | Model factory for tests |
| 4 | `apps/backend/app/Http/Resources/Api/BlogPostResource.php` | API transformer for JSON responses |
| 5 | `apps/backend/app/Http/Requests/StoreBlogPostRequest.php` | FormRequest validation |
| 6 | `apps/frontend/app/admin/blog-posts/page.tsx` | Admin blog posts management page |
| 7 | `apps/backend/tests/Feature/BlogPostsTest.php` | Feature tests for API endpoint |

### Files to UPDATE

| # | File | Change |
|---|------|--------|
| 1 | `apps/backend/app/Http/Controllers/Api/BlogPostController.php` | Replace stubs with real CRUD methods |
| 2 | `apps/backend/routes/api.php` | Add admin CRUD routes (POST/PUT/DELETE blog-posts) inside auth:sanctum group |
| 3 | `apps/backend/app/Http/Controllers/Api/Admin/StatsController.php` | Replace `'blog_posts' => 0` with real count |
| 4 | `apps/frontend/lib/admin-api.ts` | Add BlogPostData interface + fetch/create/update/delete functions |
| 5 | `apps/frontend/components/admin/sidebar.tsx` | Change Blog href from `'#'` to `'/admin/blog-posts'` |

### Existing File States (DO NOT BREAK)

**`BlogPostController.php`** (current state):
```php
class BlogPostController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success([]);
    }

    public function show(string $slug)
    {
        return $this->success(null);
    }
}
```
Preserve `use ApiResponse` and `use App\Traits\ApiResponse`. Add route model binding for `show` — since it uses slug, bind via `Route::get('/blog-posts/{slug}', ...)` — Laravel will resolve by the slug column.

**`routes/api.php`** — Already has:
```php
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{slug}', [BlogPostController::class, 'show']);
```
Add POST/PUT/DELETE routes inside the `auth:sanctum` group. Route model binding for PUT/DELETE uses `{blogPost}` (Eloquent implicit binding by primary key).

**`StatsController.php`** — Currently has `'blog_posts' => 0`. Replace with:
```php
'blog_posts' => $this->safeCount(BlogPost::class),
```
Add `use App\Models\BlogPost;` import.

**`admin-api.ts`** — Existing service/pricing/team/page patterns. Follow the same pattern for blog posts:
```typescript
export interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

**`sidebar.tsx`** — Blog item currently `{ href: '#', label: 'Blog', icon: FileText }`. Change to `{ href: '/admin/blog-posts', label: 'Blog', icon: FileText }`.

### Existing Zod Schema Reference

The frontend already has `packages/shared/src/schemas/blog-post.ts` (created in Story 1.7):

```typescript
export const BlogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  featured_image_url: z.string().nullable(),
  published_at: z.string().nullable(),
  is_published: z.boolean().default(false),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
```

This schema matches the API response shape. No changes needed — it's already correct and complete for the BlogPostResource output.

### Read-Before-Editing: Files Being Modified

**`BlogPostController.php`** — Stub returns empty arrays. Replace with full CRUD. Preserve `use ApiResponse` trait.

**`routes/api.php`** — Add inside the `auth:sanctum` group (after line 88, before line 90):
```php
// Admin CRUD: Blog Posts
Route::post('/blog-posts', [BlogPostController::class, 'store']);
Route::put('/blog-posts/{blogPost}', [BlogPostController::class, 'update']);
Route::delete('/blog-posts/{blogPost}', [BlogPostController::class, 'destroy']);
```

**`StatsController.php`** — Single line change: replace `0` with `$this->safeCount(BlogPost::class)`.

**`sidebar.tsx`** — Single href change: from `'#'` to `'/admin/blog-posts'`.

### Quill.js Integration Notes

Quill 2.x is the rich text editor for blog post content. Integration approach:
- Install quill via npm: `cd apps/frontend && npm install quill`
- Create a wrapper React component `BlogEditor.tsx` in `apps/frontend/components/`
- Toolbar configuration: bold, italic, header (2,3), list (ordered, bullet), link, image
- Auto-save: set a 30-second interval via `setInterval` that triggers a PUT request if content changed
- Track `lastSavedContent` ref to compare against current editor content
- Show "Draft saved" indicator for 2 seconds after each auto-save
- Image uploads in Quill (when user clicks image button) — for v1, handle image URL input (not upload). Deferred to Spatie-based image upload in v1.1.

### Testing Standards

- Use Pest (PHP framework default in Laravel 12, already set up)
- Feature test file: `tests/Feature/BlogPostsTest.php`
- Test GET /api/blog-posts returns 200 with `{ "data": [...] }` envelope
- Test correct sort order (created_at desc) in response
- Test GET /api/blog-posts/{slug} returns single post for valid slug
- Test GET /api/blog-posts/nonexistent-slug returns HTTP 404
- Test with factory-created posts
- Run: `cd apps/backend && php artisan test --filter=BlogPostsTest`

### Previous Story Intelligence

- **Story 1.7** created `packages/shared/src/schemas/blog-post.ts` with Zod schema for BlogPost — already complete, no changes needed
- **Story 1.5** scaffolded the API route `GET /api/blog-posts` and stub controller
- **Story 1.3** wired `blog_posts` stat widget (currently hardcoded to 0 — StatsController needs update)
- **Story 1.6** set up the public frontend with layout, ThemeProvider, and basic components
- **Review patterns from Epics 2-3:** Admin CRUD stories follow consistent pattern: migration → model → factory → resource → request → controller → routes → admin page → api.ts → sidebar → tests

### Git Intelligence

- `3720857` — "feat: implement Story 3.2 — pricing plans public display" — last feature commit
- `fdc74ea` — "chore: mark Story 3.2 as done in sprint status"
- `90a9ffa` — "create story 3.2"
- `879a40b` — "done 3.1"
- `752ce59` — "implement Story 3.1: Pricing Plans Admin CRUD"
- Epic 3 (Pricing & Plans) completed — all stories done
- This is the first story in Epic 4 (Blog Engine) — epic-4 transitions from backlog to in-progress

### Verification Checklist

After implementing, manually verify:
- [ ] Navigate to `/admin/blog-posts` — list renders with correct columns
- [ ] Create a new blog post with title, content (via Quill), excerpt, featured image, and publish toggle
- [ ] Slug auto-generates from title, can be overridden
- [ ] Edit the post — changes persist after save
- [ ] Delete a post — removed from list
- [ ] Toggle published/draft — status updates correctly
- [ ] Empty state shows when no posts exist
- [ ] GET /api/blog-posts returns all posts with `{ "data": [...] }` envelope
- [ ] GET /api/blog-posts/{slug} returns single post
- [ ] GET /api/blog-posts/nonexistent-slug returns 404
- [ ] Admin stats shows correct blog post count
- [ ] Blog nav item in sidebar links to `/admin/blog-posts`

### References

- [Source: docs/epics.md#Story-4.1] — Full AC, field specs, UX-DR coverage
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-1] — Flat Laravel structure
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3] — REST API contract
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-5] — Admin is sole content authority
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-6] — Spatie Media Library for uploads
- [Source: docs/project-context.md] — No raw SQL, Eloquent ORM only
- [Source: docs/project-context.md#Critical-Dont-Miss-Rules] — Published filtering at query level
- [Source: docs/project-context.md#Content-Model-Gotchas] — Blog slug auto-generate + overridable, unique constraint
- [Source: stories/1-7-shared-zod-schemas-package.md] — Existing blog-post Zod schema
- [Source: stories/sprint-status.yaml] — Epic 4 is backlog, transitions to in-progress
- [Source: stories/2-1-services-admin-crud.md] — Pattern reference for admin CRUD story structure
