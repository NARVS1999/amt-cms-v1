# Adsvance Media Tech CMS — Implementation SPEC

> **Purpose:** Single source of truth for all API contracts, database schemas, validation rules, component interfaces, and data flows. Every AI agent MUST read this before writing any implementation code. If the code disagrees with this SPEC, the SPEC is the authority — fix the code.

---

## 1. API Response Envelope

All API responses follow a consistent JSON envelope via `App\Traits\ApiResponse`.

| Outcome | Status | Shape |
|---------|--------|-------|
| Success | 200/201 | `{ "data": <resource(s)> }` |
| Validation failure | 422 | `{ "message": "...", "errors": { "field": ["..."] } }` |
| Client error | 400/401/403/404/429 | `{ "message": "..." }` |
| Server error | 500 | `{ "message": "..." }` |

**Exception:** `GET /api/media` returns `{ "data": [...], "meta": { "current_page", "last_page", "per_page", "total" } }` (paginated, no ApiResponse trait used).

---

## 2. Database Schema (Migrations)

### `users` (Laravel default)
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| name | string(255) | required |
| email | string(255) | unique |
| password | string(255) | bcrypt hash |
| remember_token | string(100) | nullable |
| timestamps | | |

### `personal_access_tokens` (Sanctum)
Laravel Sanctum default schema.

### `marketing_services`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| title | string(255) | required |
| description | text | required |
| icon | string(255) | required, Font Awesome class |
| is_featured | boolean | default false |
| sort_order | integer | default 0 |
| timestamps | | |

### `marketing_team_members`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| name | string(255) | required |
| role | string(255) | required |
| bio | text | nullable |
| social_links | json | nullable |
| sort_order | integer | default 0 |
| timestamps | | |

### `marketing_pages`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| title | string(255) | required |
| slug | string(255) | unique, indexed |
| hero_heading | text | nullable |
| hero_subtext | text | nullable |
| sections | json | nullable |
| is_published | boolean | default false |
| timestamps | | |

### `marketing_blog_posts`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| title | string(255) | required |
| slug | string(255) | unique, indexed |
| content | longText | rich HTML (Quill) |
| excerpt | text | nullable |
| is_published | boolean | default false |
| published_at | timestamp | nullable |
| sort_order | integer | default 0 |
| timestamps | | |

### `billing_pricing_plans`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| name | string(255) | required |
| price | decimal(10,2) | PHP numeric |
| interval | string(50) | enum: monthly, yearly, one-time |
| description | text | nullable |
| cta_text | string(255) | nullable |
| is_popular | boolean | default false |
| is_published | boolean | default false |
| sort_order | integer | default 0 |
| timestamps | | |

### `billing_plan_features`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| pricing_plan_id | bigInteger(20) | FK → billing_pricing_plans, CASCADE delete |
| description | string(255) | required |
| is_included | boolean | default true |
| sort_order | integer | default 0 |
| timestamps | | |

### `theme_settings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| primary_color | string(255) | nullable |
| secondary_color | string(255) | nullable |
| accent_color | string(255) | nullable |
| background_color | string(255) | nullable |
| foreground_color | string(255) | nullable |
| muted_color | string(255) | nullable |
| muted_foreground_color | string(255) | nullable |
| border_color | string(255) | nullable |
| success_color | string(255) | nullable |
| error_color | string(255) | nullable |
| body_font | string(255) | nullable |
| heading_font | string(255) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### `contact_contact_messages`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| name | string(255) | required |
| email | string(255) | required |
| message | text | required |
| read_at | timestamp | nullable |
| timestamps | | |

### `contact_subscribers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| email | string(255) | unique |
| subscribed_at | timestamp | required |
| timestamps | | |

### `media` (Spatie Media Library)
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| model_type | string(255) | |
| model_id | bigInteger(20) | |
| uuid | char(36) | nullable |
| collection_name | string(255) | |
| name | string(255) | |
| file_name | string(255) | |
| mime_type | string(255) | nullable |
| disk | string(255) | |
| conversions_disk | string(255) | nullable |
| size | bigInteger(20) | unsigned |
| manipulations | json | |
| custom_properties | json | |
| generated_conversions | json | |
| responsive_images | json | |
| order_column | integer | nullable |
| timestamps | | |

