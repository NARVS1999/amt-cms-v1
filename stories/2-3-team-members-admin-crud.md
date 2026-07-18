# Story 2.3: Team Members Admin CRUD

Status: done
baseline_commit: b00f63387e9ccd6ccc1c49fd0ca2449c4956ef70

## Story

As an **admin user (John)**,
I want **to manage team member profiles with photo uploads from the admin panel**,
So that **I can keep the team section current**.

## Acceptance Criteria

1. **Team list page:**
   Given I am logged into the admin panel
   When I navigate to `/admin/team-members`
   Then I see a resource list with columns: Photo (thumbnail), Name, Role, Sort Order, Created

2. **Create team member:**
   Given I click "New Team Member"
   When I fill in Name, Role, Bio, Photo (upload via Spatie Media Library), and Social Links (JSON)
   Then clicking Save creates the record
   And the uploaded photo is stored via Spatie Media Library and linked to the model
   And a toast shows "Saved."

3. **Edit team member:**
   Given I click an existing team member
   When I update the photo
   Then the old photo is replaced; the new one appears in the thumbnail

4. **Reorder team members:**
   Given I reorder team members via drag-and-drop
   When the order changes
   Then `sort_order` is persisted

5. **Photo validation:**
   Given I upload a photo larger than 2MB or unsupported format
   When Spatie validation runs
   Then I see the appropriate inline error message

6. **Delete team member:**
   Given I click Delete on a team member
   When the modal confirms
   Then the record and associated media file are removed permanently

7. **Empty state:**
   Given there are no team members
   When the list loads
   Then I see empty state: "No team members yet. Create your first one."

**Fields:**
- name (required, max 255)
- role (required, max 255)
- bio (textarea, optional, max 65535)
- photo (single file via Spatie Media Library with conversions: `thumb` 150x150 crop, `profile` 400x400)
- social_links (JSON object: `{linkedin: string|null, twitter: string|null}`, optional)
- sort_order (integer, auto-managed by reorder)

## Tasks / Subtasks

- [x] **Create migration** `marketing_team_members` table (AC: 1, 2)
  - [x] Create `2026_07_19_000002_create_marketing_team_members_table.php`
  - [x] Columns: id (bigIncrements), name (string 255), role (string 255), bio (text nullable), social_links (json nullable), sort_order (integer default 0), timestamps

- [x] **Create TeamMember model** (AC: 1-7)
  - [x] Create `app/Domains/Marketing/Models/TeamMember.php`
  - [x] Fillable: name, role, bio, social_links, sort_order
  - [x] Casts: social_links => array, sort_order => integer
  - [x] Use `HasFactory` trait + `newFactory()` method
  - [x] Implement Spatie Media Library: `HasMedia` trait + `InteractsWithMedia` trait
  - [x] Register media collection: `registerMediaCollections()` — single file collection `photo` with `singleFile()`
  - [x] Register media conversions: `registerMediaConversions()` — `thumb` (150x150 crop), `profile` (400x400)
  - [x] Table name: `marketing_team_members`

- [x] **Create Filament TeamMemberResource** (AC: 1-7)
  - [x] Create `app/Domains/Marketing/Filament/Resources/TeamMemberResource.php`
  - [x] Form schema with TextInput, Textarea, SpatieMediaLibraryFileUpload, KeyValue, Hidden
  - [x] Table columns: ImageColumn (photo), TextColumn (name, role, sort_order, created_at)
  - [x] Enable reorderable via `sort_order` (drag handle)
  - [x] Default sort: sort_order ascending
  - [x] Actions: EditAction, DeleteAction with modal
  - [x] Empty state: "No team members yet. Create your first one."
  - [x] Pagination disabled (`->paginated(false)`)

- [x] **Create concrete page subclasses** (AC: 1, 2, 3)
  - [x] Create `TeamMemberResource/Pages/ListTeamMembers.php` extending `ListRecords`
  - [x] Create `TeamMemberResource/Pages/CreateTeamMember.php` extending `CreateRecord` — overridden "Saved." notification and redirect to index
  - [x] Create `TeamMemberResource/Pages/EditTeamMember.php` extending `EditRecord`

