# AMT_V2 Directory Structure

## Root Directory

```
AMT_V2/
├── .claude/               # Claude AI configuration and skill overrides
├── .git/                  # Git repository data
├── .gitignore             # Git ignore rules
├── .planning/             # GSD planning artifacts (phases, roadmap, codebase docs)
├── AGENTS.md              # Master agent guide — 8 critical rules, naming conventions, commands
├── README.md              # Project README
├── apps/                  # Application workspaces
│   ├── backend/           # Laravel 12 REST API
│   └── frontend/          # Next.js 16 SSG frontend
├── docs/                  # PRDs, architecture docs, UX specs, error handling
│   ├── SPEC.md            # Implementation spec (API shapes, DB columns, validation)
│   ├── ERROR-HANDLING.md  # Edge cases and error handling patterns
│   ├── project-context.md # Full technology stack rules (84 rules)
│   ├── epics.md           # Acceptance criteria per user story
│   ├── architecture/      # Architecture spine documents
│   ├── configuration/     # Config guides
│   ├── guides/            # Development guides
│   ├── prds/              # Product requirement documents
│   ├── testing/           # Testing guides
│   └── ux-designs/        # UX design specs and experience guides
├── legacy/                # Legacy static assets (pre-CMS)
│   ├── assets/            # Legacy images, CSS, JS
│   ├── index.html         # Old index page
│   └── testingComponent.html  # Old test component
├── node_modules/          # npm dependencies (workspace root)
├── package.json           # npm workspace root config
├── package-lock.json      # Lockfile
├── packages/              # Shared packages
│   └── shared/            # @amt/shared — Zod schemas
└── stories/               # Story files and sprint status
    └── sprint-status.yaml # Current sprint tracking
```

---

## Backend Structure (`apps/backend/`)

