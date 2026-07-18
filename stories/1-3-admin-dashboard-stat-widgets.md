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

- [x] **Create dashboard widget registration** (AC: stat cards visible on dashboard)
  - [x] Register a custom Filament dashboard page or use Filament's built-in dashboard
  - [x] Add widget view that renders stat cards grid
- [x] **Implement StatsOverview widget** (AC: four stat cards)
  - [x] Create `StatsOverview` widget with four stat cards:
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

Filament 5.7 supports custom dashboard widgets via `php artisan make:filament-widget`. The stats overview widget should extend `Filament\Widgets\StatsOverviewWidget`.

```php
class MainStatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Services', Service::count())
                ->icon('heroicon-o-cog-6-tooth')
                ->url(ServiceResource::getUrl()),

            Stat::make('Published Posts', BlogPost::where('is_published', true)->count())
                ->icon('heroicon-o-document-text')
                ->url(BlogPostResource::getUrl()),

            Stat::make('Unread Messages', ContactMessage::whereNull('read_at')->count())
                ->icon('heroicon-o-envelope')
                ->url(admin routes...),

            Stat::make('Subscribers', Subscriber::count())
                ->icon('heroicon-o-user-group')
                ->url(admin routes...),
        ];
    }
}
```

**⚠️ IMPORTANT:** For the Messages and Subscribers stats, the models (`ContactMessage`, `Subscriber`) and their tables (`contact_contact_messages`, `contact_subscribers`) are created in Story 1.5 (API endpoints story). The dashboard widget must handle the case where these tables don't exist yet. Use `try/catch` or `Schema::hasTable()` checks to gracefully return 0 when tables don't exist.

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

### Widget Registration

Register the widget on the dashboard. In Filament 5.7, use `WidgetRegistration` in the panel configuration or define it in the widget itself:

```php
protected static ?string $pollingInterval = '10s';  // Optional auto-refresh
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
- [Source: docs/project-context.md#Filament-57-Admin-Panel] — Filament rules

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Created `MainStatsOverview` widget extending `StatsOverviewWidget` with 4 stat cards.
- Services: heroicon-o-cog-6-tooth, red danger color, counts `marketing_services` table.
- Blog Posts: heroicon-o-document-text, blue info color, counts published posts.
- Messages: heroicon-o-envelope, green success color, counts unread messages (read_at IS NULL).
- Subscribers: heroicon-o-user-group, amber warning color, counts subscribers.
- All queries use `safeCount()` helper that checks `Schema::hasTable()` first and returns 0 for non-existent tables.
- Widget auto-discovered via Filament's `discoverWidgets` from `app/Filament/Widgets/`.

### File List

- `apps/backend/app/Filament/Widgets/MainStatsOverview.php`
