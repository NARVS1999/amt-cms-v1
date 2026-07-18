---
name: Adsvance Media Tech CMS
status: draft
sources:
  - {docs}/prds/prd-adsvance-media-tech-cms-2026-07-18/prd.md
  - docs/ux-designs/ux-adsvance-cms-2026-07-18/DESIGN.md
updated: 2026-07-18
---

# Adsvance Media Tech CMS — Experience Spine

> Two-surface CMS: a public marketing site (consumer-facing brand presence) and a Filament admin panel (staff productivity tool). Built on Laravel 12 + Next.js 16 (SSG). Tailwind CSS v4. `DESIGN.md` is the visual identity reference and owns all token values; this spine is the experience layer — flows, states, behavior, accessibility.

## Foundation

**Form factor:** Responsive web application. Two distinct surfaces served under one deployment:
- **Public site:** Static HTML/JS/CSS (Next.js SSG export) served by Hostinger's Apache/Nginx. Mobile-first responsive.
- **Admin panel:** Laravel + Filament at `/admin`. Desktop-first (optimized for 1024px+), functional on mobile for read-light operations.

**UI system:** The public site is hand-crafted with Tailwind CSS. The admin panel is Filament (uses Tailwind + Blade). No off-the-shelf component library for the public site — it's intentionally lean. DESIGN.md is the visual identity reference for both surfaces; this spine specifies behavioral deltas only.

**Content model:** API-driven. All content is authored in Filament, stored in MySQL, served via REST JSON API. The public frontend fetches API at build time (SSG) — it never hits the database at request time.

## Information Architecture

### Surface Map

| # | Surface | Path | Purpose | Auth? |
|---|---------|------|---------|-------|
| P1 | Homepage | `/` | Hero, services grid, about, video embed, pricing table, blog preview, contact form | Public |
| P2 | Blog Listing | `/blog` | Chronological list of published posts with excerpt cards | Public |
| P3 | Blog Post | `/blog/{slug}` | Single post with rich text content | Public |
| P4 | 404 | * | Catch-all for unknown routes | Public |
| A1 | Admin Login | `/admin/login` | Email/password authentication | No (entry) |
| A2 | Admin Dashboard | `/admin` | Stat widgets, recent posts table, activity feed, quick actions | Admin |
| A3 | Services CRUD | `/admin/services` | List, create, edit, delete, reorder services | Admin |
| A4 | Pricing Plans | `/admin/pricing-plans` | Manage plans + features with inline feature editing | Admin |
| A5 | Blog Posts | `/admin/blog-posts` | Rich text blog editing with Quill, publish toggles | Admin |
| A6 | Team Members | `/admin/team` | Manage team bios and photos | Admin |
| A7 | Pages | `/admin/pages` | Edit homepage sections (hero, about) | Admin |
| A8 | Theme Settings | `/admin/theme` | Colors, fonts, logos — the rebrand control center | Admin |
| A9 | Media Library | `/admin/media` | Upload, browse, delete images | Admin |
| A10 | Messages | `/admin/messages` | View and manage contact submissions (v1.1) | Admin |
| A11 | Subscribers | `/admin/subscribers` | Manage newsletter list (v1.1) | Admin |

### Navigation Map

**Public site:** Single-page nav bar (Home, Services, About, Pricing, Blog, Contact) anchored to sections + Login button. On mobile: hamburger → slide-out drawer overlay.

**Admin panel:** Persistent left sidebar with grouped navigation (Main / Leads / Settings). Active item highlighted. Sub-navigation within a resource uses Filament's built-in tabs (e.g., All / Published / Drafts on Blog Posts).

### IA Closure

Every stated admin need maps to a surface:
- "Update services copy" → A3
- "Change pricing" → A4
- "Write blog post" → A5
- "Swap client logo" → A8
- "View inquiry" → A10 (v1.1, inbound email covers v1)
- "Upload team photo" → A6

Every public visitor need maps to a surface:
- "Learn about services" → P1 (Services section)
- "See pricing" → P1 (Pricing section)
- "Read blog" → P2 / P3
- "Contact us" → P1 (Contact form)
- "Subscribe to newsletter" → P1 (Footer form)

## Voice and Tone

### Public Site

Warm, confident, straightforward. Speaks to small business owners who may not be technical. Avoids jargon. Uses "you" and "we" — conversational, not corporate.

| Do | Don't |
|----|-------|
| "Need a business website?" | "Leverage our comprehensive web solutions" |
| "Build a strong brand identity that makes your business stand out." | "Our platform facilitates brand differentiation." |
| "No coding required. We handle everything." | "Zero-code abstraction layer with managed infrastructure." |
| "Starting at ₱498/month" | "Competitively priced entry-tier offering" |