```
apps/backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php                  # Base controller
│   │   │   └── Api/
│   │   │       ├── Admin/
│   │   │       │   └── StatsController.php      # GET /api/admin/stats — dashboard counts
│   │   │       ├── AdminAuthController.php       # login, me, logout
│   │   │       ├── BlogPostController.php        # index, show, store, update, destroy
│   │   │       ├── ContactController.php          # store (contact form)
│   │   │       ├── ForgotPasswordController.php   # sendResetLink
│   │   │       ├── MediaController.php            # index, store, destroy
│   │   │       ├── PageController.php              # index, adminIndex, show, store, update, destroy
│   │   │       ├── PricingPlanController.php       # index, adminIndex, store, update, destroy
│   │   │       ├── ResetPasswordController.php     # reset
│   │   │       ├── ServiceController.php           # index, store, update, destroy
│   │   │       ├── SubscribeController.php         # store (newsletter)
│   │   │       ├── TeamMemberController.php        # index, store, update, destroy
│   │   │       └── ThemeController.php             # index
│   │   ├── Requests/
│   │   │   ├── ContactRequest.php              # Form request validation
│   │   │   └── SubscribeRequest.php            # Form request validation
│   │   └── Resources/
│   │       └── Api/
│   │           ├── ApiResource.php             # Base resource (no double-wrap)
│   │           ├── BlogPostResource.php        # BlogPost JSON transform
│   │           ├── PageResource.php            # Page JSON transform
│   │           ├── PricingPlanResource.php     # PricingPlan + features transform
│   │           ├── ServiceResource.php         # Service JSON transform
│   │           └── TeamMemberResource.php      # TeamMember JSON transform
│   ├── Models/
│   │   ├── BlogPost.php          # marketing_blog_posts — Spatie HasMedia
│   │   ├── ContactMessage.php    # contact_contact_messages
│   │   ├── Media.php             # Spatie BaseMedia extension
│   │   ├── MediaLibrary.php      # media_libraries — Spatie HasMedia
│   │   ├── Page.php              # marketing_pages
│   │   ├── PlanFeature.php       # billing_plan_features — BelongsTo PricingPlan
│   │   ├── PricingPlan.php       # billing_pricing_plans — HasMany PlanFeature
│   │   ├── Service.php           # marketing_services
│   │   ├── Subscriber.php        # contact_subscribers
│   │   ├── TeamMember.php        # marketing_team_members — Spatie HasMedia
│   │   ├── ThemeSetting.php      # theme_settings
│   │   └── User.php              # users — HasApiTokens, Notifiable
│   └── Traits/
│       └── ApiResponse.php       # success() and error() JSON response helpers
├── bootstrap/
│   └── app.php
├── config/
│   ├── app.php                   # App configuration
│   ├── auth.php                  # Auth guards, providers
│   ├── cache.php                 # Cache config
│   ├── cors.php                  # CORS settings
│   ├── database.php              # Database connections
│   ├── filesystems.php           # Filesystem disks
│   ├── logging.php               # Log channels
│   ├── mail.php                  # Mail config
│   ├── media-library.php         # Spatie Media Library config
│   ├── queue.php                 # Queue config
│   ├── sanctum.php               # Sanctum config (token expiry, etc.)
│   ├── services.php              # Third-party services
│   └── session.php               # Session config
├── database/
│   ├── factories/
│   │   ├── UserFactory.php               # User factory
│   │   └── Models/
│   │       ├── BlogPostFactory.php        # BlogPost factory
│   │       ├── PageFactory.php            # Page factory
│   │       ├── PlanFeatureFactory.php     # PlanFeature factory
│   │       ├── PricingPlanFactory.php     # PricingPlan factory
│   │       ├── ServiceFactory.php         # Service factory
│   │       └── TeamMemberFactory.php      # TeamMember factory
│   └── migrations/ (15 files)
│       ├── 0001_01_01_000000_create_users_table.php
│       ├── 0001_01_01_000001_create_cache_table.php
│       ├── 0001_01_01_000002_create_jobs_table.php
│       ├── 2026_07_18_144613_create_media_table.php
│       ├── 2026_07_18_145007_create_contact_contact_messages_table.php
│       ├── 2026_07_18_145007_create_contact_subscribers_table.php
│       ├── 2026_07_18_191518_create_personal_access_tokens_table.php
│       ├── 2026_07_19_000001_create_marketing_services_table.php
│       ├── 2026_07_19_000002_create_marketing_team_members_table.php
│       ├── 2026_07_19_115824_create_theme_settings_table.php
│       ├── 2026_07_19_123000_create_marketing_pages_table.php
│       ├── 2026_07_19_125500_create_media_libraries_table.php
│       ├── 2026_07_21_000001_create_billing_pricing_plans_table.php
│       ├── 2026_07_21_000002_create_billing_plan_features_table.php
│       └── 2026_07_21_000003_create_marketing_blog_posts_table.php
├── routes/
│   ├── api.php                    # All API route definitions
│   ├── console.php                # Artisan console commands
│   └── web.php                    # Web routes (empty for API-only app)
├── tests/
│   ├── TestCase.php               # Base test case
│   ├── Feature/
│   │   ├── AuthTest.php           # Auth tests (login, logout, me, forgot/reset password)
│   │   ├── BlogPostsTest.php      # Blog post public endpoint tests
│   │   ├── ContactSubscribeTest.php  # Contact & subscribe endpoint tests
│   │   ├── ExampleTest.php        # Example test
│   │   ├── MediaTest.php          # Media library tests
│   │   ├── PagesTest.php          # Pages endpoint tests
│   │   ├── PricingPlansTest.php   # Pricing plans endpoint tests
│   │   ├── ServicesTest.php       # Services endpoint tests
│   │   ├── StatsTest.php          # Dashboard stats tests
│   │   └── TeamMembersTest.php    # Team member endpoint tests
│   └── Unit/                      # Unit tests (empty)
├── phpunit.xml                    # PHPUnit config (SQLite :memory:)
├── composer.json                  # Composer dependencies
├── artisan                        # Laravel CLI entry point
├── .env.example                   # Environment template
└── .env                           # Environment config
```

---

## Frontend Structure (`apps/frontend/`)