### `media_libraries`
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigIncrements | PK |
| name | string(255) | required |
| timestamps | | |

---

## 3. API Endpoints — Exact Contracts

### 3.1 Public GET Endpoints (Unauthenticated)

#### `GET /api/services`
Returns all services ordered by `sort_order`.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Web Development",
      "description": "Full-stack web development...",
      "icon": "fa-solid fa-code",
      "is_featured": true,
      "sort_order": 0,
      "created_at": "2026-07-19T00:00:00+00:00",
      "updated_at": "2026-07-19T00:00:00+00:00"
    }
  ]
}
```

**Implementation:** `ServiceController@index` — `Service::orderBy('sort_order')->get()`

**Frontend type (from `api.ts`):** `ServiceData`
**Zod schema:** `@amt/shared` → `ServicesResponseSchema`

---

#### `GET /api/team`
Returns all team members ordered by `sort_order`.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "role": "CEO",
      "bio": "John leads the team...",
      "photo_url": "https://example.com/storage/1/thumb.jpg",
      "social_links": {
        "linkedin": "https://linkedin.com/in/john",
        "twitter": "https://twitter.com/john"
      },
      "sort_order": 0,
      "created_at": "2026-07-19T00:00:00+00:00",
      "updated_at": "2026-07-19T00:00:00+00:00"
    }
  ]
}
```

**Implementation:** `TeamMemberController@index` — `TeamMember::orderBy('sort_order')->get()`

**Frontend type (from `api.ts`):** `TeamMemberData`
**Zod schema:** `@amt/shared` → `TeamMembersResponseSchema`

---

#### `GET /api/pages`
Returns published pages only.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Home",
      "slug": "home",
      "hero_heading": "Need a business website?",
      "hero_subtext": "We build beautiful, affordable sites.",
      "sections": null,
      "is_published": true,
      "created_at": "2026-07-19T00:00:00+00:00",
      "updated_at": "2026-07-19T00:00:00+00:00"
    }
  ]
}
```

**Implementation:** `PageController@index` — `Page::where('is_published', true)->orderBy('id')->get()`

**Frontend type (from `api.ts`):** `PageData`
**Zod schema:** `@amt/shared` → `PagesResponseSchema`

---

#### `GET /api/pages/{slug}`
Returns a single published page by slug.

**Response 200:** `{ "data": { ...page object... } }`
**Response 404:** `{ "message": "Not found." }`

**Implementation:** `PageController@show` — `Page::where('slug', $slug)->where('is_published', true)->first()`

---

#### `GET /api/pricing-plans`
Returns **published** pricing plans with features, ordered by `sort_order`.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Basic",
      "price": 498.00,
      "interval": "monthly",
      "description": "Perfect for small businesses.",
      "cta_text": "Get Started",
      "is_popular": false,
      "is_published": true,
      "sort_order": 0,
      "features": [
        {
          "id": 1,
          "description": "Custom domain",
          "is_included": true,
          "sort_order": 0
        }
      ],
      "created_at": "2026-07-21T00:00:00+00:00",
      "updated_at": "2026-07-21T00:00:00+00:00"
    }
  ]
}
```

**Implementation:** `PricingPlanController@index` — `PricingPlan::with('features')->where('is_published', true)->orderBy('sort_order')->get()`

**IMPORTANT:** The admin API endpoint also uses `GET /api/pricing-plans` but goes through a different route (`PricingPlanController@index`) — however the route file doesn't distinguish admin vs public. The `index()` method filters by `is_published: true`. There is no admin-specific pricing plans route.

**Frontend type (from `api.ts`):** `PricingPlanData`, `PlanFeatureData`
**Zod schema:** `@amt/shared` → `PricingPlansResponseSchema`

---

