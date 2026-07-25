# Page Transitions

## Design Decisions

| Decision | Winner | Why It Won |
|----------|--------|------------|
| Overlay style | Semi-transparent white overlay | Simple spinner felt too plain; skeleton overlay felt too busy for a quick transition. Branded dots strike the right balance. |
| Animation | Three bouncing dots | Feels alive and polished. The staggered timing (0.2s delay per dot) creates anticipation. |
| Overlay color | White at 90% opacity (`rgba(255,255,255,0.9)`) | Softens the background without disorienting the user — they can still see the page structure underneath. |
| Label text | "Loading" | Simple, familiar, universally understood. |
| Z-index | `z-index: 100` | Above page content, below navigation elements. |
| Transition timing | 0.3s ease | Smooth fade-in, not jarring. |

## CSS Patterns

```css
/* Overlay container */
.page-transition-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.page-transition-overlay.active {
  opacity: 1;
  pointer-events: all;
}

/* Branded dot animation */
.brand-dots {
  display: flex;
  gap: 8px;
}
.brand-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FF0000;
  animation: dotBounce 1.2s ease-in-out infinite;
}
.brand-dots span:nth-child(2) { animation-delay: 0.2s; }
.brand-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* Loading label */
.overlay-label {
  font-size: 14px;
  color: var(--color-text-muted);
  font-weight: 500;
}
```

## HTML Structures

```html
<div class="page-content">
  <!-- page content -->
</div>

<!-- Page transition overlay -->
<div class="page-transition-overlay" id="page-loader">
  <div class="brand-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <span class="overlay-label">Loading</span>
</div>
```

```javascript
// Toggle overlay
function showPageLoading() {
  document.getElementById('page-loader').classList.add('active');
}
function hidePageLoading() {
  document.getElementById('page-loader').classList.remove('active');
}
```

## What to Avoid
- **Top progress bar** (YouTube-style): Too distracting when every page navigation triggers it. Better for long-loading operations.
- **Full skeleton overlay**: Content area skeletonizing during navigation feels janky — the skeleton shape changes between pages and creates visual confusion.
- **No overlay at all**: Users need confirmation the navigation was registered. Without feedback, they may click again (double-navigation).
- **`aria-hidden="false"` on overlay**: The overlay is decorative; screen readers should not announce it. Use `aria-hidden="true"` on the overlay container.

## Origin
Synthesized from sketch: 002
Source files available in: sources/002-page-transition/