```
apps/frontend/
├── app/
│   ├── layout.tsx                  # Root layout — ThemeProvider, Google Fonts, skip-to-content
│   ├── globals.css                 # CSS variables, Tailwind base, scrollbar, selection styles
│   ├── favicon.ico                 # Site favicon
│   ├── (public)/
│   │   ├── layout.tsx              # Public layout — Header, Footer, BackToTop
│   │   ├── page.tsx                # Homepage — PageRenderer, ServicesGrid, TeamGrid, PricingTable, sections
│   │   └── not-found.tsx           # 404 page with "Go Home" link
│   └── admin/
│       ├── layout.tsx              # Admin layout — Sidebar, auth guard, ToastProvider
│       ├── page.tsx                # Redirects to /admin/dashboard
│       ├── login/
│       │   └── page.tsx            # Login form (email, password, remember me)
│       ├── forgot-password/
│       │   └── page.tsx            # Password reset request form
│       ├── dashboard/
│       │   └── page.tsx            # Admin dashboard with StatsOverview
│       ├── services/
│       │   └── page.tsx            # Services CRUD table + modal form
│       ├── team/
│       │   └── page.tsx            # Team members CRUD table + modal form
│       ├── pages/
│       │   └── page.tsx            # Pages CRUD table + JSON sections editor
│       ├── pricing-plans/
│       │   └── page.tsx            # Pricing plans CRUD table + features editor
│       ├── blog-posts/
│       │   └── page.tsx            # Blog posts CRUD table + BlogEditor (Quill)
│       └── media/
│           └── page.tsx            # Media library grid with upload/delete
├── components/
│   ├── Header.tsx                  # Public site header — nav, mobile drawer, login button
│   ├── Footer.tsx                  # Public site footer — links, newsletter, social icons
│   ├── BackToTop.tsx               # Scroll-to-top floating button
│   ├── ThemeProvider.tsx           # Server component — fetches theme, injects CSS vars
│   ├── PageRenderer.tsx            # Server component — renders page sections (hero, features, cta, content)
│   ├── ServicesGrid.tsx            # Server component — service cards grid
│   ├── TeamGrid.tsx                # Server component — team member cards grid
│   ├── PricingTable.tsx            # Server component — pricing plan cards grid
│   ├── BlogEditor.tsx              # Client component — Quill.js rich text editor
│   ├── admin/
│   │   ├── sidebar.tsx             # Admin sidebar — nav groups (Main, Leads, Settings), logout
│   │   ├── stats-overview.tsx      # Dashboard stat card grid
│   │   └── route-change-loader.tsx # Loading bar on route transitions
│   └── ui/                         # shadcn/ui primitives
│       ├── alert-dialog.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── skeleton.tsx
│       ├── spinner.tsx
│       ├── table.tsx
│       └── toast.tsx
├── lib/
│   ├── api.ts                      # Public data fetching — fetchServices, fetchTeamMembers, fetchPages, fetchPricingPlans, fetchTheme
│   ├── admin-api.ts                # Admin API client — auth, CRUD for all resources, media uploads
│   └── utils.ts                    # cn() helper (clsx + tailwind-merge)
├── next.config.ts                  # Next.js config (output: 'export', images unoptimized)
├── tsconfig.json                   # TypeScript config
├── package.json                    # Frontend dependencies
├── postcss.config.mjs              # PostCSS config (Tailwind)
├── tailwind.config.ts              # Tailwind CSS config
├── tailwindcss-animate.d.ts        # Type declaration for animate plugin
├── .env.local                      # Local env (NEXT_PUBLIC_API_URL)
├── .eslintrc.json                  # ESLint config
└── ...config files
```

---

## Shared Package (`packages/shared/`)

```
packages/shared/
├── package.json                 # @amt/shared v1.0.0 — depends on zod ^3.23
├── tsconfig.json                # TypeScript config
├── README.md                    # Package readme
├── dist/                        # Build output
└── src/
    ├── index.ts                 # Re-exports all schemas
    └── schemas/
        ├── auth.ts              # UserSchema, LoginRequestSchema, LoginResponseSchema, ForgotPasswordRequestSchema, ResetPasswordRequestSchema
        ├── blog-post.ts         # BlogPostSchema, BlogPostsResponseSchema, BlogPostResponseSchema
        ├── contact.ts           # ContactRequestSchema, ContactResponseSchema
        ├── media.ts             # MediaItemSchema, MediaListResponseSchema
        ├── page.ts              # PageSchema, PagesResponseSchema, PageResponseSchema
        ├── pricing-plan.ts      # PlanFeatureSchema, PricingPlanSchema, PricingPlansResponseSchema
        ├── service.ts           # ServiceSchema, ServicesResponseSchema
        ├── stats.ts             # DashboardStatsSchema
        ├── subscriber.ts        # SubscribeRequestSchema, SubscribeResponseSchema
        ├── team-member.ts       # TeamMemberSchema, TeamMembersResponseSchema
        └── theme.ts             # ThemeSchema
```

---

