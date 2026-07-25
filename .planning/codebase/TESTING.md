# Testing Guide

## 1. Backend (PHPUnit)

### Test Runner & Version

| Aspect | Value |
|--------|-------|
| Framework | PHPUnit 11.5.3 |
| Test runner | `php artisan test` (wraps PHPUnit) |
| Config file | `apps/backend/phpunit.xml` |
| Code coverage | Not configured (no `<coverage>` element) |

### Database Setup

| Aspect | Value |
|--------|-------|
| Connection | `sqlite` |
| Database | `:memory:` |
| Migration strategy | `RefreshDatabase` trait (runs all migrations per test class) |

### PHPUnit Config (Key Envs)

```xml
<env name="APP_ENV" value="testing"/>
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
<env name="CACHE_STORE" value="array"/>
<env name="SESSION_DRIVER" value="array"/>
<env name="QUEUE_CONNECTION" value="sync"/>
<env name="MAIL_MAILER" value="array"/>
<env name="BCRYPT_ROUNDS" value="4"/>
```

### Test Structure

All test files: `apps/backend/tests/Feature/`

| File | Lines | Focus |
|------|-------|-------|
| `AuthTest.php` | 142 | Login/logout/me/forgot-password/reset-password/remember-me/401 |
| `BlogPostsTest.php` | 92 | Index sorting, empty state, single by slug, 404, content exclusion |
| `ContactSubscribeTest.php` | 329 | Contact CRUD, subscribe, rate limits, 404, auth 401, CORS |
| `MediaTest.php` | 194 | Upload (jpg/png/webp/svg), oversize, format rejection, delete, XSS sanitization, 401 |
| `PagesTest.php` | 185 | Published filter, sort by id, empty, single, show by slug, 404, unpublished |
| `PricingPlansTest.php` | 120 | Published filter, sort, empty, single structure, nested features, popular flag |
| `ServicesTest.php` | 82 | Sort order, empty, single structure |
| `StatsTest.php` | 102 | Auth, zero counts, correct counts, dynamic update, key structure |
| `TeamMembersTest.php` | 103 | Sort order, empty, single structure, null social_links |
| `ExampleTest.php` | - | Laravel default (trivial) |

### Common Test Patterns

#### Pattern 1: Structure + Sorting
```php
class PricingPlansTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_published_plans_sorted_by_sort_order(): void
    {
        PricingPlan::factory()->create(['name' => 'Plan C', 'sort_order' => 3, 'is_published' => true]);
        PricingPlan::factory()->create(['name' => 'Plan A', 'sort_order' => 1, 'is_published' => true]);
        PricingPlan::factory()->create(['name' => 'Plan B', 'sort_order' => 2, 'is_published' => false]);

        $response = $this->getJson('/api/pricing-plans');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        $names = $response->json('data.*.name');
        $this->assertEquals(['Plan A', 'Plan C'], $names);
    }
}
```

#### Pattern 2: Empty State
```php
public function test_returns_empty_data_when_no_plans(): void
{
    $response = $this->getJson('/api/pricing-plans');
    $response->assertStatus(200);
    $response->assertJson(['data' => []]);
}
```

#### Pattern 3: Single Record Structure
```php
public function test_single_plan_response_structure(): void
{
    $plan = PricingPlan::factory()->create([...]);
    $response = $this->getJson('/api/pricing-plans');
    $response->assertStatus(200);
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.name', 'Starter');
    $response->assertJsonPath('data.0.is_popular', true);
}
```

#### Pattern 4: Nested Relationships
```php
public function test_plan_includes_nested_features(): void
{
    $plan = PricingPlan::factory()->create(['is_published' => true]);
    PlanFeature::factory()->count(3)->create(['pricing_plan_id' => $plan->id]);
    $response = $this->getJson('/api/pricing-plans');
    $features = $response->json('data.0.features');
    $this->assertCount(3, $features);
    $this->assertArrayHasKey('id', $features[0]);
}
```

#### Pattern 5: Auth-Protected Endpoints
```php
public function test_unauthenticated_post_to_admin_endpoint_returns_401(): void
{
    $response = $this->postJson('/api/services', [...]);
    $response->assertStatus(401);
    $response->assertJson(['message' => 'Unauthenticated.']);
}

public function test_authenticated_post_to_admin_endpoint_succeeds(): void
{
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;
    $response = $this->withToken($token)->postJson('/api/services', [...]);
    $response->assertStatus(201);
}
```

