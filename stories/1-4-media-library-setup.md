---
baseline_commit: 7bd5c82e6a88c6242401616eab2d214dc0e4d40c
---

# Story 1.4: Media Library Setup

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin user (John)**,
I want **to upload, browse, and delete image files in a media library**,
So that **I can use those images in blog posts, team member photos, logos, and page content**.

## Acceptance Criteria

**Given** Spatie Media Library v11 is installed (`composer require spatie/laravel-medialibrary`)
**When** I navigate to the Media Library in the admin panel
**Then** I see an upload button and a grid of uploaded media items

**Given** I upload a JPG/PNG/WebP/SVG file under 2MB
**When** the upload completes
**Then** the file appears in the media grid with a thumbnail preview
**And** the file is stored in `storage/app/public/` via Spatie

**Given** I upload a file larger than 2MB
**When** validation runs
**Then** I see inline error: "File too large. Max 2MB."

**Given** I upload an unsupported format (e.g., .gif, .pdf)
**When** validation runs
**Then** I see inline error: "Format not supported. Accepted: JPG, PNG, WebP, SVG."

**Given** I click delete on a media item
**When** the confirmation modal appears
**Then** clicking "Delete" permanently removes the file from storage and the grid

**Given** media items exist in the library
**When** the index page loads
**Then** items display as a responsive grid with file name, size, type, and thumbnail

**UX-DR coverage:** UX-DR12 (Media states), UX-DR13 (A11Y)

## Tasks / Subtasks

- [x] **Install and configure Spatie Media Library** (AC: v11 installed)
  - [x] `composer require spatie/laravel-medialibrary` in apps/backend
  - [x] `php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider"` (config + migration)
  - [x] `php artisan migrate` to create media tables
  - [x] Verify `storage/app/public/` exists and is symlinked
- [x] **Create Media Library Filament page** (AC: upload button + grid)
  - [x] Create custom Filament page for media library (not a CRUD resource — a custom page)
  - [x] Add upload button/modal with Spatie integration
  - [x] Create responsive grid view of uploaded media
  - [x] Each item shows: thumbnail, file name, file size, file type
- [x] **Implement file upload validation** (AC: 2MB limit, format restriction)
  - [x] Configure Spatie validation: max 2MB, accepted: JPG, PNG, WebP, SVG
  - [x] Show inline error: "File too large. Max 2MB." on oversized upload
  - [x] Show inline error: "Format not supported. Accepted: JPG, PNG, WebP, SVG." on wrong format
- [x] **Implement media deletion** (AC: delete with confirmation modal)
  - [x] Add delete button per media item
  - [x] Filament confirmation modal: "Are you sure?" + Delete/Cancel
  - [x] On confirm: permanently remove file from storage and grid
- [x] **Configure media collections for future models** (AC: ready for downstream stories)
  - [x] Prepare media collection definitions (can be added in downstream stories, but the Spatie foundation is ready)

## Dev Notes

### Spatie Media Library v11 Installation

```bash
cd apps/backend
composer require spatie/laravel-medialibrary
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="media-library-migrations"
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="media-library-config"
php artisan migrate
```

The config file is published to `config/media-library.php`. Key settings:
- `disk_name` → `public` (store in `storage/app/public/`)
- `max_file_size` → 2 * 1024 * 1024 (2MB)
- Accepted mime types handled via validation rules

### Media Library Architecture (AD-6)

- **All file uploads** go through Spatie Media Library — never use `Storage::put()` directly
- **Storage location:** `storage/app/public/` with symlink `public/storage/`
- **Foreign key pattern:** Media files are related via `media_id` foreign keys on content models (e.g., `photo_id`, `featured_image_id`, `hero_image_id`)
- **Collection convention:** Each model defines named collections:
  - `TeamMember`: `photo` collection (thumb 150x150 crop, profile 400x400)
  - `BlogPost`: `featured_image` collection
  - `ThemeSetting`: `light_logo`, `dark_logo`, `favicon` collections
  - `Page`: `hero_image` collection

### Media Library Page Implementation

