# Integrations — Adsvance Media Tech CMS (AMT_V2)

## External Services

| Service | Integration Point | Config Env Var | Status |
|---------|-----------------|----------------|--------|
| **AWS S3** | Filesystem disk for media storage | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET` | Configured but **default is local** (`FILESYSTEM_DISK=local`) |
| **AWS SES** | Email transport | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION` | Configured mailer, not default |
| **Postmark** | Email transport + services config | `POSTMARK_TOKEN` | Configured mailer, not default |
| **Resend** | Email transport + services config | `RESEND_KEY` | Configured mailer, not default |
| **Slack** | Log channel + error notifications | `LOG_SLACK_WEBHOOK_URL`, `SLACK_BOT_USER_OAUTH_TOKEN` (services) | Configured but not default |
| **Papertrail** | Log channel | `PAPERTRAIL_URL`, `PAPERTRAIL_PORT` | Configured, not default |
| **Redis** | Cache, session, queue driver option | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Configured but **not default** |
| **Memcached** | Cache driver option | `MEMCACHED_HOST`, `MEMCACHED_PORT` | Listed in config, not default |
| **DynamoDB** | Cache driver option | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DYNAMODB_CACHE_TABLE` | Listed in config, not default |
| **Amazon SQS** | Queue driver option | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SQS_PREFIX`, `SQS_QUEUE` | Listed in config, not default |

All external services are **optional** — the app works out of the box with local defaults (log mailer, SQLite database, local filesystem, database queue).

## Database

### Connections

| Environment | Driver | Default DB | Notes |
|-------------|--------|-----------|-------|
| **local/dev** | MariaDB (env default) | `adsvance_cms` | `DB_CONNECTION=mariadb` in `.env.example` |
| **testing** | SQLite | `:memory:` | Set in `phpunit.xml` — migrations run per test class |
| **production** | Configurable | Configurable | Supports mysql, mariadb, pgsql, sqlsrv |

### Config Details

- **Default connection:** `DB_CONNECTION` env var, falls back to `sqlite`
- **File location (sqlite):** `database/database.sqlite`
- **Charset (mysql/mariadb):** `utf8mb4` / `utf8mb4_unicode_ci`
- **Migration table:** `migrations`
- **Redis** configured with `phpredis` client, default and cache connections (DB 0 and DB 1)

## Auth Provider

### Mechanism: Laravel Sanctum (Token-based)

| Aspect | Detail |
|--------|--------|
| **Package** | `laravel/sanctum` ^4.3 |
| **Strategy** | Bearer token (plain-text API tokens) |
| **Guard** | `web` (session-based under the hood for stateful, but API uses tokens) |
| **Token expiry** | 24 hours default, 30 days with `remember=true` |
| **Stateful domains** | `localhost, localhost:3000, 127.0.0.1, 127.0.0.1:8000, ::1` + app URL |
| **Token prefix** | Configurable via `SANCTUM_TOKEN_PREFIX` |

### Auth Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/admin/login` | Public (throttled) | Login, returns `{ data: { token, user } }` |
| POST | `/api/logout` | `auth:sanctum` | Revoke current token |
| GET | `/api/me` | `auth:sanctum` | Current user info |
| POST | `/api/forgot-password` | Public (throttled: 3/1min) | Send reset link |
| POST | `/api/reset-password` | Public | Reset password |

### Admin CRUD Protection

All mutating endpoints (POST/PUT/DELETE for services, team, pages, pricing plans, blog posts, media, and the stats endpoint) are inside `Route::middleware('auth:sanctum')`.

### Frontend Auth

- Token stored in `localStorage` under `admin_token`
- `Authorization: Bearer <token>` header sent on all admin API requests
- `401` responses trigger automatic token clear and redirect to login
- Admin login page at `/admin/login`, forgot-password at `/admin/forgot-password`

## File Storage

### Spatie Media Library (v11.23)

