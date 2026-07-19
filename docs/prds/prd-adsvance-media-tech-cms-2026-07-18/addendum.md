# Addendum: Technical Architecture & Build Plan

*Companion to PRD: Adsvance Media Tech CMS v1.0*

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    MONOREPO ROOT                           │
│  package.json (npm workspaces)                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  apps/                                                     │
│  ├── backend/              Laravel 12 (REST API)           │
│  │   ├── app/Models/      Eloquent models                 │
│  │   ├── app/Http/Controllers/Api/  API controllers       │
│  │   ├── app/Http/Resources/Api/    API resources         │
│  │   └── routes/api.php   API routes                      │
│  │                                                            │
│  └── frontend/            Next.js 16 App Router (SSG)      │
│      ├── app/             Page routes + admin pages        │
│      ├── components/      Reusable UI + shadcn/ui         │
│      └── lib/             API client, theme context        │
│                                                            │
│  packages/                                                  │
│  └── shared/              Zod schemas, shared TypeScript   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Key Decision: Why SSG (Static Site Generation)

Both Laravel and Next.js run on Hostinger shared hosting. Next.js in SSG mode (`output: 'export'`) produces a folder of flat HTML, CSS, and JS files that Hostinger's Apache/Nginx serves directly — no Node.js runtime required. The build runs locally (or in CI). Benefits:

- Zero server-side Node.js cost
- Fastest possible page load (pre-built files)
- Same deployment model as the current legacy static site
- No server-side crashes or cold starts

The tradeoff: content changes require a rebuild + redeploy. For a marketing site updated weekly, this is acceptable. A CI pipeline (GitHub Actions) can make this a one-command or git-push-triggered operation.

---

## 2. Database Schema (Migrations)

### marketing_pages
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| title | string(255) | |
| slug | string(255) | unique, indexed |
| hero_heading | text | nullable |
| hero_subtext | text | nullable |
| hero_image_id | foreignId→media | nullable |
| sections | json | nullable, flexible content blocks |
| meta | json | nullable, SEO fields for v1.1 |
| is_published | boolean | default true |
| sort_order | integer | default 0 |
| timestamps | | |

### marketing_services
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| title | string(255) | |
| description | text | |
| icon | string(255) | Font Awesome class name |
| sort_order | integer | default 0 |
| timestamps | | |

### marketing_team_members
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| name | string(255) | |
| role | string(255) | |
| bio | text | nullable |
| photo_id | foreignId→media | nullable |
| sort_order | integer | default 0 |
| timestamps | | |

### marketing_blog_posts
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| title | string(255) | |
| slug | string(255) | unique, indexed |
| content | longText | rich HTML (Quill) |
| excerpt | text | nullable |
| featured_image_id | foreignId→media | nullable |
| published_at | timestamp | nullable |
| is_published | boolean | default false |
| timestamps | | |

### billing_pricing_plans
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| name | string(255) | |
| price | decimal(10,2) | PHP |
| is_popular | boolean | default false |
| cta_text | string(255) | default "See more" |
| sort_order | integer | default 0 |
| timestamps | | |

### billing_plan_features
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| pricing_plan_id | foreignId→pricing_plans | cascade delete |
| description | string(255) | |
| is_included | boolean | default true |
| sort_order | integer | default 0 |
| timestamps | | |

### contact_messages
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| name | string(255) | |
| email | string(255) | |
| message | text | |
| read_at | timestamp | nullable |
| timestamps | | |

### subscribers
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| email | string(255) | unique |
| subscribed_at | timestamp | |
| timestamps | | |

### theme_settings
| Column | Type | Notes |
|--------|------|-------|
| id | bigIncrements | |
| key | string(255) | unique |
| value | text | |
| type | string(50) | color/font/image/text |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 3. Theme System Implementation

The theme system works in three layers:

1. **Storage:** `ThemeSetting` model stores key-value pairs (e.g., `primary_color` → `#ff0000`).
2. **API:** `GET /api/theme` returns all settings as a flat JSON object.
3. **Frontend:** At build time, `getStaticProps` fetches `/api/theme` and passes the values to a `ThemeProvider` component that writes CSS custom properties into the global stylesheet.

```typescript
// In ThemeProvider (simplified):
const theme = {
  primaryColor: '#ff0000',
  secondaryColor: '#fb3d03',
  accentColor: '#FFC107',
  bodyFont: 'Poppins',
  headingFont: 'Poppins',
};

// Generates:
// :root {
//   --color-primary: #ff0000;
//   --color-secondary: #fb3d03;
//   --color-accent: #FFC107;
//   --font-body: 'Poppins', sans-serif;
//   --font-heading: 'Poppins', sans-serif;
// }
```

Tailwind config extends from these variables:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        body: ['var(--font-body)'],
        heading: ['var(--font-heading)'],
      },
    },
  },
};
```

### Default Theme (Legacy Match)
| Setting | Value |
|---------|-------|
| primary_color | `#ff0000` |
| secondary_color | `#fb3d03` |
| accent_color | `#FFC107` |
| body_font | `Poppins` |
| heading_font | `Poppins` |

---

## 4. Build Plan — 7-Day Sprint

