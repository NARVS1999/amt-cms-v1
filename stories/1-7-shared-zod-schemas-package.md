# Story 1.7: Shared Zod Schemas Package

Status: done

baseline_commit: 7bd5c82e6a88c6242401616eab2d214dc0e4d40c

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want **Zod schemas in `packages/shared` that mirror the API response shapes**,
So that **the frontend has type safety and build-time validation matching the backend contract**.

## Acceptance Criteria

**Given** `packages/shared/` is set up as an npm workspace with `package.json` and `tsconfig.json`
**When** I check the `src/schemas/` directory
**Then** it contains schema files for: `page.ts`, `service.ts`, `team-member.ts`, `blog-post.ts`, `pricing-plan.ts`, `theme.ts`, `contact.ts`, `subscriber.ts`

**Given** the `page.ts` schema
**When** I inspect it
**Then** it validates: id (number), title (string), slug (string), hero_heading (string|null), hero_subtext (string|null), sections (JSON object|null), timestamps

**Given** the `blog-post.ts` schema
**When** I inspect it
**Then** it validates: id (number), title (string), slug (string), content (string), excerpt (string|null), featured_image_url (string|null), published_at (string|null), is_published (boolean), timestamps

**Given** the `pricing-plan.ts` schema
**When** I inspect it
**Then** it validates plan fields and includes a nested array of `PlanFeature` objects (description, is_included)

**Given** all schemas are exported from `src/index.ts`
**When** I import from `@amt/shared` in the frontend
**Then** I get typed inference for all API response shapes

## Tasks / Subtasks

- [x] **Set up packages/shared workspace** (AC: npm workspace, package.json, tsconfig)
  - [x] Create `packages/shared/package.json` — name `@amt/shared`, `main`/`types` → `./src/index.ts`, dep `zod: ^3.23.0`
  - [x] Create `packages/shared/tsconfig.json` — strict mode, `moduleResolution: bundler`, no build emit needed
  - [x] Create `packages/shared/src/` directory
  - [x] Install Zod v3 (resolved: **3.25.76** — see version guardrail in Dev Notes)
- [x] **Register workspace at root** (AC: npm workspaces includes @amt/shared)
  - [x] Root `package.json` has `"workspaces": ["apps/backend", "apps/frontend", "packages/shared"]`
  - [x] `apps/frontend/package.json` depends on `"@amt/shared": "*"`
  - [x] `npm install` from root symlinks the workspace (`npm ls @amt/shared` → `.\packages\shared`)
- [x] **Create service schema** (live contract — backed by `ServiceResource`)
  - [x] Create `packages/shared/src/schemas/service.ts`
  - [x] Fields: id, title, description, icon, is_featured, sort_order, timestamps + `ServicesResponseSchema`
- [x] **Create page schema** (live contract — backed by `PageResource`)
  - [x] Create `packages/shared/src/schemas/page.ts`
  - [x] Fields: id, title, slug, hero_heading|null, hero_subtext|null, sections|null, is_published, timestamps + list/single response schemas
- [x] **Create team-member schema** (live contract — backed by `TeamMemberResource`)
  - [x] Create `packages/shared/src/schemas/team-member.ts`
  - [x] Fields: id, name, role, bio|null, photo_url|null, social_links|null, sort_order, timestamps + `TeamMembersResponseSchema`
- [x] **Create blog-post schema** (FORWARD contract — Epic 4 implements backend)
  - [x] Create `packages/shared/src/schemas/blog-post.ts`
  - [x] Fields: id, title, slug, content, excerpt|null, featured_image_url|null, published_at|null, is_published, timestamps + list/single response schemas
- [x] **Create pricing-plan schema** (FORWARD contract — Epic 3 implements backend)
  - [x] Create `packages/shared/src/schemas/pricing-plan.ts`
  - [x] Fields: id, name, price, interval (enum), description|null, is_popular, is_published, cta_text|null, sort_order, features (PlanFeature[]), timestamps
- [x] **Create theme schema** (live contract — backed by `ThemeController`)
  - [x] Create `packages/shared/src/schemas/theme.ts`
  - [x] `ThemeSchema` = `{ data: z.record(z.string()) }` envelope (see Known Gaps — currently unused by frontend)