#### `GET /api/blog-posts`
Returns blog posts ordered by `created_at desc`. **Does NOT filter by `is_published`** — returns all posts.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Why Your Business Needs a Website",
      "slug": "why-your-business-needs-a-website",
      "excerpt": "In today's digital age...",
      "featured_image_url": "https://example.com/storage/1/thumb.jpg",
      "is_published": true,
      "published_at": "2026-07-21T00:00:00+00:00",
      "created_at": "2026-07-21T00:00:00+00:00",
      "updated_at": "2026-07-21T00:00:00+00:00"
    }
  ]
}
```

**Note:** The `content` field is ONLY included in the `show` response (not `index`).

**Implementation:** `BlogPostController@index` — `BlogPost::with('media')->orderBy('created_at', 'desc')->get()`

**Frontend type (from `admin-api.ts`):** `BlogPostData`
**Zod schema:** `@amt/shared` → `BlogPostsResponseSchema` (for listing) / `BlogPostResponseSchema` (for single)

---

#### `GET /api/blog-posts/{slug}`
Returns a single blog post by slug, including `content`.

**Response 200:**
```json
{
  "data": {
    "id": 1,
    "title": "...",
    "slug": "...",
    "content": "<h2>Rich HTML content</h2><p>From Quill editor</p>",
    "excerpt": "...",
    "featured_image_url": "...",
    "is_published": true,
    "published_at": "2026-07-21T00:00:00+00:00",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Response 404:** `{ "data": null }` (via `$this->error()` which returns `{ "message": "Blog post not found." }`)

**Implementation:** `BlogPostController@show` — `BlogPost::with('media')->where('slug', $slug)->first()`

---

#### `GET /api/theme`
Returns the first `ThemeSetting` record as a flat object.

**Response 200 (has theme):**
```json
{
  "data": {
    "primary_color": "#ff0000",
    "secondary_color": "#fb3d03",
    "accent_color": "#FFC107",
    "background_color": "#FFFFFF",
    "foreground_color": "#333333",
    "muted_color": "#f5f5f5",
    "muted_foreground_color": "#888888",
    "border_color": "#f0f0f0",
    "success_color": "#22c55e",
    "error_color": "#ef4444",
    "body_font": "Poppins",
    "heading_font": "Poppins"
  }
}
```

**Response 200 (no theme):** `{ "data": {} }`

**Implementation:** `ThemeController@index` — `ThemeSetting::first()` → `$theme->only([...columns])`

**Frontend type (from `api.ts`):** `ThemeData` (all fields optional)

---

### 3.2 Public POST Endpoints (Unauthenticated, Rate-Limited)

#### `POST /api/contact`
Rate limit: 5/min per IP.

**Request:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "message": "Need a website for my bakery."
}
```

**Response 201 (success):**
```json
{
  "data": {
    "message": "Thank you! We'll get back to you soon.",
    "contact_message": {
      "id": 1,
      "name": "Maria Santos",
      "email": "maria@example.com",
      "created_at": "2026-07-21T00:00:00+00:00"
    }
  }
}
```

**Response 422 (validation):** `{ "message": "...", "errors": { "email": ["..."], "name": ["..."], "message": ["..."] } }`
**Response 429 (rate limit):** `{ "message": "Too many attempts. Please try again in a minute." }`
**Response 500 (server error):** `{ "message": "Could not submit message. Please try again." }`

**Validation rules:**
| Field | Rules |
|-------|-------|
| name | required, string, max:255 |
| email | required, string, email, max:255 |
| message | required, string, min:1 |

**Implementation:** `ContactController@store` via `ContactRequest` (FormRequest)

**Zod schema:** `@amt/shared` → `ContactRequestSchema`, `ContactResponseSchema`

---

#### `POST /api/subscribe`
Rate limit: 3/min per IP.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response 201 (success):**
```json
{
  "data": {
    "message": "Welcome! You've been subscribed successfully.",
    "subscriber": {
      "id": 1,
      "email": "user@example.com",
      "subscribed_at": "2026-07-21T00:00:00+00:00"
    }
  }
}
```

**Response 422 (duplicate or invalid):** `{ "message": "...", "errors": { "email": ["..."] } }`
**Response 429 (rate limit):** `{ "message": "Too many attempts. Try again in a minute." }`
**Response 500 (server error):** `{ "message": "Could not subscribe. Please try again." }`

**Validation rules:**
| Field | Rules |
|-------|-------|
| email | required, string, email, max:255, unique:contact_subscribers,email |

**Implementation:** `SubscribeController@store` via `SubscribeRequest` (FormRequest)

**Zod schema:** `@amt/shared` → `SubscribeRequestSchema`, `SubscribeResponseSchema`

---

### 3.3 Auth Endpoints

#### `POST /api/admin/login`
Rate limit: admin-login (configured).

**Request:**
```json
{
  "email": "admin@adsvance.com",
  "password": "secret",
  "remember": false
}
```

**Response 200:**
```json
{
  "token": "1|sanctum_token_string",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@adsvance.com"
  }
}
```

**Response 401:** `{ "message": "Invalid credentials. Try again." }`

---

#### `GET /api/me` (auth:sanctum)
**Response 200:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@adsvance.com"
  }
}
```

