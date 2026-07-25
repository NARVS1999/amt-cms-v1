# Constraints

## API Response Envelope
- source: docs/SPEC.md
- type: api-contract
- content: All API responses follow { "data": ... } for success (200/201), { "message": "...", "errors": { "field": ["..."] } } for validation failure (422), { "message": "..." } for client error (400/401/403/404/429) and server error (500). Exception: GET /api/media returns { "data": [...], "meta": { current_page, last_page, per_page, total } }.

## Rate Limiting
- source: docs/SPEC.md
- type: nfr
- content: POST /api/contact — 5/min per IP. POST /api/subscribe — 3/min per IP. POST /api/admin/login — 5/min per IP. Database-backed (no Redis).

## CORS Configuration
- source: docs/SPEC.md
- type: nfr
- content: Local dev — allowed origins *. Production — restricted to deployed frontend domain. paths: api/*, allowed_methods: *, supports_credentials: true.

## Database Schema — marketing_services
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), title (string 255 required), description (text required), icon (string 255 required, Font Awesome class), is_featured (boolean default false), sort_order (integer default 0), timestamps.

## Database Schema — marketing_team_members
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), name (string 255 required), role (string 255 required), bio (text nullable), social_links (json nullable), sort_order (integer default 0), timestamps.

## Database Schema — marketing_pages
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), title (string 255 required), slug (string 255 unique indexed), hero_heading (text nullable), hero_subtext (text nullable), sections (json nullable), is_published (boolean default false), timestamps.

## Database Schema — marketing_blog_posts
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), title (string 255 required), slug (string 255 unique indexed), content (longText rich HTML), excerpt (text nullable), is_published (boolean default false), published_at (timestamp nullable), sort_order (integer default 0), timestamps.

## Database Schema — billing_pricing_plans
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), name (string 255 required), price (decimal 10,2), interval (string 50 enum monthly/yearly/one-time), description (text nullable), cta_text (string 255 nullable), is_popular (boolean default false), is_published (boolean default false), sort_order (integer default 0), timestamps.

## Database Schema — billing_plan_features
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), pricing_plan_id (bigInteger FK cascade delete), description (string 255 required), is_included (boolean default true), sort_order (integer default 0), timestamps.

## Database Schema — theme_settings
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), primary_color (string nullable), secondary_color, accent_color, background_color, foreground_color, muted_color, muted_foreground_color, border_color, success_color, error_color, body_font, heading_font — all string nullable. timestamps.

## Database Schema — contact_contact_messages
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), name (string 255 required), email (string 255 required), message (text required), read_at (timestamp nullable), timestamps.

## Database Schema — contact_subscribers
- source: docs/SPEC.md
- type: schema
- content: Columns: id (bigIncrements PK), email (string 255 unique), subscribed_at (timestamp required), timestamps.

## API Endpoint — GET /api/services
- source: docs/SPEC.md
- type: api-contract
- content: Returns all services ordered by sort_order. Response: { "data": [{ id, title, description, icon, is_featured, sort_order, created_at, updated_at }] }.

## API Endpoint — GET /api/team
- source: docs/SPEC.md
- type: api-contract
- content: Returns all team members ordered by sort_order. Response: { "data": [{ id, name, role, bio, photo_url, social_links, sort_order, timestamps }] }.

## API Endpoint — GET /api/pages
- source: docs/SPEC.md
- type: api-contract
- content: Returns published pages only (is_published = true). Response: { "data": [{ id, title, slug, hero_heading, hero_subtext, sections, is_published, timestamps }] }.

## API Endpoint — GET /api/pages/{slug}
- source: docs/SPEC.md
- type: api-contract
- content: Returns single published page by slug. 404: { "message": "Not found." }.

## API Endpoint — GET /api/pricing-plans
- source: docs/SPEC.md
- type: api-contract
- content: Returns published pricing plans with features, ordered by sort_order. Response: { "data": [{ id, name, price, interval, description, cta_text, is_popular, is_published, sort_order, features: [{ id, description, is_included, sort_order }], timestamps }] }.

## API Endpoint — GET /api/blog-posts
- source: docs/SPEC.md
- type: api-contract
- content: Returns blog posts ordered by created_at desc. Does NOT filter by is_published — returns all posts. content field only in show response (not index). Response: { "data": [{ id, title, slug, excerpt, featured_image_url, is_published, published_at, timestamps }] }.

## API Endpoint — GET /api/blog-posts/{slug}
- source: docs/SPEC.md
- type: api-contract
- content: Returns single blog post by slug including content field. 404: { "message": "Blog post not found." }.

## API Endpoint — GET /api/theme
- source: docs/SPEC.md
- type: api-contract
- content: Returns first ThemeSetting record as flat object. Response: { "data": { primary_color, secondary_color, accent_color, background_color, foreground_color, muted_color, muted_foreground_color, border_color, success_color, error_color, body_font, heading_font } }. Empty theme: { "data": {} }.

## API Endpoint — POST /api/contact
- source: docs/SPEC.md
- type: api-contract
- content: Request: { name (required string max:255), email (required email max:255), message (required string min:1) }. 201: { "data": { "message": "Thank you!", "contact_message": { id, name, email, created_at } } }. 429: "Too many attempts. Please try again in a minute."

## API Endpoint — POST /api/subscribe
- source: docs/SPEC.md
- type: api-contract
- content: Request: { email (required email max:255 unique:contact_subscribers,email) }. 201: { "data": { "message": "Welcome!", "subscriber": { id, email, subscribed_at } } }. 422 on duplicate.

## API Endpoint — POST /api/admin/login
- source: docs/SPEC.md
- type: api-contract
- content: Request: { email, password, remember (boolean) }. 200: { "token": "1|sanctum_token", "user": { id, name, email } }. 401: { "message": "Invalid credentials. Try again." }.

## Frontend Component — ThemeProvider
- source: docs/SPEC.md
- type: api-contract
- content: Fetches GET /api/theme at build time. If data is empty object, use hardcoded defaults. Writes CSS vars into :root. Tailwind v4 extends from var(--color-*) via @theme in globals.css.

## Theme CSS Custom Properties
- source: docs/SPEC.md
- type: nfr
- content: --color-primary (#ff0000), --color-secondary (#fb3d03), --color-accent (#FFC107), --color-background (#FFFFFF), --color-foreground (#333333), --color-muted (#f5f5f5), --color-muted-foreground (#888888), --color-border (#f0f0f0), --color-success (#22c55e), --color-error (#ef4444), --font-body (Poppins), --font-heading (Poppins).

## Media Handling
- source: docs/SPEC.md
- type: nfr
- content: BlogPost -> featured_image collection (single) with thumb conversion (150x150 crop), accepted: jpeg, png, webp, svg+xml. TeamMember -> photo collection (single) with thumb conversion, accepted: jpeg, png, webp. MediaLibrary -> default collection, accepted: jpg, jpeg, png, webp, svg. SVG uploads stripped of script tags and on* event handlers server-side.

## Build Plan — 7-Day Sprint
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/addendum.md
- type: protocol
- content: Day 1 Scaffold+Schema, Day 2 Models+Admin API+Admin UI, Day 3 Public API Layer, Day 4 Next.js Foundation, Day 5 Frontend Pages, Day 6 Contact+Polish, Day 7 Deploy Prep.

## Backend Validation Rules
- source: docs/SPEC.md
- type: schema
- content: All store/update rules documented per endpoint. Key: required for store, sometimes for update. Unique constraints on slug fields. Decimal validation on price (min:0). Boolean fields accept boolean cast. File uploads max 2048 KB.

## Version Constraints (verified Jul 2026)
- source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md
- type: nfr
- content: Laravel 12.x (security until Feb 2027), Next.js 16.2.10 LTS, React 19.x, Tailwind CSS 4.x, Spatie Media Library 11.x, PHP 8.2, MariaDB 10.4 (dev) / MySQL 8.x (prod).