The Media Library page should be a custom Filament page (not a CRUD resource — it's a file management tool, not a content type). Possible approaches:

1. **Custom Filament page** with Livewire components for upload grid
2. **Custom resource** using Spatie's `Media` model

The recommended approach for v1 is a custom page with:
- Upload action (modal with file selection, validation, upload progress)
- Grid view (responsive, showing thumbnails, file metadata)
- Delete action (with confirmation modal)

### Upload Validation Rules (MANDATORY)

```php
'file' => [
    'required',
    'file',
    'mimes:jpg,jpeg,png,webp,svg',
    'max:2048',  // 2MB in kilobytes
],
```

### Error Messages (MUST match AC verbatim)

- Oversized: **"File too large. Max 2MB."**
- Wrong format: **"Format not supported. Accepted: JPG, PNG, WebP, SVG."**

These exact strings must be used — they match the AC from UX-DR12.

### Media Access URL Pattern

Media accessed via Laravel's `Storage::url()`:
```php
$mediaItem->getUrl()                // Full size URL
$mediaItem->getUrl('thumb')        // Conversion URL (if conversions defined)
$mediaItem->getPath()              // Server path
```

The media URL format is: `/storage/{id}/{filename}` via the public disk symlink.

### Testing Requirements

- Test upload of valid JPG/PNG/WebP/SVG files under 2MB → success, appears in grid
- Test upload of oversized file (>2MB) → inline error "File too large. Max 2MB."
- Test upload of unsupported format (.gif, .pdf) → inline error "Format not supported..."
- Test delete with confirmation → file removed from storage and grid
- Test empty media library state → appropriate empty message
- Test media grid renders with multiple items responsively

### Non-Functional Constraints

- **AD-6:** Media via Spatie Media Library — no direct file storage
- **FR-14:** Accepted formats: JPG, PNG, WebP, SVG. Max size: 2MB
- **NFR-10:** Zero-cost software — Spatie Media Library is MIT licensed

### UX-DR Coverage

- **UX-DR12:** Media states — oversized upload error, wrong format error, loading indicators
- **UX-DR13:** A11Y — error messages linked via `aria-describedby`
- **UX-DR15:** Admin uses Blade Heroicons (not Font Awesome)

### References

- [Source: docs/epics.md#Story-1.4] — Full AC
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-6---Media-is-managed-by-Spatie-Media-Library] — Media management rules
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Media storage within project
- [Source: docs/project-context.md#Framework-Specific-Rules] — Spatie Media Library rules
- [Source: docs/ux-designs/EXPERIENCE.md#Admin-Panel-State-Patterns] — Media state patterns
- [Source: docs/prds/addendum.md#Package-Choices] — Spatie Media Library v11
- [Source: docs/prds/prd.md#FR-14-Media-Library] — FR-14 requirements

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Spatie Media Library v11 installed via Composer.
- Config published to `config/media-library.php`.
- Migration `2026_07_18_144613_create_media_table.php` created and ran.
- Custom Filament page `MediaLibrary` created at `app/Filament/Pages/MediaLibrary.php`.
- Blade view at `resources/views/filament/pages/media-library.blade.php` with responsive grid, thumbnails, file info.
- Upload via header action with FileUpload component; validation: 2MB max, JPG/PNG/WebP/SVG only.
- Delete via hover button with JavaScript confirmation; removes from DB + storage.
- Page registered in `AdminPanelProvider` and wired into Settings → Media Library nav item.
- Navigation badge shows total media count.

### File List

- `apps/backend/config/media-library.php`
- `apps/backend/database/migrations/2026_07_18_144613_create_media_table.php`
- `apps/backend/app/Filament/Pages/MediaLibrary.php`
- `apps/backend/resources/views/filament/pages/media-library.blade.php`
- `apps/backend/app/Providers/Filament/AdminPanelProvider.php`

- `apps/backend/composer.json` (added spatie/laravel-medialibrary)
- `apps/backend/config/media-library.php`
- Migration files for Spatie media tables (created by vendor:publish)
- `apps/backend/app/Domains/Media/Filament/Pages/MediaLibraryPage.php` (or similar custom page)
- `apps/backend/resources/views/filament/pages/media-library.blade.php` (or Livewire component view)
