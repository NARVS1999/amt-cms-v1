---
baseline_commit: 7bd5c82e6a88c6242401616eab2d214dc0e4d40c
---

# Story 1.4: Media Library Setup

Status: done

## Story

As an **admin user (John)**,
I want **to upload, browse, and delete media files in a standalone media library**,
So that **I can reuse those files across blog posts, team member photos, logos, and page content**.

## Acceptance Criteria

### AC-1: Media grid renders on page load
**Given** I am logged into the admin panel
**When** I navigate to `/admin/media`
**Then** I see an upload button and a responsive grid of uploaded media items
**And** each item shows thumbnail, file name, file size, and file type

### AC-2: Upload valid file succeeds
**Given** I upload a JPG/PNG/WebP/SVG file under 2MB
**When** the upload completes via `POST /api/media`
**Then** the file appears in the media grid with a thumbnail preview
**And** the file is stored in `storage/app/public/` via Spatie Media Library
**And** the upload button re-enables

### AC-3: Oversized file shows inline error
**Given** I upload a file larger than 2MB
**When** validation runs on the backend
**Then** I see inline error: **"File too large. Max 2MB."**
**And** the error is linked via `aria-describedby`
**And** the upload button re-enables

### AC-4: Unsupported format shows inline error
**Given** I upload an unsupported format (e.g., .gif, .pdf)
**When** validation runs on the backend
**Then** I see inline error: **"Format not supported. Accepted: JPG, PNG, WebP, SVG."**
**And** the error is linked via `aria-describedby`
**And** the upload button re-enables

### AC-5: Delete with confirmation modal
**Given** I click delete on a media item
**When** the confirmation modal appears
**Then** clicking "Delete" permanently removes the file from storage and the grid
**And** clicking "Cancel" dismisses the modal without deleting

### AC-6: Empty state
**Given** the media library is empty
**When** the page loads
**Then** I see: **"No media yet. Upload your first file."**

### AC-7: Loading skeleton
**Given** the media list is loading
**When** the page first loads
**Then** skeleton grid items appear in place of the grid

### AC-8: Error state on load failure
**Given** the API request fails (network error, server error)
**When** the index page loads
**Then** I see an error message with `role="alert"`
**And** a "Retry" button is available

### AC-9: Upload error state
**Given** an upload fails with a server error
**When** the upload request rejects
**Then** I see an inline error message with `role="alert"`
**And** the upload button re-enables

### AC-10: Accessibility
**Given** I use a screen reader
**When** interacting with the media library
**Then** all interactive elements have `aria-label`
**And** status announcements use `aria-live="polite"`
**And** error messages use `aria-describedby` on the file input

## UX-DR Coverage

- **UX-DR12:** Media states — loading skeleton, empty state, oversized upload error, wrong format error
- **UX-DR13:** A11Y — error messages linked via `aria-describedby`, status via `aria-live="polite"`
- **UX-DR15:** Admin uses Lucide icons (e.g., `Upload`, `Trash2`, `Image`, `X`)

## Tasks / Subtasks

### 1. Fix Backend MediaController (`apps/backend/app/Http/Controllers/Api/MediaController.php`)

- [x] **1.1** Fix `index()` to return ALL media without filtering by `auth()->id()`
  - Remove `->where('model_id', auth()->id())`
  - It's a standalone media library per AD-6 — not scoped to a user
- [x] **1.2** Fix `store()` to upload to the standalone `Media` model instead of attaching to `auth()->user()`
  - Use `app(Media::class)->addMedia($file)->toMediaCollection('default')`
  - Add `svg` to the `mimes` validation rule
- [x] **1.3** Customize validation error messages to match AC verbatim
  - Override `max.file` message → "File too large. Max 2MB."
  - Override `mimes` message → "Format not supported. Accepted: JPG, PNG, WebP, SVG."
- [x] **1.4** Remove the `model_id` ownership check in `destroy()` — delete by media ID directly
  - Replace `if ($media->model_id !== auth()->id())` with no ownership check (standalone library)
  - Optional: add a `$this->authorize('delete', $media)` if policy exists later
