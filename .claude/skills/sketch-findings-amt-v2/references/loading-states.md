# Loading States

## Design Decisions

| Decision | Winner | Why It Won |
|----------|--------|------------|
| Animation style | Pulse (opacity fade) | Shimmer was too visually active for repeated use; minimal felt unfinished. Pulse is subtle, polished, non-distracting. |
| Animation timing | 1.8s ease-in-out | Fast enough to feel responsive, slow enough to be calming. |
| Skeleton shape | Content-matching blocks | Table rows mirror column layout, stat cards show icon + 3 lines, list items show avatar + text + chevron. |
| Border radius | `var(--radius-sm)` (4px) | Matches existing shadcn card/input border radii. |
| Background color | `var(--color-muted)` | Reuses existing CSS token — no new variables needed. |

## CSS Patterns

```css
.skeleton {
  border-radius: var(--radius-sm);
  background: var(--color-muted);
  animation: pulse 1.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Table Skeleton
```css
.table-skeleton-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 80px;
  gap: 16px;
  padding: 16px 0;
  align-items: center;
}
.table-skeleton-row + .table-skeleton-row {
  border-top: 1px solid var(--color-border);
}
```

### Stat Card Skeleton
```css
.skeleton-stat-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  background: var(--color-surface);
}
.skeleton-stat-card .icon-area {
  width: 48px; height: 48px;
  border-radius: 9999px;
  margin-bottom: 16px;
}
.skeleton-stat-card .text-line {
  height: 14px;
  margin-bottom: 12px;
}
.skeleton-stat-card .text-line:last-child {
  width: 60%;
}
```

### List Item Skeleton
```css
.skeleton-list-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
}
.skeleton-list-item + .skeleton-list-item {
  border-top: 1px solid var(--color-border);
}
.skeleton-avatar {
  width: 40px; height: 40px;
  border-radius: 9999px;
  flex-shrink: 0;
}
```

## HTML Structures

```html
<!-- Table skeleton rows -->
<div class="table-skeleton-row">
  <div class="skeleton" style="width:70%"></div>
  <div class="skeleton" style="width:50%"></div>
  <div class="skeleton" style="width:60%"></div>
  <div class="skeleton" style="width:32px;height:32px;border-radius:9999px;"></div>
</div>

<!-- Stat card skeleton -->
<div class="skeleton-stat-card">
  <div class="skeleton icon-area"></div>
  <div class="skeleton text-line" style="width:40%"></div>
  <div class="skeleton text-line" style="width:80%"></div>
  <div class="skeleton text-line"></div>
</div>
```

## What to Avoid
- **Shimmer animation** (`::after` with `linear-gradient`): Too visually busy for admin panels that update frequently. The sweeping highlight becomes distracting on repeated page loads.
- **Static skeletons** (no animation): Users perceive them as frozen/broken. Subtle motion signals the page is alive and loading.
- **Full-page overlays** for data loading: Use skeleton sections instead — they show structure and feel faster.
- **Different animation on every skeleton**: Consistent pulse across all skeleton instances creates a cohesive feel.

## Origin
Synthesized from sketch: 001
Source files available in: sources/001-skeleton-loading/
