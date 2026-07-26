# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Adsvance Media Tech CMS

**Shipped:** 2026-07-27
**Phases:** 8 | **Plans:** 21 | **Sessions:** ~30

### What Was Built
- Full-stack CMS: Laravel 12 REST API + Next.js 16 SSG frontend
- Admin panel with Sanctum auth, 5 content CRUD pages, theme settings, dashboard stats
- Blog system with Quill rich text editor, HTMLPurifier sanitization, public pages
- Theme system with CSS custom properties, fallback theme, admin color pickers
- Contact form with queued email notification, newsletter subscription
- Lead management (messages + subscribers) admin pages
- Loading UI system: skeletons, toasts, page transitions, form feedback
- 115 automated tests (467 assertions), 14,108 LOC

### What Worked
- Tracer → Expansion pattern worked well for each phase (small focused commits)
- Phase 01.1 (inserted loading UI) was the right call — improved UX across all subsequent phases
- Spatie Media Library eliminated upload complexity entirely
- SSG with `output: 'export'` kept frontend simple and fast
- Inline validation in controllers kept flow straightforward without FormRequest overhead
- Quill.js was the right choice — lightweight, no server dependency

### What Was Inefficient
- ROADMAP.md checkbox tracking drifted from actual completion status (Phase 06-02, Phase 03)
- Some phases had more plans than initially estimated (Phase 3 went from 3 to 5 plans)
- NFR-3 and NFR-5 deferred — should have been planned as explicit production-phase work
- No CI/CD means manual verification on every change

### Patterns Established
- Admin CRUD pattern: Migration → Model → Factory → Resource → Controller → Routes → Admin Page → API functions → Tests
- Public GET endpoints return raw `Resource::collection()` (no `data` envelope)
- Admin endpoints use `$this->success()` from ApiResponse trait
- CSS vars injected via ThemeProvider with FALLBACK_THEME for resilience
- Skeleton loading on all data-dependent pages
- Toast notifications via useToast() hook across all admin pages

### Key Lessons
1. Insert phases when urgency demands (01.1 was right decision) — don't wait for next milestone
2. Track checkboxes diligently — minor tracking inconsistencies compound into confusion
3. Plan NFRs explicitly — deferring production config without a plan leads to accumulation
4. SSG constraint simplified everything — no server-side complexity, no SSR edge cases
5. Test-first approach caught issues early — 115 tests provided confidence for rapid iteration

### Cost Observations
- Model mix: mimo-v2.5 (primary), opus (complex tasks)
- Sessions: ~30 across 5 days
- Notable: Phase execution accelerated as patterns were established — later phases faster than earlier ones

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~30 | 8 | First milestone — established all core patterns |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 115 | 467 assertions | 0 |

### Top Lessons (Verified Across Milestones)

1. Phase insertion pattern (01.1) works when urgency is real — don't defer UX improvements
2. Tracer → Expansion wave pattern scales well for feature development