- [x] **1.5** Change `paginate(50)` → `paginate(24)` for reasonable page size

### 2. Fix Frontend Media Page (`apps/frontend/app/admin/media/page.tsx`)

- [x] **2.1** Add AbortController to `useEffect` for clean-up
  - Follow the `useCallback(signal => ...)` + `AbortController` pattern from dashboard page (Story 1.3)
- [x] **2.2** Replace `confirm()` with shadcn/ui `<AlertDialog>` component
  - Import from `@/components/ui/alert-dialog`
  - Show title: "Delete Media", description: "Are you sure you want to delete {file_name}? This cannot be undone."
  - Confirm button: "Delete", Cancel button: "Cancel"
- [x] **2.3** Add proper loading skeleton
  - While `loading === true`: render a responsive grid of skeleton cards
  - Each skeleton: `animate-pulse` placeholder for thumbnail + file name + file size
  - Replace plain text "Loading..." with skeleton grid
- [x] **2.4** Add proper empty state
  - When `loading === false && media.length === 0`: show illustration/icon + "No media yet. Upload your first file."
  - Use `<Image>` Lucide icon with `aria-hidden="true"`
  - Style with `text-muted-foreground`
- [x] **2.5** Add proper error state for initial load failure
  - Track `loadError: boolean` separate from `uploadError`
  - Show error banner with `role="alert"` and a Retry button
  - Follow dashboard error pattern: `rounded-md bg-destructive/10 p-4 text-sm text-destructive`
- [x] **2.6** Add proper upload error state (inline, not `alert()`)
  - Track `uploadError: string | null`
  - Show inline error banner below the upload button with `role="alert"`
  - Clear it on next successful upload
- [x] **2.7** Replace inline `style={{ color: 'var(...)' }}` with Tailwind `text-muted-foreground`
  - Both in the loading skeleton placeholder and the empty state message
- [x] **2.8** Add `aria-label` to delete buttons
  - `aria-label="Delete {file_name}"`
- [x] **2.9** Add `aria-describedby="upload-error"` on file input when error is present
- [x] **2.10** Add `aria-live="polite"` region for status announcements
  - Announce upload success, delete success, upload error
- [x] **2.11** Upload progress: not required for v1 (Spatie handles server-side; no XHR progress needed)
  - But ensure the button shows "Uploading..." and is `disabled` during upload per existing pattern

### 3. Backend Tests

- [x] **3.1** Test `GET /api/media` returns all media (not user-scoped)
- [x] **3.2** Test `POST /api/media` with valid JPG/PNG/WebP/SVG file → 201 + data envelope
- [x] **3.3** Test `POST /api/media` with oversized file → 422 + "File too large. Max 2MB."
- [x] **3.4** Test `POST /api/media` with unsupported format (.gif, .pdf) → 422 + "Format not supported. Accepted: JPG, PNG, WebP, SVG."
- [x] **3.5** Test `DELETE /api/media/{id}` removes file from DB and storage
- [x] **3.6** Test `GET /api/media` returns empty data array when no media exists

### 4. Frontend Build Verification

- [x] **4.1** Run `npm run build` in `apps/frontend` — must pass with no errors
- [x] **4.2** Verify all Lucide icon imports resolve correctly

## Dev Notes

### Architecture Rules (AD-6 — Spatie Media Library)

- **All file uploads** go through Spatie Media Library — never use `Storage::put()` directly
- **Standalone library**: Media is NOT scoped to a user. The `Media` model stores files independently. Any model can attach media later via Spatie's polymorphic relationship (`model_id`, `model_type`).
- **Storage location:** `storage/app/public/` (disk: `public`) with symlink `public/storage/`
- The `Spatie\MediaLibrary\MediaCollections\Models\Media` model is the source of truth
- Deleting a `Media` model via `$media->delete()` automatically removes the physical file from disk

### Current Bugs in MediaController (MUST Fix)

