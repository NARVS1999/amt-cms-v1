# Story 3.1: Pricing Plans Admin CRUD

Status: review
baseline_commit: b00f63387e9ccd6ccc1c49fd0ca2449c4956ef70

## Story

As an **admin user (John)**,
I want **to create, edit, reorder, and delete pricing plans with their feature lists**,
So that **the pricing section reflects our current offers**.

## Acceptance Criteria

1. **Pricing plans list page:**
   Given I am logged into the admin panel
   When I navigate to `/admin/pricing-plans`
   Then I see a resource list with columns: Name, Price, Interval, Most Popular, Sort Order, Status, Created

2. **Create pricing plan:**
   Given I click "New Plan"
   When I fill in Name, Price (decimal), Interval (dropdown: Monthly/Yearly/One-time), Description, CTA Text, Is Most Popular (toggle), Is Published (toggle), and manage Plan Features (repeater)
   Then clicking Save creates the plan with all nested features
   And a toast shows "Saved."

3. **Feature repeater:**
   Given I am creating or editing a pricing plan
   When I manage plan features
   Then I can add rows with Description (text) and Is Included (toggle)
   And I can remove rows
   And features are saved as related records linked to the plan

4. **Edit pricing plan:**
   Given I click an existing pricing plan
   When I edit the Price field
   Then the decimal value is preserved exactly as entered
   And clicking Save updates the plan and its features

5. **Most Popular toggle (single-select):**
   Given I toggle "Most Popular" on a plan
   When I save
   Then if no other plan was marked Most Popular, this plan gets the badge
   And if another plan had the badge, it is removed from that plan (only one Most Popular at a time)

6. **Reorder plans:**
   Given I reorder plans via drag-and-drop
   When I save
   Then `sort_order` persists on reload

7. **Delete pricing plan:**
   Given I click Delete on a plan
   When the modal confirms
   Then the plan and all associated features are removed permanently

8. **Publish/Draft toggle:**
   Given I toggle a plan between Published and Draft
   When I save
   Then only published plans appear in the public API response

9. **Empty state:**
   Given the list is empty
   When the page loads
   Then I see: "No pricing plans yet. Create your first one."

10. **API endpoints (public):**
    Given `GET /api/pricing-plans` is called
    Then it returns published plans ordered by `sort_order` ascending
    And each plan includes nested `features` array
    And the response uses `{ "data": [...] }` envelope

## Tasks / Subtasks

- [ ] **Create migrations** `billing_pricing_plans` + `billing_plan_features` tables
  - [ ] Create `2026_07_21_000001_create_billing_pricing_plans_table.php`
  - [ ] Columns: id (bigIncrements), name (string 255), price (decimal 10,2), interval (string 50, default 'monthly'), description (text nullable), cta_text (string 255 nullable), is_popular (boolean default false), is_published (boolean default false), sort_order (integer default 0), timestamps
  - [ ] Create `2026_07_21_000002_create_billing_plan_features_table.php`
  - [ ] Columns: id (bigIncrements), pricing_plan_id (foreignId constrained cascade), description (string 255), is_included (boolean default true), sort_order (integer default 0), timestamps

- [ ] **Create PricingPlan model** `app/Models/PricingPlan.php`
  - [ ] Extends Model, use HasFactory
  - [ ] Table: `billing_pricing_plans`
  - [ ] $fillable: name, price, interval, description, cta_text, is_popular, is_published, sort_order
  - [ ] $casts: price => 'decimal:2', is_popular => 'boolean', is_published => 'boolean', sort_order => 'integer'
  - [ ] HasMany relationship: `features()` → PlanFeature
  - [ ] `newFactory()` method

- [ ] **Create PlanFeature model** `app/Models/PlanFeature.php`
  - [ ] Extends Model, use HasFactory
  - [ ] Table: `billing_plan_features`
  - [ ] $fillable: pricing_plan_id, description, is_included, sort_order
  - [ ] $casts: is_included => 'boolean', sort_order => 'integer'
  - [ ] BelongsTo relationship: `plan()` → PricingPlan
  - [ ] `newFactory()` method

