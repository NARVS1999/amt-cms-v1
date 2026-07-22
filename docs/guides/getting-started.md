# Getting Started

## Prerequisites

- PHP 8.2+
- Composer 2.x
- Node.js 18+ and npm
- MariaDB 10.4+ or MySQL 8.x
- Git

## Clone and Install

```bash
git clone <repo-url> AMT_V2
cd AMT_V2
```

## Backend Setup

```bash
cd apps/backend

# Install PHP dependencies
composer install

# Environment
cp .env.example .env
php artisan key:generate

# Database
# Create a MariaDB/MySQL database named 'adsvance_cms'
# Update DB_* vars in .env if needed
php artisan migrate

# Storage link (for media uploads)
php artisan storage:link

# Start dev server
php artisan serve
```

The API is now running at `http://localhost:8000`.

## Frontend Setup

```bash
cd apps/frontend

# Install JS dependencies
npm install

# Start dev server
npm run dev
```

The frontend is now running at `http://localhost:3000`.

## Shared Package

```bash
cd packages/shared
npm install
```

## Create Admin User

```bash
cd apps/backend
php artisan tinker
> User::factory()->create(['email' => 'admin@example.com', 'password' => bcrypt('password')])
```

Log in at `http://localhost:3000/admin/login`.

## Verify Everything Works

1. Open `http://localhost:3000` — public site loads
2. Open `http://localhost:8000/api/services` — returns JSON
3. Log in at `/admin/login` — dashboard shows stats
4. Create a service, team member, page, or blog post via admin
5. Run tests: `cd apps/backend && php artisan test`

## Build for Production

```bash
cd apps/frontend
npm run build   # Outputs to out/
```