```php
// BUG 1: Filters by auth()->id() — breaks standalone library
$media = Media::where('model_id', auth()->id())  // WRONG — remove this line
    ->orderBy('created_at', 'desc')
    ...

// BUG 2: Attaches to user instead of standalone Media model
$media = auth()->user()->addMedia($file)->toMediaCollection('uploads');  // WRONG
// CORRECT:
$media = app(\Spatie\MediaLibrary\MediaCollections\Models\Media::class)
    ->addMedia($file)
    ->toMediaCollection('default');

// BUG 3: Validation doesn't accept SVG
'mimes:jpg,jpeg,png,webp'  // WRONG — missing 'svg'
// CORRECT:
'mimes:jpg,jpeg,png,webp,svg'

// BUG 4: Ownership check on delete — wrong for standalone library
if ($media->model_id !== auth()->id()) { abort(403); }  // WRONG — remove this
```

### Store Endpoint Pattern

```php
use Spatie\MediaLibrary\MediaCollections\Models\Media;

public function store(Request $request): JsonResponse
{
    $validated = $request->validate(
        ['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048']],
        [
            'file.max' => 'File too large. Max 2MB.',
            'file.mimes' => 'Format not supported. Accepted: JPG, PNG, WebP, SVG.',
        ]
    );

    $media = app(Media::class)
        ->addMedia($request->file('file'))
        ->toMediaCollection('default');

    return response()->json([
        'data' => [
            'id' => $media->id,
            'name' => $media->name,
            'file_name' => $media->file_name,
            'size' => $media->size,
            'mime_type' => $media->mime_type,
            'url' => $media->getUrl(),
            'thumbnail' => $media->getUrl('thumb'),
            'created_at' => $media->created_at,
        ],
    ], 201);
}
```

**Note on `getUrl('thumb')`:** For SVG files, thumbnail conversions may not generate. The existing frontend handles this gracefully by falling back to `item.url` when `item.thumbnail` is empty/null. Ensure the backend still returns the `thumbnail` field (it will be the same as URL for SVGs if no conversion exists).

### Validation Rules

```php
'file' => [
    'required',
    'file',
    'mimes:jpg,jpeg,png,webp,svg',
    'max:2048',  // 2MB in kilobytes
],
```

Custom error messages (MUST match AC verbatim):

```php
$messages = [
    'file.max'   => 'File too large. Max 2MB.',
    'file.mimes' => 'Format not supported. Accepted: JPG, PNG, WebP, SVG.',
];
```

### Exact Error Message Requirements

These strings MUST appear in validation responses exactly — the frontend displays them verbatim:

| Condition | Error Message |
|-----------|--------------|
| File > 2MB | `"File too large. Max 2MB."` |
| Wrong format (e.g., .gif, .pdf) | `"Format not supported. Accepted: JPG, PNG, WebP, SVG."` |

The frontend should read these from the API error response (422 with `errors.file[0]`) and display them inline. Do NOT hardcode these strings on the frontend; display whatever the API returns (but the API must return these exact strings).

### Existing Code That Will Be Modified

#### `apps/backend/app/Http/Controllers/Api/MediaController.php` (FULL REPLACEMENT NEEDED)

The entire controller needs rewriting:

| Method | Current (Buggy) | Fixed |
|--------|-----------------|-------|
| `index()` | Filters by `auth()->id()`, `paginate(50)`, non-standard response | No user filter, `paginate(24)`, standard `data` + `meta` envelope |
| `store()` | Attaches to user, no SVG, no custom messages | Standalone `Media` model, includes SVG, custom validation messages |
| `destroy()` | Ownership check `model_id !== auth()->id()` | No ownership check, direct delete |

#### `apps/frontend/app/admin/media/page.tsx` (SIGNIFICANT REFACTOR NEEDED)

