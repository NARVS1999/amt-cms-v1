# Codebase Conventions

## 1. Code Style

### PHP (Backend)

| Aspect | Convention |
|--------|-----------|
| Linting | Laravel Pint (`laravel/pint` in `composer.json`) |
| Autoloading | PSR-4: `App\` → `app/`, `Database\Factories\` → `database/factories/` |
| PHP version | ^8.2 |
| Framework | Laravel 12 |

**Controller pattern:**
```php
namespace App\Http\Controllers\Api;

use App\Models\PricingPlan;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PricingPlanResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class PricingPlanController extends Controller
{
    use ApiResponse;

    public function index() { /* public GET, paginated */ }
    public function adminIndex() { /* admin GET, all records */ }
    public function store(Request $request) { /* inline validate → create */ }
    public function update(Request $request, PricingPlan $pricingPlan) { /* inline validate → update */ }
    public function destroy(PricingPlan $pricingPlan) { /* delete */ }
}
```

**Validation** is done inline via `$request->validate([...])` — no FormRequest classes.

**Model pattern:**
```php
namespace App\Models;

use Database\Factories\Models\PricingPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
    use HasFactory;

    protected static function newFactory(): PricingPlanFactory
    {
        return PricingPlanFactory::new();
    }

    protected $table = 'billing_pricing_plans';

    protected $fillable = ['name', 'price', ...];

    protected $casts = [
        'price' => 'decimal:2',
        'is_popular' => 'boolean',
        'sort_order' => 'integer',
    ];
}
```

No `$guarded`, no `$hidden` on content models (only on User model).

### TypeScript (Frontend + Shared)

| Aspect | Convention |
|--------|-----------|
| Linting | `next lint` (Next.js ESLint) |
| Strict mode | `"strict": true` in `tsconfig.json` |
| Module resolution | `bundler` |
| JSX | `react-jsx` |
| Path alias | `@/*` → `./*` |

**Import order convention:** UI components from `@/components/ui/*`, API functions from `@/lib/admin-api` or `@/lib/api`, shared schemas from `@amt/shared`.

**Client components** are marked `'use client'` at top. Admin pages use `'use client'` pattern.

**Frontend component naming:** PascalCase (`ServicesGrid`, `PricingTable`, `AdminPricingPlansPage`).

**Utility for class merging:**
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

## 2. Naming Patterns

| Category | Convention | Examples |
|----------|-----------|----------|
| **PHP namespace** | `App\Models`, `App\Http\Controllers\Api`, `App\Http\Resources\Api`, `App\Traits` | `App\Models\PricingPlan` |
| **Factory namespace** | `Database\Factories\Models` | `Database\Factories\Models\PricingPlanFactory` |
| **Test namespace** | `Tests\Feature` | `Tests\Feature\PricingPlansTest` |
| **Database table** | Plural snake_case, prefixed by domain | `billing_pricing_plans`, `marketing_services`, `marketing_team_members`, `contact_contact_messages`, `contact_subscribers` |
| **API routes** | kebab-case, plural | `GET /api/pricing-plans`, `POST /api/contact` |
| **Admin CRUD routes** | Same URL, different controller method | `POST /api/pricing-plans` (auth:sanctum), `GET /api/admin/pages` (admin prefix) |
| **Migration files** | `{timestamp}_{action}_{table}` | `2026_07_21_000001_create_billing_pricing_plans_table` |
| **Models** | Singular PascalCase | `PricingPlan`, `PlanFeature` |
| **Controllers** | `{Resource}Controller` in `Api` namespace | `PricingPlanController` |
| **API Resources** | `{Resource}Resource` in `App\Http\Resources\Api` | `PricingPlanResource` |
| **Frontend admin pages** | kebab-case under `app/admin/` | `app/admin/pricing-plans/page.tsx` |
| **Frontend public components** | PascalCase in `components/` | `ServicesGrid`, `PricingTable` |
| **Frontend lib functions** | camelCase in `lib/api.ts` / `lib/admin-api.ts` | `fetchPricingPlans()`, `createPricingPlan()` |
| **CSS custom properties** | `--color-*` for brand tokens, `--sidebar-*` for admin, `--font-*` for typography | `--color-primary`, `--sidebar-bg`, `--font-body` |

### Table prefixes
| Prefix | Domain |
|--------|--------|
| `billing_` | Billing/Pricing |
| `marketing_` | Main site content |
| `contact_` | Contact/Subscriber |

## 3. API Patterns

### Response Envelope

**Success:**
```json
{ "data": { ... } }          // single resource or message
{ "data": [ ... ] }          // collection
{ "data": [ ... ], "meta": { "current_page": 1, ... } }  // paginated
{ "services": 3, "blog_posts": 0 }  // stats (flat, no envelope)
```

**Error:**
```json
{ "message": "Not found." }
{ "message": "...", "errors": { "field": ["Error message"] } }
```

The `ApiResponse` trait provides:
- `$this->success($data, $code)` — wraps in `{ "data": $data }`
- `$this->error($message, $code, $errors)` — wraps in `{ "message": $message, "errors": $errors }`
- `JsonResource::collection()` — used for public GET paginated lists (returns `{ data: [...], meta: {...} }` automatically)
- `$this->success(Resource::collection(...))` — used for admin lists (no pagination, flat collections)
- Validation errors (422) are thrown inline, Laravel formats as `{ "message": "...", "errors": {...} }`

### Public GET vs Admin POST/PUT/DELETE

| Aspect | Public GET | Admin CRUD |
|--------|-----------|------------|
| Auth | None (read-only) | `auth:sanctum` |
| Content filter | `->where('is_published', true)` | All records |
| Response wrapper | Direct `Resource::collection()` (auto `data` envelope + meta) | `$this->success(Resource::collection(...))` |
| Pagination | `->paginate()` | `->get()` (no pagination) |
| Sorting | `->defaultSort('sort_order')` with `allowedSorts()` | `->orderBy('sort_order')` |

### Route structure

Routes are defined in `routes/api.php`:
- Public GET (open): `/pages`, `/pages/{slug}`, `/services`, `/team`, `/blog-posts`, `/blog-posts/{slug}`, `/pricing-plans`, `/theme`
- Public POST (throttled): `/contact`, `/subscribe`
- Auth POST (throttled): `/admin/login`, `/forgot-password`, `/reset-password`
- Sanctum-protected group (`auth:sanctum`): `/me`, `/logout`, admin CRUD, `/admin/pages`, `/admin/stats`, `/media`
- Fallback: all undefined API routes return `404 { "message": "Not found." }`

### Relationships

- Eager loaded in controllers via `->with('features')` or `->with('media')`
- Exposed in resources via `$this->whenLoaded('features', fn() => ...)`
- Nested data is inlined as an array (not a separate resource class for children)

### Validation

- Inline `$request->validate([...])` in controller methods (no FormRequest classes)
- Custom error messages are **used** in contact/subscribe endpoints (`'name.required' => 'Your name is required.'`)
- Most endpoints rely on Laravel's default validation error messages

## 4. Frontend API Pattern

### Public fetcher (`lib/api.ts`)

```ts
export async function fetchServices(): Promise<ServiceData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_URL}/services`, { signal: controller.signal });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const parsed = ServicesResponseSchema.parse(json);
    return parsed.data;
  } catch { return []; }  // silent failure → empty array
  finally { clearTimeout(timeout); }
}
```

Key pattern: 5s timeout, **Zod validation** via `@amt/shared`, **empty array on failure** (graceful degradation for SSG).

### Admin fetcher (`lib/admin-api.ts`)

```ts
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();  // from localStorage
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ... };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) { clearToken(); throw new UnauthorizedError(); }
  if (res.status === 422) { throw { status: 422, errors: data.errors, message: data.message }; }
  if (!res.ok) { throw { status: res.status, message: ... }; }
  return res.json();
}
```

Key pattern: Bearer token from `localStorage`, `UnauthorizedError` on 401 (redirects to login), structured errors on 422, raw JSON response (no Zod validation — trust the API since it's same origin).

### Admin CRUD function pattern
```ts
export async function createPricingPlan(data: Partial<PricingPlanData>): Promise<{ data: PricingPlanData }> {
  return request('/pricing-plans', { method: 'POST', body: JSON.stringify(data) });
}
```

### Token management
- `getToken()` / `setToken()` / `clearToken()` from `localStorage`
- `isAuthenticated()` convenience boolean

## 5. Model Conventions

### Standard model skeleton
```php
class PricingPlan extends Model
{
    use HasFactory;

    protected static function newFactory(): PricingPlanFactory
    {
        return PricingPlanFactory::new();
    }

    protected $table = 'billing_pricing_plans';

    protected $fillable = ['name', 'price', ...];

    protected $casts = [
        'is_popular' => 'boolean',
        'sort_order' => 'integer',
    ];
}
```

### Models with Spatie Media Library
```php
class TeamMember extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    public function registerMediaCollections(): void { ... }
    public function registerMediaConversions(?Media $media = null): void { ... }
}
```

### Shared conventions across all models
- `HasFactory` trait always used
- `newFactory()` static method always defined (returns `FactoryName::new()`)
- `$table` always explicitly set
- `$fillable` always explicitly set (never use `$guarded` or guarded=[])
- `$casts` for booleans, integers, arrays, decimals, datetimes
- Relationship methods (e.g. `features(): HasMany`) typed with return type hints

### Factory pattern
```php
namespace Database\Factories\Models;

use App\Models\PricingPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PricingPlanFactory extends Factory
{
    protected $model = PricingPlan::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'price' => fake()->randomFloat(2, 49, 999),
            // ...
        ];
    }
}
```

Factories are in `Database\Factories\Models\` namespace, use `fake()`, random data, reasonable defaults. Cross-referencing via `PricingPlan::factory()` in related factories (e.g., `PlanFeatureFactory`).

## 6. Admin Sidebar Groups

From `components/admin/sidebar.tsx`:

| Group | Items |
|-------|-------|
| **Main** | Dashboard, Services, Team, Blog, Pricing |
| **Leads** | Messages, Subscribers (v1.1 — href: '#') |
| **Settings** | Theme (href: '#'), Media Library, Pages |

Icons use **Lucide** (`lucide-react`). Sidebar uses CSS custom properties for theming (`--sidebar-bg`, `--sidebar-text`, etc.).

## 7. CSS / Theming

### CSS Custom Properties

Defined in `globals.css` and the ThemeProvider component.

**Public site colors** (via `@theme` in Tailwind v4):
```
--color-primary        default: #FF0000 (overridable via ThemeSetting)
--color-secondary      default: #fb3d03
--color-accent         default: #FFC107
--color-background     default: #FFFFFF
--color-foreground     default: #333333
--color-muted          default: #f5f5f5
--color-muted-foreground default: #888888
--color-border         default: #f0f0f0
--color-success        default: #22c55e
--color-error          default: #ef4444
```

**Typography:**
```
--font-body    default: 'Poppins'
--font-heading default: 'Poppins'
```

**Admin sidebar colors** (via `:root` CSS vars):
```
--sidebar-bg: #1e1b2e
--sidebar-text: #a5a3b5
--sidebar-active: #ffffff
--sidebar-hover: rgba(255,255,255,0.06)
--sidebar-active-bg: rgba(255,255,255,0.1)
--sidebar-group: #6b6880
```

### Tailwind Usage

- **Tailwind v4** with `@import "tailwindcss"` syntax
- `@theme` block for design tokens
- `class-variance-authority` for component variants
- `tw-animate-css` for animation utilities
- shadcn/ui components in `components/ui/` (Button, Card, Input, Table, etc.)

### Icon Libraries

| Context | Library |
|---------|---------|
| Public site | Font Awesome (`@fortawesome/fontawesome-free`, `fa-solid`, `fa-brands`) |
| Admin panel | Lucide (`lucide-react`) |

### Animation Patterns

Defined in `globals.css`:
- `toastSlideIn` — slide in from right for toast notifications
- `dotBounce` — bouncing dots for loading states

## 8. Shared Package (`@amt/shared`)

Zod schemas in `packages/shared/src/schemas/` mirror API responses exactly. Each schema file exports:
- `{Name}Schema` (Zod object)
- `{Name}ResponseSchema` (with `data` wrapper)
- Inferred TypeScript types via `z.infer<>`

Consumed by frontend `lib/api.ts` for runtime validation of public API responses.

## 9. Key Architecture Invariants (from AGENTS.md)

- **No raw SQL** — Eloquent ORM only (NFR-16)
- **No Server-Side Props** — SSG only (`output: 'export'`) (AD-2)
- **No direct Storage::put()** — Spatie Media Library for uploads (AD-6)
- **No hardcoded brand colors** — use `var(--color-*)` (AD-4)
- **API contract** — `{ "data": ... }` envelope. Match SPEC.md exactly.
