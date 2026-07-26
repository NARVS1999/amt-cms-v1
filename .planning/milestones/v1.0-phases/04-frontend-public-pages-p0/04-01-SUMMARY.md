---
phase: 04-frontend-public-pages-p0
plan: 04-01
subsystem: frontend
tags: [theme, pricing, contact, fallback, CTA]
dependency_graph:
  requires: []
  provides: [theme-fallback, pricing-cta, contact-cta]
  affects: [04-02]
tech_stack:
  added: []
  patterns: [graceful-fallback, css-custom-properties]
key_files:
  created: []
  modified:
    - apps/frontend/components/ThemeProvider.tsx
    - apps/frontend/components/PricingTable.tsx
    - apps/frontend/app/(public)/page.tsx
decisions:
  - FALLBACK_THEME constant provides hardcoded defaults matching globals.css :root (D-02)
  - buildCssVars merges API theme over FALLBACK_THEME, never throws
  - PricingTable CTA links to /contact page (D-06)
  - Homepage contact section is CTA link to /contact (D-06)
metrics:
  duration: ~5min
  completed: 2026-07-26
  tasks: 2
  files: 3
status: complete
---

# Phase 4 Plan 01: ThemeProvider Fallback + PricingTable CTA + Contact CTA Summary

ThemeProvider graceful fallback with hardcoded defaults, PricingTable CTA linking to /contact, and homepage contact section as CTA link.

## What Was Built

### ThemeProvider Graceful Fallback (D-02)
- Added `FALLBACK_THEME` constant with all 12 theme properties matching `globals.css :root` defaults
- `buildCssVars()` now merges API theme data over fallback defaults — never throws
- Catch block falls back to `FALLBACK_THEME` on any error
- Removed NFR-8 build-time throw — site builds successfully without Laravel API running

### PricingTable CTA (D-06)
- Changed CTA button `href="#contact"` to `href="/contact"`
- Popular ribbon continues to use `var(--color-primary)` background

### Homepage Contact CTA (D-06)
- Replaced "Contact form coming soon" placeholder with functional CTA
- "Get in Touch" heading + "Ready to grow your business?" subtext
- CTA button links to `/contact` with primary color background

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written.

## Known Stubs

None — all implementations are complete and functional.

## Self-Check

### Files Modified
- [x] `apps/frontend/components/ThemeProvider.tsx` — fallback logic, FALLBACK_THEME
- [x] `apps/frontend/components/PricingTable.tsx` — CTA href change
- [x] `apps/frontend/app/(public)/page.tsx` — contact CTA

### Commits
- [x] `0f31c29`: feat(04-01): ThemeProvider fallback + PricingTable CTA + Contact CTA
- [x] `3c7fe2c`: test(04-01): verify SSG build with ThemeProvider fallback

### Verification
- [x] TypeScript compiles cleanly (`npx tsc --noEmit`)
- [x] SSG build succeeds — all pages generate
- [x] ThemeProvider uses fallback colors when API unavailable (no throw)
- [x] PricingTable CTA links to /contact
- [x] Homepage contact section links to /contact

### Self-Check: PASSED
