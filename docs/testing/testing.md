# Testing

## Backend Tests

PHPUnit 11.x with SQLite `:memory:` database. Tests use the `RefreshDatabase` trait — migrations run automatically per class.

### Run Tests

```bash
cd apps/backend
php artisan test                          # Full suite (53+ tests)
php artisan test --filter=ServicesTest    # Single file
php artisan test --filter=test_returns_services_sorted  # Single test
```

### Test Structure

```
tests/
├── Feature/
│   ├── BlogPostsTest.php
│   ├── ContactSubscribeTest.php
│   ├── MediaTest.php
│   ├── PagesTest.php
│   ├── PricingPlansTest.php
│   ├── ServicesTest.php
│   ├── StatsTest.php
│   └── TeamMembersTest.php
├── Unit/
│   └── ExampleTest.php
└── TestCase.php
```

### What's Tested

| Test Class | What It Covers |
|------------|----------------|
| ServicesTest | Public GET with sorting, empty state, JSON structure; Admin CRUD |
| TeamMembersTest | Public GET with sort order, photo URL; Admin CRUD |
| PagesTest | Public GET by slug, admin listing, CRUD |
| BlogPostsTest | Public GET with pagination, published-only filter; Admin CRUD |
| PricingPlansTest | Plans with nested features, popular toggle, sort order |
| ContactSubscribeTest | Contact form and newsletter endpoints with rate limiting |
| MediaTest | File upload, listing, deletion via Spatie Media Library |
| StatsTest | Dashboard stat counts, safeCount for missing tables |

### Test Conventions

- Feature tests for HTTP endpoints; no unit tests yet
- Each test creates its own data via factories
- Tests assert: HTTP status, JSON structure, data ordering, edge cases
- No database dependency — SQLite in-memory via `phpunit.xml`
- Rate-limited endpoints tested at low limits to avoid timeouts

### Test Database Config

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

## Frontend Tests

No frontend test suite configured yet. The `npx tsc --noEmit` type check acts as a static validation gate.

## Running Verification

```bash
# Backend: full test suite
cd apps/backend && php artisan test

# Frontend: type check + lint + build
cd apps/frontend && npx tsc --noEmit && npm run lint && npm run build
```
