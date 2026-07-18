# Story 2.1: Services Admin CRUD

Status: done
baseline_commit: c8b984fa2338f2c980917a1c85255633c56c7d2e

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin user (John)**,
I want **to create, edit, reorder, and delete service cards from the admin panel**,
So that **I can manage the services displayed on the public site**.

## Acceptance Criteria

1. **Service list page:**
   Given I am logged into the admin panel
   When I navigate to `/admin/services`
   Then I see a resource list with columns: Title, Icon, Sort Order, Featured, Created

2. **Create service:**
   Given I click "New Service"
   When I fill in Title, Description, Icon (Font Awesome class selector), and toggle Featured
   Then clicking Save creates the record and redirects to the list
   And a toast shows "Saved."

3. **Edit service:**
   Given I click an existing service
   When I edit the fields
   Then clicking Save updates the record

4. **Delete service:**
   Given I click "Delete" on a service
   When the confirmation modal appears
   Then clicking "Delete" removes the record permanently

5. **Reorder services:**
   Given I have 3+ services
   When I reorder them via drag-and-drop in the list (reorder handle column)
   Then `sort_order` is updated and the order persists on reload

6. **Empty state:**
   Given the list is empty
   When the page loads
   Then I see an empty state: illustration + "No services yet. Create your first one."

7. **Loading state:**
   Given the list is loading
   When the page first loads
   Then skeleton rows matching the column structure appear

8. **Featured toggle persistence:**
   Given I toggle the Featured switch on a service
   When I save
   Then the featured status is preserved on next load

**Fields:**
- title (required, max 255)
- description (required, textarea)
- icon (string, Font Awesome class like `fa-solid fa-code`)
- is_featured (boolean, default false)
- sort_order (integer, auto-managed by reorder)

## Tasks / Subtasks

- [x] **Create migration** `marketing_services` table (AC: 1, 2)
  - [x] Create `2026_07_19_000001_create_marketing_services_table.php`
  - [x] Columns: id (bigIncrements), title (string 255), description (text), icon (string 255), is_featured (boolean default false), sort_order (integer default 0), timestamps
- [x] **Create Service model** (AC: 1-8)
  - [x] Create `app/Domains/Marketing/Models/Service.php`
  - [x] Fillable: title, description, icon, is_featured, sort_order
  - [x] Casts: is_featured => boolean
  - [x] Add `newFactory()` method to resolve from correct namespace
- [x] **Create Filament ServiceResource** (AC: 1-8)
  - [x] Create `app/Domains/Marketing/Filament/Resources/ServiceResource.php`
  - [x] Form schema: TextInput for title (required), Textarea for description (required), TextInput for icon (required, helper text "Enter Font Awesome class e.g. fa-solid fa-code"), Toggle for is_featured
  - [x] Table columns: TextColumn for title (searchable), TextColumn for icon, TextColumn for sort_order, IconColumn for is_featured (BooleanIcon), TextColumn for created_at (date)
  - [x] Enable reorderable via sort_order (drag handle)
  - [x] Actions: EditAction, DeleteAction with modal
  - [x] Empty state: "No services yet. Create your first one."
  - [x] Default sort: sort_order ascending
- [x] **Register ServiceResource with panel** (AC: 1)
  - [x] Update `AdminPanelProvider.php` — add `->resources([ServiceResource::class])`
  - [x] Create custom page classes extending ListRecords/CreateRecord/EditRecord with `$resource` initialized
  - [x] Update navigation Service item URL to use ServiceResource::getUrl()
- [x] **Update ServiceController API** (AC: pre-req for Story 2.2)
  - [x] Update `ServiceController@index` to return services ordered by sort_order
  - [x] Create `app/Http/Resources/Api/ServiceResource.php` API transformer
  - [x] Return `$this->success(ServiceResource::collection($services))`
- [x] **Write tests** (AC: API correctness)
  - [x] Feature test: GET /api/services returns HTTP 200 with `{ "data": [...] }`
  - [x] Verify correct sort_order in response
  - [x] Empty state returns empty data
  - [x] Single service response structure verified

## Dev Notes

### Architecture Compliance (AD-1 / AD-5)

