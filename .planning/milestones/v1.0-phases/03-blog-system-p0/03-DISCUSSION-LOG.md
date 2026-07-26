# Phase 3: Blog System (P0) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-26
**Phase:** 3-Blog System (P0)
**Areas discussed:** Content sanitization, Public API filtering, Blog integration with public site, Admin blog UX polish, Blog post URL & 404 handling, SEO metadata, Quill editor toolbar, Related posts

---

## Content Sanitization

### When to sanitize

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side on save | Sanitize in controller store/update. Clean data at the source. | ✓ |
| Both server + client | Sanitize on save AND when rendering. Defense in depth but redundant. | |
| Client-side on render only | Sanitize when displaying. Keeps raw HTML in DB but risks XSS. | |

**User's choice:** Server-side on save
**Notes:** Clean data at the source — public renderer doesn't need to worry about it.

### Sanitization level

| Option | Description | Selected |
|--------|-------------|----------|
| Standard HTMLPurifier | Allows safe tags (p, h2, h3, strong, em, ul, ol, li, a, img, blockquote, code, pre). Strips script, iframe, event handlers. | ✓ |
| Strict (minimal tags) | Only p, h2, h3, strong, em, ul, ol, li. No images, links. Very safe but limits Quill. | |
| Custom allowlist | Define custom allowed tags/attributes. More control but maintenance burden. | |

**User's choice:** Standard HTMLPurifier
**Notes:** Quill default output is compatible with standard allowlist.

### Where sanitization lives

| Option | Description | Selected |
|--------|-------------|----------|
| Controller inline | Sanitize $data['content'] in store/update. Follows existing pattern. | ✓ |
| Model accessor/mutator | Auto-sanitize via setAttribute mutator. Hidden logic. | |
| FormRequest class | Create BlogPostRequest with sanitize() method. Project doesn't use FormRequest for blog posts. | |

**User's choice:** Controller inline
**Notes:** Follows existing pattern of inline validation in controllers.

### Backfill existing content

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add a migration | One-time migration to sanitize all existing content. Ensures consistency. | ✓ |
| No, sanitize on next save only | Existing content stays as-is until next edit. Simpler. | |
| No, existing content is trusted | Assume existing content was entered safely. Only sanitize new saves. | |

**User's choice:** Yes, add a migration
**Notes:** Ensures all content in the DB is consistently sanitized.

### Sanitization failure handling

| Option | Description | Selected |
|--------|-------------|----------|
| Reject save with 422 | If sanitization fails, return validation error. Prevents unsafe content. | ✓ |
| Save raw, log warning | Save unsanitized content and log. Risky — defeats purpose. | |
| Retry with stricter rules | If standard fails, try stricter tag set. May lose formatting. | |

**User's choice:** Reject save with 422
**Notes:** Prevents saving potentially unsafe content. "Content could not be processed."

---

## Public API Filtering

### Draft handling

| Option | Description | Selected |
|--------|-------------|----------|
| Filter by is_published | Public endpoint only returns published posts. Follows Pages pattern. | ✓ |
| Keep returning all, add admin route | Public stays as-is. Add /api/admin/blog-posts. | |
| Add query param ?status=published | Let caller filter. Flexible but exposes drafts. | |

**User's choice:** Filter by is_published
**Notes:** Drafts are admin-only. Consistent with how Pages already works.

### Admin-specific route

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add /api/admin/blog-posts | Admin sees all posts. Consistent with Pages pattern. | ✓ |
| No, keep single route | Existing admin page uses public route. Adding new route means updates. | |
| Use query param on existing route | Admin adds ?all=true. No new route but muddies public endpoint. | |

**User's choice:** Yes, add /api/admin/blog-posts
**Notes:** Consistent with Pages pattern. Public endpoint stays clean.

### Default sort order

| Option | Description | Selected |
|--------|-------------|----------|
| Published_at desc | Newest published posts first. Uses published_at, not created_at. | ✓ |
| Created_at desc | Newest by creation time. Simpler but doesn't account for scheduling. | |
| Sort_order asc | Manual ordering. Requires explicit sorting in admin. | |

**User's choice:** Published_at desc
**Notes:** Most intuitive for a blog listing. Accounts for scheduled publishing.

### Pagination

| Option | Description | Selected |
|--------|-------------|----------|
| Return all published | Blog posts typically few (<100). No pagination needed. | |
| Paginate (15 per page) | Future-proof for large blogs. Uses paginate() with Spatie Query Builder. | ✓ |

**User's choice:** Paginate (15 per page)
**Notes:** Future-proof. SSG build fetches all pages in a loop.

### SSG build handling

| Option | Description | Selected |
|--------|-------------|----------|
| Fetch all pages at build time | Loop through pages during SSG build. Static HTML includes all posts. | ✓ |
| Client-side pagination | Fetch first page at build, load more on client. Not ideal for SSG. | |
| Large page size (100) | Use per_page=100. Simple but not truly paginated. | |