---

#### `POST /api/logout` (auth:sanctum)
**Response 200:** `{ "data": { "message": "Logged out." } }`

---

### 3.4 Admin CRUD Endpoints (auth:sanctum)

All admin CRUD endpoints follow the same pattern:
- `index` / `adminIndex` → `GET` → `{ "data": [...] }`
- `store` → `POST` → `{ "data": {...} }` (201)
- `update` → `PUT /{id}` → `{ "data": {...} }`
- `destroy` → `DELETE /{id}` → `{ "data": { "message": "Deleted." } }`

#### Services Admin

| Method | URI | Controller | Notes |
|--------|-----|-----------|-------|
| POST | `/api/services` | `ServiceController@store` | |
| PUT | `/api/services/{service}` | `ServiceController@update` | |
| DELETE | `/api/services/{service}` | `ServiceController@destroy` | |

**Store/Update request fields:**
| Field | Rules |
|-------|-------|
| title | required|string, max:255 |
| description | required|string |
| icon | required|string, max:255 |
| is_featured | boolean |
| sort_order | integer |

#### Team Members Admin

| Method | URI | Controller | Notes |
|--------|-----|-----------|-------|
| POST | `/api/team` | `TeamMemberController@store` | |
| PUT | `/api/team/{teamMember}` | `TeamMemberController@update` | |
| DELETE | `/api/team/{teamMember}` | `TeamMemberController@destroy` | |

#### Pages Admin

| Method | URI | Controller | Notes |
|--------|-----|-----------|-------|
| GET | `/api/admin/pages` | `PageController@adminIndex` | All pages (no published filter) |
| POST | `/api/pages` | `PageController@store` | |
| PUT | `/api/pages/{page}` | `PageController@update` | |
| DELETE | `/api/pages/{page}` | `PageController@destroy` | |

#### Pricing Plans Admin

| Method | URI | Controller | Notes |
|--------|-----|-----------|-------|
| POST | `/api/pricing-plans` | `PricingPlanController@store` | |
| PUT | `/api/pricing-plans/{pricingPlan}` | `PricingPlanController@update` | |
| DELETE | `/api/pricing-plans/{pricingPlan}` | `PricingPlanController@destroy` | |

**Note:** There is no admin-specific GET for all pricing plans. The admin uses the same `GET /api/pricing-plans` which filters by `is_published: true`. This means the admin cannot see unpublished plans — this may be a bug.

**Store/Update request fields (PricingPlan):**
| Field | Rules |
|-------|-------|
| name | required|string, max:255 |
| price | required|numeric, min:0 |
| interval | required|string, in:monthly,yearly,one-time |
| description | nullable|string |
| cta_text | nullable|string, max:255 |
| is_popular | boolean |
| is_published | boolean |
| sort_order | integer |
| features | array (optional) — each: { description, is_included, sort_order } |

#### Blog Posts Admin

| Method | URI | Controller | Notes |
|--------|-----|-----------|-------|
| POST | `/api/blog-posts` | `BlogPostController@store` | |
| PUT | `/api/blog-posts/{blogPost}` | `BlogPostController@update` | |
| DELETE | `/api/blog-posts/{blogPost}` | `BlogPostController@destroy` | |

**Store/Update request fields:**
| Field | Rules |
|-------|-------|
| title | required|string, max:255 |
| slug | required|string, max:255, unique:marketing_blog_posts,slug |
| content | required|string |
| excerpt | nullable|string, max:300 |
| is_published | boolean |
| published_at | nullable|date |
| featured_image | nullable|file, mimes:jpeg,png,webp,svg, max:2048 |