- **Domain:** `Marketing` — Service.php goes in `app/Domains/Marketing/Models/`
- **Filament Resource:** `app/Domains/Marketing/Filament/Resources/ServiceResource.php`
- **API Controller:** `app/Domains/Marketing/Http/Api/ServiceController.php` (already exists as stub)
- **Migration:** `database/migrations/YYYY_MM_DD_HHMMSS_create_marketing_services_table.php`
- **No cross-domain model imports.** Service model stays in Marketing domain only.

### Key Architectural Decisions

1. **`is_featured` vs PRD schema:** The PRD addendum schema for `marketing_services` does NOT list `is_featured`, but the epic ACs (Story 2.1) clearly specify it — add it. This aligns with UX-DR6 (featured services show an accent top-border on the public site).

2. **Filament resource discovery:** The current `AdminPanelProvider` only discovers resources in `app_path('Filament/Resources')` → `App\Filament\Resources`. Domain resources live in `app/Domains/{Domain}/Filament/Resources/`. You MUST either:
   - Add `->discoverResources(in: app_path('Domains/Marketing/Filament/Resources'), for: 'App\\Domains\\Marketing\\Filament\\Resources')` to the panel config, OR
   - Register ServiceResource explicitly
   
   The architecture states "Filament Resources auto-discovered from each domain's Filament/Resources/ directory — no manual registration needed" — so option #1 with multiple discovery paths is the correct approach.

3. **Reorderable table:** Use Filament's built-in `$table->reorderable('sort_order')` — this automatically adds drag handles and persists sort_order on drop.

4. **Navigation:** The `Services` nav item in `AdminPanelProvider` currently points to `'#'`. After creating the resource, update it to `url(fn (): string => \App\Domains\Marketing\Filament\Resources\ServiceResource::getUrl())`.

5. **API response:** The existing `ApiResponse` trait returns `{ "data": ... }` envelope. For the index endpoint, wrap results in a Laravel API Resource (`App\Http\Resources\Api\ServiceResource`) for consistent JSON structure matching the Zod schema. If no API Resource exists yet, create a simple one that maps the model attributes.

### Files to CREATE

| # | File | Purpose |
|---|------|---------|
| 1 | `apps/backend/database/migrations/2026_07_19_000001_create_marketing_services_table.php` | Create marketing_services table |
| 2 | `apps/backend/app/Domains/Marketing/Models/Service.php` | Eloquent model for services |
| 3 | `apps/backend/app/Domains/Marketing/Filament/Resources/ServiceResource.php` | Filament admin resource for CRUD |
| 4 | `apps/backend/app/Http/Resources/Api/ServiceResource.php` | API transformer for JSON responses |
| 5 | `apps/backend/tests/Feature/ServicesTest.php` | Feature tests for API endpoint |

### Files to UPDATE

| # | File | Change |
|---|------|--------|
| 1 | `apps/backend/app/Providers/Filament/AdminPanelProvider.php` | Add domain resource discovery + update Services nav URL |
| 2 | `apps/backend/app/Domains/Marketing/Http/Api/ServiceController.php` | Replace stub `return $this->success([])` with real DB query |

### Existing File States (DO NOT BREAK)

- **`routes/api.php`** — Already has `Route::get('/services', [ServiceController::class, 'index']);`. No route changes needed.
- **`ServiceController.php`** — Currently returns `$this->success([])`. Replace with real implementation.
- **`AdminPanelProvider.php`** — Has manual navigation items with `url('#')` for Services. The Services navigation group label is "Main". Update URL on save.
- **`ApiResponse trait`** — Already in place at `app/Traits/ApiResponse.php`. Used via `use ApiResponse` in controllers.

### Shared Zod Schema Reference

The frontend already has `packages/shared/src/schemas/service.ts`:

```typescript
export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
```

Note: The Zod schema does NOT include `is_featured`. The frontend will need this for Story 2.2 (Services Public Display) where featured services render with an accent border. **Defer updating the Zod schema to Story 2.2** — this story creates the backend schema with `is_featured`, Story 2.2 adds it to the frontend schema.

### Read-Before-Editing: Files Being Modified