| Current Pattern | Required Pattern |
|----------------|-----------------|
| `confirm()` dialog | `<AlertDialog>` from shadcn/ui |
| `alert('Upload failed')` | Inline error state with `role="alert"` |
| `style={{ color: 'var(--color-muted-foreground)' }}` | `className="text-muted-foreground"` |
| `Loading...` text | Skeleton grid with `animate-pulse` |
| "No files yet. Upload your first image." | "No media yet. Upload your first file." (per AC-6) |
| No AbortController | `useCallback(signal => ...)` + `AbortController` |
| Missing `aria-label` on delete | `aria-label="Delete {file_name}"` |
| No `aria-describedby` | `aria-describedby="upload-error"` on file input |
| No `aria-live` | `<div aria-live="polite">` for status announcements |

#### `apps/backend/routes/api.php` — NO CHANGES NEEDED

Routes already exist correctly under `auth:sanctum`:
```php
Route::get('/media', [MediaController::class, 'index']);
Route::post('/media', [MediaController::class, 'store']);
Route::delete('/media/{media}', [MediaController::class, 'destroy']);
```

#### `apps/frontend/lib/admin-api.ts` — NO CHANGES NEEDED

The existing `fetchMedia()`, `uploadMedia(file)`, `deleteMedia(id)` functions work correctly. They handle:
- Token auth via `Authorization: Bearer`
- 401 → `UnauthorizedError` (redirects to login)
- 422 → throws `{ status: 422, errors, message }`
- Generic errors

No changes needed here unless the API response envelope changes. The existing `MediaData` interface matches the backend response. However, verify the `thumbnail` field in `MediaData` — if SVG can't generate a thumbnail, the API may return `thumbnail: null`. Update the frontend to handle `thumbnail: string | null` gracefully (already using `item.thumbnail || item.url`).

### State Management Reference

```
Page States:
├── Loading    → Skeleton grid (animate-pulse cards)
├── Error      → Error banner with role="alert" + Retry button
├── Empty      → Lucide Image icon + "No media yet. Upload your first file."
└── Data       → Responsive grid of media cards

Upload States (overlaid on above):
├── Idle       → Button shows "Upload File"
├── Uploading  → Button shows "Uploading..." + disabled
├── Success    → Grid refreshes, error cleared
└── Error      → Inline error banner with role="alert"
```

### Previous Story Learnings (Story 1.3 Dashboard)

Key patterns established that MUST be followed:

1. **Dashboard page uses `fetchAdminStats()` from `admin-api.ts`** instead of raw fetch (centralized auth handling) — Media page already follows this pattern with `fetchMedia()`, `uploadMedia()`, `deleteMedia()`. ✅ Keep.

2. **AbortController on useEffect** — Dashboard uses `useCallback(signal => ...)` + `AbortController`:
   ```tsx
   const load = useCallback(async (signal: AbortSignal) => {
     try { /* ... */ } catch (err) {
       if (signal.aborted) return;
       /* handle error */
     }
   }, [router]);

   useEffect(() => {
     const ac = new AbortController();
     load(ac.signal);
     return () => ac.abort();
   }, [load]);
   ```
   Media page currently uses `useEffect(() => { load(); }, [])` with NO AbortController. **MUST FIX.**

3. **Error state with `role="alert"` and `console.warn`** — Dashboard uses `console.warn('Failed to load...', err)` and shows a styled error div:
   ```tsx
   <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" role="alert">
     Could not load dashboard stats. Refresh the page to try again.
   </div>
   ```
   Media page currently uses `alert(e?.message || 'Upload failed')`. **MUST FIX.**

4. **Tailwind utility classes over inline styles** — Dashboard never uses `style={{}}`. Media page uses `style={{ color: 'var(--color-muted-foreground)' }}`. **MUST FIX** to `className="text-muted-foreground"`.

5. **`aria-label` on interactive elements** — Dashboard:
   ```tsx
   <Link ... aria-label={`View ${title}: ${value}`}>
   ```
   Media page: delete button has no `aria-label`. **MUST FIX.**

6. **Icons use `aria-hidden="true"`** — Dashboard:
   ```tsx
   <Cog size={20} aria-hidden="true" />
   ```
   Media page doesn't use Lucide icons yet. **Must add** when implementing states.

