# Stack

## Languages & Runtimes

| Layer | Language | Runtime |
|-------|----------|---------|
| Backend API | PHP 8.2 | Laravel 12 |
| Frontend (public + admin) | TypeScript 5.7 | Node.js (build-time only) |
| Shared schemas | TypeScript | — |
| Database | SQL (SQLite dev / MySQL prod) | — |

## Framework

- **Backend:** Laravel 12 (`apps/backend/`) — REST API only, no Blade/Inertia views
- **Frontend:** Next.js 16 (`apps/frontend/`) — SSG mode (`output: 'export'`), React 19
- **Shared:** `@amt/shared` (`packages/shared/`) — Zod v3 schemas

## Key Dependencies

### Backend (`apps/backend/composer.json`)

| Package | Purpose |
|---------|---------|
| `laravel/framework ^12.0` | Core framework |
| `laravel/sanctum ^4.3` | Token-based API auth |
| `spatie/laravel-medialibrary ^11.23` | File uploads & management |
| `phpunit/phpunit ^11.5.3` | Testing |
| `mockery/mockery ^1.6` | Mocking |
| `laravel/pint ^1.13` | Code style |
| `fakerphp/faker ^1.23` | Fake data for factories |

### Frontend (`apps/frontend/package.json`)

| Package | Purpose |
|---------|---------|
| `next ^16.0.0` | Framework (SSG export) |
| `react ^19.0.0` / `react-dom ^19.0.0` | UI library |
| `@base-ui/react ^1.6.0` | Headless UI primitives |
| `lucide-react ^1.25.0` | Admin panel icons |
| `@fortawesome/fontawesome-free ^6.7.0` | Public site icons |
| `tailwindcss ^4.0.0` | CSS framework |
| `@tailwindcss/postcss ^4.0.0` | Tailwind PostCSS plugin |
| `tw-animate-css ^1.4.0` | Tailwind animation utilities |
| `class-variance-authority ^0.7.1` | Component variant logic |
| `quill ^2.0.3` | Rich text editor (blog posts) |
| `typescript ^5.7.0` | Type checking |

### Shared (`packages/shared/package.json`)

| Package | Purpose |
|---------|---------|
| `zod ^3.23.0` | Schema validation (mirrors API responses) |

## Build & Dev Tooling

- **Package manager:** npm workspaces (root `package.json`)
- **Backend dev:** `php artisan serve` + queue listener + Vite via `concurrently`
- **Frontend build:** `npx tsc --noEmit` (typecheck) + `npm run build` (SSG)
- **Backend tests:** `php artisan test` (PHPUnit 11, SQLite `:memory:`)
- **Frontend lint:** `npm run lint` (Next.js ESLint)
- **CI model:** Admin writes → MySQL → REST API → Next.js build → static HTML

## Configuration

- Root: `.gitignore`, `AGENTS.md`
- Backend: `.env`, `config/*.php` (13 config files: app, auth, cache, cors, database, filesystems, logging, mail, media-library, queue, sanctum, services, session)
- Frontend: `.env.local`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`
- Shared: `tsconfig.json`
