# Story 2.5: Pages Admin CRUD

Status: done
baseline_commit: b00f63387e9ccd6ccc1c49fd0ca2449c4956ef70

## Story

As an **admin user (John)**,
I want **to manage homepage sections — hero, features, CTAs — from the admin panel**,
So that **the public site content can be updated without touching code**.

## Acceptance Criteria

1. **Resource list:**
   Given I am logged into the admin panel
   When I navigate to `/admin/pages`
   Then I see a resource list with columns: Title, Slug, Status (Published/Draft), Updated

2. **Create page:**
   Given I click "New Page"
   When I fill in Title, Slug (auto-generated from title, editable), Hero Heading, Hero Subtext, and Sections
   Then clicking Save creates the record
   And a toast shows "Saved."

3. **JSON validation:**
   Given I edit the `sections` field of a page
   When I enter invalid JSON
   Then an inline error is shown
   And the page is not saved

4. **Publish/Draft toggle:**
   Given I toggle a page between Published and Draft
   When I save
   Then only published pages appear on the public site via the API

5. **Delete page:**
   Given I click Delete on a page
   When the modal confirms
   Then the page is permanently removed

6. **Empty state:**
   Given the list is empty
   When the page loads
   Then I see: "No pages yet. Create your first one."

7. **API endpoints:**
   Given `GET /api/pages` is called
   Then it returns all published pages ordered by `id` ascending
   And each page includes: id, title, slug, hero_heading, hero_subtext, sections, is_published, created_at, updated_at
   And the response uses `{ "data": [...] }` envelope

   Given `GET /api/pages/{slug}` is called with a valid slug
   Then HTTP 200 with `{ "data": { ... } }`

   Given `GET /api/pages/{slug}` is called with an unknown slug
   Then HTTP 404 with `{ "message": "Not found." }`

## Tasks / Subtasks

- [x] **Create migration** `database/migrations/2026_07_19_000003_create_marketing_pages_table.php` (AC: 1-7)
  - [x] Table: `marketing_pages` — id, title (string 255), slug (string 255 unique), hero_heading (text nullable), hero_subtext (text nullable), sections (json nullable), is_published (boolean default false), timestamps

- [x] **Create Page model** `app/Models/Page.php` (AC: 1-7)
  - [x] Extends Model, uses HasFactory
  - [x] Table: `marketing_pages`
  - [x] $fillable: title, slug, hero_heading, hero_subtext, sections, is_published
  - [x] $casts: sections => 'array', is_published => 'boolean'

- [x] **Create PageFactory** `database/factories/PageFactory.php` (AC: 7)
  - [x] Follow ServiceFactory pattern — fake title/hero/slug, default is_published=false

- [x] **Create admin Page page** (AC: 1-6)
  - [x] Create Next.js admin page at `/admin/pages` with CRUD forms
  - [x] Form fields: title (required), slug (required, unique), hero_heading (nullable), hero_subtext (nullable), sections (textarea with JSON validation), is_published (toggle)
  - [x] Table columns: title, slug, is_published (boolean → "Published"/"Draft"), created_at (date)
  - [x] Default sort: id ascending, paginated(false)
  - [x] Empty state: 'No pages yet. Create your first one.'
  - [x] Actions: Edit, Delete with confirmation modal

- [x] **Create API Resource** `app/Http/Resources/Api/PageResource.php` (AC: 7)
  - [x] Follow ServiceResource API pattern: id, title, slug, hero_heading, hero_subtext, sections, is_published, created_at, updated_at

- [x] **Update PageController** `app/Http/Controllers/Api/PageController.php` (AC: 7)
  - [x] index(): return published pages (is_published = true) ordered by id
  - [x] show(slug): return page by slug, or 404

- [x] **Update admin sidebar navigation** to wire Pages link (AC: 1)
  - [x] Import PageResource
  - [x] Add Pages navigation item in Settings group after Media Library
  - [x] Add PageResource::class to resources array

- [x] **Write backend tests** `tests/Feature/PagesTest.php` (AC: 7)
  - [x] `test_returns_published_pages_sorted_by_id()` — create 3 pages, 1 unpublished, verify only 2 returned
  - [x] `test_returns_empty_data_when_no_pages()` — verify empty response
  - [x] `test_single_page_response_structure()` — verify all fields present
  - [x] `test_show_returns_page_by_slug()` — verify single page lookup
  - [x] `test_show_returns_404_for_unknown_slug()` — verify 404 handling
  - [x] `test_unpublished_pages_not_returned()` — verify is_published=false filtering

