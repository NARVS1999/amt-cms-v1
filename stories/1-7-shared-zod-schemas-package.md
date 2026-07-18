# Story 1.7: Shared Zod Schemas Package

Status: review

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
  - [x] Create `packages/shared/package.json` with name `@amt/shared`
  - [x] Create `packages/shared/tsconfig.json` (strict mode)
  - [x] Create `packages/shared/src/` directory
  - [x] Install Zod: `npm install zod` in packages/shared
- [x] **Update root package.json** (AC: npm workspaces includes @amt/shared)
  - [x] Ensure `"workspaces": ["apps/backend", "apps/frontend", "packages/shared"]` in root `package.json`
- [x] **Create service schema** (AC: validates service API response)
  - [x] Create `packages/shared/src/schemas/service.ts`
  - [x] Fields: id, title, description, icon, sort_order, timestamps
- [x] **Create page schema** (AC: validates page API response)
  - [x] Create `packages/shared/src/schemas/page.ts`
  - [x] Fields: id, title, slug, hero_heading|null, hero_subtext|null, sections|null, is_published, timestamps
- [x] **Create team-member schema** (AC: validates team member API response)
  - [x] Create `packages/shared/src/schemas/team-member.ts`
  - [x] Fields: id, name, role, bio|null, photo_url|null, sort_order, timestamps
- [x] **Create blog-post schema** (AC: validates blog post API response)
  - [x] Create `packages/shared/src/schemas/blog-post.ts`
  - [x] Fields: id, title, slug, content, excerpt|null, featured_image_url|null, published_at|null, is_published, timestamps
- [x] **Create pricing-plan schema** (AC: validates pricing plan + features)
  - [x] Create `packages/shared/src/schemas/pricing-plan.ts`
  - [x] Fields: id, name, price, interval (enum), description|null, is_popular, is_published, cta_text|null, sort_order, features (PlanFeature[]), timestamps
- [x] **Create theme schema** (AC: validates theme API response)
  - [x] Create `packages/shared/src/schemas/theme.ts`
  - [x] Fields: z.record(z.string()) for key-value pairs
- [x] **Create contact schema** (AC: validates contact form submission)
  - [x] Create `packages/shared/src/schemas/contact.ts`
  - [x] Request: name, email, message; Response: success + contact_message
- [x] **Create subscriber schema** (AC: validates newsletter subscription)
  - [x] Create `packages/shared/src/schemas/subscriber.ts`
  - [x] Request: email; Response: success + subscriber data
- [x] **Create barrel export** (AC: all schemas exported from src/index.ts)
  - [x] Create `packages/shared/src/index.ts`
  - [x] Export all schemas and inferred types
- [x] **Verify frontend import** (AC: frontend can import @amt/shared)
  - [x] Import `@amt/shared` in ThemeProvider.tsx successfully
  - [x] `npm install` from root links workspace packages
  - [x] `npx tsc --noEmit` passes (both shared and frontend)
  - [x] `npm run build` succeeds with import resolved

## Dev Notes

### Package Structure

```
packages/shared/
├── package.json          # name: "@amt/shared"
├── tsconfig.json         # strict mode, composite
└── src/
    ├── schemas/
    │   ├── service.ts
    │   ├── page.ts
    │   ├── team-member.ts
    │   ├── blog-post.ts
    │   ├── pricing-plan.ts
    │   ├── theme.ts
    │   ├── contact.ts
    │   └── subscriber.ts
    └── index.ts          # barrel export
```

### Package Configuration

```json
// packages/shared/package.json
{
  "name": "@amt/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "composite": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

### Schema Examples

**service.ts:**
```typescript
import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const ServicesResponseSchema = z.object({
  data: z.array(ServiceSchema),
});

export type Service = z.infer<typeof ServiceSchema>;
export type ServicesResponse = z.infer<typeof ServicesResponseSchema>;
```

**pricing-plan.ts:**
```typescript
import { z } from 'zod';

export const PlanFeatureSchema = z.object({
  id: z.number(),
  description: z.string(),
  is_included: z.boolean(),
});

