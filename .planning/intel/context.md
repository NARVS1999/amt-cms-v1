# Ingest Context

- **Project:** Adsvance Media Tech CMS v1.0
- **Date:** 2026-07-23
- **8 documents ingested:** 2 PRD, 6 DOC
- **Scope:** CMS for Adsvance's marketing website + reusable client foundation
- **Stack:** Laravel 12 + Next.js 16 (SSG) + MySQL + Tailwind CSS v4
- **Mode:** merge (`.planning/` exists with codebase map)
- **Architecture decisions locked:** 8 (AD-1 through AD-8)
- **Functional requirements:** 15 (FR-1 through FR-15), 13 P0, 2 deferred
- **Non-functional requirements:** 8 (NFR-1 through NFR-8)
- **Constraints:** Hostinger shared hosting, zero-cost software, no DDD, SSG-only
- **Design tokens:** Defined in DESIGN.md for public and admin surfaces
- **Build plan:** 7-day sprint structure from addendum
- **Testing:** PHPUnit for backend, no frontend tests yet
- **Contract:** `{ "data": ... }` envelope, Zod schemas in `packages/shared`
