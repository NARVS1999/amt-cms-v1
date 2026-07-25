## Conflict Detection Report

### BLOCKERS (0)

No LOCKED-vs-LOCKED ADR contradictions. No UNKNOWN-confidence-low documents. No cycle-detection blockers affecting content extraction.

### WARNINGS (0)

No competing acceptance criteria variants across PRDs. All FRs are consistently defined across prd.md and epics.md.

### INFO (3)

[INFO] Cross-document reference cycles detected
  Note: The cross_ref graph contains multiple cycles (ARCHITECTURE-SPINE <-> addendum, EXPERIENCE <-> prd <-> addendum <-> ARCHITECTURE-SPINE, etc.). These are informational links between companion documents describing the same project. Content extraction reads source files independently, so cross-ref cycles do not create synthesis loops.

[INFO] Known bug: GET /api/blog-posts returns unpublished posts
  Note: docs/SPEC.md documents that GET /api/blog-posts does NOT filter by is_published, returning all posts including drafts. docs/ERROR-HANDLING.md lists this as a known unfixed bug. PRD FR-3 requires unpublished posts excluded from public site. This is an implementation gap, not a document conflict.

[INFO] Known bug: No admin-specific pricing plans endpoint
  Note: docs/SPEC.md documents that the admin uses the same GET /api/pricing-plans which filters by is_published: true. docs/ERROR-HANDLING.md lists this as a known unfixed bug — admin cannot see unpublished plans. No admin-specific GET /api/admin/pricing-plans route exists.