- [x] **Create contact schema** (live contract — backed by `ContactController` + `ContactRequest`)
  - [x] Create `packages/shared/src/schemas/contact.ts`
  - [x] `ContactRequestSchema` (name, email, message — mirrors FormRequest rules/messages) + `ContactResponseSchema` (201 envelope)
- [x] **Create subscriber schema** (live contract — backed by `SubscribeController` + `SubscribeRequest`)
  - [x] Create `packages/shared/src/schemas/subscriber.ts`
  - [x] `SubscribeRequestSchema` (email) + `SubscribeResponseSchema` (201 envelope)
- [x] **Create barrel export** (AC: all schemas exported from src/index.ts)
  - [x] `packages/shared/src/index.ts` re-exports all 8 schema modules (schemas + inferred types)
- [x] **Verify frontend consumption** (AC: frontend imports @amt/shared with typed inference)
  - [x] `apps/frontend/lib/api.ts` imports `PagesResponseSchema`, `ServicesResponseSchema`, `TeamMembersResponseSchema` and `.parse()`es API responses
  - [x] `npx tsc --noEmit` passes in both `packages/shared` and `apps/frontend`
  - [x] `npm run build` (frontend) succeeds with the workspace import resolved

## Dev Notes

### Architecture Compliance

**AD-3 — REST API is the contract:**
- All public data flows through `GET /api/*`; submissions through `POST /api/*`
- Success envelope: `{ "data": ... }`. Validation-failure envelope: `{ "message": "...", "errors": { "field": ["..."] } }` (HTTP 422)
- **Backend validation (Laravel FormRequest) is the authority.** Zod schemas in `packages/shared` are the TypeScript-side *projection* — they must never diverge from what the API actually returns, and they never replace server-side validation
- This package exists so the frontend gets (a) compile-time types via `z.infer` and (b) build-time runtime validation via `.parse()` when fetching at SSG build time

**Monorepo boundaries (project-context.md):**
- `apps/frontend` → `packages/shared` is the ONLY allowed cross-package import. Apps never import from other apps
- `packages/shared` contains ONLY TypeScript Zod schemas exported from `src/index.ts` — **no PHP, no runtime app logic, no fetch code**
- TypeScript strict mode — no `any` types (`sections` uses `z.unknown()` values, not `any`)

**Dependency direction:** `apps/backend` owns validation via FormRequest classes; it does NOT import `@amt/shared`. The shared package is a frontend-side reference.

### Package Configuration (actual, verified)

```json
// packages/shared/package.json
{
  "name": "@amt/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": { "zod": "^3.23.0" }
}
```

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "strict": true, "esModuleInterop": true, "skipLibCheck": true,
    "declaration": true, "composite": true, "outDir": "./dist"
  },
  "include": ["src"]
}
```

**Why `main` points at raw `.ts` source:** there is no build step for this package. Next.js 16 and `tsc` in `apps/frontend` consume the TypeScript source directly through the workspace symlink. Do NOT add a compile step or point `main` at `dist/` — `outDir`/`composite` exist only for editor/project-reference ergonomics. Verification is `npx tsc --noEmit`, not emit.

### Zod Version Guardrail

- **Pinned: Zod v3** (`^3.23.0`, resolved `3.25.76`) per PRD addendum and architecture stack table
- **DO NOT upgrade to Zod 4.** v4 breaks APIs this package relies on (`z.record()` requires two args, error-message customization API changed, `.default()`/`.nullable()` semantics differ). An upgrade is a deliberate, separate decision requiring a sweep of every schema file and the frontend client
- Import style everywhere: `import { z } from 'zod';`

### Schema ↔ API Contract Map

| Schema file | Endpoint(s) | Backend source of truth | Contract status |
|---|---|---|---|
| `service.ts` | `GET /api/services` | `ServiceResource` | **Live** — backend shipped (Story 1.5/2.x) |
| `page.ts` | `GET /api/pages`, `GET /api/pages/{slug}` | `PageResource` | **Live** |
| `team-member.ts` | `GET /api/team` | `TeamMemberResource` | **Live** |
| `theme.ts` | `GET /api/theme` | `ThemeController@index` (no resource class) | **Live** (schema currently unused — see Known Gaps) |
| `contact.ts` | `POST /api/contact` | `ContactController` + `ContactRequest` | **Live** |
| `subscriber.ts` | `POST /api/subscribe` | `SubscribeController` + `SubscribeRequest` | **Live** |
| `blog-post.ts` | `GET /api/blog-posts`, `GET /api/blog-posts/{slug}` | *none yet* — controller returns `success([])` / `success(null)` | **FORWARD** — Epic 4 must implement backend to match |
| `pricing-plan.ts` | `GET /api/pricing-plans` | *none yet* — controller returns `success([])` | **FORWARD** — Epic 3 must implement backend to match |

**Envelope helpers used:** list endpoints → `{ data: T[] }`; single-record endpoints → `{ data: T | null }`; POST success → HTTP 201 with `{ data: { message, <entity> } }`.

### Live Schemas — Field-Level Ground Truth

**service.ts** — mirrors `ServiceResource::toArray()` exactly:
```typescript
export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),                                  // Font Awesome class, e.g. 'fa-solid fa-code'
  is_featured: z.boolean().optional().default(false),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),                 // ISO 8601 via ->toIso8601String()
  updated_at: z.string().nullable(),
});
export const ServicesResponseSchema = z.object({ data: z.array(ServiceSchema) });
```
- `is_featured` is always returned by the resource; `.optional().default(false)` is lenient so partial admin payloads also parse. Matches Story 2.1 fields spec.

**page.ts** — mirrors `PageResource::toArray()`:
```typescript
export const PageSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  hero_heading: z.string().nullable(),
  hero_subtext: z.string().nullable(),
  sections: z.array(z.record(z.unknown())).nullable(),
  is_published: z.boolean().default(false),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export const PagesResponseSchema = z.object({ data: z.array(PageSchema) });
