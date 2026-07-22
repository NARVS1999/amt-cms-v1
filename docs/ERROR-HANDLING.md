# Error Handling & Edge Cases

> **Purpose:** Central registry of every error type, edge case, and boundary condition. If an agent has to ask "what happens when X happens?", the answer is documented here.

---

## 1. Error Taxonomy

### 1.1 HTTP Status Code Usage

| Code | Meaning | When | Response Shape |
|------|---------|------|---------------|
| 200 | Success (read/update/delete) | GET, PUT, DELETE | `{ "data": ... }` |
| 201 | Created | POST | `{ "data": ... }` |
| 400 | Bad request | Generic client error | `{ "message": "..." }` |
| 401 | Unauthenticated | Missing/invalid token | `{ "message": "Unauthenticated." }` |
| 403 | Forbidden | Permission denied (future) | `{ "message": "..." }` |
| 404 | Not found | Unknown route or resource | `{ "message": "Not found." }` or `{ "message": "Blog post not found." }` |
| 422 | Validation failure | Invalid request body | `{ "message": "...", "errors": { "field": ["..."] } }` |
| 429 | Rate limited | Too many requests | `{ "message": "Too many attempts. Please try again in a minute." }` |
| 500 | Server error | Unexpected failure | `{ "message": "..." }` |

### 1.2 Frontend Error Handling Patterns

| Error | Where | Visual Treatment | Behavior |
|-------|-------|-----------------|----------|
| 401 Unauthorized | Any admin fetch | Redirect | `clearToken()`, redirect to `/admin/login` |
| 422 Validation | Form submit | Inline red text below each field | Fields retain values |
| 429 Rate limited | Contact/Subscribe form | Inline message | Button disabled for 60s |
| 500 Server error | Any admin operation | Red toast (persistent) | "Couldn't save. Try again." |
| Network error | Public fetch | Silent (returns `[]` or `null`) | Graceful degradation |
| Network error | Admin fetch | Red toast | "Connection error. Check your network." |
| Abort (timeout >5s) | Public fetch | Silent (returns `[]` or `null`) | Graceful degradation |

---

## 2. Per-Feature Edge Cases

### 2.1 Services

| Edge Case | Expected Behavior |
|-----------|------------------|
| Empty list | Services section is visually hidden on public site |
| Two services with same sort_order | Display order is undefined (no secondary sort). Fix: ensure unique sort_order. |
| Delete service referenced by UI | Admin shows "Deleted" toast, removed from list |
| Icon class is invalid Font Awesome | Icon renders as empty/fallback (no validation on icon value beyond string) |
| Creating with empty title | 422 validation: "The title field is required." |
| `is_featured` is null | Treated as false (boolean cast) |

### 2.2 Team Members

| Edge Case | Expected Behavior |
|-----------|------------------|
| Empty list | Team section visually hidden on public site |
| No photo uploaded | Shows placeholder avatar (initials on muted background) |
| No social links | Social icons hidden for that member |
| Social links are invalid URLs | Stored as-is, rendered as anchor links (may break) |
| Delete member with photo | Cascade: member deleted, media remains (Spatie handles cleanup) |
| Upload >2MB photo | 422 with message from FormRequest |
| Upload non-image file | 422: "The photo must be a file of type: jpeg, png, webp." |

### 2.3 Pricing Plans

| Edge Case | Expected Behavior |
|-----------|------------------|
| Two plans marked `is_popular` | Controller clears previous popular first (see store/update logic) |
| No plans | Pricing section visually hidden on public site |
| All plans unpublished | Pricing section visually hidden on public site |
| Price = "abc" | 422: "The price must be a number." |
| Price = 0 | Accepted (min:0) |
| Price = 99999999.99 | Accepted (decimal 10,2 allows up to 99999999.99) |
| Delete plan with features | Cascade: features deleted with plan |
| Update with features array | Features are deleted and recreated (not individually updated) |
| Features with missing descriptions | Defaults to empty string |
| Features with missing is_included | Defaults to true |
| No interval provided | 422: "The interval field is required." |
| Interval = "weekly" | 422: "The selected interval is invalid." |

