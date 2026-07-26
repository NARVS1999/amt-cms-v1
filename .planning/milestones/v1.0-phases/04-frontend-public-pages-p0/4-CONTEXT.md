# Phase 4: Frontend Public Pages (P0) - Context

**Gathered:** 2026-07-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Public site components and pages consuming the API. Focuses on theme integration (CSS custom properties from API settings), pricing table polish (responsive, features, CTA, popular ribbon), and ensuring all public pages render correctly with proper loading states.

Covers: Theme CSS variable injection at build time, pricing table responsive design and popular plan highlighting, contact section as CTA link, skeleton loaders for data-dependent sections.

</domain>

<decisions>
## Implementation Decisions

### Theme Integration
- **D-01:** Fetch theme settings at build time via `generateStaticProps`, inject as inline `<style>` on `<body>` — works with SSG, no client-side fetch needed.
- **D-02:** If theme API is unavailable during build, use hardcoded fallback colors from `globals.css` `:root` — site still renders gracefully.
- **D-03:** Admin panel is independent — uses its own Inter font + neutral palette, does not inherit public theme colors.

### Pricing Table & Public Pages Polish
- **D-04:** Popular plan gets a ribbon/badge with accent color — visual emphasis without changing card layout.
- **D-05:** Pricing table responsive breakpoint: single column on mobile, 2-3 columns on desktop — standard pricing table pattern.
- **D-06:** Contact section on homepage is a CTA link to `/contact` page (Phase 5 will build the full form) — keeps Phase 4 scope tight.
- **D-07:** Public pages use skeleton loaders for data-dependent sections (services, team, pricing) — reuses components from Phase 01.1.

### the agent's Discretion
- Specific skeleton loader implementations per section
- Exact ribbon/badge styling for popular plan
- Transition animations between page states

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Skeleton component (`components/ui/skeleton.tsx`) — already built in Phase 01.1
- PricingTable component (`components/PricingTable.tsx`) — exists, needs responsive polish
- ServicesGrid, TeamGrid, LatestPosts components — exist on homepage
- Theme CSS variables defined in `globals.css` `:root` block

### Established Patterns
- SSG with `output: 'export'` — all pages generated at build time
- CSS custom properties via `var(--color-*)` — no hardcoded brand colors
- Font Awesome for public site icons
- Responsive design with Tailwind CSS v4

### Integration Points
- Theme API endpoint (if exists) or hardcoded theme settings
- Homepage at `app/(public)/page.tsx` — imports all section components
- Public layout at `app/(public)/layout.tsx` — wraps all public pages

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for theme integration and responsive pricing table design.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