export const PageResponseSchema = z.object({ data: PageSchema.nullable() });
```
- `sections` is cast `'array'` on the `Page` model (table: `marketing_pages`). Per Story 2.5, section objects carry `type`, `heading`, `content`, `image` — the schema intentionally stays loose (`record(unknown)`) until the section taxonomy stabilizes. Tightening to a discriminated union on `type` is a future refinement, not this story.
- Public list responses contain only `is_published = true` records — filtering happens at the backend query level (project-context gotcha), not in the schema.

**team-member.ts** — mirrors `TeamMemberResource::toArray()`:
```typescript
export const TeamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string(),
  bio: z.string().nullable(),
  photo_url: z.string().nullable(),                  // Spatie 'thumb' conversion (150x150 crop) or null
  social_links: z.object({
    linkedin: z.string().url().nullable(),
    twitter: z.string().url().nullable(),
  }).nullable(),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export const TeamMembersResponseSchema = z.object({ data: z.array(TeamMemberSchema) });
```
- `photo_url` comes from `$this->getFirstMediaUrl('photo', 'thumb') ?: null` — never an empty string; either a full URL or `null`
- `social_links` is a JSON cast on the model (Story 2.3 fields spec: `{linkedin, twitter}` optional)

**theme.ts:**
```typescript
export const ThemeSchema = z.object({ data: z.record(z.string()) });
export type Theme = z.infer<typeof ThemeSchema>;
```
- Backend returns `{ data: { primary_color, secondary_color, accent_color, background_color, foreground_color, muted_color, muted_foreground_color, border_color, success_color, error_color, body_font, heading_font } }` — 12 known string keys (`ThemeController@index`), or `{ data: {} }` when no `ThemeSetting` row exists
- ⚠️ **Currently unused by the frontend** — see Known Gaps below

**contact.ts** — mirrors `ContactRequest` rules AND `ContactController` 201 response:
```typescript
export const ContactRequestSchema = z.object({
  name: z.string().min(1, 'Your name is required.').max(255, 'Name too long.'),
  email: z.string().email('Please provide a valid email address.').max(255, 'Email too long.'),
  message: z.string().min(1, 'A message is required.').max(5000, 'Message must not exceed 5000 characters.'),
});
export const ContactResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    contact_message: z.object({
      id: z.number(), name: z.string(), email: z.string(), created_at: z.string(),
    }),
  }),
});
```
- Error messages deliberately match `ContactRequest::messages()` wording so client-side and server-side validation read identically (Epic 6 contact form)
- The request schema is for the Epic 6 form's client-side pre-validation; the FormRequest remains the authority

**subscriber.ts** — mirrors `SubscribeRequest` + `SubscribeController` 201 response:
```typescript
export const SubscribeRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address.').max(255, 'Email too long.'),
});
export const SubscribeResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    subscriber: z.object({ id: z.number(), email: z.string(), subscribed_at: z.string() }),
  }),
});
```
- `SubscribeRequest` also enforces `unique:contact_subscribers,email` — Zod CANNOT check uniqueness client-side. The form must handle HTTP 422 `{ message, errors: { email: ["Already subscribed."] } }` (Epic 6)

### Forward-Contract Schemas (Epic 3 & 4 must conform)

These schemas are the **published contract**. The backend controllers today return empty stubs (`success([])`); when Epics 3 and 4 build the real models/resources, the API responses MUST parse against these schemas — that is the acceptance test for contract conformance.

**blog-post.ts** (Epic 4; fields per Story 4.1):
```typescript
export const BlogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),                                  // unique, auto-from-title, admin-overridable
  content: z.string(),                               // Quill HTML, sanitized via HTMLPurifier before render
  excerpt: z.string().nullable(),                    // max 300 chars per Story 4.1
  featured_image_url: z.string().nullable(),         // Spatie single-file collection
  published_at: z.string().nullable(),               // ISO 8601, auto-set on first publish
  is_published: z.boolean().default(false),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export const BlogPostsResponseSchema = z.object({ data: z.array(BlogPostSchema) });