#### Media Library Admin

| Method | URI | Controller | Notes |
|--------|-----|-----------|-------|
| GET | `/api/media` | `MediaController@index` | Paginated 24 per page |
| POST | `/api/media` | `MediaController@store` | Multipart form data |
| DELETE | `/api/media/{media}` | `MediaController@destroy` | |

**GET /api/media Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "hero-image",
      "file_name": "hero-image.jpg",
      "size": 102400,
      "mime_type": "image/jpeg",
      "url": "http://localhost:8000/storage/1/hero-image.jpg",
      "thumbnail": "http://localhost:8000/storage/1/conversions/hero-image-thumb.jpg",
      "created_at": "2026-07-21T00:00:00+00:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 24,
    "total": 58
  }
}
```

**POST /api/media Request:** Multipart form with field `file` (JPG, PNG, WebP, SVG, max 2MB).
**SVG Sanitization:** SVG uploads are stripped of `<script>` tags and `on*` event handler attributes server-side.

#### Dashboard Stats

| Method | URI | Controller |
|--------|-----|-----------|
| GET | `/api/admin/stats` | `StatsController@index` |

**Response:**
```json
{
  "services": 5,
  "blog_posts": 3,
  "unread_messages": 2,
  "subscribers": 10
}
```

**Note:** Uses `safeCount()` helper wrapping queries in try/catch for tables that don't exist yet. `blog_posts` is hardcoded as 0 until BlogPost model existed (now query-based).

---

## 4. Frontend Component Props & Interfaces

### 4.1 Admin API Interfaces (`lib/admin-api.ts`)

All admin interfaces match their corresponding API resource shapes (see Section 3). Key types:

```typescript
interface ServiceData {
  id: number;
  title: string; description: string; icon: string;
  is_featured: boolean; sort_order: number;
  created_at: string | null; updated_at: string | null;
}

interface TeamMemberData {
  id: number; name: string; role: string; bio: string | null;
  photo_url: string | null;
  social_links: { linkedin: string | null; twitter: string | null } | null;
  sort_order: number;
  created_at: string | null; updated_at: string | null;
}

interface PageData {
  id: number; title: string; slug: string;
  hero_heading: string | null; hero_subtext: string | null;
  sections: Record<string, unknown>[] | null;
  is_published: boolean;
  created_at: string | null; updated_at: string | null;
}

interface MediaData {
  id: number; name: string; file_name: string; size: number;
  mime_type: string; url: string; thumbnail: string;
  created_at: string;
}

interface PricingPlanData {
  id: number; name: string; price: number; interval: string;
  description: string | null; cta_text: string | null;
  is_popular: boolean; is_published: boolean; sort_order: number;
  features: PricingPlanFeatureData[];
  created_at: string | null; updated_at: string | null;
}

interface PricingPlanFeatureData {
  id?: number; description: string; is_included: boolean; sort_order: number;
}

interface BlogPostData {
  id: number; title: string; slug: string; content: string;
  excerpt: string | null; featured_image_url: string | null;
  is_published: boolean; published_at: string | null;
  created_at: string | null; updated_at: string | null;
}

