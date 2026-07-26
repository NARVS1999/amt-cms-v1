# Phase 6: Admin Panel (P0) - Context

**Gathered:** 2026-07-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin UI polish and remaining admin features. Focuses on completing dashboard stats to show all 7 content types, ensuring consistent UX across all admin CRUD pages, and polishing the admin panel for production use.

Covers: Dashboard stats expansion (add Team Members, Pricing Plans, Pages counts), admin table/form consistency, page header standardization, sidebar navigation verification.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Stats Completeness
- **D-01:** Dashboard shows all 7 content type counts: Services, Team Members, Blog Posts, Pricing Plans, Pages, Messages, Subscribers — complete visibility.
- **D-02:** Grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile — responsive grid adapts to screen size.
- **D-03:** Stat cards link to their respective admin CRUD pages — click navigates to the content type's list view.

### Admin UX Consistency
- **D-04:** All admin CRUD tables use consistent column structure: Name/Title, Description/Excerpt, Sort Order, Actions (edit/delete).
- **D-05:** All admin forms use consistent validation: Zod client-side + Laravel server-side, inline error display.
- **D-06:** Sidebar does NOT show content type counts as badges — keep sidebar clean, counts only on dashboard.
- **D-07:** Admin pages have consistent page headers: Title + description + action button pattern.

### the agent's Discretion
- Specific stat card colors/icons for new content types
- Table column widths and responsive behavior
- Form layout and field ordering within CRUD pages

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- StatsOverview component (`components/admin/stats-overview.tsx`) — needs expansion for 7 content types
- Admin sidebar (`components/admin/sidebar.tsx`) — already has all navigation items
- Admin CRUD pages exist for: Services, Team, Blog Posts, Pricing Plans, Pages

### Established Patterns
- Admin pages follow Phase 01.1 patterns (loading states, toasts, validation)
- Stat cards use Lucide icons with colored backgrounds
- Tables use shadcn Table component with sorting/filtering

### Integration Points
- Dashboard at `app/admin/dashboard/page.tsx` — imports StatsOverview
- Stats API endpoint: `GET /api/admin/stats` — needs to return all 7 content type counts
- Admin sidebar navigation already wired to all CRUD pages

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for dashboard expansion and UX consistency.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