### 2.4 Blog Posts

| Edge Case | Expected Behavior |
|-----------|------------------|
| Published toggle ON with no published_at | Auto-set to `now()` |
| Published toggle OFF → ON again | Uses existing published_at if set, otherwise now() |
| Slug conflict (duplicate) | 422: "The slug has already been taken." |
| Slug auto-generation | Must happen client-side (no backend auto-generation) |
| Empty title | 422: "The title field is required." |
| Empty content | 422: "The content field is required." |
| Content with `<script>` tags | Must be sanitized via HTMLPurifier before rendering on public site |
| Content with `<img>` pointing to external URL | Rendered as-is (sanitizer allows safe tags) |
| Excerpt >300 chars | 422: "The excerpt must not be greater than 300 characters." |
| Featured image >2MB | 422: "The featured image must not be greater than 2048 kilobytes." |
| Featured image not an image | 422 file type error |
| Post has no featured image | `featured_image_url` is null. Blog card shows placeholder |
| Draft post in public API | BlogPostController@index does NOT filter by is_published — draft posts ARE returned |
| Delete post with featured image | Spatie cascade removes media |
| Auto-save conflict | If user saves while auto-save timer fires, last save wins |

### 2.5 Pages

| Edge Case | Expected Behavior |
|-----------|------------------|
| No published pages | Public API returns `[]`. Homepage shows "Coming Soon" fallback. |
| Slug doesn't match any page | 404 |
| Sections JSON is malformed string | 422: "Sections must be valid JSON." |
| Sections JSON contains unknown section type | Silently skipped by PageRenderer |
| Page is toggled from published to draft | Immediately excluded from public API |
| Slug edited to existing slug | 422: "The slug has already been taken." |

### 2.6 Media

| Edge Case | Expected Behavior |
|-----------|------------------|
| Upload >2MB | 422: "File too large. Max 2MB." (custom message) |
| Upload .gif or .pdf | 422: "Format not supported. Accepted: JPG, PNG, WebP, SVG." (custom message) |
| Upload SVG with embedded script | Script tags stripped server-side |
| Delete media used by a blog post | Blog post's `featured_image_url` becomes a broken link. No cascade delete prevention. |
| Upload without selecting file | 422: "Please select a file to upload." (custom message) |
| Media list empty | "No media yet. Upload your first file." |
| Media pagination | 24 per page. Frontend handles pagination controls. |

### 2.7 Contact Form

| Edge Case | Expected Behavior |
|-----------|------------------|
| Email server down | Message saved to DB. Queue retries up to 3 times. |
| Same email submits twice | Both saved (no duplicate check on contact messages) |
| Rate limit exceeded (6th request in 1 min) | 429: "Too many attempts. Please try again in a minute." |
| Message >5000 chars | 422 (Frontend Zod validation max 5000, backend has no max) |
| All fields empty | 422 with errors for name, email, message |
| Name >255 chars | 422: "The name must not be greater than 255 characters." |
| Email not valid format | 422: validation.email error message |
| Session expired mid-submit | API returns 401 → redirect to login |

### 2.8 Newsletter Subscribe

| Edge Case | Expected Behavior |
|-----------|------------------|
| Duplicate email | 422: unique constraint on `contact_subscribers.email` — "The email has already been taken." |
| Rate limit exceeded (4th in 1 min) | 429 |
| Invalid email format | 422 |
| Email >255 chars | 422 |
| Same email, different case | Treated as different until unique index is case-insensitive (MySQL default is case-sensitive VARCHAR) |

### 2.9 Authentication