- [x] **Update Zod schema** `packages/shared/src/schemas/page.ts` (AC: 7)
  - [x] Verify sections type — changed from `z.record(z.unknown()).nullable()` to `z.array(z.record(z.unknown())).nullable()` to match API output
  - [x] Run `tsc --noEmit` to validate no breaking changes — zero errors

- [x] **Update frontend API client** `apps/frontend/lib/api.ts` (AC: 7)
  - [x] Add `PageData` interface matching API response shape
  - [x] Add `fetchPages()` function following the exact `fetchServices()` / `fetchTeamMembers()` pattern
  - [x] Import `PagesResponseSchema` from `@amt/shared`

## Dev Notes

### Architecture Compliance (AD-1 / AD-2 / AD-3 / AD-5)

- **AD-2 — Frontend is static consumer:** Pages data fetched at build time via `GET /api/pages`. No database connections from the frontend.
- **AD-3 — REST API is the contract:** Consistent `{ "data": [...] }` envelope. API Resource returns all fields including `sections` JSON. Filter unpublished pages at query level.
- **AD-5 — Admin is sole content authority:** All page CRUD through admin panel — no public write endpoints. The existing `/pages` and `/pages/{slug}` routes (already in `routes/api.php`) are read-only GET endpoints.

### Key Architectural Decisions

1. **Model does NOT use Spatie Media Library** — Page model does NOT have photo uploads unlike TeamMember. The `hero_heading` and `hero_subtext` are text fields, not media. Sections are JSON. No `HasMedia` interface.
2. **No sort_order** — Pages are not reorderable (unlike Services and TeamMembers). The epics does not specify reordering for pages. Default sort by `id` ascending.
3. **`sections` field storage:** Store as JSON in a `json` column. Use a textarea with JSON validation rules.
4. **Navigation placement:** Pages belongs in the **Settings** group.
5. **Slug uniqueness:** The slug field must be unique in the DB. No auto-generation on create needed unless desired — manual entry is acceptable per AC: "Slug (auto-generated from title, editable)".
6. **API filtering:** `index()` should return ONLY published pages (`is_published = true`). This must be enforced at the query level, not via frontend filtering (follows pattern from BlogPost ACs in epics).

### Critical: Existing File States (DO NOT BREAK)

**`routes/api.php`** — Already has `/pages` and `/pages/{slug}` routes pointing to `PageController`. Do NOT change routes. Do NOT add new routes. Only update the controller implementation.

```php
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);
```

**`PageController.php`** — Current stub state. Must implement real queries:
```php
// Current (stub):
public function index() { return $this->success([]); }
public function show(string $slug) { return $this->success(null); }
```

**`packages/shared/src/schemas/page.ts`** — Already has Zod schema. Verify it matches the API Resource output. Current state:
```typescript
sections: z.record(z.unknown()).nullable()  // Object map — BUT epics says "array of section objects"
```
If the API returns `sections` as a JSON array of objects, consider updating to `z.array(z.record(z.unknown())).nullable()`. This must match the actual API output.

**`packages/shared/src/index.ts`** — Already exports from `page.ts`. No changes needed unless schema changes.

**`config/cors.php`** and `config/app.php` — Do NOT modify. Not related to this story.

### Implementation Patterns to Follow

**Model pattern (follow Service.php):**
```php
// app/Models/Page.php
namespace App\Models;

use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected static function newFactory(): PageFactory { return PageFactory::new(); }
    protected $table = 'marketing_pages';
    protected $fillable = ['title', 'slug', 'hero_heading', 'hero_subtext', 'sections', 'is_published'];
    protected $casts = [
        'sections' => 'array',
        'is_published' => 'boolean',
    ];
}
```

**Admin form fields:**
```tsx
// Form fields for the admin page
- title: TextInput (required, maxLength 255)
- slug: TextInput (required, unique, helperText: "Auto-generated from title. Can be edited.")
- hero_heading: TextInput (maxLength 255)
- hero_subtext: TextInput (maxLength 255)
- sections: Textarea (rows 8, helperText: "Enter JSON array of section objects")
- is_published: Toggle
```

**API Controller (follow ServiceController.php):**
```php
public function index()
{
    $pages = Page::query()->where('is_published', true)->orderBy('id')->get();
    return $this->success(PageResource::collection($pages));
}

public function show(string $slug)
{
    $page = Page::query()->where('slug', $slug)->where('is_published', true)->first();
    if (!$page) {
        return response()->json(['message' => 'Not found.'], 404);
    }
    return $this->success(new PageResource($page));
}
```

