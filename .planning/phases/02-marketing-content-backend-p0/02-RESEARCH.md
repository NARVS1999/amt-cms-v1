# Phase 2: Marketing Content Backend (P0) — Research

**Date:** 2026-07-26
**Status:** Complete

---

## 1. Existing Patterns — Admin Page CRUD Components

### Existing admin pages (already implemented in Phase 1)

All four target admin pages **already exist** and have fully functional CRUD:

| Page | File | Status |
|------|------|--------|
| Services | `apps/frontend/app/admin/services/page.tsx` | Full CRUD: table + modal form |
| Team | `apps/frontend/app/admin/team/page.tsx` | Full CRUD: table + modal form |
| Pages | `apps/frontend/app/admin/pages/page.tsx` | Full CRUD: table + modal form + JSON sections editor |
| Pricing Plans | `apps/frontend/app/admin/pricing-plans/page.tsx` | Full CRUD: table + modal form + inline feature rows |

### Key observation
The admin UI for this phase was **built during Phase 1 as scaffolding**. The pages exist and function, but several features from the discuss-phase decisions (team photo upload, social links, sort order controls, toast integration) are **missing or incomplete**. This phase should focus on gap-filling and polishing rather than building from scratch.

### Shared UI components (`components/ui/`)
10 shadcn-based primitives available:

| Component | File | Notes |
|-----------|------|-------|
| AlertDialog | `alert-dialog.tsx` | Modal confirmations — used for delete everywhere |
| Button | `button.tsx` | With loading/disabled state |
| Card | `card.tsx` | Header, Content, Title, Description, Footer |
| Input | `input.tsx` | Text/number/email inputs |
| Label | `label.tsx` | Form labels |
| Progress | `progress.tsx` | Progress bar |
| Skeleton | `skeleton.tsx` | Pulse animation loading placeholder |
| Spinner | `spinner.tsx` | Lucide `LoaderCircle` with `animate-spin` |
| Table | `table.tsx` | Table/Header/Body/Row/Cell/Head |
| Toast | `toast.tsx` | ToastProvider + useToast() with success/error/info variants |

### Established admin page pattern (from dashboard page + media page)
```tsx
'use client';
// Imports: Button, Card, Input, Label, Table, Skeleton, AlertDialog, useToast
// States: items[], loading, editing, saving, error, deleteTarget
// load() → try/catch with UnauthorizedError → router.push('/admin/login')
// useEffect(() => { load() }, [])
// handleSave() / handleDelete() with try/catch + showToast
// Loading: skeleton rows in table
// Error: alert banner with bg-destructive/10
// Empty: "No items yet" centered message
// Form: modal overlay (fixed inset-0 z-50 bg-black/50) with Card
```

### Page-specific patterns already implemented

**Services** (`services/page.tsx`):
- Fields: title, description (textarea), icon (Font Awesome class text input), is_featured (checkbox)
- Table: Title, Icon, Featured, Sort, Actions

**Team** (`team/page.tsx`):
- Fields: name, role, bio (textarea), sort_order (number input)
- Table: Name, Role, Sort, Actions
- **Missing**: photo upload (no file input, no photo preview, no remove/replace buttons), social_links

**Pages** (`pages/page.tsx`):
- Fields: title, slug, hero_heading, hero_subtext, sections (JSON textarea with "Load Example" button), is_published (checkbox)
- Table: Title, Slug, Status, Actions (Edit, View if published, Del)
- Sections schema defined in `EXAMPLE_SECTIONS` constant: `hero`, `features`, `content`, `cta` types with `heading`, `content`, `image` fields
- JSON validation: real-time parse check in `handleJsonChange()`

**Pricing Plans** (`pricing-plans/page.tsx`):
- Fields: name, price (number step=0.01), interval (select: monthly/yearly/one-time), description, cta_text, is_popular (checkbox), is_published (checkbox), features (inline dynamic rows)
- Features: add/remove rows, description input + is_included checkbox per row
- Features deleted and recreated on update (matches backend controller logic)
- Known bug: admin uses public `GET /api/pricing-plans` which filters by `is_published: true` — no admin-specific route

---

## 2. Admin API Pattern (`lib/admin-api.ts`)

