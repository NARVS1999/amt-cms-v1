# Phase 7: Lead Management (v1.1) - Context

**Gathered:** 2026-07-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin views and manages contact messages and subscribers. Includes contact message list view with mark-as-read and delete, subscriber list view with delete, and wiring the sidebar placeholder links to real pages.

Covers: Contact message admin page (table with name/email/message/date/read/actions, detail modal, mark-as-read toggle, delete), subscriber admin page (table with email/date/actions, delete), sidebar navigation links (Messages, Subscribers).

</domain>

<decisions>
## Implementation Decisions

### Contact Message Management
- **D-01:** Messages table columns: Name, Email, Message (truncated), Date, Read status, Actions (view/delete).
- **D-02:** Mark-as-read: click row or button toggles read status — simple toggle.
- **D-03:** Detail view: modal shows full message with mark-read and delete actions.
- **D-04:** Default sort order: newest first (created_at desc).

### Subscriber Management
- **D-05:** Subscribers table columns: Email, Date subscribed, Actions (delete).
- **D-06:** Admin can delete subscribers — removes subscriber from list.
- **D-07:** No bulk delete for v1 — single delete only, keep it simple.
- **D-08:** Default sort order: newest first (created_at desc).

### the agent's Discretion
- Modal styling and layout for message detail
- Confirmation dialog for delete actions
- Empty states for messages and subscribers lists
- Badge/indicator for unread message count in sidebar

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- ContactMessage model exists (from Phase 5 contact form)
- Subscriber model exists (from Phase 5 newsletter subscribe)
- Dashboard stats already count unread_messages and subscribers
- Admin sidebar has placeholder links for Messages and Subscribers

### Established Patterns
- Admin CRUD pages follow Phase 01.1 patterns (loading states, toasts, validation)
- Tables use shadcn Table component with sorting/filtering
- Modals use shadcn Dialog component
- Delete confirmations use AlertDialog pattern

### Integration Points
- Sidebar at `components/admin/sidebar.tsx` — Messages and Subscribers links need real hrefs
- Contact API: need admin endpoints for messages (GET, PUT read status, DELETE)
- Subscriber API: need admin endpoints for subscribers (GET, DELETE)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for message and subscriber management.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