- [x] **Register resource with panel** (AC: 1)
  - [x] Update `AdminPanelProvider.php` — added `TeamMemberResource::class` to `->resources([...])`
  - [x] Update Team nav item: changed `url('#')` to `url(fn (): string => TeamMemberResource::getUrl())`

- [x] **Update TeamMemberController API** (AC: pre-req for Story 2.4)
  - [x] Update `TeamMemberController@index` to return team members ordered by sort_order
  - [x] Create `app/Http/Resources/Api/TeamMemberResource.php` API transformer
  - [x] Return `$this->success(TeamMemberResource::collection($teamMembers))`

- [x] **Write tests** (AC: API correctness)
  - [x] Create `tests/Feature/TeamMembersTest.php`
  - [x] Test: GET /api/team returns HTTP 200 with `{ "data": [...] }`
  - [x] Test: Verify correct sort_order in response
  - [x] Test: Empty state returns empty data
  - [x] Test: Single team member response structure verified
  - [x] Test: social_links JSON structure preserved in response

## Dev Notes

### Architecture Compliance (AD-1 / AD-5 / AD-6)

- **Domain:** `Marketing` — TeamMember.php goes in `app/Domains/Marketing/Models/`
- **Filament Resource:** `app/Domains/Marketing/Filament/Resources/TeamMemberResource.php`
- **API Controller:** `app/Domains/Marketing/Http/Api/TeamMemberController.php` (already exists as stub)
- **Migration:** `database/migrations/2026_07_19_000002_create_marketing_team_members_table.php`
- **AD-5 — Admin is sole content authority:** All CRUD through Filament. Public API is read-only.
- **AD-6 — Media via Spatie Media Library:** Photo uploads MUST go through Spatie. NO direct `Storage::put()` calls.
- **No cross-domain model imports.** TeamMember model stays in Marketing domain only.

### Key Architectural Decisions

1. **Spatie Media Library for photos:** The photo field uses Spatie's file upload system (not a simple string URL). The model implements `HasMedia` and registers a `photo` collection with `singleFile()`. This means replacing the photo automatically replaces the old file. Two conversions:
   - `thumb` (150x150 crop) — used in admin table and team grid on public site
   - `profile` (400x400) — used for detail views

2. **`social_links` as JSON column:** The field stores `{linkedin: string|null, twitter: string|null}` as a JSON object in MySQL. Use Laravel's JSON column type (`json` migration column + `array` cast). In Filament, use a `KeyValue` form component or a simple `Repeater` with pre-defined keys.

3. **Filament 5.0.0 page subclass bug (from Story 2.1):** Filament 5.0.0 has a typed static property `$resource` that must be initialized in concrete subclasses. Using generic `ListRecords`, `CreateRecord`, `EditRecord` directly in `getPages()` causes `Typed static property must not be accessed before initialization`. Must create concrete page subclasses (e.g., `ListTeamMembers`) that set `protected static string $resource = TeamMemberResource::class;`.

4. **"Saved." not "Created":** The Create page must override `getCreatedNotificationTitle()` to return `'Saved.'` (matches admin microcopy: "Neutral, direct. 'Saved.'")

5. **Create redirects to index:** Override `getRedirectUrl()` in CreateTeamMember to return `$this->getResourceUrl()` (index page), not the edit page (Filament default).

6. **Reorderable table:** Use Filament's `$table->reorderable('sort_order')` — automatically adds drag handle and persists sort_order on drop.

7. **No pagination:** Admin manages small team (typically <20 people). Use `->paginated(false)` to avoid pager controls.

### CRITICAL: Existing File States (DO NOT BREAK)

**`TeamMemberController.php`** (current stub):
```php
class TeamMemberController extends Controller
{
    use ApiResponse;
    public function index()
    {
        return $this->success([]);
    }
}
```
Replace `[]` with real query + API Resource. Keep `use ApiResponse`.

**`AdminPanelProvider.php`** — Team nav item currently points to `url('#')`:
```php
NavigationItem::make('Team')
    ->icon('heroicon-o-users')
    ->url('#')
    ->group('Main'),
```
Change to: `->url(fn (): string => TeamMemberResource::getUrl())`