### Day 1: Scaffold + Schema
- Initialize monorepo (package.json with npm workspaces)
- `laravel new apps/backend` — Laravel 12 (current LTS)
- Configure `.env` for local XAMPP MySQL (MariaDB 10.4)
- Create all migration files (10 tables)
- `npx create-next-app@latest apps/frontend` — Next.js 16 App Router
- Configure `output: 'export'` in `next.config.js`
- Create `packages/shared` with initial Zod schemas

### Day 2: Models + Admin API + Admin UI
- Create all Eloquent models with relationships
- Create admin API controllers in Laravel for: Services, PricingPlans, PlanFeatures, TeamMembers, BlogPosts, Pages, ThemeSettings
- Create admin pages in Next.js with shadcn/ui (table views, CRUD forms)
- Create seeder with legacy sample content

### Day 3: Public API Layer
- Create API controllers for all public endpoints
- Create FormRequest validation classes for POST endpoints
- Create API Resources (transformers) for consistent JSON output
- Implement rate limiting on POST endpoints
- Configure CORS
- Install Spatie Media Library
- Create `packages/shared` Zod schemas mirroring Laravel validation

### Day 4: Next.js Foundation
- Configure Tailwind CSS with theme CSS custom properties
- Build `ThemeProvider` component
- Build API client library (`lib/api.ts`)
- Build layout components: Header (with mobile hamburger), Footer
- Implement responsive mobile navigation (slide-out drawer)
- Back-to-top floating button component
- Set up Font Awesome icon library

### Day 5: Frontend Pages
- Homepage: hero section, services grid, about section, video embed
- Pricing table (3-column, responsive)
- Blog listing page with excerpt cards
- Single blog post page with rich content rendering
- Team member grid
- 404 page

### Day 6: Contact + Polish
- Contact form component (name, email, message fields)
- Newsletter subscribe form component
- Form validation + error states
- Success/confirmation states
- Mobile responsiveness audit across all pages
- Cross-browser testing
- Content security: HTML sanitization on blog content

### Day 7: Deploy Prep
- Build scripts (npm run build → out/ folder)
- Hostinger deploy documentation
- README with setup instructions
- Final test: swap theme colors, verify full repaint
- Verify SSG export produces clean output
- Tag v1.0 release

---

## 5. Local Development Setup

### Prerequisites
- PHP 8.2+ (installed: 8.2.12 ✅)
- Composer 2.x (installed: 2.8.9 ✅)
- Node.js 18+ (installed: v20.17.0 ✅)
- MySQL/MariaDB (available via XAMPP at `C:\xampp\mysql\bin\` - MariaDB 10.4)

### Quick Start
```bash
# Clone and install
git clone <repo-url> adsvance-media-tech-cms
cd adsvance-media-tech-cms

# Backend setup
cd apps/backend
cp .env.example .env
# Edit .env: DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD for XAMPP
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Frontend setup
cd ../frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev

# In another terminal - serve backend
cd apps/backend
php artisan serve
```

---

## 6. Deployment to Hostinger

### Laravel Backend
1. Zip the `apps/backend` directory (excluding `node_modules`, `.git`, storage debug files)
2. Upload via Hostinger File Manager or FTP to `public_html/`
3. Set up MySQL database in Hostinger cPanel
4. Configure `.env` with production database credentials
5. Run `php artisan migrate --seed`
6. Set storage directory permissions to 755

### Next.js Frontend
1. Run `npm run build` locally (produces `apps/frontend/out/`)
2. Upload contents of `out/` folder to Hostinger `public_html/` (or a subdirectory)
3. Ensure `public_html/.htaccess` rewrites to `index.html` for client-side routing (blog posts, etc.)

### CI Pipeline (Future Enhancement)
GitHub Actions workflow: on push to `main`, build both apps and deploy via FTP. Not implemented for v1 launch but straightforward to add.

---

## 7. Package Choices

> **Version note (Jul 2026):** The versions below have been verified against current package registries and supersede any earlier version references in the PRD or this document. See `docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md` (Stack section) for the full rationale on each bump.

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| Laravel | 12.x | Backend framework — current LTS (security until Feb 2027) | MIT |
| Spatie Media Library | 11.x | File/media management | MIT |
| Spatie Laravel Permission | 6.x | Role-based access (v1.1 deferred) | MIT |
| Laravel Debugbar | 3.x | Local dev debugging | MIT |
| Next.js | 16.2.10 | Frontend framework — current LTS (replaces v14) | MIT |
| shadcn/ui | Latest | UI component library (admin panel) | MIT |
| Tailwind CSS | 4.x | Utility CSS (replaces v3) | MIT |
| React | 19.x | UI library (bundled with Next.js 16) | MIT |
| TypeScript | 5.x | Type safety for frontend | Apache 2.0 |
| Quill.js | 2.x | Rich text editor | BSD-3-Clause |
| Font Awesome Free | 6.x | Icons (public site) | CC BY 4.0 + MIT |
| Zod | 3.x | Schema validation (shared) | MIT |
| HTMLPurifier | 4.x | Rich text sanitization | LGPL |

All packages are free, open-source, and require no paid licenses.

---

*Prepared 2026-07-18. Companion to PRD: Adsvance Media Tech CMS v1.0.*