**User's choice:** Fetch all pages at build time
**Notes:** Static HTML includes all posts. No client-side pagination needed.

---

## Blog Integration with Public Site

### Homepage appearance

| Option | Description | Selected |
|--------|-------------|----------|
| Latest Posts section with cards | "Latest from our blog" section with 3 cards. Consistent with Services/Team grids. | ✓ |
| Latest Posts as a list | Single-column list with title, date, excerpt. Less visual. | |
| No blog on homepage | Blog only accessible via /blog page. Homepage stays focused. | |

**User's choice:** Latest Posts section with cards
**Notes:** Consistent with existing grid patterns on the site.

### Number of posts on homepage

| Option | Description | Selected |
|--------|-------------|----------|
| 3 posts | Shows enough to indicate active blog. Fits 3-column grid. | ✓ |
| 6 posts | More content visible. May push other sections down. | |
| All posts | Show every published post. Could be overwhelming. | |

**User's choice:** 3 posts
**Notes:** Keeps homepage scannable. Shows just enough to indicate an active blog.

### Dedicated blog page

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, /blog page | Full blog listing with all posts, pagination. Homepage shows 3 featured. | ✓ |
| No, homepage only | Blog posts only on homepage. Simpler but limits discoverability. | |
| Defer to Phase 4 | Focus on homepage section now. Dedicated page later. | |

**User's choice:** Yes, /blog page
**Notes:** Standard blog pattern. Homepage shows 3 featured, /blog shows everything.

### Single post page content

| Option | Description | Selected |
|--------|-------------|----------|
| Full post with featured image, title, date, content, excerpt | Standard blog post layout. Clean, readable. | ✓ |
| Add author, reading time, tags | Richer post page. Requires additional data in model. | |
| Minimal — title + content only | Just title and content. Feels incomplete. | |

**User's choice:** Full post with featured image, title, date, content, excerpt
**Notes:** Standard blog post layout. Clean, readable.

### Featured images on cards

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, show images | Each card shows featured image thumbnail. Falls back to placeholder. | ✓ |
| No, text only | Cards show title, excerpt, date only. Cleaner layout. | |

**User's choice:** Yes, show images
**Notes:** More visual, better engagement. Falls back to placeholder if no image.

### Blog page layout

| Option | Description | Selected |
|--------|-------------|----------|
| Grid of cards | 2 or 3 column grid. Consistent with Services/Team patterns. | ✓ |
| List layout | Single-column list. Easier to read, less visual. | |
| Featured + grid | First post large/featured, rest in grid. More complex. | |

**User's choice:** Grid of cards
**Notes:** Consistent with existing site patterns. Visual, scannable.

### Header navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add Blog link to header | Add "Blog" link to public site header. Users expect it there. | ✓ |
| No, link from homepage only | Blog discoverable via homepage section. Keeps header minimal. | |
| Add to footer only | Blog link in footer. Less prominent. | |

**User's choice:** Yes, add Blog link to header
**Notes:** Standard navigation pattern. Users expect to find blog in the header.

---

## Admin Blog UX Polish

### Word count / reading time

| Option | Description | Selected |
|--------|-------------|----------|
| Reading time estimate | Show "X min read" below editor. Calculated as word count / 200. | ✓ |
| Word count | Show "X words". More precise but less user-friendly. | |
| Neither | Keep form clean. Not essential for admin. | |

**User's choice:** Reading time estimate
**Notes:** Useful for authors to gauge post length.

### Excerpt field

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate from content, editable | Auto-fill from first 300 chars. User can override. Saves time. | ✓ |
| Manual only | User must type excerpt. More control but extra work. | |
| Remove excerpt field | Always auto-generate on backend. Simplifies form. | |

**User's choice:** Auto-generate from content, editable
**Notes:** Saves time while allowing customization.

### Post reordering

| Option | Description | Selected |
|--------|-------------|----------|
| No reordering needed | Posts ordered by published_at desc. No manual sort needed. | |
| Add sort_order controls | Up/down arrows in table. More control. | ✓ |
| Drag-and-drop reorder | Full drag-and-drop. Most complex. Overkill for blog. | |

**User's choice:** Add sort_order controls
**Notes:** Up/down arrows in the table for manual ordering.

### Featured image handling

| Option | Description | Selected |
|--------|-------------|----------|
| Upload with preview + remove | Current implementation. File input, preview, remove button. Works well. | ✓ |
| Media library picker | Browse and select from media library. Adds complexity. | |
| Drag-and-drop upload | Drag image onto form. More modern but requires component work. | |

**User's choice:** Upload with preview + remove
**Notes:** Current implementation works well. Keep as-is.

### Table content preview