| Setting | Value |
|---------|-------|
| **Default disk** | `public` (local) — configurable via `MEDIA_DISK` |
| **Conversions disk** | Same as source — configurable via `MEDIA_CONVERSIONS_DISK` |
| **Max file size** | 10 MB (`1024 * 1024 * 10`) |
| **Image driver** | GD (default) — configurable to imagick or vips via `IMAGE_DRIVER` |
| **Queue conversions** | Enabled by default (`QUEUE_CONVERSIONS_BY_DEFAULT=true`) |
| **Queue connection** | From `QUEUE_CONNECTION` (default: `sync` for testing, `database` for dev) |
| **FFMPEG** | Configured at `/usr/bin/ffmpeg` for video thumbnails (900s timeout) |

### Image Optimizers

| Optimizer | Settings |
|-----------|----------|
| **Jpegoptim** | Quality 85%, progressive, strip all metadata |
| **Pngquant** | Force compression |
| **Optipng** | Level 2 optimization, non-interlaced |
| **Svgo** | Disable cleanupIDs |
| **Gifsicle** | Level 3 optimization |
| **Cwebp** | Method 6, 10 passes, quality 90, multithreaded |
| **Avifenc** | CQ level 23, SSIM tuning, all cores |

### Responsive Images

- **Width calculator:** `FileSizeOptimizedWidthCalculator` (30% reduction per variant)
- **Tiny placeholders:** Enabled (`Blurred` generator)
- **Loading attribute:** Not set by default

### Media Models

| Model | Table | Notes |
|-------|-------|-------|
| `App\Models\Media` | `media` | Custom model extending Spatie's Media |
| `App\Models\MediaLibrary` | `media_libraries` | Custom media library model |

### Frontend Media

- Admin media browser at `/admin/media`
- Routes: `GET /api/media`, `POST /api/media` (multipart upload), `DELETE /api/media/{id}`
- Returns `{ data: { id, name, file_name, size, mime_type, url, thumbnail, created_at } }`

## Email / Notifications

### Mail Configuration

| Setting | Default | Notes |
|---------|---------|-------|
| **Default mailer** | `log` | Writes to `storage/logs/laravel.log` in dev |
| **From address** | `hello@example.com` | Configurable via `MAIL_FROM_ADDRESS` |
| **From name** | App name | Configurable via `MAIL_FROM_NAME` |

### Mailers Available

| Mailer | Transport | When to use |
|--------|-----------|-------------|
| `smtp` | SMTP | Any SMTP provider |
| `ses` | AWS SES | Production with AWS |
| `postmark` | Postmark API | Production with Postmark |
| `resend` | Resend API | Production with Resend |
| `sendmail` | Local sendmail | Local only |
| `log` | Log file | Dev/testing |
| `array` | Memory | Testing |
| `failover` | smtp → log | Resilience |

### Current Email Usage

- **Contact form** (`POST /api/contact`): Stores to `contact_messages` table only — **no email notification sent** (no Mailables found)
- **Password reset** (`POST /api/forgot-password`): Generates token, returns it in response — **no actual email sending configured** (uses token-based reset with no Mailable)
- **No Notification classes** exist in the codebase
- **Subscriber** model exists but no email workflows implemented yet

## Queue

### Configuration

| Setting | Default | Notes |
|---------|---------|-------|
| **Default connection** | `database` | Uses `jobs` table |
| **Failed jobs** | `database-uuids` | Stored in `failed_jobs` table |
| **Job batching** | Enabled | Uses `job_batches` table |

### Queue Connections Available

| Driver | When used |
|--------|-----------|
| `sync` | Testing (phpunit.xml sets `QUEUE_CONNECTION=sync`) |
| `database` | Dev/production default |
| `beanstalkd` | Alternative option |
| `sqs` | AWS production option |
| `redis` | Redis-based option |

### What Uses the Queue

- **Spatie Media Library conversions** — image conversions and responsive image generation are queued by default (`queue_conversions_by_default: true`)
- **No custom jobs** detected in the codebase

### Dev Server

The `composer.json` `dev` script runs concurrently:
```
php artisan serve
php artisan queue:listen --tries=1
php artisan pail --timeout=0
npm run dev (Vite)
```