export const BlogPostResponseSchema = z.object({ data: BlogPostSchema.nullable() });
```

**pricing-plan.ts** (Epic 3; fields per Story 3.1 + project-context):
```typescript
export const PlanFeatureSchema = z.object({
  id: z.number(),
  description: z.string(),
  is_included: z.boolean(),                          // green check vs red cross on pricing card
});
export const PricingPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),                                 // decimal(10,2) in DB; display as ₱XXX in UI
  interval: z.enum(['monthly', 'yearly', 'one-time']),
  description: z.string().nullable(),
  is_popular: z.boolean().default(false),            // only ONE plan may be popular (project-context gotcha)
  is_published: z.boolean().default(false),
  cta_text: z.string().nullable(),                   // button label, defaults to "Get Started" in UI
  sort_order: z.number().default(0),
  features: z.array(PlanFeatureSchema),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export const PricingPlansResponseSchema = z.object({ data: z.array(PricingPlanSchema) });
```

### Known Gaps & Contract Risks (read before touching this package)

1. **`is_popular` vs `is_most_popular` naming** — the schema and `project-context.md` use `is_popular`; Story 3.1's fields spec says `is_most_popular`. **Epic 3 must reconcile**: either the API resource emits `is_popular` (preferred — matches this shipped schema), or this schema and its consumers are renamed in the same change. Do not let both names ship.
2. **`PlanFeatureSchema` vs Story 3.1 fields** — schema has `id` but no `sort_order`; Story 3.1 lists `sort_order` on features. If feature reordering ships in Epic 3, add `sort_order: z.number().default(0)` here (additive, non-breaking).
3. **`ThemeSchema` is unused** — `apps/frontend/lib/api.ts::fetchTheme()` hand-rolls validation (`'data' in json` check) and casts `as ThemeData` (a local interface with the 12 known optional keys); `ThemeProvider` imports nothing from `@amt/shared`. `z.record(z.string())` accepts any keys and is looser than the real payload. Acceptable for now; if a third theme consumer appears, replace with an explicit 12-key object schema and delete `ThemeData`.
4. **Local interfaces duplicate inferred types** — `lib/api.ts` declares `ServiceData`/`TeamMemberData`/`PageData` interfaces alongside the imported schemas (they must stay structurally identical; `.parse()` guarantees it at runtime, but the duplicates are maintenance debt). Structural seed's `lib/types.ts` was never created. Future cleanup: drop the local interfaces and use `z.infer` types directly.
5. **`sections` is loosely typed** (`array(record(unknown)) | null`) by design — tighten to a section `type` discriminated union once Story 2.5/2.6 settles the taxonomy.
6. **No uniqueness/async refinements** — Zod schemas here are synchronous shape checks only. Server-side rules like `unique:contact_subscribers,email` surface as 422 error envelopes and are the form's responsibility.

### Consumption Pattern (how the frontend uses this package)

`apps/frontend/lib/api.ts` is the **only current consumer**. Pattern for every fetch (established in Story 1.6):

```typescript
import { ServicesResponseSchema } from '@amt/shared';

