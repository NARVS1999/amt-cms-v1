# Adsvance Media Tech CMS

A clean, reusable content management system built on Laravel 12 + Next.js 16 that powers Adsvance's own marketing site and serves as a ready-made foundation for client projects.

## Architecture

```
AMT_V2/
├── apps/
│   ├── backend/       # Laravel 12 REST API
│   └── frontend/      # Next.js 16 SSG (shadcn admin + public site)
├── packages/
│   └── shared/        # @amt/shared — Zod schemas
├── docs/              # Architecture, PRDs, UX specs
├── stories/           # User stories and sprint tracking
└── .planning/         # GSD planning artifacts
```

- **Backend:** PHP 8.2, Laravel 12, Sanctum auth, Spatie Media Library 11
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui components
- **Shared:** Zod 3.x schemas for API contract validation
- **Database:** MariaDB/MySQL 8.x
- **Deployment:** Hostinger — Laravel in `~/laravel_app/`, static frontend in `~/public_html/`

## Quick Start

```bash
# Backend
cd apps/backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve        # http://localhost:8000

# Frontend (separate terminal)
cd apps/frontend
npm install
npm run dev              # http://localhost:3000

# Shared package
cd packages/shared
npm install
```

## Key Principles

- **SSG only** — `output: 'export'`, no server-side rendering
- **REST API contract** — `{ "data": ... }` envelope, Zod-validated
- **Spatie Media Library** for all file uploads
- **Eloquent ORM only** — no raw SQL
- **CSS custom properties** — no hardcoded brand colors

## Admin Panel

Login at `/admin/login` (email/password via Laravel Sanctum). Manage services, pricing plans, team members, blog posts, pages, media, and theme settings.

## License

MIT
