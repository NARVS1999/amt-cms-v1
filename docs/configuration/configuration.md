# Configuration

## Backend Environment

The Laravel backend uses `.env` at `apps/backend/.env`. Copy from `.env.example`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

### Key Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `local` | Environment (`local`, `production`) |
| `APP_DEBUG` | `true` | Enable error detail (disable in production) |
| `APP_URL` | `http://localhost:8000` | Backend base URL |
| `DB_CONNECTION` | `mariadb` | Database driver (`mariadb` or `mysql`) |
| `DB_HOST` | `127.0.0.1` | Database host |
| `DB_PORT` | `3306` | Database port |
| `DB_DATABASE` | `adsvance_cms` | Database name |
| `SESSION_DRIVER` | `database` | Session storage |
| `QUEUE_CONNECTION` | `database` | Queue driver (database-based) |
| `CACHE_STORE` | `database` | Cache driver |
| `MAIL_MAILER` | `log` | Mail driver (`log` for dev, `smtp` for production) |
| `FILESYSTEM_DISK` | `local` | Storage disk |

### Rate Limiting

Configured in `AppServiceProvider`:
- Contact form: 5 requests per minute
- Newsletter subscribe: 3 requests per minute
- Admin login: 5 requests per minute

## Frontend Environment

The Next.js frontend uses `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`). Set via `.env.local` at `apps/frontend/` or at build time.

## Backend Config Files

All at `apps/backend/config/`:

| File | Purpose |
|------|---------|
| `app.php` | App name, URL, timezone, locale |
| `auth.php` | Authentication guards, Sanctum config |
| `database.php` | MySQL/MariaDB connection settings |
| `session.php` | Database-backed session driver |
| `cache.php` | Database cache store |
| `queue.php` | Database queue driver |
| `mail.php` | SMTP/log mail driver |
| `filesystems.php` | Local disk, Spatie media disk |
| `media-library.php` | Spatie Media Library 11.x config |
| `sanctum.php` | Sanctum token expiration, middleware |
| `cors.php` | CORS settings for frontend origin |
| `logging.php` | Log channels and levels |
| `services.php` | Third-party service credentials |

## Frontend Config Files

| File | Purpose |
|------|---------|
| `next.config.ts` | SSG output (`output: 'export'`), unoptimized images |
| `tsconfig.json` | TypeScript strict mode, `@/` path alias |
| `app/globals.css` | Tailwind v4 theme tokens, CSS custom properties |

## Tailwind Theme

Defined in `app/globals.css` using `@theme` directive (Tailwind v4). All brand colors use `var(--color-*)` CSS custom properties, populated at build time from the `/api/theme` endpoint.

## Shared Package

`packages/shared/package.json` has no configuration beyond Zod dependency. TypeScript types are exported from `src/index.ts`.