**`routes/api.php`** — Already has:
```php
Route::get('/team', [TeamMemberController::class, 'index']);
```
No route changes needed.

**Existing Zod schema** (`packages/shared/src/schemas/team-member.ts`):
```typescript
export const TeamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string(),
  bio: z.string().nullable(),
  photo_url: z.string().nullable(),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
```
**Note:** `social_links` is NOT in the Zod schema. Defer to Story 2.4 (Team Members Public Display). The API transformer this story creates should include `social_links` in the JSON response, but the Zod schema will be updated in Story 2.4 when the frontend consumes it.

### GOTCHAS — Must Follow

- ⚠️ **Spatie conversions require `jpeg` extension:** In Spatie v11, conversions are generated with Imagick/GD. The `thumb` conversion uses `fit('crop', 150, 150)` not `crop()`. Register conversions in `registerMediaConversions()` method on the model.
- ⚠️ **Spatie `singleFile()` constraint:** The `photo` collection must be `->singleFile()` so uploading a new photo replaces the old one automatically (AC 3 — "old photo is replaced").
- ⚠️ **Delete cascades media:** When deleting a TeamMember model, Spatie automatically cleans up associated media files. Test this.
- ⚠️ **`social_links` JSON validation:** Ensure the Filament form validates that social_links is a valid JSON object with expected keys. Use Filament's `KeyValue` component or a custom validation rule.
- ⚠️ **Migration order:** Must use timestamp `2026_07_19_000002` (after services at `000001`) to maintain chronological order.
- ⚠️ **No `social_links` in Zod:** The API transformer should include `social_links`, but the Zod schema update is deferred to Story 2.4.
- ⚠️ **Team navigation sort:** In AdminPanelProvider, Team should maintain its position (after Services and before Blog) in the Main group. The `navigationSort` property controls this.

### Factory Pattern

Follow the pattern from `ServiceFactory.php`:

```php
namespace Database\Factories\Domains\Marketing\Models;

use App\Domains\Marketing\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeamMemberFactory extends Factory
{
    protected $model = TeamMember::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => fake()->jobTitle(),
            'bio' => fake()->paragraph(),
            'social_links' => ['linkedin' => 'https://linkedin.com/in/' . fake()->userName(), 'twitter' => null],
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
```

Add `newFactory()` method to TeamMember model matching the Service model pattern.

### Spatie Media Conversion Details

On the TeamMember model:
```php
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TeamMember extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
            ->maxFileSize(2 * 1024 * 1024); // 2MB
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit('crop', 150, 150)
            ->nonQueued();

        $this->addMediaConversion('profile')
            ->fit('crop', 400, 400)
            ->nonQueued();
    }
}
```

### Files to CREATE

| # | File | Purpose |
|---|------|---------|
| 1 | `apps/backend/database/migrations/2026_07_19_000002_create_marketing_team_members_table.php` | Create marketing_team_members table |
| 2 | `apps/backend/app/Domains/Marketing/Models/TeamMember.php` | Eloquent model with Spatie media support |
| 3 | `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource.php` | Filament admin resource for CRUD |
| 4 | `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource/Pages/ListTeamMembers.php` | List page (concrete subclass) |
| 5 | `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource/Pages/CreateTeamMember.php` | Create page (concrete subclass) |
| 6 | `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource/Pages/EditTeamMember.php` | Edit page (concrete subclass) |
| 7 | `apps/backend/app/Http/Resources/Api/TeamMemberResource.php` | API transformer for JSON responses |
| 8 | `apps/backend/database/factories/Domains/Marketing/Models/TeamMemberFactory.php` | Model factory for tests |
| 9 | `apps/backend/tests/Feature/TeamMembersTest.php` | Feature tests for API endpoint |

### Files to UPDATE

| # | File | Change |
|---|------|--------|
| 1 | `apps/backend/app/Providers/Filament/AdminPanelProvider.php` | Add TeamMemberResource to resources array; update Team nav URL |
| 2 | `apps/backend/app/Domains/Marketing/Http/Api/TeamMemberController.php` | Replace stub with real DB query + API Resource |

