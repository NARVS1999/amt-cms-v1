# Testing

## Backend (PHPUnit 11)

### Framework

| Aspect | Detail |
|--------|--------|
| Test runner | PHPUnit 11 (`php artisan test`) |
| Config | `apps/backend/phpunit.xml` |
| Database | SQLite `:memory:` (in-memory, per-class via `RefreshDatabase`) |
| Base class | `Tests\TestCase` |

### Configuration (from `phpunit.xml`)

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
<env name="APP_ENV" value="testing"/>
<env name="CACHE_STORE" value="array"/>
<env name="QUEUE_CONNECTION" value="sync"/>
<env name="MAIL_MAILER" value="array"/>
<env name="SESSION_DRIVER" value="array"/>
```

Key settings: `BCRYPT_ROUNDS=4` (fast hashing), `MAIL_MAILER=array` (no transport), `TELESCOPE_ENABLED=false`.

### Test Structure

```
tests/
├── Feature/
│   ├── BlogPostsTest.php
│   ├── ContactSubscribeTest.php
│   ├── ExampleTest.php
│   ├── MediaTest.php
│   ├── PagesTest.php
│   ├── PricingPlansTest.php
│   ├── ServicesTest.php
│   ├── StatsTest.php
│   └── TeamMembersTest.php
├── Unit/
└── TestCase.php
```

### Test Patterns

All feature tests follow the same pattern:

1. **Extend `Tests\TestCase`** (which uses `RefreshDatabase` or `CreatesApplication`)
2. **Use `RefreshDatabase` trait** — runs migrations before each test
3. **Use `Service::factory()`** for model creation
4. **Use `$this->getJson()`** for API calls
5. **Assert on JSON structure and values**

### Example Test Pattern (`ServicesTest.php`)

```php
class ServicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_services_sorted_by_sort_order(): void
    {
        Service::factory()->create(['title' => 'Service C', 'sort_order' => 3]);
        Service::factory()->create(['title' => 'Service A', 'sort_order' => 1]);
        Service::factory()->create(['title' => 'Service B', 'sort_order' => 2]);

        $response = $this->getJson('/api/services');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => [ '*' => ['id', 'title', ...] ]]);
        $titles = $response->json('data.*.title');
        $this->assertEquals(['Service A', 'Service B', 'Service C'], $titles);
    }
}
```

### What Tests Cover

Each resource has a feature test covering:
- **Structure** — response matches expected JSON structure
- **Sorting** — records returned in correct `sort_order`
- **Empty state** — returns `{ "data": [] }` when no records exist
- **Single record** — individual field values are correct

### What Tests DON'T Cover (gaps)

- Admin CRUD endpoints (POST/PUT/DELETE) — no authentication tests
- Validation rules — no validation error tests
- Edge cases — no boundary/limit tests
- Frontend — zero frontend tests exist
- Integration — no end-to-end tests
- Coverage — no coverage threshold configured

### Factories

Factories live in `database/factories/Models/` under the `Database\Factories\Models` namespace. Each factory defines default attribute values using `faker`.

```php
class PricingPlanFactory extends Factory
{
    protected $model = PricingPlan::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 10, 500),
            'interval' => fake()->randomElement(['monthly', 'yearly', 'one-time']),
            'is_published' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
```

## Frontend Testing

**No frontend tests exist.** The frontend has no test runner configured. The `package.json` only has `dev`, `build`, `start`, and `lint` scripts. No Vitest, Jest, or Playwright setup.