## Key Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| **Models** | Singular PascalCase | `PricingPlan`, `PlanFeature` |
| **Tables** | Plural snake_case with domain prefix | `billing_pricing_plans`, `marketing_services`, `contact_contact_messages` |
| **Migrations** | `{timestamp}_{action}_{table}` | `2026_07_21_000001_create_billing_pricing_plans_table` |
| **API routes** | kebab-case, plural | `GET /api/pricing-plans`, `POST /api/contact` |
| **Controllers** | PascalCase with optional domain prefix | `PricingPlanController`, `AdminAuthController` |
| **Controller namespace** | `App\Http\Controllers\Api\*` | `App\Http\Controllers\Api\PricingPlanController` |
| **Admin sub-controllers** | `App\Http\Controllers\Api\Admin\*` | `App\Http\Controllers\Api\Admin\StatsController` |
| **API Resources** | `App\Http\Resources\Api\*Resource` | `PricingPlanResource` |
| **Form Requests** | `App\Http\Requests\*Request` | `ContactRequest`, `SubscribeRequest` |
| **Factories** | `Database\Factories\Models\*Factory` | `PricingPlanFactory` (namespace `Database\Factories\Models`) |
| **User factory** | `Database\Factories\UserFactory` | (legacy — outside Models/) |
| **Frontend components** | PascalCase | `ServicesGrid`, `PricingTable` |
| **Admin pages** | kebab-case under `app/admin/` | `app/admin/pricing-plans/page.tsx` |
| **Admin API functions** | camelCase in `lib/admin-api.ts` | `fetchPricingPlans()`, `createPricingPlan()` |
| **Public API functions** | camelCase in `lib/api.ts` | `fetchPricingPlans()`, `fetchTheme()` |
| **Frontend types/interfaces** | PascalCase + `Data` suffix | `PricingPlanData`, `ServiceData`, `BlogPostData` |
| **CSS custom properties** | kebab-case with `--color-` prefix | `--color-primary`, `--color-muted-foreground` |
| **Admin CSS custom properties** | kebab-case with `--sidebar-` or custom prefix | `--sidebar-bg`, `--sidebar-text`, `--surface` |
| **Icons (public)** | Font Awesome classes | `fa-solid fa-code`, `fa-brands fa-linkedin-in` |
| **Icons (admin)** | Lucide components | `Cog`, `Users`, `LayoutDashboard` |
| **Test files** | PascalCase + `Test` suffix | `ServicesTest.php`, `PricingPlansTest.php` |
| **Git branches** | Not specified (follow standard conventions) | — |

---

## Admin CRUD Pattern

Every admin resource follows the same 10-step pattern (from `AGENTS.md`):

1. **Migration** — two tables if 1:N relation (e.g., PricingPlan + PlanFeature)
2. **Model** — `HasFactory`, `$table`, `$fillable`, `$casts`, `newFactory()`
3. **Factory** — in `Database\Factories\Models\` namespace
4. **API Resource** — in `App\Http\Resources\Api\`
5. **Controller** — CRUD methods using `ApiResponse` trait; eager-load with `->with()`
6. **Routes** — public GET outside `auth:sanctum`, POST/PUT/DELETE inside `auth:sanctum`
7. **Admin page** — `app/admin/{resource}/page.tsx` — table + modal form
8. **`lib/admin-api.ts`** — `interface XxxData` + fetch/create/update/delete functions
9. **Sidebar** — update in `components/admin/sidebar.tsx`
10. **Feature tests** — test public GET only (sorting, empty state, structure)

---

## Tests (10 feature test files)

| File | What it Tests |
|------|---------------|
| `AuthTest.php` | Login, logout, me, forgot/reset password, remember me, unauthenticated access |
| `ServicesTest.php` | GET /api/services — sorting, empty state, single item structure |
| `TeamMembersTest.php` | GET /api/team — sorting, empty state, structure |
| `PagesTest.php` | GET /api/pages — published-only filter, slug lookup, empty state |
| `PricingPlansTest.php` | GET /api/pricing-plans — published-only, sorting, features inclusion |
| `BlogPostsTest.php` | GET /api/blog-posts — sorting, show by slug, structure |
| `ContactSubscribeTest.php` | POST /api/contact and /api/subscribe — validation, rate limiting |
| `StatsTest.php` | GET /api/admin/stats — auth required, counts accuracy |
| `MediaTest.php` | Media upload CRUD, validation, file type/size limits |
| `ExampleTest.php` | Basic smoke test |

---

## Config Files

### Backend (`apps/backend/config/`)
13 config files: `app.php`, `auth.php`, `cache.php`, `cors.php`, `database.php`, `filesystems.php`, `logging.php`, `mail.php`, `media-library.php`, `queue.php`, `sanctum.php`, `services.php`, `session.php`

### Frontend
- `next.config.ts` — Next.js configuration (SSG export, image settings)
- `tsconfig.json` — TypeScript paths (aliases: `@/` → `./`)
- `tailwind.config.ts` — Tailwind theme extensions
- `postcss.config.mjs` — PostCSS plugins
- `.eslintrc.json` — ESLint rules
