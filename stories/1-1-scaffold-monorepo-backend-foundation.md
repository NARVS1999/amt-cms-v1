---
baseline_commit: 7bd5c82e6a88c6242401616eab2d214dc0e4d40c
---

# Story 1.1: Scaffold Monorepo & Backend Foundation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **the monorepo scaffolded with Laravel 12 backend connected to XAMPP MariaDB**,
So that **the development environment is ready for feature work**.

## Acceptance Criteria

**Given** a clean project at `C:\Users\Admin\Desktop\project\AMT_V2`
**When** I run the scaffold commands
**Then** the root `package.json` defines npm workspaces: `["apps/backend", "apps/frontend", "packages/shared"]`
**And** `apps/backend` contains a fresh Laravel 12 installation with `.env` configured for XAMPP MariaDB (DB_HOST=127.0.0.1, DB_PORT=3306, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
**And** `php artisan serve` starts without errors
**And** `php artisan migrate` runs the default Laravel migrations successfully (users table, password_resets, etc.) — domain-specific migrations will be added in their respective stories
**And** a `.gitignore` at root covers `vendor/`, `node_modules/`, `.env`, `storage/`, `out/`
**And** `public/storage` is symlinked to `storage/app/public`

**Given** local PHP 8.2.12, Composer 2.8.9, Node 20.17.0 are installed
**When** I run `composer install` in `apps/backend`
**Then** it completes without errors

## Tasks / Subtasks

- [x] **Initialize root monorepo** (AC: npm workspaces)
  - [x] Create root `package.json` with npm workspaces: `["apps/backend", "apps/frontend", "packages/shared"]`
  - [x] Create root `.gitignore` covering `vendor/`, `node_modules/`, `.env`, `storage/`, `out/`, `.idea/`
  - [x] Ensure `git` is initialized at root with no tracked `.env` or secrets
- [x] **Scaffold Laravel 12 backend** (AC: artisan serve, migrate, composer)
  - [x] Run `composer create-project laravel/laravel:^12.0 apps/backend` (or `laravel new apps/backend`)
  - [x] Configure `.env` for XAMPP MariaDB: DB_HOST=127.0.0.1, DB_PORT=3306, DB_DATABASE=adsvance_cms, DB_USERNAME=root, DB_PASSWORD=
  - [x] Configure .env APP_URL=http://localhost:8000
  - [x] Run `php artisan key:generate`
  - [x] Create XAMPP database `adsvance_cms` if it doesn't exist
  - [x] Run `php artisan migrate` — verify default migrations succeed (users, password_resets, etc.)
  - [x] Run `php artisan storage:link` to symlink public/storage → storage/app/public
  - [x] Run `php artisan serve` and verify it starts without errors
- [x] **Add workspace composer.json to apps/backend** (AC: monorepo compatible)
  - [x] Add `"name": "adsvance/backend"` to apps/backend/composer.json
- [x] **Verify scaffold** (AC: all commands green)
  - [x] Run `composer install` in apps/backend — must pass
  - [x] Run `php artisan migrate:fresh` — must pass
  - [x] Verify `php artisan route:list` shows default Laravel routes

## Dev Notes

### Monorepo Structure (MANDATORY — must match exactly)

```
project-root/
├── package.json              # npm workspaces root
├── apps/
│   ├── backend/              # Laravel 12 (scaffolded by laravel new / composer)
│   │   ├── composer.json
│   │   └── .env              # XAMPP MariaDB config
│   └── frontend/             # Created in Story 1.6 — do NOT create yet
└── packages/
    └── shared/               # Created in Story 1.7 — do NOT create yet
```

### Critical Rules

- **ONLY the `users` table migration runs here.** Domain migrations (marketing_services, billing_pricing_plans, etc.) are created in the stories that first need them. Do NOT pre-create all migrations.
- **Do NOT scaffold `apps/frontend` or `packages/shared`** — those are created in Stories 1.6 and 1.7 respectively. Only set up the root `package.json` with workspaces definition.
- **Never hardcode any configuration** — everything must be in `.env` (NFR-9).
- **No raw SQL** — Eloquent ORM only (NFR-16).

### Technology Versions (PINNED)

- PHP 8.2.12 ✅ (Hostinger compatible)
- Composer 2.8.9 ✅
- Node.js 20.17.0 ✅
- Laravel 12.x (current LTS, security until Feb 2027)
- MariaDB 10.4 (local via XAMPP) at `C:\xampp\mysql\bin\`

### Environment Configuration

**.env** (apps/backend):
```
APP_NAME=AdsvanceMediaTechCMS
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=adsvance_cms
DB_USERNAME=root
DB_PASSWORD=

CONTACT_NOTIFICATION_EMAIL=johnpaulnarvasa6@gmail.com
```

### XAMPP Details

- MariaDB executable: `C:\xampp\mysql\bin\mysqld.exe`
- Accessible via `C:\xampp\mysql\bin\mysql.exe -u root`
- Default port: 3306, default user: root, no password
- Create database via: `CREATE DATABASE IF NOT EXISTS adsvance_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

### Testing Requirements

- Run `php artisan migrate:fresh` — must complete without errors
- Run `php artisan serve --port=8000` — must start, curl http://localhost:8000 returns Laravel welcome page
- Run `composer install` — must pass with no conflicts
- Verify `.env` has no hardcoded secrets that would be committed to git

### Non-Functional Constraints

- **NFR-9:** All configuration environment-driven (`.env`), never hardcoded
- **NFR-10:** Zero-cost software — Laravel is MIT licensed
- **NFR-11:** Hostinger compatible (PHP 8.2)
- **NFR-16:** No raw SQL queries — Eloquent ORM only

### Migration Naming Convention

Migrations follow the pattern `YYYY_MM_DD_HHMMSS_create_{domain}_{table}_table.php`.

### References

- [Source: docs/epics.md#Story-1.1] — Full AC definition
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Expected directory tree
- [Source: docs/project-context.md#Technology-Stack--Versions] — Pinned versions
- [Source: docs/prds/addendum.md#Local-Development-Setup] — Dev setup instructions
- [Source: docs/prds/addendum.md#Architecture-Overview] — Monorepo layout diagram

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Initialized root monorepo: package.json with npm workspaces, .gitignore covering vendor/, node_modules/, .env, storage/, out/.
- Scaffolded Laravel 12 in apps/backend using `composer create-project laravel/laravel:^12.0 apps/backend`.
- Configured .env for XAMPP MariaDB (DB_HOST=127.0.0.1, DB_PORT=3306, DB_DATABASE=adsvance_cms, DB_USERNAME=root, DB_PASSWORD=).
- Created adsvance_cms database, ran migrate:fresh successfully (users, cache, jobs tables).
- Ran php artisan storage:link, verified php artisan serve starts without errors.
- Added workspace name "adsvance/backend" to apps/backend/composer.json.
- Verified: composer install passes, migration:fresh passes, route:list shows default Laravel routes.

### File List

- `package.json` (root, npm workspaces)
- `apps/backend/` (Laravel 12 installation)
- `apps/backend/.env` (configured for XAMPP MariaDB)
- `apps/backend/composer.json` (with name "adsvance/backend")
- `.gitignore` (root)