| Edge Case | Expected Behavior |
|-----------|------------------|
| Wrong password | 401: "Invalid credentials. Try again." |
| Token expired | 401 → frontend redirects to `/admin/login` with "Session expired" message |
| Access /admin while logged out | Redirect to `/admin/login` from middleware |
| Access /admin/api routes without token | 401 from Sanctum middleware |
| Multiple tabs open, logout in one | Other tab's next API call gets 401 → redirects to login |

---

## 3. Boundary Values

| Field | Min | Max | Type Notes |
|-------|-----|-----|------------|
| Service title | 1 | 255 | string |
| Service description | 1 | — | text (unbounded) |
| Service icon | 1 | 255 | Font Awesome class string |
| Team member name | 1 | 255 | string |
| Team member role | 1 | 255 | string |
| Team member bio | 0 | — | text (nullable, unbounded) |
| Page title | 1 | 255 | string |
| Page slug | 1 | 255 | string, unique |
| Blog post title | 1 | 255 | string |
| Blog post slug | 1 | 255 | string, unique |
| Blog post excerpt | 0 | 300 | text (nullable) |
| Blog post content | 1 | — | longText (unbounded) |
| Pricing plan name | 1 | 255 | string |
| Pricing plan price | 0 | 99999999.99 | decimal(10,2) |
| Pricing plan interval | — | — | enum: monthly, yearly, one-time |
| Pricing plan cta_text | 0 | 255 | string (nullable) |
| Contact name | 1 | 255 | string |
| Contact email | 1 | 255 | email |
| Contact message | 1 | — | text (unbounded in backend, 5000 in frontend) |
| Subscribe email | 1 | 255 | email, unique |
| Media file size | 1 | 2048 | kilobytes |
| Media file types | — | — | jpg, jpeg, png, webp, svg |
| Sort order | — | — | integer, default 0 |

---

## 4. Concurrency & Race Conditions

| Scenario | Risk | Mitigation |
|----------|------|-----------|
| Two admin users edit same service simultaneously | Last save wins (no versioning) | Acceptable for v1 single-admin usage |
| Pricing plan `is_popular` race | Both could be set if requests arrive at same time | Controller clears all before setting one — narrow window possible |
| Blog post auto-save + manual save | Content could be overwritten | Manual save always wins (auto-save fires every 30s, but pending manual save should cancel timer) |
| Delete + re-create same slug | Slug unique constraint prevents duplicates | DB-level unique constraint is the guard |

---

## 5. Known Bugs (documented from implementation)

| Bug | Impact | Status |
|-----|--------|--------|
| `GET /api/blog-posts` returns all posts (including drafts) | Public site shows unpublished posts | **Unfixed** — `BlogPostController@index` needs `->where('is_published', true)` |
| No admin-specific `GET /api/admin/pricing-plans` route | Admin uses public route which filters out unpublished plans | **Unfixed** — needs `PricingPlanController@adminIndex` route |
| `PricingPlanResource` uses `$this->whenLoaded('features')` but public `index()` always loads features via `->with('features')` | Fine in practice — features are always loaded | Low priority |
| `MediaController` does not use `ApiResponse` trait | Inconsistent response envelope — returns `{ data, meta }` instead of just `{ data }` | Low priority — paginated responses need `meta` anyway |
| Duplicate interfaces in `admin-api.ts` and `api.ts` | Types may drift — `PricingPlanData` has `is_published` in admin but not exported in public `api.ts` | **Potential drift risk** — should consolidate to shared types |

---

## 6. What to Do When You Hit an Unhandled Edge Case

1. **Document it in this file** — add a new row to the relevant section
2. **Implement the safest fallback:**
   - API: return a clear error response (422 for invalid input, 500 for unexpected)
   - Frontend: show a red toast with "Something went wrong." + generic message
   - Never silently swallow errors that affect data integrity
3. **If it's a data integrity issue** (e.g., orphaned records, duplicate unique constraints): use DB-level constraints as the last line of defense
4. **If it's a UX edge case**: follow the closest pattern in EXPERIENCE.md (e.g., empty states, save failures)
