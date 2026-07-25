---
name: sketch-findings-amt-v2
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments. Auto-loaded during UI implementation on AMT_V2.
---

<context>
## Project: AMT_V2

Smooth & polished loading states for the admin panel. Pulse skeleton animations, branded dot loading overlay, and inline form feedback with toast notifications.

Reference: UI-SPEC for Phase 01.1 (Loading and progress UI).

Sketch sessions wrapped: 2026-07-26
</context>

<design_direction>
## Overall Direction

- **Animation style:** Pulse (opacity fade, 1.8s) — subtle, polished, non-distracting
- **Page transitions:** Branded dot overlay — three bouncing red dots on white semi-transparent background
- **Form feedback:** Inline errors below inputs, top alert banner for API errors, bottom-right toast for success
- **Destructive actions:** Modal confirmation dialog with resource name, Cancel/Delete buttons
- **Button loading:** Text swap to context-specific copy ("Saving...", "Signing in...") + disabled state
- **Toast behavior:** Success = auto-dismiss 2s; Error = manual dismiss
- **Color tokens:** Reuse existing CSS custom properties (`--color-muted`, `--color-destructive`, `--color-primary`) — no new variables
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Loading States | references/loading-states.md | Pulse animation for all skeleton instances (table rows, stat cards, list items) |
| Page Transitions | references/page-transitions.md | Branded 3-dot overlay on semi-transparent white background |
| Form Feedback & Notifications | references/form-feedback.md | Below-input errors, top alert banners, bottom-right toasts, delete modals |

## Theme

The winning theme file is at `sources/themes/default.css`.

## Source Files

Original sketch HTML files are preserved in `sources/` for complete reference.
</findings_index>

<metadata>
## Processed Sketches

- 001-skeleton-loading
- 002-page-transition
- 003-form-feedback
</metadata>