- [ ] **Create factories** for both models
  - [ ] `database/factories/Models/PricingPlanFactory.php`
  - [ ] `database/factories/Models/PlanFeatureFactory.php`

- [ ] **Create PricingPlanResource** `app/Http/Resources/Api/PricingPlanResource.php`
  - [ ] Return: id, name, price (float), interval, description, cta_text, is_popular, is_published, sort_order, features (nested array), created_at, updated_at
  - [ ] Load features relationship and map to array

- [ ] **Update PricingPlanController** `app/Http/Controllers/Api/PricingPlanController.php`
  - [ ] index(): return published plans ordered by sort_order, with features loaded
  - [ ] store(): validate + create plan + features
  - [ ] update(): validate + update plan + sync features
  - [ ] destroy(): delete plan (cascades to features)

- [ ] **Update routes** `routes/api.php`
  - [ ] Add POST `/pricing-plans` inside auth:sanctum group
  - [ ] Add PUT `/pricing-plans/{pricingPlan}` inside auth:sanctum group
  - [ ] Add DELETE `/pricing-plans/{pricingPlan}` inside auth:sanctum group

- [ ] **Create admin pricing plans page** `apps/frontend/app/admin/pricing-plans/page.tsx`
  - [ ] Table columns: Name, Price, Interval, Most Popular (badge), Sort Order, Status (Published/Draft), Actions
  - [ ] Modal form: Name, Price (number input with step=0.01), Interval (select), Description (textarea), CTA Text, Is Popular (toggle), Is Published (toggle)
  - [ ] Feature repeater inside the form: add/remove rows with description + is_included
  - [ ] Reorderable via sort_order (drag handle)
  - [ ] Empty state: "No pricing plans yet. Create your first one."
  - [ ] Default sort: sort_order ascending

- [ ] **Update sidebar navigation** `components/admin/sidebar.tsx`
  - [ ] Change Pricing href from `'#'` to `/admin/pricing-plans`

- [ ] **Update frontend API client** `apps/frontend/lib/admin-api.ts`
  - [ ] Add `PricingPlanData` interface matching API response
  - [ ] Add `PricingPlanFeatureData` interface for nested features
  - [ ] Add `fetchPricingPlans()`, `createPricingPlan()`, `updatePricingPlan()`, `deletePricingPlan()`

- [ ] **Update shared Zod schema** `packages/shared/src/schemas/pricing-plan.ts`
  - [ ] Verify schema matches API Resource output (add `cta_text`, `interval`, `description` fields if missing)
  - [ ] Verify `is_popular` naming matches API output
  - [ ] Run `tsc --noEmit` to validate

- [ ] **Write backend tests** `tests/Feature/PricingPlansTest.php`
  - [ ] `test_returns_published_plans_sorted_by_sort_order()` — create 3 plans, 1 unpublished, verify sort + filtering
  - [ ] `test_returns_empty_data_when_no_plans()` — empty state
  - [ ] `test_single_plan_response_structure()` — all fields + nested features
  - [ ] `test_plan_includes_nested_features()` — features array present with correct structure
  - [ ] `test_unpublished_plans_not_returned()` — is_published=false filtering
  - [ ] `test_most_popular_single_plan()` — only one plan marked as popular

## Dev Notes

### Architecture Compliance (AD-1 / AD-3 / AD-5)

- **AD-1 — Flat Laravel structure:** Models in `app/Models/`, resource in `app/Http/Resources/Api/`, controller in `app/Http/Controllers/Api/`. Standard Laravel MVC.
- **AD-3 — REST API is the contract:** Consistent `{ "data": [...] }` envelope. PricingPlanResource returns all fields including nested `features`. Zod schema in `packages/shared` mirrors the response.
- **AD-5 — Admin is sole content authority:** All CRUD through admin panel. Public GET endpoint is read-only. Admin CRUD routes require Sanctum auth.
- **No Spatie Media Library:** Pricing plans have no file uploads. No HasMedia interface.