### `request<T>()` function
```typescript
async function request<T>(path: string, options: RequestInit = {}): Promise<T>
```
- Reads `admin_token` from `localStorage` via `getToken()`
- Sends `Authorization: Bearer <token>` header
- `Content-Type: application/json` by default (except FormData uploads)
- 401 → `clearToken()` + throws `UnauthorizedError`
- 422 → throws `{ status: 422, errors, message }`
- Other errors → throws `{ status, message }`

### CRUD function pattern
```typescript
// Pattern for all resources:
export async function fetchXxx(): Promise<{ data: XxxData[] }>
export async function createXxx(data: Partial<XxxData>): Promise<{ data: XxxData }>
export async function updateXxx(id: number, data: Partial<XxxData>): Promise<{ data: XxxData }>
export async function deleteXxx(id: number): Promise<void>
```

### Key types already defined in `admin-api.ts`
- `ServiceData`, `TeamMemberData`, `PageData`, `PricingPlanData`, `PricingPlanFeatureData`
- All CRUD functions exist for all four resources

### File upload exception
`uploadMedia()` bypasses `request<T>()` for FormData (no `Content-Type: application/json`). Same pattern should be used for team member photo upload.

### Auth helpers
- `getToken()`, `setToken()`, `clearToken()` — localStorage management
- `isAuthenticated()` — boolean check
- `UnauthorizedError` class — caught in admin pages to redirect to login

---

## 3. Existing Zod Schemas (`packages/shared/src/schemas/`)

All schemas exist and match the SPEC exactly:

| Schema File | Key Shape |
|-------------|-----------|
| `service.ts` | `{ id, title, description, icon, is_featured?, sort_order?, created_at, updated_at }` |
| `team-member.ts` | `{ id, name, role, bio?, photo_url?, social_links?: { linkedin?, twitter? }, sort_order?, created_at, updated_at }` |
| `page.ts` | `{ id, title, slug, hero_heading?, hero_subtext?, sections? (Record[]), is_published?, created_at, updated_at }` |
| `pricing-plan.ts` | `{ id, name, price, interval (enum), description?, is_popular?, is_published?, cta_text?, sort_order?, features: PlanFeature[], created_at, updated_at }` |

**Assessment:** No updates needed unless API contracts change. Team member `social_links` schema validates URLs (z.string().url()) — may need relaxation if admin can save non-URL values.

---

## 4. Edge Cases (from `docs/ERROR-HANDLING.md`)

### Services (§2.1)
| Edge Case | Behavior |
|-----------|----------|
| Empty list | Visually hidden on public site |
| Same sort_order | Undefined display order (no secondary sort) |
| Invalid icon class | Renders as empty/fallback (no validation beyond string) |
| `is_featured` null | Treated as false (boolean cast) |
| Delete service referenced by UI | "Deleted" toast, removed from list |

### Team Members (§2.2)
| Edge Case | Behavior |
|-----------|----------|
| Empty list | Team section visually hidden |
| No photo | Placeholder avatar (initials on muted bg) |
| No social links | Social icons hidden |
| Invalid social URLs | Stored as-is, may render broken links |
| Delete with photo | Cascade: member deleted, media handled by Spatie |
| Upload >2MB photo | 422 from FormRequest |
| Upload non-image | 422: "must be a file of type: jpeg, png, webp" |

### Pricing Plans (§2.3)
| Edge Case | Behavior |
|-----------|----------|
| Two plans marked `is_popular` | Controller clears previous popular first |
| No plans / all unpublished | Pricing section hidden |
| Price = "abc" | 422 validation |
| Price = 0 | Accepted (min:0) |
| Delete plan with features | Cascade delete |
| Update with features array | Features deleted and recreated |
| Missing `interval` | 422 required |
| Interval = "weekly" | 422 invalid enum |

### Pages (§2.5)
| Edge Case | Behavior |
|-----------|----------|
| No published pages | API returns [], homepage shows "Coming Soon" |
| Slug doesn't match | 404 |
| Sections JSON is malformed | 422: "Sections must be valid JSON." |
| Unknown section type | Silently skipped by PageRenderer |
| Toggle published→draft | Immediately excluded from public API |
| Slug edited to existing slug | 422 unique constraint |

### Known Bugs (§5)
| Bug | Impact |
|-----|--------|
| No admin-specific GET for pricing plans | Admin uses public route → cannot see unpublished plans |
| Duplicate interfaces in `admin-api.ts` and `api.ts` | Types may drift |