interface DashboardStats {
  services: number; blog_posts: number;
  unread_messages: number; subscribers: number;
}
```

### 4.2 Public API Interfaces (`lib/api.ts`)

```typescript
interface ThemeData {
  primary_color?: string; secondary_color?: string; accent_color?: string;
  background_color?: string; foreground_color?: string;
  muted_color?: string; muted_foreground_color?: string;
  border_color?: string; success_color?: string; error_color?: string;
  body_font?: string; heading_font?: string;
}
```

Note: `ServiceData`, `TeamMemberData`, `PageData`, `PricingPlanData`, `PlanFeatureData` are duplicated in both files with the same shapes.

### 4.3 Component Props

| Component | File | Props | Notes |
|-----------|------|-------|-------|
| Header | `components/Header.tsx` | none (reads sections via IntersectionObserver) | Public site navbar |
| Footer | `components/Footer.tsx` | none | Public site footer |
| BackToTop | `components/BackToTop.tsx` | none | Floating button, hidden until 300px scroll |
| ThemeProvider | `components/ThemeProvider.tsx` | `{ children: ReactNode }` | Fetches `/api/theme`, sets CSS vars |
| ServicesGrid | `components/ServicesGrid.tsx` | `{ services: ServiceData[] }` | Public homepage |
| PricingTable | `components/PricingTable.tsx` | `{ plans: PricingPlanData[] }` | Public homepage |
| TeamGrid | `components/TeamGrid.tsx` | `{ members: TeamMemberData[] }` | Public homepage |
| BlogEditor | `components/BlogEditor.tsx` | `{ content: string; onChange: (html: string) => void }` | Quill wrapper |
| PageRenderer | `components/PageRenderer.tsx` | `{ page: PageData }` | Renders sections by type |
| Sidebar (admin) | `components/admin/sidebar.tsx` | none | Nav groups: Main, Leads, Settings |
| StatsOverview (admin) | `components/admin/stats-overview.tsx` | `{ stats: DashboardStats }` | |
| button | `components/ui/button.tsx` | shadcn variant | |
| card | `components/ui/card.tsx` | shadcn variant | |
| input | `components/ui/input.tsx` | shadcn variant | |
| table | `components/ui/table.tsx` | shadcn variant | |
| label | `components/ui/label.tsx` | shadcn variant | |
| alert-dialog | `components/ui/alert-dialog.tsx` | shadcn variant | |

---

## 5. Validation Rules (Complete)

### 5.1 Backend FormRequest Validation

| Endpoint | Field | Rules |
|----------|-------|-------|
| POST/PUT services | title | `required` (store) / `sometimes` (update), `string`, `max:255` |
| | description | `required` / `sometimes`, `string` |
| | icon | `required` / `sometimes`, `string`, `max:255` |
| | is_featured | `boolean` |
| | sort_order | `integer` |
| POST/PUT team | name | `required` / `sometimes`, `string`, `max:255` |
| | role | `required` / `sometimes`, `string`, `max:255` |
| | bio | `nullable`, `string` |
| | social_links | `nullable`, `json` |
| | sort_order | `integer` |
| | photo | `nullable`, `file`, `mimes:jpeg,png,webp`, `max:2048` |
| POST/PUT pricing-plans | name | `required` / `sometimes`, `string`, `max:255` |
| | price | `required` / `sometimes`, `numeric`, `min:0` |
| | interval | `required` / `sometimes`, `string`, `in:monthly,yearly,one-time` |
| | description | `nullable`, `string` |
| | cta_text | `nullable`, `string`, `max:255` |
| | is_popular | `boolean` |
| | is_published | `boolean` |
| | sort_order | `integer` |
| POST/PUT pages | title | `required` / `sometimes`, `string`, `max:255` |
| | slug | `required` / `sometimes`, `string`, `max:255`, `unique:marketing_pages,slug` |
| | hero_heading | `nullable`, `string` |
| | hero_subtext | `nullable`, `string` |
| | sections | `nullable`, `json` |
| | is_published | `boolean` |
| POST/PUT blog-posts | title | `required` / `sometimes`, `string`, `max:255` |
| | slug | `required` / `sometimes`, `string`, `max:255`, `unique:marketing_blog_posts,slug` |
| | content | `required` / `sometimes`, `string` |
| | excerpt | `nullable`, `string`, `max:300` |
| | is_published | `boolean` |
| | published_at | `nullable`, `date` |
| | featured_image | `nullable`, `file`, `mimes:jpeg,png,webp,svg`, `max:2048` |
| POST contact | name | `required`, `string`, `max:255` |
| | email | `required`, `string`, `email`, `max:255` |
| | message | `required`, `string`, `min:1` |
| POST subscribe | email | `required`, `string`, `email`, `max:255`, `unique:contact_subscribers,email` |

### 5.2 Rate Limiting

| Endpoint | Limit | Period |
|----------|-------|--------|
| POST `/api/contact` | 5 requests | 1 minute per IP |
| POST `/api/subscribe` | 3 requests | 1 minute per IP |
| POST `/api/admin/login` | 5 requests | 1 minute per IP |

---

## 6. Named Routes (for reference)

From `routes/api.php`:

```php
// Public GET
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/team', [TeamMemberController::class, 'index']);
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{slug}', [BlogPostController::class, 'show']);
Route::get('/pricing-plans', [PricingPlanController::class, 'index']);
Route::get('/theme', [ThemeController::class, 'index']);