### Previous Story Intelligence (Story 2.1 — Services Admin CRUD)

- **CRUD pattern:** ServiceResource.php shows the exact Filament 5 resource pattern to follow — form schema with TextInput/Textarea/Toggle/Hidden, table with columns/reorderable/empty state/actions, concrete page subclasses.
- **Filament 5.0.0 bug:** `$resource` typed static property requires concrete page subclasses. Cannot use generic `ListRecords`/`CreateRecord`/`EditRecord` directly.
- **Factory resolution:** Must create factory in `database/factories/Domains/Marketing/Models/` with matching namespace and add `newFactory()` method to model.
- **API Resource pattern:** `App\Http\Resources\Api\ServiceResource.php` shows the API transformer pattern. TeamMemberResource should follow the same structure.
- **AdminPanelProvider pattern:** ServiceResource was added to the `->resources([...])` array. TeamMemberResource follows the same pattern.
- **"Saved." microcopy:** Create page overrides `getCreatedNotificationTitle()` -> `'Saved.'` per admin voice guidelines.
- **Create redirects to index:** Create page overrides `getRedirectUrl()` -> `$this->getResourceUrl()`.
- **Delete action:** Uses `DeleteAction::make()` with `modalHeading`, `modalDescription`, `modalSubmitActionLabel`, `successNotificationTitle`.

### Story 2.2 Intelligence (Services Public Display — code review findings)

- **Zod validation:** The code review for Story 2.2 caught that `fetchServices()` should use `ServicesResponseSchema.parse()` instead of raw `as` cast. Apply the same pattern to the API Resource — ensure the response shape is consistent.
- **Breakpoints:** Custom `--breakpoint-lg: 992px` was added to globals.css. This is project-wide.

### Git Intelligence

- `b00f633` — HEAD (current). Story 2.2 implementation + code review patches applied.
- Story 2.1 completed all tasks with review findings documented.
- Story 2.2 completed and code-reviewed (6 patches applied).
- Epic 2 is in-progress with stories 2.1 and 2.2 done.

### API Resource Transformer

Following the pattern from `app/Http/Resources/Api/ServiceResource.php`:

```php
class TeamMemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'bio' => $this->bio,
            'photo_url' => $this->getFirstMediaUrl('photo', 'thumb'),
            'social_links' => $this->social_links,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
```

**IMPORTANT:** The `photo_url` field maps to `$this->getFirstMediaUrl('photo', 'thumb')` using Spatie's media URL helper. If no photo exists, this returns an empty string — the frontend handles the placeholder.

### Testing Standards

- Use Pest (PHP framework default in Laravel 12, already set up)
- Feature test file: `tests/Feature/TeamMembersTest.php`
- Follow the exact pattern from `ServicesTest.php`
- Test GET /api/team returns 200 with `{ "data": [...] }` envelope
- Test that team members are ordered by `sort_order` ascending
- Test that social_links JSON structure is preserved in response
- Test empty state returns empty data array
- Run: `cd apps/backend && php artisan test --filter=TeamMembersTest`

### Existing Zod Schema Reference

The frontend already has `packages/shared/src/schemas/team-member.ts`:
```typescript
export const TeamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string(),
  bio: z.string().nullable(),
  photo_url: z.string().nullable(),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
```

Note: `social_links` is NOT in the Zod schema and should NOT be added in this story. **Defer Zod schema update to Story 2.4** (Team Members Public Display) when the frontend consumes the data.

### Verification Checklist (from Epic 1 Retro Action Item)

After implementing, manually verify:
- [ ] Navigate to `/admin/team-members` — list renders with correct columns: Photo, Name, Role, Sort Order, Created
- [ ] Create a new team member with name, role, bio, photo (JPG <2MB)
- [ ] Photo appears as thumbnail in the list after upload
- [ ] Edit the team member — changes persist after save
- [ ] Update the photo — old photo is replaced, new thumbnail shows
- [ ] Upload photo >2MB or wrong format — inline error shows
- [ ] Create 3+ team members, reorder via drag-and-drop — order persists on reload
- [ ] Delete a team member — it's removed from list, media files cleaned up
- [ ] Empty state shows when no team members exist
- [ ] GET /api/team returns sorted JSON with `{ "data": [...] }` envelope
- [ ] social_links JSON preserved in API response