---

## 5. Admin Sidebar (`components/admin/sidebar.tsx`)

### Nav groups (no changes needed for phase 2)

| Group | Items | Status |
|-------|-------|--------|
| **Main** | Dashboard (`/admin/dashboard`), Services (`/admin/services`), Team (`/admin/team`), Blog (`/admin/blog-posts`), Pricing (`/admin/pricing-plans`) | All active, hrefs correct |
| **Leads** | Messages (`#`), Subscribers (`#`) | Placeholder — v1.1 |
| **Settings** | Theme (`#`), Media Library (`/admin/media`), Pages (`/admin/pages`) | Theme placeholder |

The sidebar already has all four target links with correct hrefs. No navigation updates are needed for Phase 2.

---

## 6. Page Sections — Schema Analysis

### Current definition (from `pages/page.tsx` `EXAMPLE_SECTIONS`)
```typescript
const EXAMPLE_SECTIONS = [
  { type: 'hero', heading: 'Welcome to Our Agency', content: '...' },
  { type: 'features', heading: 'What We Offer', content: '...' },
  { type: 'content', heading: 'Our Process', content: '...', image: '' },
  { type: 'cta', heading: 'Ready to Grow?', content: '...' },
];
```

### Section type taxonomy (inferred from code)
| Type | Fields | Notes |
|------|--------|-------|
| `hero` | `heading`, `content` | Page hero section |
| `features` | `heading`, `content` | Features highlight |
| `content` | `heading`, `content`, `image?` | Rich content block |
| `cta` | `heading`, `content` | Call-to-action banner |

### Current admin UI
- Raw JSON textarea with real-time validation
- "Load Example" button populates example sections
- Error display for invalid JSON
- No structured form fields per section type (deferred to discretion)

### SPEC field
The `sections` column in `marketing_pages` is `json nullable` — the schema is open-ended. The current `PageRenderer` component (public site) handles rendering based on `type` field.

### Recommendation (from CONTEXT.md Claude's discretion)
Structured form fields per section type would be better UX but adds significant complexity. The current JSON editor approach is acceptable for v1. Defer structured section editing.

---

## 7. Backend State — Already Implemented

### Controllers (all exist in `app/Http/Controllers/Api/`)

| Controller | Methods | Notes |
|------------|---------|-------|
| `ServiceController` | index, store, update, destroy | Full CRUD, Spatie Query Builder for index |
| `TeamMemberController` | index, store, update, destroy | Full CRUD, `with('media')` for eager loading |
| `PageController` | index, adminIndex, show, store, update, destroy | `adminIndex` returns all (no published filter), `show` filters by published |
| `PricingPlanController` | index, adminIndex, store, update, destroy | Has `adminIndex()` but **no route** for it (known bug) |
| `MediaController` | index, store, destroy | File upload via Spatie |

### Team Member photo upload — NOT handled in controller
The `TeamMemberController@store` and `@update` methods validate fields (name, role, bio, social_links, sort_order) but do **NOT** handle `photo` file upload. The TeamMember model has:
- `registerMediaCollections()` with `singleFile()` for 'photo' collection
- `registerMediaConversions()` with 'thumb' crop (150x150)
- `InteractsWithMedia` trait

The store/update methods need to be extended to handle:
```php
if ($request->hasFile('photo')) {
    $member->addMedia($request->file('photo'))->toMediaCollection('photo');
}
```

### Team Member photo removal — NOT implemented
There is no endpoint for explicitly removing a team member's photo (as per D-02 requirement: explicit remove + replace as two separate actions).

### Pricing Plans — missing admin route (known bug)
`PricingPlanController` has an `adminIndex()` method that returns all plans (including unpublished), but there's no route for it in `api.php`. The admin currently uses `GET /api/pricing-plans` which goes to `index()` which filters `->where('is_published', true)`.

### Models (all exist)

| Model | Table | Traits | Key Feature |
|-------|-------|--------|-------------|
| `Service` | `marketing_services` | HasFactory | fillable, casts |
| `TeamMember` | `marketing_team_members` | HasFactory, InteractsWithMedia | media collections, conversions |
| `Page` | `marketing_pages` | HasFactory | fillable, casts |
| `PricingPlan` | `billing_pricing_plans` | HasFactory | features() HasMany relationship |
| `PlanFeature` | `billing_plan_features` | HasFactory | plan() BelongsTo relationship |