### Admin Panel

Neutral, efficient, direct. No personality — the tool gets out of the way. System messages are plain English.

| Context | Message |
|---------|---------|
| Save success | "Saved." (green toast) |
| Save failure | "Couldn't save. Try again." (red toast) |
| Delete confirmation | "Delete this post? This can't be undone." |
| Empty table | "No posts yet. Create your first one." |
| Validation error | Inline red text below the field — no toast for field errors. |
| Theme saved | "Theme saved. Rebuild the site to see changes." |

Microcopy everywhere should avoid emoji, exclamation marks, and celebration animations. The admin is a tool, not a cheerleader.

## Component Patterns

Behavioral rules. Visual specs live in `DESIGN.md.Components`. All Filament base components (Table, Modal, Form, Toast, etc.) inherit Filament's default behaviors unless specified below.

### Public Site — Behavioral Specs

| Component | Behavior |
|-----------|----------|
| **Navbar Link** | Smooth-scrolls to the corresponding section (`#services`, `#pricing`, etc.). Active section highlighted during scroll via Intersection Observer. |
| **Mobile Hamburger** | Tap toggles slide-out drawer. Overlay behind drawer is semi-transparent black, tap-to-close. Menu close button inside drawer. `aria-expanded` toggles. Body scroll locked when open. |
| **Pricing CTA** | "See More" button scrolls to contact section. No page navigation. |
| **Blog Card** | Entire card is clickable — navigates to `/blog/{slug}`. |
| **Contact Form** | Submit with all valid fields: shows success inline message ("Thanks! We'll get back to you soon."). Field-level validation on blur. Form resets on success. |
| **Newsletter Subscribe** | Single email input + submit button. Success: "Subscribed!" inline. Duplicate: "Already subscribed." Error (invalid): inline validation. |
| **Back-to-Top** | Hidden until user scrolls past 300px from top. Smooth-scroll click. `aria-label="Back to top"` |

### Admin Panel — Behavioral Specs

| Component | Behavior |
|-----------|----------|
| **Stat Card** | Click navigates to the corresponding resource list (e.g., clicking "5 Unread Messages" → Messages index). |
| **Table Row** | Click navigates to edit view for that record. `aria-label` includes record name. |
| **Quick Action Button** | Opens the create form for that resource in a modal or navigates to the create page (Filament default). |
| **Theme Color Picker** | Color swatch + hex input stay in sync. Changing either triggers preview panel update — no save required to preview. |
| **Theme Save** | "Save Changes" button updates the database. Shows "Saved!" confirmation. Does NOT trigger a rebuild — that's a separate deploy step. |
| **Logo Upload** | Click-to-upload zone with drag-and-drop support. Preview updates immediately after upload completes. Shows file name + size. |
| **Blog Editor (Quill)** | Toolbar: bold, italic, headings (h2/h3), ordered/unordered lists, link, image. Auto-save draft every 30 seconds if user has made changes. Published/unpublished toggle is explicit — no auto-publish. |

## State Patterns

### Public Site

| State | Surface | Treatment |
|-------|---------|-----------|
| Loading (SSG) | All | Pre-built HTML — no loading state. SSG means content is already rendered. |
| Contact form — idle | P1 Hero/Contact | All fields empty. Submit button enabled when required fields filled. |
| Contact form — success | P1 Contact | Inline green message replaces form. Fades after 5 seconds, form resets. |
| Contact form — error | P1 Contact | Inline red message above submit. Fields retain values. |
| Contact form — rate limited | P1 Contact | "Too many submissions. Try again in a minute." |
| Newsletter — duplicate | P1 Footer | Inline message: "Already subscribed." |
| Newsletter — success | P1 Footer | Inline: "Subscribed!" Input clears. |
| 404 — unknown route | P4 | "Page not found" with illustration and "Go Home" button. |

### Admin Panel

| State | Surface | Treatment |
|-------|---------|-----------|
| Loading data | All tables | Filament `Skeleton` rows (5-6) matching column structure. |
| Empty resource | A3-A7, A10-A11 | Filament empty state: illustration, description, primary action. "No services yet. Create one." |
| Cold app load | A2 Dashboard | Skeletons for stat cards + table rows. Resolves in <500ms. |
| Save succeeding | A3-A11 | Filament success notification (green, auto-dismiss 3s). |
| Save failing | A3-A11 | Filament error notification (red, persistent until dismissed). "Couldn't save. {reason}" |
| Delete confirmation | All | Filament modal: "Are you sure?" + "Delete" (destructive) / "Cancel". |
| Theme — unsaved changes | A8 | No explicit dirty indicator. Save button is always active. Preview panel always reflects current picker values. |
| Media — oversized upload | A9 | Inline error: "File too large. Max 2MB." |
| Media — wrong format | A9 | Inline error: "Format not supported. Accepted: JPG, PNG, WebP, SVG." |
| Session expired | A1 | Redirect to login with message: "Session expired. Please log in again." |
| Permission denied | Any admin | Filament 403 page. |

