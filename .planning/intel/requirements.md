# Requirements (Synthesized)

## Functional Requirements (from PRD)

| ID | Title | Priority | Source | Status |
|----|-------|----------|--------|--------|
| FR-1 | Manage Services | P0 | PRD §4.1 | required |
| FR-2 | Manage Pricing Plans | P0 | PRD §4.1 | required |
| FR-3 | Manage Blog Posts | P0 | PRD §4.1 | required |
| FR-4 | Manage Team Members | P0 | PRD §4.1 | required |
| FR-5 | Manage Pages / Site Sections | P0 | PRD §4.1 | required |
| FR-6 | Manage Theme Settings | P0 | PRD §4.2 | required |
| FR-7 | Theme Application (Frontend) | P0 | PRD §4.2 | required |
| FR-8 | Display Pricing Table | P0 | PRD §4.3 | required |
| FR-9 | Contact Form Submission | P0 | PRD §4.4 | required |
| FR-10 | Newsletter Subscription | P0 | PRD §4.4 | required |
| FR-11 | Contact Message Mgmt (Admin) | P2 | PRD §4.4 | deferred-v1.1 |
| FR-12 | Admin Authentication | P0 | PRD §4.5 | required |
| FR-13 | Admin Dashboard | P0 | PRD §4.5 | required |
| FR-14 | Media Library | P0 | PRD §4.5 | required |
| FR-15 | Public REST API | P0 | PRD §4.6 | required |

## Non-Functional Requirements

| ID | Title | Target | Source |
|----|-------|--------|--------|
| NFR-1 | Frontend Performance (SSG) | <2s Lighthouse, <300KB bundle | PRD §7 |
| NFR-2 | API Performance | <200ms response | PRD §7 |
| NFR-3 | Admin HTTPS only | Production | PRD §7 |
| NFR-4 | Rich text sanitization | HTMLPurifier | PRD §7 |
| NFR-5 | Rate limiting | 5/min contact, 3/min subscribe | PRD §7 |
| NFR-6 | No raw SQL | Eloquent ORM only | project-context.md |
| NFR-7 | Email retry | 3 retries, DB queue | PRD §7 |
| NFR-8 | Zero-cost software | All packages free/OSS | PRD §8 |