export const PricingPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  interval: z.enum(['monthly', 'yearly', 'one-time']),
  description: z.string().nullable(),
  is_popular: z.boolean().default(false),
  is_published: z.boolean().default(false),
  cta_text: z.string().nullable(),
  sort_order: z.number().default(0),
  features: z.array(PlanFeatureSchema),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PricingPlansResponseSchema = z.object({
  data: z.array(PricingPlanSchema),
});

export type PricingPlan = z.infer<typeof PricingPlanSchema>;
export type PlanFeature = z.infer<typeof PlanFeatureSchema>;
```

**index.ts:**
```typescript
export * from './schemas/page';
export * from './schemas/service';
export * from './schemas/team-member';
export * from './schemas/blog-post';
export * from './schemas/pricing-plan';
export * from './schemas/theme';
export * from './schemas/contact';
export * from './schemas/subscriber';
```

### Field Mapping (API → Schema)

| API Endpoint | Schema File | Key Fields |
|-------------|-------------|-----------|
| `GET /api/services` | service.ts | id, title, description, icon, sort_order |
| `GET /api/pages` | page.ts | id, title, slug, hero_heading, hero_subtext, sections, is_published |
| `GET /api/team` | team-member.ts | id, name, role, bio, photo_url, sort_order |
| `GET /api/blog-posts` | blog-post.ts | id, title, slug, content, excerpt, featured_image_url, published_at, is_published |
| `GET /api/pricing-plans` | pricing-plan.ts | id, name, price, interval, features[], is_popular, cta_text |
| `GET /api/theme` | theme.ts | key-value record (flat object) |
| `POST /api/contact` | contact.ts | name, email, message |
| `POST /api/subscribe` | subscriber.ts | email |

### Important Notes

- **Zod v3.x** is the version to use (latest stable)
- **Backend validation** is the authority — Laravel FormRequest classes define the actual validation rules. The Zod schemas are the TypeScript-side projection (AD-3).
- **Response envelope:** All schemas should be designed to work with the `{ "data": ... }` envelope. Create a helper `ApiResponseSchema<T>` if desired.
- **Frontend imports** from `@amt/shared` after npm workspace linking: `npm install` at root level creates symlinks.
- **No PHP code** in `packages/shared` — TypeScript only (AD-3).
- **Strict mode** required in `tsconfig.json` — no `any` types.

### Testing Requirements

- `npx tsc --noEmit` in packages/shared passes without errors
- Each schema validates correct data and rejects invalid data
- Frontend can import `@amt/shared` and get type inference
- npm workspace resolution works: `npm ls @amt/shared` shows linked package

### Previous Story Intelligence

- Story 1.6 scaffolded the Next.js 16 frontend with `output: 'export'` and Tailwind v4
- The frontend uses TypeScript in strict mode
- The frontend's `lib/api.ts` will consume these schemas for type-safe API calls
- Backend API routes are defined in Story 1.5 with 8 route groups

### References

- [Source: docs/epics.md#Story-1.7] — Full AC and field specifications
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3---REST-API-is-the-contract] — API contract rules
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Shared package structure
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Database-Schema-Migrations] — All DB schema specs (source for schema fields)
- [Source: docs/project-context.md#TypeScript-Frontend--Shared] — TypeScript rules
- [Source: docs/prds/addendum.md#Package-Choices] — Zod 3.x version

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Shared package `@amt/shared` created at `packages/shared/` with Zod v3.x schemas.
- 8 schema files: service, page, team-member, blog-post, pricing-plan (with PlanFeature), theme, contact, subscriber.
- All schemas export both the schema and inferred TypeScript types.
- Barrel export via `src/index.ts`.
- Workspace linked: `npm ls @amt/shared` shows `@amt/shared@1.0.0 -> .\packages\shared`.
- Frontend imports `Theme` type from `@amt/shared` in ThemeProvider.
- `npx tsc --noEmit` passes in both packages/shared and apps/frontend.
- Full `npm run build` succeeds in frontend.

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
