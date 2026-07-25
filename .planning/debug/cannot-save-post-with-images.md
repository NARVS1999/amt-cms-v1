---
status: investigating
trigger: |
  User cannot save a blog post with images. Validation error:
  {"message":"The content field must be a string.","errors":{"content":["The content field must be a string."]}}
created: 2026-07-26
updated: 2026-07-26
---

## Symptoms

- **Expected behavior:** Blog post saves with images attached.
- **Actual behavior:** Validation error "The content field must be a string." appears after clicking Save.
- **Error messages:** `{"message":"The content field must be a string.","errors":{"content":["The content field must be a string."]}}`
- **Timeline:** Never worked — new feature.
- **Reproduction:** Save a blog post with images attached via rich text editor.

## Current Focus

- **Hypothesis:** The index endpoint excludes `content`. When editing, `content` is `undefined`. The FormData branch sends `content=''` unconditionally, which `ConvertEmptyStringsToNull` converts to `null`, failing the `string` validation.
- **Test:** Confirmed via code inspection.
- **Expecting:** The bug is a chain of three interacting causes.
- **Next action:** present findings and offer fix options

## Evidence

- **Timestamp:** 2026-07-26
- **Finding:** `GET /api/blog-posts` (index) does NOT include `content` field by design (SPEC.md lines 319-341, BlogPostResource.php lines 24-26)
- **File:** `apps/frontend/app/admin/blog-posts/page.tsx` line 164 — FormData unconditionally appends `formData.append('content', editing.content || '')`
- **File:** `apps/backend/app/Http/Controllers/Api/BlogPostController.php` line 70 — update validation has `'content' => 'string'` without `nullable`
- **Cause:** Laravel global middleware `ConvertEmptyStringsToNull` converts `content=""` → `null` for multipart requests, and `null` fails the `string` rule
- **Files involved:**
  - Frontend form: `apps/frontend/app/admin/blog-posts/page.tsx`
  - Frontend API: `apps/frontend/lib/admin-api.ts`
  - Backend controller: `apps/backend/app/Http/Controllers/Api/BlogPostController.php`
  - Backend resource: `apps/backend/app/Http/Resources/Api/BlogPostResource.php`

## Eliminated

- **Hypothesis:** Rich text editor sends non-string content — Eliminated: `BlogEditor.tsx` returns a plain HTML string via `onChange`
- **Hypothesis:** API content-type issue — Eliminated: FormData is valid for file uploads, the issue is empty string coercion

## Resolution

- **Root cause:** Chain of 3 bugs:
  1. `BlogPostResource` omits `content` from index response → frontend has `undefined`
  2. Frontend FormData path always sends `content` even if empty → `content=''`
  3. `ConvertEmptyStringsToNull` converts `''` → `null` → fails `string` rule in update
- **Fix applied:**
  1. `openEdit()` now fetches `GET /api/blog-posts/{slug}` (show endpoint) to get full post data including `content` — `apps/frontend/app/admin/blog-posts/page.tsx:118-130`
  2. FormData only appends `content` when truthy — `apps/frontend/app/admin/blog-posts/page.tsx:164`
  3. Backend update validation allows `nullable|string` for content — `apps/backend/app/Http/Controllers/Api/BlogPostController.php:70`
- **Files changed:**
  - `apps/frontend/lib/admin-api.ts` — added `fetchBlogPost(slug)` function
  - `apps/frontend/app/admin/blog-posts/page.tsx` — openEdit fetches show endpoint, conditional FormData for content
  - `apps/backend/app/Http/Controllers/Api/BlogPostController.php` — nullable content on update
- **Verification:** Passed — all 6 BlogPostsTest tests pass, frontend typecheck clean