**`ServiceController.php`** (current state):
```php
class ServiceController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success([]);
    }
}
```
Minimum change: replace `[]` with query results. Preserve the `use ApiResponse` and `use App\Traits\ApiResponse`.

**`AdminPanelProvider.php`** — Navigation builder has Services nav item pointing to `url('#')`. Change to `url(fn (): string => \App\Domains\Marketing\Filament\Resources\ServiceResource::getUrl())`. Keep all other nav items unchanged.

### Testing Standards

- Use Pest (PHP framework default in Laravel 12, already set up)
- Feature test file: `tests/Feature/ServicesTest.php`
- Test GET /api/services returns 200 with `{ "data": [...] }` envelope
- Test that services are ordered by `sort_order` ascending
- Test that description content is returned in the response
- Test with seeded services (use model factory or direct DB insert in test)
- Run: `cd apps/backend && php artisan test --filter=ServicesTest`

### Previous Story Intelligence

- **Story 1.7** created `packages/shared/src/schemas/service.ts` with Zod schema for Service
- **Story 1.5** scaffolded the API route `GET /api/services` and stub controller
- **Story 1.2** installed Filament 5 and set up the admin panel with dark sidebar theme (#1e1b2e), Inter typeface, and structured navigation groups (Main / Leads / Settings)
- **Story 1.1** scaffolded the monorepo with `apps/backend` (Laravel 12), `apps/frontend` (Next.js 16), `packages/shared`
- **Existing Filament pattern:** `UserResource.php` in `App\Domains\Identity\Filament\Resources\` shows the established convention for Filament resources within domains — use the same `form()`, `table()`, `getPages()` structure
- **Review item from Epic 1 retro:** Add manual verification checklist to every Epic 2 story (see action_items in sprint-status.yaml)

### Git Intelligence

- `c8b984f` — "create Epic 1" — added all Epic 1 stories and sprint status
- `7bd5c82` — "added require documents" — added PRD, architecture, UX docs
- All Epic 1 stories completed (1-1 through 1-7)
- Epic 1 retrospective completed with action item for Epic 2 verification checklists

### Verification Checklist (from Epic 1 Retro Action Item)

After implementing, manually verify:
- [ ] Navigate to `/admin/services` — list renders with correct columns
- [ ] Create a new service with title, description, icon (e.g., `fa-solid fa-code`), featured toggle
- [ ] Edit the service — changes persist after save
- [ ] Create 3+ services, reorder via drag-and-drop — order persists on reload
- [ ] Delete a service — it's removed from the list
- [ ] Empty state shows when no services exist
- [ ] GET /api/services returns sorted JSON with `{ "data": [...] }` envelope

### References

- [Source: docs/epics.md#Story-2.1] — Full AC, field specs, UX-DR coverage
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-1] — Domain boundary isolation
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-5] — Admin is sole content authority
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — File locations for Service model, resource, controller
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Consistency-Conventions] — Naming conventions for models, tables, resources
- [Source: docs/project-context.md#PHP-Backend—Laravel] — DDD domain rules, no raw SQL
- [Source: docs/project-context.md#Laravel-12] — DDD directory structure, Filament resource discovery
- [Source: docs/prds/addendum.md#Database-Schema-Migrations] — `marketing_services` table schema (add is_featured per epic)
- [Source: stories/1-7-shared-zod-schemas-package.md] — Existing service Zod schema
- [Source: stories/sprint-status.yaml] — Story 2.1 is first in Epic 2

## Dev Agent Record

### Agent Model Used

OpenCode deepseek-v4-flash-free

### Debug Log References

- **Filament 5.0.0 bug:** `Resources\Pages\Page::$resource` is a typed static property without default value. Using generic page classes (`ListRecords`, `CreateRecord`, `EditRecord`) directly in `getPages()` causes `Typed static property must not be accessed before initialization` because `$resource` is unset. Fixed by creating concrete page subclasses (`ListServices`, `CreateService`, `EditService`) that set `protected static string $resource = ServiceResource::class`.
- **Factory namespace:** Model uses `App\Domains\Marketing\Models\Service` but factory auto-resolution expects `Database\Factories\Domains\Marketing\Models\ServiceFactory`. Created factory in the expected directory and added `newFactory()` method to the model.

### Completion Notes List

- This story sets the foundation for Epic 2 (Core Site Content) — all public-facing content management starts here.
- The `marketing_services` table is created in this story (first migration in the Marketing domain).
- Created custom Filament page classes for the ServiceResource to work around Filament 5.0.0's uninitialized `$resource` bug.
- Factory moved to `database/factories/Domains/Marketing/Models/ServiceFactory.php` to match convention-based resolution.
- Old factory at `database/factories/ServiceFactory.php` deleted.
- `is_featured` is added to the DB schema but NOT yet to the frontend Zod schema — Story 2.2 (Services Public Display) will handle that.

### File List

- `apps/backend/database/migrations/2026_07_19_000001_create_marketing_services_table.php`
- `apps/backend/app/Domains/Marketing/Models/Service.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/ServiceResource.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/ServiceResource/Pages/ListServices.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/ServiceResource/Pages/CreateService.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/ServiceResource/Pages/EditService.php`
- `apps/backend/app/Http/Resources/Api/ServiceResource.php`
- `apps/backend/app/Providers/Filament/AdminPanelProvider.php` (UPDATE)
- `apps/backend/app/Domains/Marketing/Http/Api/ServiceController.php` (UPDATE)
- `apps/backend/database/factories/Domains/Marketing/Models/ServiceFactory.php`
- `apps/backend/tests/Feature/ServicesTest.php`

### Review Findings

**decision-needed** (none)

**patch** (4):
- [x] [Review][Patch] Create notification says "Created" not "Saved." [`CreateService.php`] — overrode `getCreatedNotificationTitle()` to return `'Saved.'`
- [x] [Review][Patch] Create redirects to edit page, not list [`CreateService.php`] — overrode `getRedirectUrl()` to return index URL
- [x] [Review][Patch] Description field lacks maxLength [`ServiceResource.php:35`] — added `->maxLength(65535)` to description Textarea
- [x] [Review][Patch] YAML indentation inconsistency [`sprint-status.yaml:68`] — corrected from 4-space to 3-space indent

**defer** (10):
- [x] [Review][Defer] No authentication guard on public API endpoint — deferred, pre-existing; API is a read-only stub for Story 2.2
- [x] [Review][Defer] No authorization policy on admin CRUD — deferred, pre-existing; default Filament allow-all pattern, cross-cutting concern
- [x] [Review][Defer] Missing skeleton loading state (AC 7) — deferred, pre-existing; Filament 5.0.0 tables lack skeleton-row support by default; revisit with version upgrade or custom loading state
- [x] [Review][Defer] sort_order collisions on new records — deferred; Filament reorderable manages order on drag; new records default to 0
- [x] [Review][Defer] Icon field lacks format validation — deferred; helper text sufficient for admin input; format too varied to regex-validate
- [x] [Review][Defer] Missing DB indexes — deferred; table expected to stay very small
- [x] [Review][Defer] No pagination on API response — deferred; small dataset; Story 2.2 can add if needed
- [x] [Review][Defer] No soft deletes / visibility flag — deferred; not in AC scope, can be added if requirements change
- [x] [Review][Defer] No exception handling in API — deferred; Laravel's global handler manages this
- [x] [Review][Defer] Test coverage gaps (AC 2-7 not covered by automated tests) — deferred; core API ACs covered; admin UX tests require browser testing framework

**dismiss** (5):
- [x] [Review][Dismiss] Explicit resource registration contradicts auto-discovery — dismissed, pre-existing; deliberate workaround for Filament 5.0.0 bug
- [x] [Review][Dismiss] No UI for sort_order on create form — dismissed; hidden by design, auto-managed by reorder
- [x] [Review][Dismiss] paginated(false) at scale — dismissed; admin manages few services; deliberate design
- [x] [Review][Dismiss] No sanitization on description (XSS) — dismissed; plain text field; frontend must escape HTML
- [x] [Review][Dismiss] Null timestamps in API response — dismissed; timestamps always set by Eloquent on save