### Key Architectural Decisions

1. **Two-table design:** PricingPlan + PlanFeature (one-to-many). Features stored in a separate table rather than JSON column, matching the PRD addendum schema. This enables proper foreign key integrity, indexing, and future query flexibility.

2. **`is_popular` naming:** The Zod schema already uses `is_popular` (not `is_most_popular` as the epic ACs suggest). Stick with `is_popular` to avoid breaking the shared type contract. The frontend admin form can label it "Most Popular" for UX clarity.

3. **`is_popular` single-select enforced at application level:** Only one plan can have `is_popular = true`. The controller ensures this by resetting other plans when saving. No DB-level unique constraint on a partial index (too complex for v1).

4. **Feature deletion on plan update:** When updating a plan, the simplest approach is to delete all existing features and re-insert them from the request payload. This avoids complex diff logic. The `cascade` foreign key ensures cleanup on plan delete.

5. **`cta_text` field:** Included per PRD addendum schema and Zod schema. Nullable — falls back to "Get Started" in the frontend display.

6. **`interval` field:** String enum: monthly/yearly/one-time. Stored as string(50) with frontend validation. The Zod schema already defines `z.enum(['monthly', 'yearly', 'one-time'])`.

### Critical: Existing File States (DO NOT BREAK)

**`PricingPlanController.php`** (current stub):
```php
class PricingPlanController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success([]);
    }
}
```
Replace stub with real implementation. Add store/update/destroy. Keep `use ApiResponse`.

**`routes/api.php`** — Already has:
```php
Route::get('/pricing-plans', [PricingPlanController::class, 'index']);
```
Do NOT change this route. Add admin CRUD routes inside `auth:sanctum` group:
```php
Route::post('/pricing-plans', [PricingPlanController::class, 'store']);
Route::put('/pricing-plans/{pricingPlan}', [PricingPlanController::class, 'update']);
Route::delete('/pricing-plans/{pricingPlan}', [PricingPlanController::class, 'destroy']);
```

**`packages/shared/src/schemas/pricing-plan.ts`** — Already exists with full schema. Verify it matches API Resource output. No breaking changes expected.

**`apps/frontend/lib/admin-api.ts`** — Currently has Service, TeamMember, Page, Media resources. Add PricingPlan following the exact same pattern.

**`apps/frontend/components/admin/sidebar.tsx`** — Currently has:
```tsx
{ href: '#', label: 'Pricing', icon: DollarSign },
```
Change to `/admin/pricing-plans`.

### Existing Zod Schema Reference

```typescript
// packages/shared/src/schemas/pricing-plan.ts
export const PlanFeatureSchema = z.object({
  id: z.number(),
  description: z.string(),
  is_included: z.boolean(),
});

export const PricingPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  interval: z.enum(['monthly', 'yearly', 'one-time']),
  description: z.string().nullable(),
  is_popular: z.boolean().default(false),
  is_published: z.boolean().default(false),
  cta_text: z.string().nullable(),
  sort_order: z.number().default(0),
  features: z.array(PlanFeatureSchema),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
```

The Zod schema does NOT include `PlanFeatureSchema` with `sort_order`. The API Resource MUST include `sort_order` on features for reordering support. If the Zod schema is missing `sort_order` on PlanFeature, update it to include `sort_order: z.number().default(0)`.

### API Resource Transformer

Following the pattern from `PageResource.php` / `ServiceResource.php`:

```php
class PricingPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'interval' => $this->interval,
            'description' => $this->description,
            'cta_text' => $this->cta_text,
            'is_popular' => $this->is_popular,
            'is_published' => $this->is_published,
            'sort_order' => $this->sort_order,
            'features' => $this->whenLoaded('features', fn() =>
                $this->features->map(fn($f) => [
                    'id' => $f->id,
                    'description' => $f->description,
                    'is_included' => $f->is_included,
                    'sort_order' => $f->sort_order,
                ])
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
```

