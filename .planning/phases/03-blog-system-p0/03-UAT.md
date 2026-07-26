---
status: diagnosed
phase: 03-blog-system-p0
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md
started: 2026-07-26T00:00:00Z
updated: 2026-07-26T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Admin Blog Post CRUD
expected: Admin can create, edit, and publish blog posts using a Quill rich text editor. Posts auto-generate slugs from titles. Featured images can be uploaded. A post saved as draft does not appear on the public blog. Publishing it makes it visible.
result: issue
reported: "in content fields there are an option to add image, i can add image but the image on content when i save then edit it again there are no image on it"
severity: major

### 2. Content Sanitization
expected: When saving a blog post with raw HTML (script tags, inline event handlers, iframes), the content is cleaned by HTMLPurifier — dangerous elements are stripped, safe HTML (bold, links, images) is preserved.
result: pass

### 3. Admin Blog UX Controls
expected: Admin blog page shows sort order arrows (up/down) for reordering posts. Each post displays estimated reading time. An auto-save indicator appears when editing. Excerpts are auto-generated from content when left blank.
result: issue
reported: "when i click sort icon, then respond was {\"message\":\"Cannot move down further.\"}"
severity: major

### 4. Public Blog Listing Page
expected: /blog shows a responsive 3-column grid of blog cards. Cards show featured image (or placeholder), title, excerpt, date, and reading time. Client-side pagination works at 6 posts per page with next/prev controls.
result: issue
reported: "blog push have fetch data on network, but there are not data on display just 'Blog Tips, guides, and industry updates No posts published yet.' and on navigation when i click home, they did not go to home page"
severity: major

### 5. Public Blog Single Post Page
expected: /blog/[slug] shows the full post with hero image, title, publication date, reading time, and readable content layout. Page has proper SEO metadata (title, description OG tags).
result: blocked
blocked_by: prior-phase
reason: "Cannot test because blog listing shows no posts — blocked by test 4 issue"

### 6. Blog 404 Page
expected: Navigating to /blog/nonexistent-slug shows a blog-specific "Post not found" page with a link back to the blog listing.
result: issue
reported: "when i try it this was run time error - Page '/(public)/blog/[slug]/page' is missing param '/blog/[slug]' in 'generateStaticParams()', which is required with 'output: export' config."
severity: blocker

### 7. Homepage Latest Posts Section
expected: Homepage shows a "Latest Insights" section with up to 3 blog cards. When there are 0 published posts, the section hides entirely.
result: issue
reported: "empty section or no section for latest 3 blog"
severity: minor

### 8. Blog Navigation Link
expected: Header navigation includes a "Blog" link that navigates to /blog. The link is visible on all public pages.
result: pass

## Summary

total: 8
passed: 2
issues: 5
pending: 0
skipped: 0
blocked: 1

## Gaps

- gap_id: G-03-1
  truth: "Images embedded in Quill content persist after save and remain visible when re-editing"
  status: failed
  reason: "User reported: in content fields there are an option to add image, i can add image but the image on content when i save then edit it again there are no image on it"
  severity: major
  test: 1
  root_cause: "HTMLPurifier strips data: URIs from img src attributes. Quill converts pasted/dragged images to base64 data: URIs. HTMLPurifier default URI.AllowedSchemes only includes http, https, mailto — not data:. So img tags survive but their src attributes get silently stripped."
  artifacts:
    - path: "apps/backend/app/Http/Controllers/Api/BlogPostController.php"
      issue: "sanitizeContent() missing 'data' in URI.AllowedSchemes config"
  missing:
    - "Add $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'data' => true]); to sanitizeContent method"

- gap_id: G-03-3
  truth: "Sort order arrows work without errors — moving up/down reorders posts correctly"
  status: failed
  reason: "User reported: when i click sort icon, then respond was {\"message\":\"Cannot move down further.\"}"
  severity: major
  test: 3
  root_cause: "BlogPost model has no auto-increment logic for sort_order on creation. All posts default to sort_order=0. swapSortOrder() queries for a neighbor with a different sort_order value — when all share 0, no neighbor exists, triggering 422."
  artifacts:
    - path: "apps/backend/app/Models/BlogPost.php"
      issue: "Missing booted() hook to auto-assign sequential sort_order"
  missing:
    - "Add booted() static::creating hook that auto-assigns sort_order = max('sort_order') + 1 when null"

- gap_id: G-03-4
  truth: "Blog listing page fetches data and renders blog cards in a grid"
  status: failed
  reason: "User reported: blog push have fetch data on network, but there are not data on display just 'Blog Tips, guides, and industry updates No posts published yet.'"
  severity: major
  test: 4
  root_cause: "Zod BlogPostSchema requires content as non-nullable string, but API listing endpoint omits content (only included for show). Zod parse fails silently, catch block returns [], page renders 'No posts published yet.'"
  artifacts:
    - path: "packages/shared/src/schemas/blog-post.ts"
      issue: "content field is required but API listing omits it"
  missing:
    - "Change content: z.string() to content: z.string().optional() in BlogPostSchema"

- gap_id: G-03-4b
  truth: "Clicking Home link in navigation navigates to the homepage"
  status: failed
  reason: "User reported: on navigation when i click home, they did not go to home page"
  severity: major
  test: 4
  root_cause: "Home link uses href='#home' (in-page anchor). On /blog, clicking Home navigates to /blog#home instead of /."
  artifacts:
    - path: "apps/frontend/components/Header.tsx"
      issue: "Home link href is '#home' instead of '/'"
  missing:
    - "Change Home link href from '#home' to '/'"

- gap_id: G-03-6
  truth: "Blog 404 page renders a 'Post not found' message for non-existent slugs"
  status: failed
  reason: "User reported: runtime error - Page '/(public)/blog/[slug]/page' is missing param '/blog/[slug]' in 'generateStaticParams()', which is required with 'output: export' config."
  severity: blocker
  test: 6
  root_cause: "fetchBlogPosts() silently catches all errors and returns []. generateStaticParams() returns zero params when API is unreachable. Next.js output:'export' requires params from generateStaticParams."
  artifacts:
    - path: "apps/frontend/lib/api.ts"
      issue: "Silent catch in fetchBlogPosts returns [] swallowing errors"
    - path: "apps/frontend/app/(public)/blog/[slug]/page.tsx"
      issue: "generateStaticParams returns empty array when API fails"
  missing:
    - "generateStaticParams should throw descriptive error when zero posts returned"
    - "Ensure backend API is running during npm run build"

- gap_id: G-03-7
  truth: "Homepage shows Latest Insights section with 3 blog cards when posts exist"
  status: failed
  reason: "User reported: empty section or no section for latest 3 blog"
  severity: minor
  test: 7
  root_cause: "Same root cause as G-03-4 — fetchBlogPosts() silently fails, returns [], LatestPosts component returns null when posts is empty. Section vanishes with no indication."
  artifacts:
    - path: "apps/frontend/components/LatestPosts.tsx"
      issue: "Returns null when posts is empty array"
  missing:
    - "Fix tied to G-03-4 — once blog listing works, LatestPosts will also populate"
