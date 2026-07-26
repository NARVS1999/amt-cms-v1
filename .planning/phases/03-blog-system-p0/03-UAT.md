---
status: complete
phase: 03-blog-system-p0
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md
started: 2026-07-26T13:10:00Z
updated: 2026-07-26T13:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Admin Blog Post CRUD — Image Persistence
expected: When you paste or drag an image into the Quill editor, save the post, then re-edit it, the image should still be visible in the content.
result: pass

### 2. Content Sanitization
expected: When saving a blog post with raw HTML (script tags, inline event handlers, iframes), the content is cleaned by HTMLPurifier — dangerous elements are stripped, safe HTML (bold, links, images) is preserved.
result: pass

### 3. Admin Blog UX Controls — Sort Order
expected: Admin blog page shows sort order arrows (up/down) for reordering posts. Clicking the arrows should reorder posts without errors.
result: issue
reported: "there was second to the first but they saying : {\"message\":\"Cannot move up further.\"}"
severity: major

### 4. Public Blog Listing Page
expected: /blog shows a responsive 3-column grid of blog cards. Cards show featured image (or placeholder), title, excerpt, date, and reading time. Blog posts are displayed (not empty).
result: pass

### 5. Home Navigation Link
expected: Clicking "Home" in the header navigation navigates to the homepage (/), not to an anchor on the current page.
result: pass

### 6. Blog 404 Page
expected: Navigating to /blog/nonexistent-slug shows a blog-specific "Post not found" page with a link back to the blog listing.
result: pass

### 7. Homepage Latest Posts Section
expected: Homepage shows a "Latest Insights" section with up to 3 blog cards when posts exist. When there are 0 published posts, the section hides entirely.
result: pass

### 8. Blog Navigation Link
expected: Header navigation includes a "Blog" link that navigates to /blog. The link is visible on all public pages.
result: pass

## Summary

total: 8
passed: 7
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Sort order arrows work without errors — moving up/down reorders posts correctly"
  status: failed
  reason: "User reported: there was second to the first but they saying : {\"message\":\"Cannot move up further.\"}"
  severity: major
  test: 3
  root_cause: "All BlogPosts have sort_order = 0 (database default). swapSortOrder looks for neighbor with sort_order < currentOrder, but when all posts have sort_order = 0, no neighbor exists."
  artifacts:
    - path: "apps/backend/app/Http/Controllers/Api/BlogPostController.php"
      issue: "swapSortOrder uses strict < instead of <= and doesn't handle same sort_order"
    - path: "apps/backend/database/migrations/2026_07_21_000003_create_marketing_blog_posts_table.php"
      issue: "sort_order column has default 0, posts created before booted() hook have sort_order = 0"
  missing:
    - "Migration to reset existing posts to sequential sort_order values"
    - "Update swapSortOrder to use <= and handle same sort_order cases"
  plan: 03-05
