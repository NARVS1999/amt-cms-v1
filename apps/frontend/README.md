# Adsvance CMS — Frontend

Next.js 16 SSG frontend for the Adsvance Media Tech CMS. Renders the public marketing site and the shadcn/ui admin panel.

## Tech Stack

- Next.js 16 / React 19
- Tailwind CSS v4
- shadcn/ui components
- Zod 3.x with `@amt/shared` schemas
- Font Awesome 6 (public site) + Lucide (admin panel)

## Quick Start

```bash
npm install
npm run dev        # Dev server on :3000
npm run build      # SSG build to out/
npx tsc --noEmit   # TypeScript check
npm run lint       # ESLint
```

## Architecture

- **SSG only** — `output: 'export'`, no server-side rendering
- Data fetched at build time from the Laravel API at `NEXT_PUBLIC_API_URL`
- Public data: `lib/api.ts` (with Zod validation)
- Admin data: `lib/admin-api.ts` (with Bearer token auth)

## Key Directories

| Path | Purpose |
|------|---------|
| `app/(public)/` | Public marketing pages |
| `app/admin/` | Admin panel pages (login, dashboard, CRUD) |
| `components/` | React components (ui/, admin/, public) |
| `lib/` | API clients, utilities |
| `app/globals.css` | Tailwind v4 theme with CSS custom properties |
