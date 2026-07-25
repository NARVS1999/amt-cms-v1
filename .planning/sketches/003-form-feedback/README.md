---
sketch: 003
name: form-feedback
question: "How should form validation feedback, save states, and destructive confirmations look?"
winner: "C"
tags: [forms, validation, toast, feedback]
---

# Sketch 003: Form Feedback & Toasts

## Design Question
How should form validation feedback, save states, and destructive confirmations look and feel?

## How to View
open .planning/sketches/003-form-feedback/index.html

## Variants
- **A: Below Input** — Field errors appear below each input in small red text. Standard, clean, familiar.
- **B: Beside Input** — Errors appear in a colored chip beside the field. More visible, uses horizontal space.
- **C: Top Alert + Toast** — Error banner at form top + bottom-right toast notifications. Also includes delete confirmation modal demo.

## What to Look For
- Click the state cycler buttons to see idle/saving/error/success states
- In Variant C, try the save button (shows toast), error button (shows alert), and delete button (shows modal)
- Which error placement feels most natural for the admin panel?
- Does the toast placement feel right at bottom-right?