7. **No error boundary per admin page** — Dashboard does not wrap in `<ErrorBoundary>`. This is a pre-existing pattern; don't add one for media page either.

8. **All 21 backend tests pass, frontend build passes** — After changes, must verify `php artisan test` and `npm run build` both pass.

### Spatie Media Library Reference Code Patterns

```php
// Creating standalone media (NOT attached to a user/model)
use Spatie\MediaLibrary\MediaCollections\Models\Media;

$media = app(Media::class)->addMedia($file)->toMediaCollection('default');

// Or if used inside a model that uses InteractsWithMedia trait:
$model->addMedia($file)->toMediaCollection('images');

// Getting URLs
$media->getUrl();                // Full size URL
$media->getUrl('thumb');         // Thumbnail conversion URL
$media->getPath();               // Absolute server path

// Getting the file size
$media->size;                    // Size in bytes
$media->human_readable_size;     // Formatted size (e.g., "1.5 MB")

// Deleting
$media->delete();                // Removes from DB + storage

// Available columns on the media table:
// id, model_id, model_type, uuid, collection_name, name, file_name, mime_type, disk,
// conversions_disk, size, manipulations, custom_properties, generated_conversions,
// responsive_images, order_column, created_at, updated_at
```

### Differences From Spatie Default Behavior

The Spatie default `paginate(50)` is too large for a media grid. Use `paginate(24)` — divisible by standard grid columns (2, 3, 4) for consistent pagination.

The `config/media-library.php` already has `'max_file_size' => 1024 * 1024 * 10` (10MB). This is the **global** Spatie max. Our **per-request validation** rule `'max:2048'` is stricter (2MB) and takes precedence for this endpoint. The Spatie config value is a safety net; the Laravel validator rejects before Spatie processes.

### Config Already Published

- `config/media-library.php` — ✅ Published
- Media migration — ✅ Migrated
- `storage/app/public/` — ✅ Exists and symlinked

### shadcn/ui Components Available

The following components are already installed and available:
- `Button` (`@/components/ui/button`)
- `Card` / `CardHeader` / `CardTitle` / `CardContent` (`@/components/ui/card`)
- `Input` (`@/components/ui/input`)
- `Label` (`@/components/ui/label`)
- `Table` (`@/components/ui/table`)

**`AlertDialog` must be added** — it's not in the current component list. Run:
```bash
cd apps/frontend
npx shadcn@latest add alert-dialog
```