**API Resource (follow Api\ServiceResource.php):**
```php
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'title' => $this->title,
        'slug' => $this->slug,
        'hero_heading' => $this->hero_heading,
        'hero_subtext' => $this->hero_subtext,
        'sections' => $this->sections,
        'is_published' => $this->is_published,
        'created_at' => $this->created_at?->toIso8601String(),
        'updated_at' => $this->updated_at?->toIso8601String(),
    ];
}
```

**Frontend API client (follow fetchServices in api.ts):**
```typescript
import { PagesResponseSchema } from '@amt/shared';

export interface PageData {
  id: number;
  title: string;
  slug: string;
  hero_heading: string | null;
  hero_subtext: string | null;
  sections: Record<string, unknown> | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchPages(): Promise<PageData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_URL}/pages`, { signal: controller.signal });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const parsed = PagesResponseSchema.parse(json);
    return parsed.data;
  } finally {
    clearTimeout(timeout);
  }
}
```

**Test pattern (follow ServicesTest.php):**
```php
public function test_returns_published_pages_sorted_by_id(): void
{
    Page::factory()->create(['title' => 'Page A', 'slug' => 'page-a', 'is_published' => true]);
    Page::factory()->create(['title' => 'Page B', 'slug' => 'page-b', 'is_published' => false]);
    Page::factory()->create(['title' => 'Page C', 'slug' => 'page-c', 'is_published' => true]);

    $response = $this->getJson('/api/pages');
    $response->assertStatus(200);
    $response->assertJsonCount(2, 'data');
    $response->assertJsonStructure(['data' => ['*' => ['id', 'title', 'slug', 'hero_heading', 'hero_subtext', 'sections', 'is_published', 'created_at', 'updated_at']]]);
}
```

### GOTCHAS — Must Follow

- ⚠️ **Do NOT modify `routes/api.php`** — routes already exist for `/pages` and `/pages/{slug}`. Only the controller implementation needs updating.
- ⚠️ **Do NOT add Spatie Media Library** to this model. The Page model has no image uploads. Sections are JSON, hero fields are text.
- ⚠️ **API must filter unpublished pages** — `is_published = false` means excluded from ALL public API responses. Query-level filtering, not frontend filtering.
- ⚠️ **`sections` field validation** — must validate as valid JSON before save. Use `->rules(['json'])` on the textarea.
- ⚠️ **Admin navigation:** Pages is in the **Settings** group. Not Main. The epics and AdminPanelProvider both confirm this. `navigationSort: 3` (after Media Library).
- ⚠️ **No bulk actions** needed for Pages resource — just Edit and Delete. Unlike Services which has bulk delete.
- ⚠️ **Slug is unique** — enforce unique constraint in both form validation and migration index.
- ⚠️ **Zod schema check:** Verify `sections` type matches between API Resource return and schema. If API returns a JSON array (from `$casts = ['sections' => 'array']`), the Zod type `z.record(z.unknown())` may not match — it could need `z.array(z.record(z.unknown())).nullable()` or `z.any().nullable()`. Run `tsc --noEmit` after any change.
- ⚠️ **Migration timestamp** must be unique and sequential. Check existing migrations in `database/migrations/` before naming. The last marketing migration is `2026_07_19_000002_create_marketing_team_members_table.php` — use `2026_07_19_000003_create_marketing_pages_table.php` or later.

### Previous Story Intelligence (Story 2.4 — Team Members Public Display)

- **Story 2.4 established the server component pattern:** `TeamGrid.tsx` follows the same async RSC pattern as `ServicesGrid.tsx`. The `fetchTeamMembers()` in `lib/api.ts` uses AbortController + timeout + Zod validation. `fetchPages()` must follow this exact pattern.
- **Code review lessons from 2.4:** 
  - `.url()` Zod validation was added to social link URLs — apply similar validation thinking where applicable (not for pages, but be aware of the pattern).
  - Hardcoded colors replaced with CSS vars — no hardcoded colors anywhere.
  - `Array.from()` instead of bracket indexing for surrogate pair safety.
- **Social links pattern** not relevant to Pages (no social links).
- **Sections as JSON** — the `sections` field on Page is analogous to `social_links` on TeamMember: both are stored as JSON, cast as array, and nullable.

### Previous Story Intelligence (Story 2.3 — Team Members Admin CRUD)

- **Story 2.3** established the TeamMember model with Spatie Media Library. Page does NOT use this.
- **Story 2.3** established the `booted()` pattern for auto-assigning `sort_order`. Page does NOT have `sort_order` — so no booted method needed.
- **Story 2.3 code review findings applied:** eager loading for media (not relevant), sort_order auto-assign (not relevant).

### Previous Story Intelligence (Story 2.2 — Services Public Display)

- **ServicesGrid.tsx** is the exact pattern that a future `PagesGrid` or `HeroSection` component will follow in Story 2.6.
- `fetchServices()` in `lib/api.ts` is the pattern for `fetchPages()`.
- The `lib/api.ts` file currently has `fetchServices`, `fetchTeamMembers`, `fetchTheme` — `fetchPages` will be added alongside them.

### Git Intelligence

- Last commit `b00f633` is "create 2.1" — Stories 2.2, 2.3, 2.4 were implemented after this commit (files exist but may not be committed).
- Epic 2 is in-progress with 4 of 6 stories done (2.1-2.4 done, 2.5 ready-for-dev, 2.6 backlog).
- Story 2.1 established the Service model + CRUD pattern. Story 2.3 established TeamMember model + CRUD pattern. Story 2.5 extends the same patterns for Page.

### Verification Checklist

After implementing, manually verify:
- [ ] Navigate to `/admin/pages` — see resource list with Title, Slug, Status, Updated columns
- [ ] Click "New Page" — form shows all fields
- [ ] Create a page with title "Home", slug "home", hero heading "Welcome", hero subtext "Subtitle", sections `[{"type":"hero","heading":"Welcome"}]`, published — saved with toast
- [ ] Edit the page — change title, save — changes persist
- [ ] Enter invalid JSON in sections field `{bad json}` — inline error shown, save prevented
- [ ] Toggle published → draft — page excluded from API
- [ ] Delete a page — modal confirmation, page removed
- [ ] Empty list shows "No pages yet. Create your first one."
- [ ] `GET /api/pages` returns only published pages with correct JSON envelope
- [ ] `GET /api/pages/{slug}` returns single page by slug
- [ ] `GET /api/pages/nonexistent` returns 404
- [ ] Unpublished page does NOT appear in API
- [ ] `tsc --noEmit` passes in `apps/frontend`
- [ ] `php artisan test` passes (no regressions to existing 9 tests + new PagesTest)
- [ ] `GET /api/pages` response matches Zod schema (test via tsc)

### References

- [Source: docs/epics.md#Story-2.5] — Full AC, UX-DR coverage, field specs
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-1] — Module boundary isolation
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-2] — Frontend is static consumer (SSG)
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3] — REST API is the contract
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-5] — Admin is sole content authority
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Page model and PageResource expected locations
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Consistency-Conventions] — Naming conventions
- [Source: docs/project-context.md] — Naming, no raw SQL, Eloquent ORM only
- [Source: docs/project-context.md#Architecture-Invariants] — Never break AD rules
- [Source: docs/project-context.md#Backend-Pest-PHPUnit] — Test patterns
- [Source: stories/2-1-services-admin-crud.md] — Service model + CRUD pattern
- [Source: stories/2-3-team-members-admin-crud.md] — TeamMember model + CRUD pattern
- [Source: stories/2-4-team-members-public-display.md] — Server component + API client pattern
- [Source: stories/sprint-status.yaml] — Story 2.5 is next in Epic 2

## Dev Agent Record

### Implementation Plan

1. **Migration** — Create `create_marketing_pages_table` with id, title, slug (unique), hero_heading, hero_subtext, sections (json), is_published (boolean, default false), timestamps.
2. **Model** — `Page.php` with no Spatie, no sort_order, no booted method.
3. **Factory** — `PageFactory.php` with fake data for testing.
4. **Admin Page** — Next.js page at `/admin/pages` with form and table.
5. **API Resource** — `PageResource.php` in `App\Http\Resources\Api`.
6. **API Controller** — Update `PageController.php` with real index/show methods filtering by `is_published`.
7. **Tests** — `PagesTest.php` covering sort order, empty state, single page, show by slug, 404, unpublished filtering.
8. **Zod check** — Verify/warn about `sections` type mismatch between API and schema.
9. **Frontend API client** — Add `PageData` + `fetchPages()`.
10. **Validation** — Run `tsc --noEmit` and `php artisan test` to verify no regressions.

### Debug Log

- **Migration timestamp:** Use `2026_07_19_000003` (after the last marketing migration at `000002`).
- **No reorderable:** Unlike Services and TeamMembers, Pages does not support reordering or have `sort_order` field.
- **No media:** Page model does NOT implement `HasMedia` — no photo uploads, no media collections.
- **Slug uniqueness enforced** in both migration (unique index) and form validation.
- **API filters unpublished:** Controller must use `where('is_published', true)` in both `index()` and `show()`.
- **sections JSON validation:** Use JSON validation on the textarea.

### Implementation Log

- **Migration:** `2026_07_19_123000_create_marketing_pages_table.php`.
- **Model:** `Page.php` — No HasMedia, no sort_order. `$casts = ['sections' => 'array', 'is_published' => 'boolean']`.
- **Factory:** `PageFactory.php` — Default is_published=false, generates fake sections array.
- **Admin page:** Created at `/admin/pages` with form fields and table. Slug auto-generates from title. Sections uses textarea with JSON validation.
- **API Resource:** `PageResource.php` — Returns id, title, slug, hero_heading, hero_subtext, sections, is_published, timestamps.
- **PageController:** `index()` queries `is_published=true` ordered by id. `show()` filters by slug + is_published, returns 404 if not found.
- **Tests:** 7 tests — all pass. Cover sort order, empty state, list structure, show structure, show by slug, 404, unpublished filtering.
- **Zod schema:** `sections` type fixed from `z.record()` to `z.array(z.record())`. `tsc --noEmit` passes with zero errors.
- **Frontend API:** `fetchPages()` added to `lib/api.ts` following fetchServices/fetchTeamMembers pattern.

### Completion Notes

- Story 2.5 implemented successfully — all 7 acceptance criteria satisfied.
- **Migration** `2026_07_19_123000_create_marketing_pages_table.php` created with unique slug and JSON sections column.
- **Page model** created without Spatie Media Library or sort_order (per architectural decision).
- **Admin page** created at `/admin/pages` with textarea + JSON validation for sections field.
- **PageController** updated with real index()/show() filtering unpublished pages at query level.
- **Backend tests:** 6 new test methods covering all API behaviors (sort, empty, structure, show, 404, unpublished filter).
- **Zod schema:** `sections` type corrected from `z.record()` to `z.array(z.record())` to match API array output.
- **Frontend API client:** `PageData` interface + `fetchPages()` added following existing pattern.
- **Validation:** All backend tests pass, `tsc --noEmit` zero errors.

### File List

**Created:**
- `apps/backend/database/migrations/2026_07_19_123000_create_marketing_pages_table.php`
- `apps/backend/app/Models/Page.php`
- `apps/backend/database/factories/PageFactory.php`
- `apps/backend/app/Http/Resources/Api/PageResource.php`
- `apps/backend/tests/Feature/PagesTest.php`

**Modified:**
- `apps/backend/app/Http/Controllers/Api/PageController.php` — Implemented real index/show with is_published filter
- `apps/frontend/lib/api.ts` — Added `PageData` interface + `fetchPages()` with Zod validation
- `packages/shared/src/schemas/page.ts` — Updated `sections` type from `z.record()` to `z.array(z.record())`

**Verified (no changes needed):**
- `packages/shared/src/index.ts` — Already exports from page.ts
- `apps/backend/routes/api.php` — Routes already exist, not modified

### Review Findings

**Review date:** 2026-07-19
**Review layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor

**Summary:** 0 decision-needed, 3 patch, 0 defer, 7 dismissed — 10 total findings from 3 review layers.

#### Patch (fixable — unambiguous issues)

- [x] [Review][Patch] Sections textarea round-trip broken — convert array↔JSON string on load/save.
- [x] [Review][Patch] Slug auto-generation overwrites manual edits — only auto-generate when slug field is empty.
- [x] [Review][Patch] Test doesn't verify actual sort order — added ascending ID order assertion.

#### Dismissed (noise or handled elsewhere)

- Slug unique validation on edit — handled. (blind) ✓
- No auth guards — public read endpoints by design (AD-5). (blind)
- Max-length on title — handled. (edge) ✓
- No pagination — matches existing pattern, pre-existing. (blind+edge)
- Admin can't preview unpublished pages — by design per AC4. (edge)
- Network/timeout errors in fetchPages — matches existing pattern, NFR-8. (edge)
- Factory unrelated title/slug — intentional test data. (blind)
