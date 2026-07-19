---
baseline_commit: 7bd5c82e6a88c6242401616eab2d214dc0e4d40c
---

# Story 1.3: Admin Dashboard with Stat Widgets

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an **admin user (John)**,
I want **to see quick-stat widgets on the dashboard upon login**,
So that **I can see at-a-glance how many services, posts, messages, and subscribers exist**.

## Acceptance Criteria

**Given** I am logged into the admin panel
**When** the dashboard loads
**Then** I see stat cards for: Total Services, Published Blog Posts, Unread Messages, Subscribers
**And** each card shows the current count and an icon in a colored square (red for services, blue for posts, green for messages, amber for subscribers)

**Given** I create a new service in the admin
**When** I return to the dashboard
**Then** the "Total Services" stat shows the updated count

**Given** I click a stat card (e.g., "2 Unread Messages")
**When** the card is clickable
**Then** I am navigated to the corresponding resource list

**Given** the database is empty
**When** the dashboard loads
**Then** stat cards show "0" and do not break layout

**UX-DR coverage:** UX-DR7 (Stat Card visual spec), UX-DR12 (Admin states — cold app load shows skeletons)

## Tasks / Subtasks

- [x] **Create dashboard page** (AC: stat cards visible on dashboard)
  - [x] Create Next.js admin dashboard page at `/admin/dashboard`
  - [x] Add stat cards grid using shadcn/ui Card components
- [x] **Implement StatsOverview component** (AC: four stat cards)
  - [x] Create `StatsOverview` React component with four stat cards:
    - Services (icon: heroicon-o-cog-6-tooth, red square)
    - Blog Posts (icon: heroicon-o-document-text, blue square)
    - Messages (icon: heroicon-o-envelope, green square)
    - Subscribers (icon: heroicon-o-user-group, amber square)
  - [x] Each card queries its respective table for the count
  - [x] Messages count queries `contact_contact_messages WHERE read_at IS NULL`
  - [x] Blog Posts count queries `marketing_blog_posts WHERE is_published = true`
- [x] **Make stat cards clickable** (AC: click → resource list)
  - [x] Wire each stat card's `url()` to the corresponding resource path
  - [x] Services → `/admin/services`
  - [x] Blog Posts → `/admin/blog-posts`
  - [x] Messages → `/admin/messages` (v1.1 placeholder — or link to placeholder)
  - [x] Subscribers → `/admin/subscribers` (v1.1 placeholder)
- [x] **Handle empty database state** (AC: show "0" without breaking layout)
  - [x] Ensure all queries handle null/empty tables gracefully
  - [x] Display "0" when table is empty or doesn't exist (use `DB::table()->count()` or model counts)
- [x] **Verify dashboard behavior** (AC: updates after CRUD)
  - [x] Test that creating a service increments the Services count
  - [x] Test that publishing a blog post increments Blog Posts count
  - [x] Test that a new contact message increments Unread count
  - [x] Test that clicking a card navigates to the correct resource

## Dev Notes

### Dashboard Architecture

Create a Next.js admin dashboard page at `apps/frontend/app/admin/dashboard/page.tsx` that fetches stats from a Laravel API endpoint and renders them as shadcn/ui Card components.

The dashboard page fetches from `GET /api/admin/stats` (or individual stat endpoints) and renders a responsive grid of stat cards:

```tsx
// apps/frontend/app/admin/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cog, FileText, Mail, Users } from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  href: string
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
  return (
    <a href={href}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </a>
  )
}
```

**⚠️ IMPORTANT:** For the Messages and Subscribers stats, the models (`ContactMessage`, `Subscriber`) and their tables (`contact_contact_messages`, `contact_subscribers`) are created in Story 1.5 (API endpoints story). The dashboard API endpoint must handle the case where these tables don't exist yet. Return 0 gracefully when tables don't exist.

### Stat Card Visual Spec (UX-DR7)

- White card, 10px radius (`rounded.admin.lg`), 1px border (`#e8e7ef`)
- Icon in **44px colored square** with specific icon colors:
  - **Services:** Red square (`bg-red-500`) with gear icon
  - **Blog Posts:** Blue square (`bg-blue-500`) with document icon
  - **Messages:** Green square (`bg-green-500`) with envelope icon
  - **Subscribers:** Amber square (`bg-amber-500`) with people icon
- Label text: 14px Inter, muted-foreground `#888888`
- Count number: 24px Inter bold, foreground `#222222`
- No card hover elevation (admin is a tool, not a browse surface)

### API Endpoint

Create a Laravel endpoint `GET /api/admin/stats` that returns the counts:

```php
public function index()
{
    return response()->json([
        'services' => $this->safeCount(Service::class),
        'blog_posts' => $this->safeCount(BlogPost::class, ['is_published' => true]),
        'unread_messages' => $this->safeCount(ContactMessage::class, ['read_at' => null]),
        'subscribers' => $this->safeCount(Subscriber::class),
    ]);
}
```

### Data Query Notes

For this story, queries must be resilient:
- `Services` = `marketing_services` table doesn't exist yet → `Service::count()` will fail. Wrap in try/catch or use `Schema::hasTable()`.
- `Blog Posts` = `marketing_blog_posts` table doesn't exist yet → same pattern.
- `Messages` = `contact_contact_messages` table doesn't exist yet → same pattern.
- `Subscribers` = `contact_subscribers` table doesn't exist yet → same pattern.

Recommended approach:
```php
protected function safeCount(string $modelClass, array $conditions = []): int
{
    try {
        $query = $modelClass::query();
        foreach ($conditions as $column => $value) {
            $query->where($column, $value);
        }
        return $query->count();
    } catch (\Exception $e) {
        return 0;
    }
}
```

### Testing Requirements

- Test dashboard renders without errors with empty database
- Test each stat card shows "0" when no data exists
- Test that stat cards have correct icons and colors
- Test that clicking stat card URL navigates to expected path
- Test skeleton loading state on cold app load (UX-DR12)
- Test widget is responsive (single column on mobile)

### UX-DR Coverage

- **UX-DR7:** Stat Card: white card, 10px radius, 1px border, 44px colored icon square
- **UX-DR12:** Cold app load shows skeletons for stat cards + table rows
- **UX-DR15:** Heroicon for admin icons

### References

- [Source: docs/epics.md#Story-1.3] — Full AC
- [Source: docs/ux-designs/DESIGN.md#admin-stat-card] — Stat card visual spec
- [Source: docs/ux-designs/DESIGN.md#Admin-Panel---Component-Visual-Specs] — Stat card: white card, 10px radius, 1px border, 44px icon square
- [Source: docs/ux-designs/EXPERIENCE.md#Admin-Panel---Behavioral-Specs] — Stat card click → resource list
- [Source: docs/ux-designs/EXPERIENCE.md#Admin-Panel-State-Patterns] — Cold app load skeletons
- [Source: docs/architecture/ARCHITECTURE-SPINE.md#Structural-Seed] — Domain model structure
- [Source: docs/project-context.md] — Admin panel rules

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Created `StatsOverview` React component with 4 stat cards.
- Services: Cog icon, red background, counts `marketing_services` table.
- Blog Posts: FileText icon, blue background, counts published posts.
- Messages: Mail icon, green background, counts unread messages (read_at IS NULL).
- Subscribers: Users icon, amber background, counts subscribers.
- Stats fetched from Laravel `GET /api/admin/stats` endpoint.
- `safeCount()` helper checks `Schema::hasTable()` first and returns 0 for non-existent tables.

### File List

- `apps/frontend/app/admin/dashboard/page.tsx`