| Option | Description | Selected |
|--------|-------------|----------|
| Title + excerpt | Show title and truncated excerpt. Helps identify posts. | ✓ |
| Title only | Cleaner table. Less clutter but harder to identify posts. | |
| Title + full excerpt | Full excerpt in table. May make rows too tall. | |

**User's choice:** Title + excerpt
**Notes:** Helps admins identify posts at a glance without opening each one.

### Auto-save

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as-is | 30s interval, saves content only. Shows "Draft saved" toast. | |
| Add visual indicator | Show "Unsaved changes" badge or "Last saved: X minutes ago". More feedback. | ✓ |
| Remove auto-save | Only save on explicit click. Simpler but risks losing work. | |

**User's choice:** Add visual indicator
**Notes:** More feedback on auto-save state.

---

## Blog Post URL & 404 Handling

### URL structure

| Option | Description | Selected |
|--------|-------------|----------|
| /blog/[slug] | Standard blog URL pattern. Clean, SEO-friendly. | ✓ |
| /posts/[slug] | Alternative "posts" segment. Less common. | |
| /[slug] (root level) | Flat URL. Shortest but may conflict with other routes. | |

**User's choice:** /blog/[slug]
**Notes:** Standard blog URL pattern. Matches existing API route structure.

### 404 handling

| Option | Description | Selected |
|--------|-------------|----------|
| Show blog-specific 404 | "Post not found" message with link back to /blog. Clean, focused. | ✓ |
| Use generic 404 page | Redirect to existing 404 page. Simpler but less context-specific. | |
| Redirect to /blog listing | Silently redirect. Avoids 404 but may confuse users. | |

**User's choice:** Show blog-specific 404
**Notes:** Clean, focused. "Post not found" with "← Back to Blog" link.

---

## SEO Metadata

### SEO approach

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate from excerpt | Use excerpt as meta description. Auto-generate OG tags. No extra admin fields. | ✓ |
| Add admin fields for SEO | Add meta_title, meta_description, og_image fields. Full control but more work. | |
| Skip SEO for now | No SEO metadata in v1. Can be added later. | |

**User's choice:** Auto-generate from excerpt
**Notes:** Good enough for v1. No extra admin fields needed.

### OG image fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Use site logo/default image | Fall back to default OG image. Ensures every post has an OG image. | ✓ |
| No OG image tag | Skip og:image if no featured image. Generic preview on social. | |
| Use generic placeholder | Branded placeholder. Consistent but may look low-quality. | |

**User's choice:** Use site logo/default image
**Notes:** Ensures every post has an OG image for social sharing.

---

## Quill Editor Toolbar

### Toolbar expansion

| Option | Description | Selected |
|--------|-------------|----------|
| Expand with common options | Add underline, strike, blockquote, code block, link, image, clean. | |
| Keep minimal as-is | Current set (bold, italic, headers, lists, link, image) is sufficient. | ✓ |
| Full toolbar | Enable all Quill options. Maximum flexibility but overwhelming. | |

**User's choice:** Keep minimal as-is
**Notes:** Current set covers most blog writing needs without overwhelming.

### Inline image handling

| Option | Description | Selected |
|--------|-------------|----------|
| Upload via media library | Open media library picker. Upload/select, insert URL. Reuses infrastructure. | ✓ |
| Direct paste/upload | Allow pasting/dragging images. More intuitive but requires inline handling. | |
| No inline images | Disable image upload in editor. Featured image is the only image. | |

**User's choice:** Upload via media library
**Notes:** Reuses existing media library infrastructure.

---

## Related Posts

### Related posts on single post page

| Option | Description | Selected |
|--------|-------------|----------|
| No related posts in v1 | Keep single post page clean. Can be added later. | ✓ |
| Show latest 3 posts | Simple to implement but not truly "related". | |
| Tag-based related posts | Add tags/categories. More useful but requires model changes. | |

**User's choice:** No related posts in v1
**Notes:** Requires additional logic (tag/category matching) that can be added later.

---

## Claude's Discretion

The following areas were identified but not discussed in detail. Claude has flexibility:

- **Blog post metadata on admin table:** Follow existing patterns from services/team tables
- **Blog post empty state:** "No posts yet. Create your first one." (already implemented)
- **Blog post date formatting:** `toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`
- **Blog post content sanitization error message:** "Content could not be processed. Please check your content and try again."

---

## Deferred Ideas

- Related posts (tag/category-based) — deferred to v1.1 or later
- Blog post tags/categories — requires model changes, admin UI, filtering logic
- RSS feed for blog — can be added as a separate phase
- Social sharing buttons on blog posts — frontend-only feature, separate phase
- Admin SEO fields (meta_title, meta_description) — auto-generation is sufficient for v1
- Blog post search/filtering in admin — deferred to Phase 6 (Admin Panel)
