# Story 3.2: Pricing Plans Public Display

Status: ready-for-dev
baseline_commit: 752ce593c2bc54e99126b20bb2d4d964247bec4a

## Story

As a **visitor**,
I want **to see a pricing table with feature comparisons and a CTA**,
So that **I can choose the right plan and take action**.

## Acceptance Criteria

1. **Pricing section on homepage:**
   Given the homepage loads
   When the pricing section renders
   Then it shows a heading "Our Pricing" with a subtitle line
   And published pricing plans display in a responsive card grid

2. **Desktop pricing grid (≥992px):**
   Given the homepage loads on desktop
   When the pricing section renders
   Then cards display in a 3-column grid

3. **Tablet pricing grid (768-991px):**
   Given the homepage loads on tablet
   When the pricing section renders
   Then cards display in a 2-column grid

4. **Mobile pricing grid (≤767px):**
   Given the homepage loads on mobile
   When the pricing section renders
   Then cards display in a single column

5. **Most Popular badge:**
   Given a plan is marked as `is_popular = true`
   When the card renders
   Then it has a "Most Popular" ribbon/badge at the top
   And the card has a visual accent (primary colored border or elevated shadow)

6. **Pricing card content:**
   Given a pricing plan card renders
   When I inspect its contents
   Then it shows: plan name, price formatted as "₱{price}/{interval}", description, feature list, and CTA button
   And features with `is_included: true` show a green checkmark (`fa-check`)
   And features with `is_included: false` show a red cross (`fa-xmark`)

7. **CTA scroll behavior:**
   Given I click "Get Started" on any plan
   When the CTA button is clicked
   Then the page scrolls smoothly to the contact section (`#contact`)

8. **Empty state:**
   Given no published plans exist
   When the pricing section renders
   Then it is visually hidden (does not render the section)

9. **API integration:**
   Given the homepage is built via SSG
   When `GET /api/pricing-plans` is called at build time
   Then the response is parsed through the Zod schema
   And plans are displayed in `sort_order` ascending
   And build fails with a clear error if the API is unreachable (NFR-8)

## Tasks / Subtasks

- [ ] **Add fetchPricingPlans to public API client** `apps/frontend/lib/api.ts`
  - [ ] Add `PricingPlanData` interface matching API response (with nested features)
  - [ ] Add `fetchPricingPlans()` — 5s timeout, error handling, Zod validation via `PricingPlansResponseSchema.parse()`
  - [ ] Import `PricingPlansResponseSchema` from `@amt/shared`

- [ ] **Create PricingTable component** `apps/frontend/components/PricingTable.tsx`
  - [ ] Async server component (no `'use client'`) — fetches at build time
  - [ ] Renders "Our Pricing" heading + subtitle
  - [ ] Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - [ ] PricingCard component with: plan name, price (formatted ₱), interval, description
  - [ ] Feature list with green check / red cross Font Awesome icons
  - [ ] "Most Popular" badge for `is_popular === true` plans
  - [ ] Most Popular card accent styling: elevated shadow + primary border
  - [ ] CTA button "Get Started" with `onClick` scroll to `#contact` (client component or anchor link)
  - [ ] Empty state: returns null (section hidden)
  - [ ] White background section (alternates with muted sections)

- [ ] **Update homepage** `apps/frontend/app/(public)/page.tsx`
  - [ ] Replace hardcoded pricing section (`{['Starter', 'Professional', 'Enterprise'].map(...)}`) with `<PricingTable />`
  - [ ] Add import for `PricingTable` from `@/components/PricingTable`
  - [ ] Preserve all other sections unchanged

## Dev Notes

### Architecture Compliance (AD-2 / AD-3 / AD-4)

- **AD-2 — Frontend is static consumer:** Data fetched at build time via `fetch()` to Laravel REST API. `PricingTable` is an async server component.
- **AD-3 — REST API is the contract:** `GET /api/pricing-plans` already implemented in Story 3.1, returns `{ "data": [...] }` envelope with nested `features`. Zod schema exists in `packages/shared`.
- **AD-4 — CSS custom properties:** All visual tokens use `var(--color-*)`. No hardcoded brand colors.
- **No client-side state management:** PricingTable is a server component.

### Key Architectural Decisions

1. **Server Component pattern:** `PricingTable` is an async React Server Component following the exact pattern from `ServicesGrid.tsx` (Story 2.2) and `TeamGrid.tsx` (Story 2.4). No `'use client'` directive.

