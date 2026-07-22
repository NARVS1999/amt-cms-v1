# Constraints

## Hosting
- **Hostinger Business Shared** — no Node.js runtime on server
- Frontend is static HTML/CSS/JS only
- Laravel lives at `~/laravel_app/`, static files at `~/public_html/`
- MySQL database (MariaDB 10.4 dev, MySQL 8.x prod)
- No Redis — DB-backed queue and rate limiting

## Budget
- Zero-cost software mandate — all packages free/open-source
- No paid APIs or SaaS subscriptions

## Technical
- PHP 8.2 runtime
- No DDD — flat Laravel MVC structure
- No server-side rendering — SSG only
- All visual tokens through CSS custom properties — ZERO hardcoded brand colors
- No direct file storage — Spatie Media Library only
- No raw SQL — Eloquent ORM only
- All API validation in Laravel FormRequest classes
- React Server Components by default (no client library)
- No emoji as UI icons

## Content
- Single admin user in v1
- Content is "ready" after save, "live" after deploy
- Contact message management deferred to v1.1
- Subscriber management deferred to v1.1
- Not multi-tenant — each client gets own deployment
- English only — no multilingual support
- Not e-commerce — no cart, payments, or inventory

## Version Constraints (verified Jul 2026)
- Laravel 12.x (security until Feb 2027)
- Next.js 16.2.10 LTS
- React 19.x
- Tailwind CSS 4.x (CSS-first config)
- Spatie Media Library 11.x
