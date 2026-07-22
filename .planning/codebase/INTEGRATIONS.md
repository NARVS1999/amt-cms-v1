# Integrations

## External Services

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| (None configured) | — | — |

All external integrations are optional or future. The current codebase is self-contained.

## Database

| Environment | Driver | Connection |
|-------------|--------|------------|
| Development | SQLite | `database/database.sqlite` (`DB_CONNECTION=sqlite`) |
| Testing | SQLite | `:memory:` (in-memory, per-test) |
| Production | MySQL | Configured via `.env` `DB_CONNECTION=mysql` |

**Migrations** (`apps/backend/database/migrations/`): 15 migrations covering:
- `users`, `cache`, `jobs` (Laravel defaults)
- `personal_access_tokens` (Sanctum)
- `media` (Spatie Media Library)
- `contact_messages`, `subscribers`
- `marketing_services`, `marketing_team_members`
- `theme_settings`
- `marketing_pages`
- `media_libraries`
- `billing_pricing_plans`, `billing_plan_features`
- `marketing_blog_posts`

## Auth Provider

**Laravel Sanctum** (`config/sanctum.php`):
- Token-based API auth
- Stateless (no session cookies)
- Token stored client-side in `localStorage` under `admin_token`
- Login at `POST /api/admin/login`, logout at `POST /api/logout`

## File Storage

**Spatie Media Library** (`config/media-library.php`):
- Disk: `public` (local, configurable via `MEDIA_DISK` env)
- Max file size: 10 MB
- Image optimization pipeline (Jpegoptim, Pngquant, Optipng, Svgo, Gifsicle, Cwebp, Avifenc)
- Responsive image generation with blur placeholders
- Supports video/pdf/svg thumbnails via FFmpeg (optional)
- S3-compatible remote disk support via config

## Email / Notifications

- Mail driver: `array` in testing (logged, not sent)
- Production mail: configurable via `.env` (`MAIL_MAILER`, `MAIL_HOST`, etc.)
- Contact form: `POST /api/contact` (throttled)
- Newsletter: `POST /api/subscribe` (throttled)

## Queue

- Default driver: `sync` (inline execution)
- Configurable via `.env` (`QUEUE_CONNECTION`)
- Used by Spatie Media Library for image conversions