## Interaction Primitives

### Public Site

- **Scroll navigation:** Anchor links with smooth-scroll behavior.
- **Click-to-call:** Phone numbers are `tel:` links on mobile.
- **Email links:** `mailto:` with subject prefill.
- **Form submission:** Standard HTTP POST to the API (via fetch, no full page reload). Success/failure handled inline.
- **Hover-reveal actions:** None on mobile. On desktop, pricing CTA buttons are always visible.
- **Banned:** Hover-only affordances on touch devices. Infinite scroll. Drag interactions. Auto-playing video.

### Admin Panel

- **Click to edit:** Table rows → edit view. Stat cards → resource list.
- **Inline edit (Filament):** Blog post title, pricing plan fields, etc. — standard Filament edit forms.
- **Quill editor:** Toolbar-driven rich text. Tab key inserts indent. `Shift+Tab` outdents lists.
- **Keyboard navigation:** Standard Filament keyboard support. `Tab` through form fields. `Enter` submits. `Esc` closes modals.
- **Drag-to-reorder:** Services, pricing plans, team members use Filament's reorderable table (drag handle on left). Saves order immediately on drop.
- **Search:** Admin topbar search is global — searches across all resources.
- **Banned:** Auto-save on every keystroke (Filament already has this concern covered). Hover-only actions. Context menus. Modal stacks deeper than 1 level.

## Accessibility Floor

Behavioral. Visual contrast, focus rings, and color usage are specified in `DESIGN.md`.

- **WCAG 2.2 AA** across both surfaces.
- **Skip to content link** on the public site (first focusable element, visible on focus).
- **Landmark regions:** `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>` with `aria-label` where appropriate.
- **Form labels:** All inputs have visible `<label>` elements (not placeholders as labels).
- **Error announcements:** Form validation errors use `aria-describedby` on the input, pointing to the error message.
- **Status announcements:** Contact form success/failure uses `aria-live="polite"` region.
- **Mobile nav:** Hamburger button has `aria-expanded` (true/false). Drawer has `role="dialog"` and `aria-modal="true"`. Focus trapped inside drawer when open.
- **Pricing table:** Screen reader announces "Most Popular" badge on the Premium plan via `aria-label`.
- **Color pickers (admin):** Hex input serves as accessible alternative to the visual swatch. Both are labeled.
- **Quill editor:** Standard `contenteditable` with `aria-multiline="true"`. Toolbar buttons labeled with `aria-label`.
- **Keyboard operability:** All interactive elements reachable and operable via keyboard. No custom widget that breaks standard keyboard expectations.
- **Focus order:** Matches visual reading order on every surface. `Tab` moves forward through interactive elements; `Shift+Tab` reverses.

## Key Flows

### Flow 1 — John updates pricing before a client call (UJ-1 from PRD)

1. John is on a call in 10 minutes. Opens the admin panel at `/admin`, logs in.
2. Dashboard loads. John clicks the "Pricing Plans" sidebar item (or the stat card showing 3 plans).
3. The Pricing Plans index lists all three plans with their prices. "Most Popular" badge visible on the Premium row.
4. John clicks "Ultimate" to open the edit form.
5. Form loads with current values. John changes the price field from `898` to `948`. The field validates the numeric input on blur.
6. **Climax:** John hits "Save." A green toast appears: "Saved." He opens the public site in a new tab (previously built version — actual update requires a rebuild, but the admin confirmation tells him the data is ready). He feels the change is in the pipeline.
7. John closes the tab and takes the client call, confident the numbers match what they discussed.

**Failure mode:** John types "abc" into the price field. The field immediately shows red inline validation: "Must be a number." He corrects it and saves.

### Flow 2 — John onboards a new client with a branded CMS (UJ-2)

1. John has deployed a fresh CMS instance for "Juan's Cafe." He opens the admin panel.
2. John navigates to Settings → Theme. The default red/black theme is loaded.
3. He opens theme settings: changes Primary Color to `#2563EB` (blue) and Secondary to `#1D4ED8`. The live preview panel repaints instantly.
4. He uploads the client's logo (light variant for footer, dark variant for header) by clicking the upload zones. Both preview within seconds.
5. John scrolls to the "Typography" section and switches Heading Font to "Playfair Display" — the live preview updates to show the serif.
6. **Climax:** The preview panel now shows a blue-themed hero with a serif heading and the client's logo. John hits "Save Changes." Green toast: "Theme saved. Rebuild the site to see changes." In under 5 minutes, John has completely rebranded the entire site without touching code.
7. John fills in the client's services, team, and pricing through the other admin sections. Each save is instant.
8. He triggers a rebuild. The public site now reflects the complete Juan's Cafe brand.

