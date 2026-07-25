# Requirements

## REQ-fr-1-manage-services
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can create, read, update, delete, and reorder services (icon as Font Awesome class name, title, description).
- acceptance: Services appear on homepage in admin-set order. Deleting a service removes it from public site immediately. Icon field accepts valid Font Awesome class names.
- scope: marketing content management

## REQ-fr-2-manage-pricing-plans
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can create, read, update, delete, and reorder pricing plans. Each plan has name, monthly price (PHP numeric), 'Most Popular' toggle, CTA text, and feature list (description + included flag).
- acceptance: Plans appear in admin-set order. 'Most Popular' shows ribbon badge on public site. Price validates numeric. Deleting plan cascades to features.
- scope: marketing content management

## REQ-fr-3-manage-blog-posts
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can create, read, update, delete blog posts with title, auto-generated slug (overridable), rich text content (Quill), excerpt, featured image, and published-at date.
- acceptance: Published posts appear on /blog sorted by date descending. Unpublished posts excluded from public site. Slug auto-generates from title, admin can override. Rich text sanitized.
- scope: marketing content management

## REQ-fr-4-manage-team-members
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can create, read, update, delete, and reorder team members with name, role, photo upload, and bio.
- acceptance: Team section on public site reflects admin-set order. Photo upload accepts JPG, PNG, WebP up to 2MB.
- scope: marketing content management

## REQ-fr-5-manage-pages
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can update key homepage sections via Page records with slug identifier, hero fields, and JSON sections field for structured content blocks.
- acceptance: Changing hero heading in admin updates homepage on next build. JSON sections structure validated on save.
- scope: marketing content management

## REQ-fr-6-manage-theme-settings
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can set primary color, secondary color, accent color, body font, heading font, light logo, dark logo, and favicon through a dedicated Theme Settings page.
- acceptance: Changing primary color repaints all primary-colored elements site-wide. Color inputs validate hex format. Font inputs validate as known Google Font names. Empty settings fall back to legacy red scheme.
- scope: theme system

## REQ-fr-7-theme-application-frontend
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Next.js frontend fetches /api/theme at build time and generates CSS custom properties on :root. Tailwind extends config from these values.
- acceptance: ThemeProvider resolves all theme CSS vars. All components using var(--color-*) repaint correctly when value changes. Theme change triggers rebuild for public site reflection.
- scope: theme system

## REQ-fr-8-display-pricing-table
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Public frontend renders responsive pricing table with plan name, price (PHP), feature list with check/cross icons, CTA button, and 'Most Popular' ribbon.
- acceptance: 3-column pricing layout matching legacy site. Included features show green check; excluded show red X. CTA button scrolls to contact form.
- scope: billing/pricing

## REQ-fr-9-contact-form-submission
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Public visitors can submit name, email, and message through contact form. System saves to database and dispatches notification email to configured recipient.
- acceptance: Valid submission returns success message. Missing required fields return inline validation errors. Email sent to CONTACT_NOTIFICATION_EMAIL. Message stored with read_at: null (unread). Rate-limited 5/min/IP.
- scope: contact/lead management

## REQ-fr-10-newsletter-subscription
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Public visitors can subscribe with email address via single-step subscription (no double opt-in for v1).
- acceptance: Duplicate email returns 'already subscribed' message. Invalid email format rejected with validation. Subscription stored with subscribed_at timestamp. Rate-limited 3/min/IP.
- scope: contact/lead management

## REQ-fr-11-contact-message-management-admin
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can view all contact submissions, mark messages as read, and delete messages.
- acceptance: Unread messages visually distinct. Deleting message removes it permanently from database. Deferred to v1.1.
- scope: contact/lead management

## REQ-fr-12-admin-authentication
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin users log in with email and password via Next.js login page against Laravel API with Sanctum. Supports 'Remember Me'.
- acceptance: Unauthenticated users redirected to /admin/login. Session expires after configurable inactivity.
- scope: admin panel

## REQ-fr-13-admin-dashboard
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin dashboard displays quick-stat widgets: total services, published blog posts, unread contact messages, newsletter subscriber count.
- acceptance: Widget counts update after relevant CRUD operations. Clicking a widget navigates to corresponding resource list.
- scope: admin panel

## REQ-fr-14-media-library
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin can upload, browse, and delete media files via Spatie Media Library. Accepted formats: JPG, PNG, WebP, SVG. Max file size: 2MB.
- acceptance: Deleting media removes it from storage. Media can be attached to any model through Spatie relationship.
- scope: admin panel