### Controller Implementation Pattern

The `index()` method must eager-load features to avoid N+1:
```php
public function index()
{
    $plans = PricingPlan::query()
        ->with('features')
        ->where('is_published', true)
        ->orderBy('sort_order')
        ->get();

    return $this->success(PricingPlanResource::collection($plans));
}
```

The `store()` method must handle the Most Popular single-select:
```php
public function store(Request $request)
{
    $data = $request->validate([...]);

    if (!empty($data['is_popular'])) {
        PricingPlan::where('is_popular', true)->update(['is_popular' => false]);
    }

    $plan = PricingPlan::create($data);

    // Create features
    if ($request->has('features')) {
        foreach ($request->input('features', []) as $feature) {
            $plan->features()->create($feature);
        }
    }

    return $this->success(new PricingPlanResource($plan->load('features')), 201);
}
```

### Migration Details

**`2026_07_21_000001_create_billing_pricing_plans_table.php`:**
```php
Schema::create('billing_pricing_plans', function (Blueprint $table) {
    $table->id();
    $table->string('name', 255);
    $table->decimal('price', 10, 2);
    $table->string('interval', 50)->default('monthly');
    $table->text('description')->nullable();
    $table->string('cta_text', 255)->nullable();
    $table->boolean('is_popular')->default(false);
    $table->boolean('is_published')->default(false);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

**`2026_07_21_000002_create_billing_plan_features_table.php`:**
```php
Schema::create('billing_plan_features', function (Blueprint $table) {
    $table->id();
    $table->foreignId('pricing_plan_id')
        ->constrained('billing_pricing_plans')
        ->cascadeOnDelete();
    $table->string('description', 255);
    $table->boolean('is_included')->default(true);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

### Testing Standards

- Use Pest (PHP framework default in Laravel 12)
- Feature test file: `tests/Feature/PricingPlansTest.php`
- Follow the exact pattern from `ServicesTest.php` / `PagesTest.php`
- Use `RefreshDatabase` trait
- Test public GET endpoint only (admin CRUD tested via frontend)
- Run: `cd apps/backend && php artisan test --filter=PricingPlansTest`

### Previous Story Intelligence

**Story 2.5 (Pages Admin CRUD) — closest pattern:**
- Created migration, model, factory, resource, controller, admin page, tests
- Model without Spatie or sort_order auto-assign (same for PricingPlan)
- JSON handling in controller for `sections` field (same pattern needed for features array)
- `adminIndex()` for listing all records (not just published)

**Story 2.1 (Services Admin CRUD) — reorderable pattern:**
- `sort_order` field with drag-and-drop reorder
- Controller uses `->orderBy('sort_order')` in index query
- Factory generates fake data with `fake()->numberBetween(0, 100)` for sort_order

**Story 2.3 (Team Members Admin CRUD) — nested data pattern:**
- JSON `social_links` handling with `json` validation rule + try/catch decode
- Same pattern applicable for features array in request payload

### Git Intelligence

- Last commit `b00f633` is "create 2.1"
- Stories 2.1-2.6 are all done
- Epic 2 is done (all 6 stories)
- Epic 3 is currently backlog — this is the first story
- PricingPlanController already exists as a stub (created in Epic 1 scaffold)

### Verification Checklist

After implementing, manually verify:
- [ ] Navigate to `/admin/pricing-plans` — list renders with correct columns: Name, Price, Interval, Most Popular, Sort, Status
- [ ] Click "New Plan" — form shows Name, Price, Interval, Description, CTA Text, Is Popular toggle, Is Published toggle, Features repeater
- [ ] Add 3 features with descriptions and toggles, save — plan appears in list
- [ ] Edit the plan — change price from 99.00 to 149.50 — decimal preserved
- [ ] Toggle "Most Popular" on a plan, save — badge shows. Toggle it on another plan — first plan's badge removed
- [ ] Toggle Published → Draft — plan excluded from GET /api/pricing-plans
- [ ] Delete a plan — plan + features removed
- [ ] Reorder plans via drag-and-drop — order persists on reload
- [ ] Empty state shows when no plans exist
- [ ] GET /api/pricing-plans returns sorted JSON with `{ "data": [...] }` envelope + nested features
- [ ] Sidebar Pricing link navigates to `/admin/pricing-plans`
- [ ] `tsc --noEmit` passes in `apps/frontend`
- [ ] `php artisan test` passes (no regressions)

### References

- [Source: docs/epics.md#Story-3.1] — Full AC, field specs, UX-DR coverage
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-1] — Flat Laravel structure
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3] — REST API is the contract
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-5] — Admin is sole content authority
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — PricingPlan model + resource expected locations
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Consistency-Conventions] — Naming conventions
- [Source: docs/project-context.md] — No raw SQL, Eloquent ORM only
- [Source: docs/prds/addendum.md#Database-Schema-Migrations] — billing_pricing_plans + billing_plan_features schema
- [Source: docs/ux-designs/DESIGN.md#Components] — Pricing Card visual spec
- [Source: docs/ux-designs/EXPERIENCE.md#Admin-Panel] — Drag-to-reorder behavior, table patterns
- [Source: packages/shared/src/schemas/pricing-plan.ts] — Existing Zod schema (frontend contract)
- [Source: stories/2-1-services-admin-crud.md] — Reorderable CRUD pattern
- [Source: stories/2-5-pages-admin-crud.md] — Admin CRUD with JSON validation pattern
- [Source: stories/sprint-status.yaml] — Story 3.1 is first in Epic 3

## Dev Agent Record

### Implementation Plan

1. **Migrations** — Create two tables: `billing_pricing_plans` and `billing_plan_features` with foreign key cascade.
2. **Models** — PricingPlan (HasMany features) and PlanFeature (BelongsTo plan). Both with HasFactory.
3. **Factories** — PricingPlanFactory generating fake plans with 2-4 features. PlanFeatureFactory for standalone feature creation.
4. **API Resource** — PricingPlanResource with nested features array, eager loading.
5. **Controller** — Replace stub with full CRUD: index (published only, sorted), store (with feature creation + is_popular single-select), update (with feature sync + is_popular handling), destroy (cascade deletes features).
6. **Routes** — Add admin CRUD routes inside auth:sanctum group.
7. **Admin page** — Create `/admin/pricing-plans` with table, modal form, feature repeater.
8. **Sidebar** — Wire Pricing link from `#` to `/admin/pricing-plans`.
9. **Frontend API** — Add PricingPlanData interface + CRUD functions.
10. **Zod schema** — Verify and update `PlanFeatureSchema` to include `sort_order`.
11. **Tests** — 6 test methods covering sort, empty, structure, features nesting, unpublished filtering, most popular single-select.

### File List

**Created:**
- `apps/backend/database/migrations/2026_07_21_000001_create_billing_pricing_plans_table.php`
- `apps/backend/database/migrations/2026_07_21_000002_create_billing_plan_features_table.php`
- `apps/backend/app/Models/PricingPlan.php`
- `apps/backend/app/Models/PlanFeature.php`
- `apps/backend/database/factories/Models/PricingPlanFactory.php`
- `apps/backend/database/factories/Models/PlanFeatureFactory.php`
- `apps/backend/app/Http/Resources/Api/PricingPlanResource.php`
- `apps/backend/tests/Feature/PricingPlansTest.php`
- `apps/frontend/app/admin/pricing-plans/page.tsx`

**Modified:**
- `apps/backend/app/Http/Controllers/Api/PricingPlanController.php` — Replace stub with real CRUD
- `apps/backend/routes/api.php` — Add admin CRUD routes
- `apps/frontend/lib/admin-api.ts` — Add PricingPlanData + CRUD functions
- `apps/frontend/components/admin/sidebar.tsx` — Wire Pricing link
- `packages/shared/src/schemas/pricing-plan.ts` — Add `sort_order` to PlanFeatureSchema