2. **CTA scroll via anchor link:** Use `<a href="#contact">` for "Get Started" buttons rather than `onClick` scroll. This works without JavaScript and is the pattern used elsewhere on the site (e.g., PageRenderer's "Get Started" button). It preserves server component purity.

3. **Price formatting:** The API returns `price` as a float (e.g., `99.99`). Format as `₱{price}/{interval}` e.g., "₱99.99/monthly". Use `toFixed(2)` for consistent decimal places.

4. **Most Popular accent:** Elevated card via `boxShadow` and primary border (`var(--color-primary)`). The ribbon badge uses a red primary background with white text, matching the UX-DR6 Pricing Card spec.

5. **Empty state = hidden section:** When API returns empty array, return `null`. No heading without cards.

6. **API error handling:** If the API is unreachable during build, throw an error that fails the build with a clear message (matching NFR-8 and the ServicesGrid pattern).

### Existing File States (DO NOT BREAK)

**`page.tsx`** — The pricing section is currently hardcoded:
```tsx
{/* Pricing Section */}
<section id="pricing" className="py-20">
  <div className="mx-auto max-w-7xl px-6">
    <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--color-foreground)' }}>
      Pricing Plans
    </h2>
    <p className="mt-4 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
      Flexible plans to match your business goals
    </p>
    <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {['Starter', 'Professional', 'Enterprise'].map((plan, i) => ( ... ))}
    </div>
  </div>
</section>
```
**Replace entirely** with `<PricingTable />`. Keep the `<section id="pricing">` inside the new component. Do NOT modify hero, services, about, team, blog, or contact sections.

**`lib/api.ts`** — Follow the exact `fetchServices()` / `fetchTeamMembers()` pattern:
```typescript
export async function fetchPricingPlans(): Promise<PricingPlanData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_URL}/pricing-plans`, { signal: controller.signal });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const parsed = PricingPlansResponseSchema.parse(json);
    return parsed.data;
  } finally {
    clearTimeout(timeout);
  }
}
```

**Existing pricing-plan Zod schema** (`packages/shared/src/schemas/pricing-plan.ts`):
```typescript
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
  ...
});
```
Already includes all fields needed. No schema changes required.

### Pricing Card Visual Spec (from DESIGN.md + UX-DR6)

- White card, `rounded-xl` (10px), `border` (1px solid `var(--color-border)`)
- **Most Popular variant:** `border-2 border-[var(--color-primary)]`, elevated shadow
- **Most Popular ribbon:** `<div>` with `background: var(--color-primary)`, white text, positioned at top
- **Plan name:** `text-xl font-bold`, `var(--color-foreground)`
- **Price:** `text-4xl font-extrabold`, `var(--color-foreground)`
- **Interval:** `text-base font-normal`, `var(--color-muted-foreground)`
- **Description:** `text-sm`, `var(--color-muted-foreground)`
- **Features:** list with `fa-check` (green `var(--color-success)`) and `fa-xmark` (red `var(--color-error)`)
- **CTA Button:** `rounded-lg px-8 py-3 text-sm font-semibold text-white`, `background: var(--color-primary)`, hover darken
- **Hover:** `hover:shadow-lg hover:-translate-y-1 transition-all duration-300`

### GOTCHAS — Must Follow

- ⚠️ Do NOT modify any existing sections in `page.tsx` — only replace the hardcoded pricing div with `<PricingTable />`.
- ⚠️ The pricing section should have `id="pricing"` for anchor linking from nav.
- ⚠️ CTA button must scroll to `#contact` section — use `<a href="#contact">Get Started</a>` anchor link.
- ⚠️ Price must be formatted as PHP peso: `₱{price.toFixed(2)}/{interval}`.
- ⚠️ Interval display: "monthly" → "month", "yearly" → "year", "one-time" → "one-time".
- ⚠️ Only published plans (`is_published = true`) are returned by the API — the index method already filters.
- ⚠️ The PricingTable is a white-background section (to alternate with the muted sections around it). Do NOT use `var(--color-muted)`.
- ⚠️ Font Awesome icons: `fa-check` (solid) and `fa-xmark` (solid) — both use `fa-solid` prefix.
- ⚠️ `cta_text` field can be null — fall back to "Get Started" if empty.

### Previous Story Intelligence (Story 3.1 — Pricing Plans Admin CRUD)

- **Story 3.1** created the PricingPlan + PlanFeature models, migrations, admin CRUD, and API endpoint
- **`GET /api/pricing-plans`** returns published plans sorted by `sort_order` with nested features
- **6 tests** cover sorting, empty state, response structure, nested features, unpublished filtering, most popular single-select
- **`is_popular`** naming used in DB/Zod (not `is_most_popular`)
- **Two-table design:** PricingPlan + PlanFeature (one-to-many) — features loaded via `->with('features')`
- **Controller eager-loads** features: `PricingPlan::with('features')->where('is_published', true)->orderBy('sort_order')->get()`