**Failure mode:** John tries to upload a 5MB logo. The upload zone shows red error: "File too large. Max 2MB." He resizes the file and re-uploads — succeeds.

### Flow 3 — Maria submits a contact inquiry (UJ-3)

1. Maria visits Adsvance Media Tech's site, scrolls to the "Get in Touch" section.
2. She fills in her name, email address, and a message: "Need a website for my bakery in Quezon City."
3. **Climax:** She hits "Send Message." The form shows a success message inline: "Thanks, Maria! We'll get back to you soon." The form fields clear. Within seconds, John's email inbox at `johnpaulnarvasa6@gmail.com` receives a notification with her details and message.
4. Maria navigates away, confident she'll be contacted.

**Failure mode:** Maria forgets to fill in her email. On blur, the email field shows: "Email is required." She fills it in and resubmits — success.

**Edge case:** The email server is down. The contact message is still saved in the database (visible later). A queued job retries email delivery up to 3 times.

### Flow 4 — John writes a blog post (UJ-4)

1. John clicks "Blog Posts" in the sidebar, then "Create" to open the blog editor.
2. He enters the title: "Why Your Business Needs a Website in 2026." The slug auto-generates: `why-your-business-needs-a-website-in-2026`.
3. John types the post body using the Quill toolbar. He adds a heading, bolds key terms, inserts an image from the media library, and adds a bullet list.
4. He writes an excerpt, selects the featured image, and sets the "Published" toggle to ON.
5. **Climax:** John hits "Save." The post appears in the blog list with a green "Published" badge. It will appear on the public site after the next rebuild. Total time from "New Post" click to completion: under 3 minutes.

**Edge case:** John hits Save with an empty title. The form prevents submission with inline validation: "Title is required." He enters a title and saves successfully.

## Responsive & Platform

### Public Site

| Breakpoint | Layout Behavior |
|------------|----------------|
| `≥ 992px` | Full desktop layout. 2-column hero, 4-column services grid, 3-column pricing. Full nav visible. |
| `768px – 991px` | Tablet. Hero stacks single column. Services grid drops to 2 columns. Footer switches to 2-column grid. |
| `≤ 767px` | Mobile. Everything single column. Hamburger menu replaces full nav. Reduced section padding (40px). Pricing cards stack vertically. |

### Admin Panel

| Breakpoint | Layout Behavior |
|------------|----------------|
| `≥ 1024px` | Full layout. Sidebar visible. Dashboard shows 2-column grid (recent posts + activity). |
| `768px – 1023px` | Sidebar collapses to icon-only (show labels on hover). Dashboard goes single column. |
| `≤ 767px` | Sidebar becomes an off-canvas slide-out triggered from topbar hamburger. Content is single-column. Tables show horizontal scroll. |

### Platform Notes

- **Desktop is the primary admin surface.** Mobile admin access is supported for reading notifications and reviewing messages, but content authoring is designed for larger screens.
- **Public site works fully on mobile.** The marketing site is designed to be browsed and engaged with from any device.
- **No PWA, no native app, no offline mode** in v1.
- **Browser support:** Latest 2 versions of Chrome, Firefox, Safari, Edge.

## Inspiration & Anti-patterns

### Lifted From
- **Lifted from the legacy site:** The pricing table layout (3-column comparison with check/cross icons, "Most Popular" ribbon), the service card grid, the hero heading pattern ("Need a business *website?*"), the Font Awesome icon vocabulary, the Poppins typeface.
- **Lifted from Filament:** The entire admin panel UX — sidebar navigation pattern, table CRUD, modal confirmations, notification toasts, form patterns. No need to reinvent.
- **Lifted from modern marketing sites (linear.app, Vercel, Tailwind UI):** The hero layout (left text + right illustration), the subtle float animation on hero imagery, the gradient hero backgrounds, the "live preview" pattern on settings pages.

### Rejected
- **Rejected — Drag-and-drop page builder:** The CMS uses structured fields, not a canvas. Adding a page builder would break the "lean and reusable" constraint.
- **Rejected — Dashboard celebration animations:** No "confetti on publish" or "streak badges." The admin is a tool.
- **Rejected — Multi-language toggle:** English only in v1. Adding the pattern later would be a separate surface, not a retrofitted toggle.
- **Rejected — Dark mode toggle for the public site:** The public site is a brand presence — the brand sets the colors, not the visitor.
- **Rejected — AI-generated content features:** No auto-write, no SEO suggestions, no content prompts. The CMS manages what the user writes; it doesn't write for them.
