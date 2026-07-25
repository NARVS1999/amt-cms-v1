# Tech Stack — Adsvance Media Tech CMS (AMT_V2)

## Languages & Runtimes

| Layer | Language | Runtime | Version |
|-------|----------|---------|---------|
| Backend | PHP | CLI (php artisan) | ^8.2 |
| Frontend | TypeScript | Node.js | ^22 (types) |
| Shared | TypeScript | — | — |
| Database | SQL (MySQL/MariaDB primary, SQLite test) | — | — |

## Frameworks

| Layer | Framework | Version | Notes |
|-------|-----------|---------|-------|
| Backend | Laravel | ^12.0 | Flat structure, no DDD |
| Backend (API Auth) | Laravel Sanctum | ^4.3 | Token-based SPA auth |
| Frontend | Next.js | ^16.0.0 | SSG only (`output: 'export'`) |
| Frontend (UI) | React | ^19.0.0 | — |
| Frontend (styling) | Tailwind CSS | ^4.0.0 | — |
| Frontend (components) | @base-ui/react | ^1.6.0 | Headless UI primitives |
| Shared | Zod | ^3.23.0 | API contract validation |

## Key Dependencies

### Backend — `apps/backend/composer.json`

| Package | Version | Purpose |
|---------|---------|---------|
| `laravel/framework` | ^12.0 | Core framework |
| `laravel/sanctum` | ^4.3 | API token auth |
| `laravel/tinker` | ^2.10.1 | REPL |
| `spatie/laravel-medialibrary` | ^11.23 | File uploads, conversions, responsive images |
| `spatie/laravel-query-builder` | * | API query filtering/sorting (not yet actively used) |
| `phpunit/phpunit` | ^11.5.3 | Testing |
| `laravel/pint` | ^1.13 | PHP CS fixer |
| `mockery/mockery` | ^1.6 | Mocking |
| `nunomaduro/collision` | ^8.6 | CLI error handling |
| `fakerphp/faker` | ^1.23 | Test data |
| `laravel/sail` | ^1.41 | Docker dev env |

### Frontend — `apps/frontend/package.json`

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.0.0 | SSG framework |
| `react` / `react-dom` | ^19.0.0 | UI library |
| `@base-ui/react` | ^1.6.0 | Headless UI primitives |
| `tailwindcss` | ^4.0.0 | Utility CSS |
| `@tailwindcss/postcss` | ^4.0.0 | PostCSS plugin for Tailwind v4 |
| `lucide-react` | ^1.25.0 | Admin panel icons |
| `@fortawesome/fontawesome-free` | ^6.7.0 | Public site icons |
| `quill` | ^2.0.3 | Rich text editor (blog) |
| `class-variance-authority` | ^0.7.1 | Component variant management |
| `clsx` | ^2.1.1 | Classname merging |
| `tailwind-merge` | ^3.6.0 | Tailwind class dedup |
| `tw-animate-css` | ^1.4.0 | Tailwind animation plugin |
| `typescript` | ^5.7.0 | Type checking |

### Shared — `packages/shared/package.json`

| Package | Version | Purpose |
|---------|---------|---------|
| `zod` | ^3.23.0 | Schema validation, shared API contract types |

## Build & Dev Tooling

### Package Manager

npm workspaces monorepo root (`package.json` defines `workspaces: ["apps/backend", "apps/frontend", "packages/shared"]`).

### Commands

| Scope | Command | Action |
|-------|---------|--------|
| Backend | `php artisan serve` | Dev server (port 8000) |
| Backend | `php artisan test` | Run all PHPUnit tests |
| Backend | `php artisan test --filter=TestsName` | Single test file |
| Backend | `php artisan migrate` | Run migrations |
| Backend | `php artisan queue:listen` | Process queue jobs |
| Backend | `php artisan pail` | Log watcher |
| Backend | `./vendor/bin/pint` | PHP CS fixer |
| Frontend | `npm run dev` | Next.js dev server |
| Frontend | `npm run build` | SSG build (`next build`) |
| Frontend | `npm run lint` | ESLint (`next lint`) |
| Frontend | `npx tsc --noEmit` | TypeScript type check |
| Shared | (none) | Consumed as workspace dep, no build step |

### CI / Testing Model

- **PHPUnit** with SQLite `:memory:` (from `phpunit.xml`) — tests run against in-memory DB with `RefreshDatabase` trait per class
- **No E2E or Playwright** tests detected
- **No GitHub Actions or CI config** detected in repo root

## Configuration Files

### Root

| File | Purpose |
|------|---------|
| `package.json` | npm workspaces manifest |
| `AGENTS.md` | AI agent conventions, rules, commands |

### Backend — `apps/backend/`

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable template |
| `phpunit.xml` | Test config (SQLite :memory:) |
| `config/app.php` | App name, env, debug, timezone, locale |
| `config/auth.php` | Auth guards (session), user providers |
| `config/database.php` | DB connections (sqlite/mysql/mariadb/pgsql/sqlsrv + redis) |
| `config/filesystems.php` | Disk config (local/public/s3) |
| `config/cache.php` | Cache stores (array/database/file/memcached/redis/dynamodb) |
| `config/session.php` | Session driver (database default), lifetime, cookie |
| `config/mail.php` | Mailers (smtp/ses/postmark/resend/sendmail/log/array) |
| `config/queue.php` | Queue connections (sync/database/beanstalkd/sqs/redis) |
| `config/logging.php` | Log channels (stack/single/daily/slack/papertrail/etc.) |
| `config/sanctum.php` | API auth: stateful domains, expiration (1440 min), middleware |
| `config/media-library.php` | Spatie Media Library: disk, conversions, image optimizers, queue |
| `config/services.php` | 3rd-party services (postmark/ses/resend/slack) |
| `config/cors.php` | CORS: paths `api/*, sanctum/csrf-cookie`, credentials true |

### Frontend — `apps/frontend/`

| File | Purpose |
|------|---------|
| `next.config.ts` | SSG output, unoptimized images |
| `tsconfig.json` | TypeScript config (ES2017 target, bundler resolution) |

### Shared — `packages/shared/`

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config (ES2022, declaration + composite) |