#### Pattern 6: Rate Limiting
```php
public function test_contact_rate_limit(): void
{
    Cache::flush();
    $payload = [...];
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/contact', $payload)->assertStatus(201);
    }
    $response = $this->postJson('/api/contact', $payload);
    $response->assertStatus(429);
}
```

#### Pattern 7: setUp with shared state
```php
class AuthTest extends TestCase
{
    use RefreshDatabase;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
    }
}
```

### What Tests Cover

- **Structure verification:** `assertJsonStructure` with nested `'*'` patterns
- **Sorting:** Create records out of order, assert `data.*.name` is in expected order
- **Empty state:** `assertJson(['data' => []])` when no records exist
- **Single record:** `assertJsonPath('data.0.field', value)`
- **Filtering:** Unpublished records not returned in public GET
- **Nested resources:** Features, social_links structure
- **Auth:** 401 for unauthenticated, 201 with token
- **Rate limiting:** 429 after N requests using Cache::flush isolation
- **404:** Unknown slugs, nonexistent routes
- **Media:** File type validation, size limits, XSS sanitization, delete
- **Stats:** Zero-state, correct counts, auth protection

### What Tests DON'T Cover (Gaps)

- **No validation error tests** for most CRUD endpoints (e.g., missing name on pricing plan store)
- **No update tests** for admin CRUD (PUT endpoints)
- **No delete tests** for most resources (except MediaTest)
- **No pagination tests** (meta structure, page sizing)
- **No adminIndex tests** (admin listing of all records including unpublished)
- **No sorting via query parameters** (only default sort tested)
- **No search/filter tests**
- **No edge case tests** like extremely long strings, negative sort_order, XSS in text fields
- **No database constraint violation tests** (unique slug, etc.)
- **No test for pricing plan popular mutual exclusivity** (store/update logic with `is_popular`)
- **No feature tests for nested feature CRUD** (only read-side tested)
- **Coverage reporting is not configured**

## 2. Frontend Testing

| Aspect | Status |
|--------|--------|
| Test framework | **None** — no test libraries in `package.json` |
| Test files | **None found** — no `__tests__/`, `*.test.ts`, or `*.spec.ts` files |
| Coverage | **Not configured** |

The frontend has **zero testing infrastructure**. No Vitest, Jest, Playwright, or Cypress. No test scripts in `package.json`.

### Suggested Additions

- Unit tests for `lib/api.ts` and `lib/admin-api.ts` (fetch wrappers)
- Component tests for UI components in `components/ui/`
- Integration tests for admin pages (modal CRUD flows)
- E2E tests for critical public site rendering (SSG output verification)
- Zod schema validation tests in `packages/shared/`

## 3. Running Tests

```bash
# Full backend test suite
cd apps/backend && php artisan test

# Single test file
cd apps/backend && php artisan test --filter=ServicesTest

# Single test method
cd apps/backend && php artisan test --filter=test_returns_empty_data
```

## 4. Factory Patterns

Factories live in `database/factories/Models/` namespace.

**Simple factory:**
```php
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'icon' => 'fa-solid fa-' . fake()->word(),
            'is_featured' => fake()->boolean(20),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
```

**Cross-referencing factory:**
```php
class PlanFeatureFactory extends Factory
{
    protected $model = PlanFeature::class;

    public function definition(): array
    {
        return [
            'pricing_plan_id' => PricingPlan::factory(),  // auto-creates parent
            'description' => fake()->sentence(4),
            'is_included' => fake()->boolean(80),
            'sort_order' => fake()->numberBetween(0, 20),
        ];
    }
}
```

### All factories

| Factory | Model | Table |
|---------|-------|-------|
| `UserFactory` | User | `users` |
| `Models\ServiceFactory` | Service | `marketing_services` |
| `Models\TeamMemberFactory` | TeamMember | `marketing_team_members` |
| `Models\PricingPlanFactory` | PricingPlan | `billing_pricing_plans` |
| `Models\PlanFeatureFactory` | PlanFeature | `billing_plan_features` |
| `Models\PageFactory` | Page | `marketing_pages` |
| `Models\BlogPostFactory` | BlogPost | `marketing_blog_posts` |
