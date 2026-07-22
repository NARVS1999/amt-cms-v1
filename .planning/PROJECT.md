---
title: Adsvance Media Tech CMS
version: v1.0
status: active
created: 2026-07-23
---

# Project: Adsvance Media Tech CMS

## Elevator Pitch

A clean, reusable content management system on Laravel + Next.js that powers Adsvance's own marketing site and serves as a ready-made foundation for client projects. Swap the logo, change the primary color, fill in the content — and a client has their own CMS-driven site without writing code.

## Goals

- **G1:** Enable John to update all marketing content (services, pricing, team, blog, pages) through an admin panel — no HTML editing required
- **G2:** Provide a themeable CMS foundation that can be white-labeled for client deployments in under 2 hours
- **G3:** Capture contact form submissions and newsletter signups with reliable delivery

## Non-Goals

- Not a drag-and-drop page builder
- Not multi-tenant (each deployment = separate instance)
- Not e-commerce (no cart, payments, inventory)
- Not multilingual (English only)
- Not real-time collaborative editing

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12 (PHP 8.2) |
| Frontend | Next.js 16.2.10 SSG (React 19) |
| Database | MySQL 8.x (prod) / MariaDB 10.4 (dev) |
| CSS | Tailwind CSS v4 |
| Auth | Laravel Sanctum |
| Media | Spatie Media Library 11.x |
| Validation | Laravel FormRequest (backend) + Zod 3.x (frontend) |
| Rich Text | Quill.js 2.x |
| Icons | Font Awesome Free 6.x (public) + Lucide React (admin) |

## Architecture Decisions

See `.planning/intel/decisions.md` for full details. Key locked decisions:

- **AD-1:** Flat Laravel — no DDD
- **AD-2:** SSG only — no server-side rendering
- **AD-3:** REST API contract with `{ "data": ... }` envelope
- **AD-4:** CSS custom properties — no hardcoded brand colors
- **AD-6:** Spatie Media Library for all file uploads
- **AD-7:** Unidirectional content flow

## Hosting

**Hostinger Business Shared** — Laravel in `~/laravel_app/`, static frontend in `~/public_html/`. No Node.js runtime on server. No Redis.

## Success Metrics

- **SM-1:** John can update any content and see it live within 5 minutes of rebuild
- **SM-2:** Client deployment with brand customization under 2 hours
- **SM-3:** Blog post from "New Post" click to public live in under 3 minutes
