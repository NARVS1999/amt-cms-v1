# Phase 2: Marketing Content Backend (P0) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-26
**Phase:** 2-Marketing Content Backend (P0)
**Areas discussed:** Team Member Photo Upload

---

## Team Member Photo Upload

| Option | Description | Selected |
|--------|-------------|----------|
| Upload directly in form | File input in the team member form, Spatie handles it inline. Simple, single-step. Separate from media library. | ✓ |
| Select from Media Library | Opens the Phase 1 media library browser. User picks an existing image. | |
| Both — upload or pick | File input to upload new AND a 'Browse Library' option to pick existing. | |

**User's choice:** Upload directly in form
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Replace on re-upload | Uploading a new photo replaces the old one (Spatie handles cleanup). No separate 'remove' action needed. | |
| Explicit remove + replace | Separate 'Remove Photo' button that clears the image, plus upload for replacement. Two distinct actions. | ✓ |

**User's choice:** Explicit remove + replace
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Initials on muted bg | Show first/last initials on a muted background circle. Standard pattern, no image needed. | |
| Generic avatar icon | Show a generic user icon (Lucide User icon) in a circle. No initials, just icon. | ✓ |
| Upload prompt area | Show a dashed-border upload zone with 'Click to upload photo' text. | |

**User's choice:** Generic avatar icon
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Recommended sizing only | Show dimensions guidance (e.g., 'Recommended: 400x400px') but no hard enforcement. | ✓ |
| Enforced constraints | Hard limits: max 2MB, square crop (1:1 aspect ratio), JPEG/PNG/WebP only. | |

**User's choice:** Recommended sizing only
**Notes:** None

---

## Claude's Discretion

The following areas were identified but not discussed — Claude will use standard/reasonable approaches:

- **Page Sections Schema & Editor:** What section types go in the JSON `sections` field
- **Pricing Plan Features UI:** How to manage 1:N features (inline rows recommended)
- **Sort Order / Reordering:** Up/down buttons vs drag-and-drop (simple buttons recommended)
- **Service Icon Picker:** Text input vs visual picker (text input recommended)
- **Featured Service Toggle:** Simple boolean toggle

## Deferred Ideas

None.