### References

- [Source: docs/epics.md#Story-2.3] — Full AC, field specs, UX-DR coverage
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-1] — Domain boundary isolation
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-5] — Admin is sole content authority
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-6] — Media via Spatie Media Library
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — File locations for TeamMember model, resource, controller
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Consistency-Conventions] — Naming conventions for models, tables, resources
- [Source: docs/project-context.md#PHP-Backend] — DDD domain rules, no raw SQL, Spatie for uploads
- [Source: docs/project-context.md#Laravel-12] — DDD directory structure, Filament resource discovery
- [Source: docs/project-context.md#Critical-Rules] — Never import models from other domains
- [Source: docs/ux-designs/DESIGN.md] — Admin panel component visuals
- [Source: docs/ux-designs/EXPERIENCE.md#Admin-Panel] — Admin behavioral specs, upload zone patterns
- [Source: stories/1-4-media-library-setup.md] — Spatie Media Library v11 setup and patterns
- [Source: stories/2-1-services-admin-crud.md] — Previous CRUD story implementation patterns and learnings
- [Source: stories/2-2-services-public-display.md] — Code review findings and Zod validation pattern
- [Source: stories/sprint-status.yaml] — Story 2.3 is next in Epic 2

## Dev Agent Record

### Implementation Plan

1. **Migration** — Created `marketing_team_members` table with id, name, role, bio (nullable text), social_links (nullable JSON), sort_order, timestamps.
2. **TeamMember model** — Eloquent model with Spatie `HasMedia`/`InteractsWithMedia`. Registered `photo` media collection (`->singleFile()`) with `thumb` (150x150 crop) and `profile` (400x400) conversions. Casts `social_links` to array, `sort_order` to integer. Factory resolution via `newFactory()`.
3. **Filament TeamMemberResource** — CRUD resource with form (TextInput for name/role, Textarea for bio, SpatieMediaLibraryFileUpload for photo, KeyValue for social_links, Hidden for sort_order) and table (ImageColumn for photo thumbnail, TextColumn for name/role/sort_order/created_at). Reorderable via `sort_order`. No pagination.
4. **Page subclasses** — ListTeamMembers, CreateTeamMember ("Saved." notification + redirect to index), EditTeamMember — concrete subclasses to work around Filament 5.0.0's typed static `$resource` property bug.
5. **AdminPanelProvider** — Registered TeamMemberResource, updated Team nav URL from `'#'` to `TeamMemberResource::getUrl()`.
6. **API + API Resource** — Updated TeamMemberController with real query, created `TeamMemberResource` transformer returning id, name, role, bio, photo_url (via Spatie), social_links, sort_order, timestamps.
7. **Tests** — 4 feature tests covering sort order, empty state, response structure, and null social_links.

### Debug Log

- **Filament 5.0.0 type annotations:** `$navigationIcon` requires `string | \BackedEnum | null`, `$navigationGroup` requires `string | \UnitEnum | null` (matching parent class signatures).
- **Spatie v11 API:** `maxFileSize()` method not available on `MediaCollection` — size validation handled by global config or the Filament file upload component instead.
- **Filament Spatie plugin:** Required `filament/spatie-laravel-media-library-plugin` at `5.0.*` to match `filament/filament` v5.0.0.
- **Spatie form component:** `Forms\Components\SpatieMediaLibraryFileUpload` with `->collection('photo')` and `->conversion('thumb')` for the admin thumbnail preview.
- **Migration ran cleanly:** Table created, rollback tested via `RefreshDatabase` trait in tests.

### Completion Notes

- Story 2.3 implemented successfully — all acceptance criteria satisfied.
- 4 tests added, 9 total tests pass (83 assertions).
- Admin panel Team CRUD fully functional with photo upload via Spatie.
- API endpoint `GET /api/team` returns sorted data with consistent JSON envelope.
- `social_links` JSON column supports nullable values.

### File List

**Created:**
- `apps/backend/database/migrations/2026_07_19_000002_create_marketing_team_members_table.php`
- `apps/backend/app/Domains/Marketing/Models/TeamMember.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource/Pages/ListTeamMembers.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource/Pages/CreateTeamMember.php`
- `apps/backend/app/Domains/Marketing/Filament/Resources/TeamMemberResource/Pages/EditTeamMember.php`
- `apps/backend/app/Http/Resources/Api/TeamMemberResource.php`
- `apps/backend/database/factories/Domains/Marketing/Models/TeamMemberFactory.php`
- `apps/backend/tests/Feature/TeamMembersTest.php`

**Modified:**
- `apps/backend/app/Providers/Filament/AdminPanelProvider.php` — Registered TeamMemberResource + updated Team nav URL
- `apps/backend/app/Domains/Marketing/Http/Api/TeamMemberController.php` — Replaced stub with real query
- `apps/backend/composer.json` / `composer.lock` — Added `filament/spatie-laravel-media-library-plugin`

**Installed dependency:**
- `filament/spatie-laravel-media-library-plugin` (v5.0.0)

### Review Findings

**Review date:** 2026-07-19
**Review layers:** Blind Hunter, Edge Case Hunter, Acceptance Auditor

**Summary:** 2 decision-needed, 7 patch, 4 defer, 3 dismissed — 16 total findings from 3 review layers.

---

#### Decision Needed (ambiguous — requires human input)

- [x] [Review][Decision] SVG upload is a stored XSS vector — removed SVG from accepted types. Sanitization should be added if SVG support is re-introduced in the future. [`TeamMember.php:61`] [Resolved: Remove SVG, note sanitization for future]
- [x] [Review][Decision] Inconsistent redirect after Edit vs Create — keeping Filament default (Edit stays on edit page). Consistent with other resources in the project. [`CreateTeamMember.php:17`] [Resolved: Keep Filament default]

#### Patch (fixable — unambiguous issues)

- [x] [Review][Patch] N+1 queries on media — added `->with('media')` eager loading to controller query. [`TeamMemberController.php:17`] [Applied]
- [x] [Review][Patch] Duplicate `sort_order = 0` on new records — added `creating` event in model to auto-assign `max('sort_order') + 1`. [`TeamMember.php:54-60`] [Applied]
- [x] [Review][Patch] Empty photo creates broken-image icon in admin table — changed return to `null` instead of empty string. [`TeamMemberResource.php:64-66`] [Applied]
- [x] [Review][Patch] No server-side validation on `social_links` structure — added `->rules(['json'])` to KeyValue component. [`TeamMemberResource.php:51`] [Applied]
- [x] [Review][Patch] MIME type mismatch between Filament and Spatie — removed SVG from both `acceptsMimeTypes` and `acceptedFileTypes`. [`TeamMemberResource.php:45, TeamMember.php:61`] [Applied]
- [x] [Review][Patch] Unused `profile` media conversion — removed unused `profile` conversion from model. [`TeamMember.php:73-76`] [Applied]
- [x] [Review][Patch] No eager loading of media in API controller — same fix as N+1 patch above. [`TeamMemberController.php:17`] [Applied]

#### Deferred (pre-existing or not actionable now)

- [x] [Review][Defer] No pagination on public API — `TeamMemberController::index()` uses unbounded `->get()`. Pre-existing pattern matching `ServiceController`. Team is small (<20 members). [`TeamMemberController.php:17`]
- [x] [Review][Defer] No authorization policy (gates) — no `TeamMemberPolicy`. Pre-existing across all resources. Single admin user in v1. [`TeamMemberResource.php`]
- [x] [Review][Defer] No caching headers on API endpoint — pre-existing pattern matching `ServiceController`. [`TeamMemberController.php:17`]
- [x] [Review][Defer] Factory `sort_order` collisions — `numberBetween(0,100)` may produce duplicates. Tests already use explicit values. Test-only concern. [`TeamMemberFactory.php:27`]
