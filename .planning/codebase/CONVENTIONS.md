# Conventions

## Code Style

### PHP (Backend)

- **Laravel Pint** (`laravel/pint`) for automatic formatting — equivalent to PHP CS Fixer with Laravel preset
- PSR-4 autoloading: `App\` namespace maps to `app/`
- Controller methods use `ApiResponse` trait for all responses
- Validation is inline in controllers (no separate FormRequest classes)
- Models use `HasFactory` trait and `newFactory()` static method

### TypeScript (Frontend + Shared)

- **TypeScript 5.7** with strict mode enabled
- **ESLint** via `next lint`
- PascalCase for components, camelCase for functions/variables
- All API responses validated through Zod schemas at runtime

## Naming Patterns

| What | Convention | Example |
|------|-----------|---------|
| PHP namespaces | `App\Http\Controllers\Api\*` | `App\Http\Controllers\Api\PricingPlanController` |
| Database tables | `{domain}_{plural_snake}` | `billing_pricing_plans`, `marketing_services` |
| API routes | kebab-case plural | `/api/pricing-plans` |
| Migration files | `{timestamp}_{action}_{table}` | `2026_07_21_000001_create_billing_pricing_plans_table` |
| Factories | `Database\Factories\Models\{Name}Factory` | `Database\Factories\Models\PricingPlanFactory` |
| Frontend admin pages | kebab-case under `app/admin/` | `app/admin/pricing-plans/page.tsx` |
| API client functions | camelCase | `fetchPricingPlans()`, `createService()` |
| CSS custom properties | `var(--color-*)` | `var(--color-primary)`, `var(--color-muted)` |

## API Patterns

### Response Envelope

All successful responses follow `{ "data": ... }`. The `ApiResponse` trait at `app/Traits/ApiResponse.php` provides `success()` and `error()` helpers. Resources do NOT wrap in `data` themselves — the controller trait handles that.

### Error Responses

```json
{ "message": "Validation failed.", "errors": { "field": ["..."] } }
```

Validation errors return 422 with field-level error messages. 401 responses clear the admin token client-side.

### Controller Pattern

```php
class XxxController extends Controller
{
    use ApiResponse;

    public function index() { /* public GET */ }
    public function store(Request $request) { /* admin POST */ }
    public function update(Request $request, Xxx $xxx) { /* admin PUT */ }
    public function destroy(Xxx $xxx) { /* admin DELETE */ }
}
```

- Public GET queries filter by `is_published: true` and sort by `sort_order`
- Admin POST/PUT validate inside the method body
- Route model binding used for implicit `findOrFail`
- Eager load relationships with `->with()` and expose with `whenLoaded()` in resources

### Frontend API Pattern

```typescript
export async function fetchXxx(): Promise<XxxData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_URL}/xxx`, { signal: controller.signal });
    const json = await res.json();
    return parsed.data;
  } catch { return []; }
  finally { clearTimeout(timeout); }
}
```

Public fetchers use 5-second timeouts and return empty arrays on failure. Admin fetchers throw structured errors.

## Model Conventions

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
    protected $casts = ['is_published' => 'boolean', 'sort_order' => 'integer'];

    public function features(): HasMany
    {
        return $this->hasMany(PlanFeature::class)->orderBy('sort_order');
    }
}
```

- `$table` always explicitly set (table prefixes vary by domain)
- `$fillable` over `$guarded` (explicit allowlist)
- `$casts` for boolean, integer, decimal types
- `HasFactory` + `newFactory()` overrides required
- Relationships use type-hinted return types (`HasMany`, `BelongsTo`)

## Admin Sidebar Groups

```
Main:     Dashboard, Services, Team, Blog, Pricing
Leads:    Messages, Subscribers (v1.1)
Settings: Theme, Media, Pages
```

## CSS / Theming

- All visual tokens via `var(--color-*)` — zero hardcoded brand colors
- Tailwind CSS v4 with `@tailwindcss/postcss`
- Inline `style` attribute used for CSS var values (Tailwind v4 limitation)
- Font Awesome for public site icons (`fa-brands`, `fa-solid`)
- Lucide React for admin panel icons
- `tw-animate-css` for animation utilities
- `border-t-2` pattern for featured service accent