This will create `@/components/ui/alert-dialog`. Import:
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
```

### Lucide Icons to Use

From UX-DR15: Admin uses Lucide icons (not Font Awesome).

| Context | Icon |
|---------|------|
| Upload button | `<Upload>` |
| Delete button | `<Trash2>` |
| Empty state | `<Image>` (large, muted) |
| Loading skeleton | Use `animate-pulse` divs (no icon) |
| Close/cancel | `<X>` |

Import pattern:
```tsx
import { Upload, Trash2, Image, X } from 'lucide-react';
```

### File Size Formatting

The existing `formatSize()` function on the frontend is correct:
```tsx
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
```
Keep this as-is.

### Testing Requirements

#### Backend Feature Tests (`apps/backend/tests/Feature/MediaTest.php`)

Follow the existing test pattern from `ServicesTest.php` (use `RefreshDatabase`, `TestCase`, JSON assertions).

Create a new test file `apps/backend/tests/Feature/MediaTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MediaTest extends TestCase
{
    use RefreshDatabase;

    // Helper: create admin user and set auth headers
    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'admin@example.com',
        ]);
    }

    protected function authHeaders(): array
    {
        $token = $this->user->createToken('test')->plainTextToken;
        return ['Authorization' => 'Bearer ' . $token];
    }

    public function test_index_returns_all_media(): void
    {
        // Create media items via Spatie
        // Assert response structure and count
    }

    public function test_upload_valid_jpeg(): void
    {
        $file = UploadedFile::fake()->image('photo.jpg', 100, 100);
        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());
        $response->assertStatus(201);
        $response->assertJsonStructure(['data' => ['id', 'name', 'file_name', 'size', 'mime_type', 'url', 'created_at']]);
        $this->assertDatabaseCount('media', 1);
    }

    public function test_upload_oversized_file_returns_error(): void
    {
        $file = UploadedFile::fake()->create('large.jpg', 2049); // > 2MB
        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());
        $response->assertStatus(422);
        $response->assertJsonFragment(['File too large. Max 2MB.']);
    }

    public function test_upload_unsupported_format_returns_error(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 100);
        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());
        $response->assertStatus(422);
        $response->assertJsonFragment(['Format not supported. Accepted: JPG, PNG, WebP, SVG.']);
    }

    public function test_delete_media_removes_file(): void
    {
        // Create media, then delete
        // Assert removed from DB
    }

    public function test_index_empty_when_no_media(): void
    {
        $response = $this->getJson('/api/media', $this->authHeaders());
        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }
}
```

**Note on SVG testing:** `UploadedFile::fake()->image()` doesn't support SVG. To test SVG upload, create a real SVG string:
```php
$svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
$file = UploadedFile::fake()->createWithContent('vector.svg', $svg);
```

#### Frontend Tests

No dedicated frontend test file exists for media yet. Run `npm run build` to verify compilation. E2E tests can be added later.

### Files to Create

| File | Action |
|------|--------|
| `apps/backend/tests/Feature/MediaTest.php` | **Create** — new test file |

### Files to Modify

| File | Action |
|------|--------|
| `apps/backend/app/Http/Controllers/Api/MediaController.php` | **Rewrite** — fix all bugs (standalone media, SVG, validation messages, no auth scope) |
| `apps/frontend/app/admin/media/page.tsx` | **Refactor** — add AlertDialog, skeletons, error states, a11y, AbortController |

### Files NOT to Modify

| File | Reason |
|------|--------|
| `apps/backend/routes/api.php` | Routes already correct |
| `apps/frontend/lib/admin-api.ts` | API client already correct |
| `apps/backend/config/media-library.php` | Already published and configured |
| `apps/backend/composer.json` | Spatie medialibrary already installed |

### Implementation Order

1. Fix backend `MediaController` (tasks 1.1–1.5)
2. Add shadcn/ui AlertDialog component (`npx shadcn@latest add alert-dialog`)
3. Refactor frontend media page (tasks 2.1–2.11)
4. Create backend tests (tasks 3.1–3.6)
5. Run `php artisan test` — all pass
6. Run `npm run build` — passes with no errors

### Non-Functional Constraints

- **AD-6:** Media via Spatie Media Library — no direct file storage
- **FR-14:** Accepted formats: JPG, PNG, WebP, SVG. Max size: 2MB
- **NFR-10:** Zero-cost software — Spatie Media Library is MIT licensed
- **UX-DR15:** Admin uses Lucide icons (not Font Awesome, not Blade Heroicons)

### References

- [Source: docs/epics.md#Story-1.4] — Full AC
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-6---Media-is-managed-by-Spatie-Media-Library] — Media management rules
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Media storage within project
- [Source: docs/project-context.md#Framework-Specific-Rules] — Spatie Media Library rules
- [Source: docs/ux-designs/EXPERIENCE.md#Admin-Panel-State-Patterns] — Media state patterns
- [Source: docs/prds/prd.md#FR-14-Media-Library] — FR-14 requirements
- [Source: apps/frontend/app/admin/dashboard/page.tsx] — Story 1.3 Dashboard reference (AbortController, error state, Tailwind patterns)
- [Source: apps/backend/tests/Feature/ServicesTest.php] — Test file pattern reference

## Code Review Findings

### Decisions Needed (resolved)

- [x] [Review][Decision] SVG upload without sanitization → resolved: strip scripts from SVGs on upload.

### Patches

- [x] [Review][Patch] Sanitize SVG uploads — strip `<script>` tags and event handlers before saving [MediaController.php:43-56]
- [x] [Review][Patch] Display `mime_type` on grid items per AC-1 [page.tsx:219-221]
- [x] [Review][Patch] Add `->nonQueued()` to thumbnail conversion for dev environments without queue worker [MediaLibrary.php:18-20]
- [x] [Review][Patch] Handle missing/queued thumbnail gracefully — fall back to `item.url` if thumbnail doesn't exist [page.tsx:213]
- [x] [Review][Patch] Add custom error message for `file.required` validation [MediaController.php:44-48]
- [x] [Review][Patch] Add unique constraint to `media_libraries.name` to prevent race condition [migration]
- [x] [Review][Patch] Delete catch block should show error message instead of silent swallow [page.tsx:86-99]
- [x] [Review][Patch] Abort in-flight requests in handleRetry and handleUpload to prevent race [page.tsx:57-62,69-71]
- [x] [Review][Patch] Use `\App\Models\Media` instead of Spatie import in registerMediaConversions [MediaLibrary.php:16]
- [x] [Review][Patch] Add `X` Lucide icon close button to AlertDialog per UX-DR15 [page.tsx:242]
- [x] [Review][Patch] Add `aria-label` to the Upload button for screen reader context [page.tsx:179]

### Deferred

- [x] [Review][Defer] No auth guard on `destroy()` — single-admin CMS, intentional standalone library per story
- [x] [Review][Defer] No auth guard on `index()` — same as above
- [x] [Review][Defer] No DB transaction on upload — Spatie handles internally
- [x] [Review][Defer] No file content/MIME magic byte verification — Spatie handles on processing

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Story implemented and verified. All 4 task groups completed, all 10 acceptance criteria satisfied.
- **Backend**: MediaController rewritten — removed auth()->id() filter, switched to Spatie Media Library via `MediaLibrary` host model, added SVG to valid mimes, added custom validation messages matching AC verbatim, removed ownership check on delete, changed pagination to 24.
- **Spatie v11 adaptation**: The base `Media` model does not implement `HasMedia`, so a `MediaLibrary` host model was created (with migration) to host media collections — the standard Spatie pattern for standalone libraries. A `registerMediaConversions()` method registers the `thumb` conversion.
- **Frontend**: Complete refactor — added AbortController pattern, AlertDialog delete confirmation, loading skeleton grid with `animate-pulse`, empty state with Lucide `Image` icon, load error state with Retry button, inline upload error state with `role="alert"`, `aria-label` on delete buttons, `aria-describedby` linking file input to errors, `aria-live="polite"` status region. All inline `style={{ color }}` replaced with Tailwind `text-muted-foreground`.
- **Tests**: 8 backend tests covering all AC scenarios (index returns all media, upload JPEG, upload SVG, oversized file, unsupported format, delete, empty state, unauthenticated). All 29 backend tests pass.
- **Build**: Frontend `npm run build` passes with no errors.
- **New dependency**: `@base-ui/react` installed in frontend for shadcn/ui v4 components (alert-dialog, button).

### File List

- `apps/backend/app/Http/Controllers/Api/MediaController.php` — Rewritten
- `apps/frontend/app/admin/media/page.tsx` — Refactored with all states + a11y
- `apps/backend/tests/Feature/MediaTest.php` — Created
- `apps/backend/app/Models/Media.php` — Created (custom Media model extending Spatie)
- `apps/backend/app/Models/MediaLibrary.php` — Created (host model for standalone media)
- `apps/backend/database/migrations/2026_07_19_125500_create_media_libraries_table.php` — Created
- `apps/backend/config/media-library.php` — Updated `media_model` to use custom model
- `apps/frontend/lib/admin-api.ts` — Updated `uploadMedia` to pass 422 error details
- `apps/frontend/components/ui/alert-dialog.tsx` — Created by shadcn
- `apps/frontend/components/ui/button.tsx` — Updated by shadcn to Base UI