export async function fetchServices(): Promise<ServiceData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_URL}/services`, { signal: controller.signal });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const parsed = ServicesResponseSchema.parse(json);   // ← runtime contract check
    return parsed.data;
  } catch {
    return [];                                            // list fetchers degrade to empty
  } finally {
    clearTimeout(timeout);
  }
}
```

- `.parse()` **throws** on shape mismatch → caught → fetcher degrades (`[]` for lists, `null` for theme). This is how a backend contract drift surfaces as a build-time failure instead of silent UI corruption
- Runs at **SSG build time** (AD-2) — these fetches execute during `npm run build`, not in the browser
- When adding a new consumer (Epics 2–6): import the `*ResponseSchema` from `@amt/shared`, `.parse()` the raw JSON inside the try block, degrade in the catch. Never `as`-cast unvalidated JSON except where already documented (theme)

### File Structure

```
packages/shared/
├── package.json            # @amt/shared, zod ^3.23.0
├── tsconfig.json           # strict, moduleResolution: bundler
└── src/
    ├── schemas/
    │   ├── service.ts      # LIVE — ServiceResource
    │   ├── page.ts         # LIVE — PageResource
    │   ├── team-member.ts  # LIVE — TeamMemberResource
    │   ├── theme.ts        # LIVE — ThemeController (schema unused)
    │   ├── contact.ts      # LIVE — request + 201 response
    │   ├── subscriber.ts   # LIVE — request + 201 response
    │   ├── blog-post.ts    # FORWARD — Epic 4
    │   └── pricing-plan.ts # FORWARD — Epic 3
    └── index.ts            # barrel: export * from all 8 modules
```

### Testing Requirements

- `npx tsc --noEmit` in `packages/shared` passes with zero errors (strict mode)
- `npx tsc --noEmit` in `apps/frontend` passes — proves workspace types resolve
- `npm run build` in `apps/frontend` succeeds — proves Next.js 16 resolves the workspace `.ts` source import
- `npm ls @amt/shared` from repo root shows the symlinked workspace (`@amt/shared@1.0.0 -> .\packages\shared`)
- Each schema accepts conforming payloads and rejects non-conforming ones (spot-check via `.parse()` / `.safeParse()` in a scratch script or REPL)
- **Deferred:** Vitest API-client tests with mocked fetch + Zod mismatch assertions (project-context frontend testing rule) — no frontend test infrastructure exists yet (recorded in `stories/deferred-work.md`)

### Non-Functional Constraints

| Constraint | Requirement | How Met |
|---|---|---|
| **AD-3** | Zod = TS projection of API contract; FormRequest is authority | Schemas mirror resources/controllers field-for-field; request schemas mirror FormRequest rules + messages |
| **AD-2** | SSG build-time consumption | Schemas only used inside build-time fetchers in `lib/api.ts` |
| **NFR-10** | Zero-cost software mandate | Zod is MIT |
| **project-context** | Strict TS, no `any`; `packages/shared` = schemas only | `strict: true`; `z.unknown()` for open JSON; no PHP/app logic in package |
| **Version pin** | Zod 3.x per PRD addendum + architecture stack | `^3.23.0` → 3.25.76; v4 upgrade forbidden without dedicated sweep |

### Previous Story Intelligence (Story 1.6)

- Story 1.6 scaffolded the Next.js 16 frontend (`output: 'export'`, Tailwind v4 CSS-first config) and created `apps/frontend/lib/api.ts` — this story's schemas plug into that client's fetchers
- Established fetch pattern: `AbortController` + 5s timeout, `res.ok` check, envelope check, degrade-on-catch. `.parse()` slots in between `res.json()` and returning data
- `ThemeProvider` got its theme via the hand-rolled `fetchTheme()`/`ThemeData` path (not `@amt/shared`) — the old completion note claiming it imports `Theme` from `@amt/shared` was **wrong**; corrected in Known Gaps #3
- Backend API routes + envelope from Story 1.5 (`ApiResponse` trait: `success(mixed $data)` → `{ data }`, `error(msg, code, errors)` → `{ message, errors? }`) are the envelope every response schema models