### API Resources (all exist)

| Resource | Key Behavior |
|----------|-------------|
| `ServiceResource` | Direct field mapping |
| `TeamMemberResource` | `$this->getFirstMediaUrl('photo', 'thumb')` for `photo_url` |
| `PageResource` | Includes `sections` JSON array |
| `PricingPlanResource` | Includes nested `features` via `$this->whenLoaded('features')` |

### Routes (all defined in `routes/api.php`)

All routes are properly registered. The `auth:sanctum` group wraps:
- POST/PUT/DELETE for services, team, pages, pricing-plans, blog-posts
- GET `/admin/pages` (adminIndex)
- GET `/admin/stats`
- Media CRUD
- `/me` and `/logout`

---

## 8. File Upload Pattern

### Media Library upload (existing reference pattern)
```typescript
// From admin-api.ts uploadMedia()
export async function uploadMedia(file: File): Promise<{ data: MediaData }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  // ... error handling same as request() pattern
}
```

Key pattern: **No `Content-Type` header** — browser sets `multipart/form-data` with boundary automatically.

### Blog post featured image upload (existing reference pattern)
```typescript
// From blog-posts/page.tsx handleSave()
const formData = new FormData();
formData.append('title', editing.title);
formData.append('featured_image', featuredImageFile);
if (editing.id) formData.append('_method', 'PUT');  // Laravel form method spoofing
const res = await fetch(`${API_BASE}/blog-posts${editing.id ? `/${editing.id}` : ''}`, {
  method: 'POST',  // Always POST with _method for file uploads
  headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  body: formData,
});
```

Key pattern: **Laravel method spoofing** — when uploading files, use `POST` with `_method: 'PUT'` instead of PUT request (because FormData can't be sent with PUT).

### Team member photo — what needs to be built
The team admin page (`page.tsx`) currently has NO photo upload. Based on decisions D-01 through D-04:
1. File input in the team member form (not media library)
2. Remove button + separate upload for replacement
3. Lucide User icon as empty placeholder
4. Recommended sizing guidance (400x400px, JPEG/PNG/WebP, no hard enforcement)

Implementation approach for store (create):
```php
if ($request->hasFile('photo')) {
    $member->addMedia($request->file('photo'))->toMediaCollection('photo');
}
```

Implementation approach for update (replace/remove):
- Remove: `$member->clearMediaCollection('photo')` or delete the single media item
- Replace: `$member->addMedia($request->file('photo'))->toMediaCollection('photo')` — singleFile() handles auto-replacement on the Spatie side if we want replace behavior; but per D-02, we need explicit remove + replace as two separate actions

For the frontend, the team form needs:
- Photo preview (current photo_url or placeholder icon)
- Remove photo button (clears collection + sets photo_url to null)
- Upload button/file input that shows preview after selection
- Form submission sends photo via FormData with _method spoofing for updates

---

## Summary of Gaps to Address in Planning

| # | Gap | Location | Effort |
|---|-----|----------|--------|
| 1 | Team member photo upload — missing from both controller and admin UI | `TeamMemberController`, `team/page.tsx` | Medium |
| 2 | Team member photo removal — no endpoint or UI action | `TeamMemberController`, `team/page.tsx` | Small |
| 3 | Team member social_links — missing from admin form UI | `team/page.tsx` | Small |
| 4 | Pricing plans missing admin route (cannot see unpublished) | `routes/api.php` | Small |
| 5 | Known bug: pricing plans admin uses public filter | ERROR-HANDLING.md §5 | Small |
| 6 | Sorting controls (up/down buttons) — not implemented anywhere | All four pages | Medium |
| 7 | Toast integration — services, team, pages pages don't use `useToast()` | All four pages | Small |
| 8 | Form validation error display (inline red text per D-12) — partially done | All four pages | Medium |
| 9 | Page sections could benefit from structured form fields (deferred) | `pages/page.tsx` | Optional |
| 10 | Pricing plan features inline UI already done (gap closed) | `pricing-plans/page.tsx` | None |
| 11 | Service icon picker is text input (as decided) | `services/page.tsx` | None |
| 12 | Featured toggle is simple boolean (as decided) | `services/page.tsx` | None |

---

## RESEARCH COMPLETE