// Public POST (throttled)
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
Route::post('/subscribe', [SubscribeController::class, 'store'])->middleware('throttle:subscribe');

// Auth
Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:admin-login');

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/pages', [PageController::class, 'adminIndex']);
    // Services, Team, Pages, PricingPlans, BlogPosts CRUD...
    Route::get('/admin/stats', [StatsController::class, 'index']);
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::delete('/media/{media}', [MediaController::class, 'destroy']);
});

// Fallback
Route::fallback(fn() => response()->json(['message' => 'Not found.'], 404));
```

---

## 7. Data Flow Maps

### 7.1 Content Read (Public)
```
Visitor browser → GET / (Next.js SSG)
  → fetch("/api/services") → GET /api/services → ServiceController@index
      → Service::orderBy('sort_order')->get() → ServiceResource::collection()
      → { "data": [...] } JSON
  → fetch("/api/theme") → GET /api/theme → ThemeController@index
      → ThemeSetting::first() → $theme->only([...])
      → { "data": { ... } } JSON → ThemeProvider writes CSS vars
```

### 7.2 Content Write (Admin)
```
Admin form submit → POST /api/services
  → auth:sanctum middleware (validates Bearer token)
  → $request->validate([...]) inline validation
  → Service::create($validated)
  → ApiResponse::success(new ServiceResource($service), 201)
  → { "data": { ... } } JSON
```

### 7.3 Pricing Plan Save (with nested features)
```
Admin form submit → POST /api/pricing-plans
  → auth:sanctum middleware
  → validate plan fields
  → if is_popular: clear other popular plans
  → PricingPlan::create($data)
  → for each feature: $plan->features()->create([...])
  → $plan->load('features')
  → PricingPlanResource::collection($plan)
```

### 7.4 Contact Form Submit
```
Visitor form submit → POST /api/contact
  → throttle:contact (5/min/IP)
  → ContactRequest validation
  → ContactMessage::create([name, email, message, read_at: null])
  → (queue email notification — v1 may be synchronous)
  → { "data": { "message": "...", "contact_message": { id, name, email, created_at } } }
```

---

## 8. CORS Configuration

| Environment | Allowed Origins |
|-------------|-----------------|
| Local dev | `*` |
| Production | Restricted to deployed frontend domain |

Configured in `config/cors.php`:
```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'supports_credentials' => true,
];
```

---

## 9. Theme System

### CSS Custom Properties (set by ThemeProvider)
```
--color-primary        (default: #ff0000)
--color-secondary      (default: #fb3d03)
--color-accent         (default: #FFC107)
--color-background     (default: #FFFFFF)
--color-foreground     (default: #333333)
--color-muted          (default: #f5f5f5)
--color-muted-foreground (default: #888888)
--color-border         (default: #f0f0f0)
--color-success        (default: #22c55e)
--color-error          (default: #ef4444)
--font-body            (default: 'Poppins', sans-serif)
--font-heading         (default: 'Poppins', sans-serif)
```

### Implementation
- `ThemeProvider` fetches `GET /api/theme` at build time
- If response `data` is empty object, use hardcoded defaults above
- Writes CSS vars into a `<style>` tag or inline on `:root` in the layout
- Tailwind v4 extends from `var(--color-*)` via `@theme` in `globals.css`
- **No component should hardcode brand colors** — always use `var(--color-*)` or Tailwind classes (`bg-primary`, `text-foreground`)

---

## 10. Media Handling

| Model | Media Collection | Conversions | Accepted Types |
|-------|-----------------|-------------|----------------|
| BlogPost | `featured_image` (single) | `thumb` (150x150 crop) | jpeg, png, webp, svg+xml |
| TeamMember | `photo` (single) | `thumb` (150x150 crop) | jpeg, png, webp |
| MediaLibrary | `default` | (automatic) | jpg, jpeg, png, webp, svg |

All uploads go through Spatie Media Library — no direct `Storage::put()` anywhere.