### References

- [Source: docs/epics.md#Story-1.7] — Full AC (lines 495-521)
- [Source: docs/epics.md#Story-2.1 / 2.3 / 2.5] — Live schema field specs (service, team-member, page)
- [Source: docs/epics.md#Story-3.1] — PricingPlan/PlanFeature field spec (forward contract; note `is_most_popular` naming conflict)
- [Source: docs/epics.md#Story-4.1] — BlogPost field spec (forward contract)
- [Source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md#AD-3---REST-API-is-the-contract] — Envelope + projection rules
- [Source: docs/architecture/architecture-AMT_V2-2026-07-18/ARCHITECTURE-SPINE.md#Structural-Seed] — `packages/shared` layout
- [Source: docs/project-context.md#TypeScript-Frontend--Shared] — Strict mode, no `any`, package boundaries
- [Source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/addendum.md#Package-Choices] — Zod 3.x pin
- Backend ground truth (verified this rewrite): `app/Http/Resources/Api/{Page,Service,TeamMember}Resource.php`, `app/Http/Controllers/Api/{Theme,Contact,Subscribe,BlogPost,PricingPlan}Controller.php`, `app/Http/Requests/{Contact,Subscribe}Request.php`, `app/Traits/ApiResponse.php`, `app/Models/{Page,TeamMember}.php`
- Consumer ground truth: `apps/frontend/lib/api.ts`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Shared package `@amt/shared` created at `packages/shared/` with Zod v3 (3.25.76) schemas.
- 8 schema files: service, page, team-member, blog-post, pricing-plan (with PlanFeature), theme, contact, subscriber.
- All schemas export both the schema and inferred TypeScript types via barrel `src/index.ts`.
- Workspace linked: `npm ls @amt/shared` shows `@amt/shared@1.0.0 -> .\packages\shared`.
- Frontend consumer: `apps/frontend/lib/api.ts` imports `PagesResponseSchema`, `ServicesResponseSchema`, `TeamMembersResponseSchema` and `.parse()`es responses at build time.
- Correction (rewrite): ThemeProvider does NOT import from `@amt/shared` — theme uses local `ThemeData` in `lib/api.ts`; `ThemeSchema` is currently unused. See Known Gaps #3.
- blog-post/pricing-plan schemas are forward contracts; backend controllers are stubs until Epics 3/4.
- `npx tsc --noEmit` passes in both `packages/shared` and `apps/frontend`; full `npm run build` succeeds.

### File List

- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/schemas/page.ts`
- `packages/shared/src/schemas/service.ts`
- `packages/shared/src/schemas/team-member.ts`
- `packages/shared/src/schemas/blog-post.ts`
- `packages/shared/src/schemas/pricing-plan.ts`
- `packages/shared/src/schemas/theme.ts`
- `packages/shared/src/schemas/contact.ts`
- `packages/shared/src/schemas/subscriber.ts`
- `apps/frontend/lib/api.ts` (patched: `TeamMemberData.social_links` keys made optional)
- `apps/frontend/components/TeamGrid.tsx` (patched: `TeamCard` prop type keys made optional)

### Review Findings

- [x] [Review][Patch] `social_links` inner keys should be optional [packages/shared/src/schemas/team-member.ts:9-12] — Dev notes say `{linkedin, twitter}` optional but `z.object()` requires both keys when present. If admin saves only one social link, schema rejects API response at build time. **PATCHED** — made inner keys `.optional()`; also updated `TeamMemberData` interface in `api.ts` and `TeamCard` prop type in `TeamGrid.tsx` to match.
- [x] [Review][Defer] `ThemeSchema` unused by frontend consumer [apps/frontend/lib/api.ts:112-134] — deferred, pre-existing (Known Gap #3)
- [x] [Review][Defer] Local interfaces duplicate `z.infer` types [apps/frontend/lib/api.ts:20-91] — deferred, pre-existing (Known Gap #4)
- [x] [Review][Defer] `PricingPlan.price` number vs decimal [packages/shared/src/schemas/pricing-plan.ts:12] — deferred, forward contract (Epic 3 must conform)
