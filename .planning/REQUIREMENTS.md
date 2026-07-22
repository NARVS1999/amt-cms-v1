# Requirements

## Functional Requirements

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| FR-1 | Manage Services — CRUD + reorder with icon, title, description | P0 | required |
| FR-2 | Manage Pricing Plans — CRUD with features, popular toggle, CTA | P0 | required |
| FR-3 | Manage Blog Posts — CRUD with Quill editor, slug, featured image | P0 | required |
| FR-4 | Manage Team Members — CRUD with photo, bio, sort order | P0 | required |
| FR-5 | Manage Pages / Site Sections — CRUD with hero, JSON sections | P0 | required |
| FR-6 | Manage Theme Settings — colors, fonts, logos via admin | P0 | required |
| FR-7 | Theme Application (Frontend) — CSS custom properties from API | P0 | required |
| FR-8 | Display Pricing Table — responsive with features, CTA, ribbon | P0 | required |
| FR-9 | Contact Form Submission — name/email/message, DB, email notif | P0 | required |
| FR-10 | Newsletter Subscription — single-step email subscribe | P0 | required |
| FR-11 | Contact Message Mgmt (Admin) — view/manage submissions | P2 | deferred-v1.1 |
| FR-12 | Admin Authentication — email/password via Sanctum | P0 | required |
| FR-13 | Admin Dashboard — stat widgets for all content types | P0 | required |
| FR-14 | Media Library — upload/browse/delete JPG/PNG/WebP/SVG | P0 | required |
| FR-15 | Public REST API — GET endpoints + POST contact/subscribe | P0 | required |

## Non-Functional Requirements

| ID | Title | Target |
|----|-------|--------|
| NFR-1 | Frontend Performance | <2s Lighthouse, <300KB bundle |
| NFR-2 | API Performance | <200ms response |
| NFR-3 | Admin HTTPS only | Production |
| NFR-4 | Rich text sanitization | HTMLPurifier |
| NFR-5 | Rate limiting | 5/min contact, 3/min subscribe |
| NFR-6 | No raw SQL | Eloquent ORM only |
| NFR-7 | Email retry | 3 retries, DB queue |
| NFR-8 | Zero-cost software | All packages free/OSS |
