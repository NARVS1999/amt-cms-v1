# Structure

## Root Directory

```
AMT_V2/
├── apps/
│   ├── backend/              # Laravel 12 REST API
│   └── frontend/             # Next.js 16 SSG site
├── packages/
│   └── shared/               # @amt/shared — Zod schemas
├── docs/                     # PRDs, architecture docs, UX designs
├── stories/                  # Story files for incremental dev
├── legacy/                   # Old static prototype files
├── .planning/                # GSD planning artifacts
├── package.json              # npm workspaces root
└── AGENTS.md                 # Agent guide
```

## Backend Structure (`apps/backend/`)

```
apps/backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php          # Base controller
│   │   │   └── Api/
│   │   │       ├── Admin/
│   │   │       │   └── StatsController.php
│   │   │       ├── AdminAuthController.php
│   │   │       ├── BlogPostController.php
│   │   │       ├── ContactController.php
│   │   │       ├── MediaController.php
│   │   │       ├── PageController.php
│   │   │       ├── PricingPlanController.php
│   │   │       ├── ServiceController.php
│   │   │       ├── SubscribeController.php
│   │   │       ├── TeamMemberController.php
│   │   │       └── ThemeController.php
│   │   ├── Requests/                   # (empty — validation inline)
│   │   └── Resources/
│   │       └── Api/
│   │           ├── ApiResource.php
│   │           ├── BlogPostResource.php
│   │           ├── PageResource.php
│   │           ├── PricingPlanResource.php
│   │           ├── ServiceResource.php
│   │           └── TeamMemberResource.php
│   ├── Models/
│   │   ├── BlogPost.php
│   │   ├── ContactMessage.php
│   │   ├── Media.php
│   │   ├── MediaLibrary.php
│   │   ├── Page.php
│   │   ├── PlanFeature.php
│   │   ├── PricingPlan.php
│   │   ├── Service.php
│   │   ├── Subscriber.php
│   │   ├── TeamMember.php
│   │   ├── ThemeSetting.php
│   │   └── User.php
│   ├── Providers/
│   └── Traits/
│       └── ApiResponse.php
├── bootstrap/
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── cors.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── mail.php
│   ├── media-library.php
│   ├── queue.php
│   ├── sanctum.php
│   ├── services.php
│   └── session.php
├── database/
│   ├── factories/
│   │   └── Models/                     # Model factories
│   │       ├── PricingPlanFactory.php
│   │       ├── ServiceFactory.php
│   │       └── ...
│   ├── migrations/                     # 15 migration files
│   └── seeders/
├── routes/
│   ├── api.php                         # All API routes
│   ├── web.php
│   └── console.php
├── tests/
│   ├── Feature/
│   │   ├── BlogPostsTest.php
│   │   ├── ContactSubscribeTest.php
│   │   ├── MediaTest.php
│   │   ├── PagesTest.php
│   │   ├── PricingPlansTest.php
│   │   ├── ServicesTest.php
│   │   ├── StatsTest.php
│   │   └── TeamMembersTest.php
│   ├── Unit/
│   └── TestCase.php
├── composer.json
├── phpunit.xml
└── vite.config.js
```

## Frontend Structure (`apps/frontend/`)

```
apps/frontend/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Home page
│   │   └── not-found.tsx
│   ├── admin/
│   │   ├── layout.tsx                 # Admin layout with sidebar
│   │   ├── page.tsx                   # Admin landing
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── team/
│   │   │   └── page.tsx
│   │   ├── pages/
│   │   │   └── page.tsx
│   │   ├── pricing-plans/
│   │   │   └── page.tsx
│   │   ├── blog-posts/
│   │   │   └── page.tsx
│   │   └── media/
│   │       └── page.tsx
│   ├── globals.css
│   └── layout.tsx                    # Root layout
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx
│   │   └── stats-overview.tsx
│   ├── ui/                           # shadcn-style primitives
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ServicesGrid.tsx
│   ├── TeamGrid.tsx
│   ├── PricingTable.tsx
│   ├── BlogEditor.tsx
│   ├── PageRenderer.tsx
│   ├── ThemeProvider.tsx
│   └── BackToTop.tsx
├── lib/
│   ├── api.ts                        # Public API fetchers
│   ├── admin-api.ts                  # Admin CRUD API client
│   └── utils.ts
├── public/
├── next.config.ts                    # output: 'export'
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Shared Package (`packages/shared/`)

```
packages/shared/
├── src/
│   ├── index.ts                      # Re-exports all schemas
│   └── schemas/
│       ├── blog-post.ts
│       ├── contact.ts
│       ├── page.ts
│       ├── pricing-plan.ts
│       ├── service.ts
│       ├── subscriber.ts
│       ├── team-member.ts
│       └── theme.ts
├── dist/                             # Compiled output
├── package.json
└── tsconfig.json
```

## Key Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Models | Singular PascalCase | `PricingPlan`, `PlanFeature` |
| Tables | Plural snake_case with prefix | `billing_pricing_plans`, `marketing_services` |
| Migrations | `{timestamp}_{action}_{table}` | `2026_07_21_000001_create_billing_pricing_plans_table` |
| API routes | kebab-case, plural | `GET /api/pricing-plans`, `POST /api/contact` |
| API Resources | App\Http\Resources\Api\* | `PricingPlanResource` |
| Factories | Database\Factories\Models\* | `PricingPlanFactory` |
| Frontend components | PascalCase | `ServicesGrid`, `PricingTable` |
| Admin pages | kebab-case under `app/admin/` | `app/admin/pricing-plans/page.tsx` |
| Admin API functions | camelCase in `lib/admin-api.ts` | `fetchPricingPlans()`, `createPricingPlan()` |
