# Adsvance CMS — Backend

Laravel 12 REST API powering the Adsvance Media Tech CMS.

## Tech Stack

- PHP 8.2 / Laravel 12
- MariaDB/MySQL 8.x
- Laravel Sanctum (token auth)
- Spatie Media Library 11.x

## Quick Start

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Testing

```bash
php artisan test
```

Uses SQLite `:memory:` — no external database needed for tests.

## API

All routes in `routes/api.php`. Public GET endpoints at `/api/*`, admin CRUD behind `auth:sanctum`. See `docs/API.md` in the project root for the full reference.

## Key Directories

| Path | Purpose |
|------|---------|
| `app/Models/` | 12 Eloquent models |
| `app/Http/Controllers/Api/` | REST controllers |
| `app/Http/Resources/Api/` | JSON resource classes |
| `app/Http/Requests/` | FormRequest validation |
| `database/migrations/` | 15 migrations |
| `tests/Feature/` | 53+ PHPUnit feature tests |
| `routes/api.php` | All API route definitions |
