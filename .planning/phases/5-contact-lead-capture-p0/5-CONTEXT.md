# Phase 5: Contact & Lead Capture (P0) - Context

**Gathered:** 2026-07-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Contact form and newsletter subscription functionality. Includes contact form with validation and email notification, newsletter subscription in footer, and admin theme settings management (colors, logos, favicon).

Covers: Contact form (name/email/message), client-side Zod validation, server-side storage + email notification, rate limiting (5/min), newsletter subscribe form in footer (single email input), admin theme settings page (primary/secondary/accent colors, logo upload, favicon).

</domain>

<decisions>
## Implementation Decisions

### Contact Form Design
- **D-01:** Contact form fields: Name, Email, Message — standard contact form, matches FR-9 requirements.
- **D-02:** After submission: show success message inline + clear form — simple, no redirect needed.
- **D-03:** Client-side Zod validation before API call, show errors inline — better UX than server-only validation.
- **D-04:** Rate limit: 5 submissions per minute per IP — already defined in NFR-5.

### Newsletter & Theme Settings
- **D-05:** Newsletter subscribe form lives in footer of all public pages — always visible, high conversion.
- **D-06:** Subscribe flow: single email input + submit button — one step, minimal friction.
- **D-07:** Admin theme settings: primary/secondary/accent colors, logo upload, favicon — core branding only.
- **D-08:** Theme changes apply immediately on save — no preview mode needed for v1.

### the agent's Discretion
- Contact form layout and styling (standard single-column recommended)
- Success/error message styling
- Newsletter footer placement within existing footer structure
- Theme settings page layout in admin panel

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Contact form placeholder on homepage (now CTA to `/contact`)
- Newsletter subscription in requirements (FR-10)
- Theme CSS variables defined in `globals.css` `:root` block
- Zod validation patterns from `packages/shared/src/schemas/`

### Established Patterns
- SSG with `output: 'export'` — all pages generated at build time
- CSS custom properties via `var(--color-*)` — no hardcoded brand colors
- Admin CRUD pages follow Phase 01.1 patterns (loading states, toasts, validation)
- API endpoints use `{ "data": ... }` envelope

### Integration Points
- Public layout at `app/(public)/layout.tsx` — footer lives here
- Admin settings page at `app/admin/settings/page.tsx` (to be created)
- Contact API endpoint: `POST /api/contact`
- Subscribe API endpoint: `POST /api/subscribe`
- Theme API endpoint: `GET/PUT /api/admin/theme`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for contact form, newsletter, and theme settings.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