## REQ-fr-15-public-rest-api
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Laravel backend exposes GET endpoints (/api/pages, /api/services, /api/team, /api/blog-posts, /api/pricing-plans, /api/theme) and POST endpoints (/api/contact, /api/subscribe).
- acceptance: GET return 200 with { "data": ... }. POST return 201 on success, 422 on validation failure. Unknown routes return 404. Consistent JSON structure. CORS restricted to deployed frontend domain.
- scope: public API

## REQ-nfr-1-frontend-performance
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Next.js SSG pages must load in under 2 seconds on Hostinger shared hosting (Lighthouse Mobile). Maximum bundle size under 300KB JS + CSS total.
- acceptance: All pages pre-built as static HTML. No server-side rendering.
- scope: performance

## REQ-nfr-2-api-performance
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: API GET endpoints must respond in under 200ms with Laravel response caching where appropriate.
- acceptance: absent
- scope: performance

## REQ-nfr-3-security-https-cors
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Admin panel accessible only over HTTPS in production. CORS restricted to deployed frontend domain. All API inputs validated via FormRequest classes.
- acceptance: absent
- scope: security

## REQ-nfr-4-content-sanitization
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Rich text content (blog post body) sanitized before public render via HTMLPurifier. Strip disallowed tags, allow safe HTML.
- acceptance: absent
- scope: security

## REQ-nfr-5-rate-limiting
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Contact form max 5 submissions per IP per minute. Newsletter max 3 per IP per minute. Database-backed via Laravel RateLimiter.
- acceptance: absent
- scope: security

## REQ-nfr-6-authentication-security
- source: docs/epics.md
- description: Admin passwords hashed via Laravel default bcrypt. SQL injection impossible via Eloquent ORM (no raw queries in v1).
- acceptance: absent
- scope: security

## REQ-nfr-7-email-queue-reliability
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: Contact form submissions stored in DB before email dispatch. Email runs through Laravel queue (database driver). Failed deliveries retry up to 3 times.
- acceptance: Message record survives regardless of email delivery status.
- scope: reliability

## REQ-nfr-8-graceful-degradation
- source: docs/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
- description: If API is unreachable during Next.js build, build fails with clear error message rather than producing broken site.
- acceptance: absent
- scope: reliability

## REQ-nfr-9-environment-driven-config
- source: docs/epics.md
- description: All configuration environment-driven (.env), never hardcoded. Key variables: CONTACT_NOTIFICATION_EMAIL, APP_NAME, APP_URL, DB_*, MAIL_*.
- acceptance: absent
- scope: configuration

## REQ-nfr-10-zero-cost-software
- source: docs/epics.md
- description: All software free/open-source. Hostinger shared hosting cost only (~$3-10/month). No paid APIs.
- acceptance: absent
- scope: budget

## REQ-nfr-11-hostinger-compatibility
- source: docs/epics.md
- description: Laravel runs on Hostinger Business Shared (PHP 8.2). Next.js deploys as static HTML/JS/CSS. MySQL database included.
- acceptance: absent
- scope: infrastructure

## REQ-nfr-12-accessibility-wcag
- source: docs/epics.md
- description: Both surfaces meet WCAG 2.2 AA. Skip-to-content link. Landmark regions. Form labels visible (not placeholders). Error announcements via aria-describedby. Status via aria-live.
- acceptance: absent
- scope: accessibility

## REQ-nfr-13-browser-support
- source: docs/epics.md
- description: Latest 2 versions of Chrome, Firefox, Safari, Edge. No PWA, no offline mode in v1.
- acceptance: absent
- scope: compatibility

## REQ-nfr-14-mobile-responsive-public
- source: docs/epics.md
- description: Mobile-first responsive: desktop >=992px, tablet 768-991px, mobile <=767px. Single-column on mobile, hamburger menu, 40px section padding.
- acceptance: absent
- scope: responsiveness

## REQ-nfr-15-admin-panel-responsive
- source: docs/epics.md
- description: Admin desktop-first: full layout >=1024px, icon-only sidebar 768-1023px, off-canvas sidebar <=767px. Content authoring for larger screens.
- acceptance: absent
- scope: responsiveness

## REQ-nfr-16-no-raw-sql
- source: docs/epics.md
- description: SQL injection impossible via Eloquent ORM. No raw SQL queries in v1 codebase.
- acceptance: absent
- scope: security