### Previous Story Intelligence (Story 2.4 — Team Members Public Display)

- **TeamGrid.tsx** follows the exact async RSC pattern: `fetchTeamMembers()`, Zod validation, responsive grid, empty state → null
- **Error handling:** throws on API failure with `API_URL` in message
- **CSS vars only** for all colors — no hardcoded brand colors
- **Font Awesome brand icons** use `fa-brands` prefix; check/cross icons use `fa-solid`

### Previous Story Intelligence (Story 2.2 — Services Public Display)

- **ServicesGrid.tsx** is the exact pattern to follow: async server component, fetch + Zod, responsive grid, empty state → null, error throw on build failure
- **Breakpoints:** Custom `--breakpoint-lg: 992px` in globals.css

### Git Intelligence

- Story 3.1 implemented and committed at `752ce59`
- Epic 3 is in-progress with 3.1 done, 3.2 backlog
- Pricing API endpoint fully implemented and tested

### Verification Checklist

After implementing, manually verify:
- [ ] Navigate to homepage — pricing section shows "Our Pricing" heading with subtitle
- [ ] Desktop (≥992px): 3-column grid of pricing cards
- [ ] Tablet (768-991px): 2-column grid
- [ ] Mobile (≤767px): single-column grid
- [ ] Each card shows: plan name, ₱{price}/{interval}, description, feature list with check/cross icons
- [ ] "Most Popular" plan shows red ribbon badge + primary border + elevated shadow
- [ ] Non-popular plans have standard border + shadow
- [ ] Included features show green `fa-check` icon
- [ ] Excluded features show red `fa-xmark` icon
- [ ] "Get Started" button scrolls to `#contact`
- [ ] Create 0 published plans — section is hidden on homepage
- [ ] Create 1 plan — section shows with 1 card
- [ ] Create 4+ plans — grid wraps (3-col desktop then row wrap)
- [ ] Reorder plans in admin — order matches on homepage after rebuild
- [ ] `GET /api/pricing-plans` returns nested features in JSON response
- [ ] Frontend build succeeds with API running
- [ ] Frontend build fails with clear error when API is down
- [ ] `tsc --noEmit` passes with zero errors

### References

- [Source: docs/epics.md#Story-3.2] — Full AC, UX-DR coverage
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-2] — Frontend is static consumer (SSG)
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-3] — REST API is the contract
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#AD-4] — CSS custom properties for all visual tokens
- [Source: docs/ux-designs/DESIGN.md#Components] — Pricing Card visual spec
- [Source: docs/ux-designs/DESIGN.md#public-pricing-card] — Most Popular border, ribbon, check/cross icons
- [Source: docs/ux-designs/EXPERIENCE.md#Pricing CTA] — CTA scrolls to contact section
- [Source: docs/ux-designs/EXPERIENCE.md#Responsive] — Breakpoints and grid behavior
- [Source: docs/project-context.md#Next.js-16-SSG] — SSG pattern, no getServerSideProps
- [Source: stories/3-1-pricing-plans-admin-crud.md] — Backend API, model, endpoint details
- [Source: stories/2-4-team-members-public-display.md] — Server component + API client pattern
- [Source: stories/2-2-services-public-display.md] — ServicesGrid pattern to follow
- [Source: stories/sprint-status.yaml] — Story 3.2 is next in Epic 3

## Dev Agent Record

### Implementation Plan

1. **API client** — Add `PricingPlanData` interface and `fetchPricingPlans()` to `lib/api.ts`. Follow the exact pattern from `fetchServices()` / `fetchTeamMembers()`: AbortController timeout, Zod validation via `PricingPlansResponseSchema.parse()`, error handling.

2. **PricingTable component** — Async React Server Component (no `'use client'`). Fetches pricing plans at build time via `fetchPricingPlans()`. Renders:
   - "Our Pricing" heading with subtitle
   - Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - PricingCard with: "Most Popular" badge, plan name, formatted price, description, feature list (check/cross icons), CTA anchor link to `#contact`
   - Returns `null` for empty state (section hidden)
   - Throws on API error (graceful build failure per NFR-8)

3. **Homepage update** — Replace the hardcoded pricing section in `page.tsx` (lines 28-58) with `<PricingTable />`. All other sections preserved unchanged.

4. **Frontend tests** — Deferred (no test runner configured — pre-existing infrastructure gap).

### File List

**Created:**
- `apps/frontend/components/PricingTable.tsx` — Pricing table with PricingCard component

**Modified:**
- `apps/frontend/lib/api.ts` — Added `fetchPricingPlans()` + `PricingPlanData` interface
- `apps/frontend/app/(public)/page.tsx` — Replace hardcoded pricing with `<PricingTable />`
