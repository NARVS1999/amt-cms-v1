# Form Feedback & Notifications

## Design Decisions

| Decision | Winner | Why It Won |
|----------|--------|------------|
| Error placement | Below input (small red text) | Beside-input chips use too much horizontal space. Below-input is standard, familiar, and works at all viewport widths. |
| API error display | Top-of-form alert banner | More visible than inline field errors for non-field-specific errors. Uses `bg-destructive/10` + `text-destructive` styling. |
| Success feedback | Bottom-right toast | Green background, white text, auto-dismiss after 2s. Non-intrusive, don't require user action. |
| Error toasts | Bottom-right toast | Red background, manual dismiss (user must acknowledge). |
| Button loading state | Text swap + disabled | Button text changes to "Saving...", "Signing in...", "Uploading..." etc. Button becomes disabled during operation. |
| Delete confirmation | Modal dialog | "Delete this {resource}? This cannot be undone." with Cancel/Delete buttons. Delete button uses `bg-danger` styling. |

## CSS Patterns

```css
/* Inline field error */
.field-error {
  font-size: 0.75rem;
  color: var(--color-danger, #ef4444);
  margin-top: 4px;
}

/* Input error state */
input.error {
  border-color: var(--color-danger, #ef4444);
}

/* Alert banner */
.alert-banner {
  padding: 12px 16px;
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.alert-banner.error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--color-danger, #ef4444);
}
.alert-banner.success {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #15803d;
}

/* Toast */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  padding: 12px 16px;
  border-radius: var(--radius-lg, 12px);
  font-size: 0.875rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  animation: toastSlideIn 0.25s ease;
  max-width: 320px;
}
.toast.success { background: #15803d; color: white; }
.toast.error { background: var(--color-danger, #ef4444); color: white; }
.toast.info { background: var(--color-text); color: white; }
.toast .dismiss {
  margin-left: auto;
  cursor: pointer;
  opacity: 0.7;
  background: none;
  border: none;
  color: inherit;
  font-size: 0.75rem;
}
@keyframes toastSlideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Button loading state */
.btn-loading {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Delete confirmation modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9997;
}
.modal-box {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 12px);
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}
```

## HTML Structures

```html
<!-- Form with inline error -->
<div class="form-group">
  <label for="title">Title</label>
  <input id="title" type="text" class="error">
  <div class="field-error">This title already exists</div>
</div>

<!-- Alert banner -->
<div class="alert-banner error" role="alert">
  Could not save. Please check the form and try again.
</div>

<!-- Toast container -->
<div class="toast-container" id="toast-container"></div>

<script>
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = message + '<button class="dismiss" onclick="this.parentElement.remove()">✕</button>';
  container.appendChild(toast);
  if (type === 'success') {
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 2000);
  }
}

function setButtonLoading(btn, text) {
  btn.disabled = true;
  btn.textContent = text;
}

function setButtonIdle(btn, text) {
  btn.disabled = false;
  btn.textContent = text;
}
</script>

<!-- Delete confirmation modal -->
<div class="modal-overlay" id="delete-modal">
  <div class="modal-box">
    <h3>Delete this service?</h3>
    <p>This action cannot be undone. The service "Digital Marketing" will be permanently removed.</p>
    <div class="btn-row">
      <button class="btn btn-danger" onclick="confirmDelete()">Delete</button>
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    </div>
  </div>
</div>
```

## Copy Templates

| Context | Copy |
|---------|------|
| Save button loading | "Saving..." |
| Login button loading | "Signing in..." |
| Upload button loading | "Uploading..." |
| Save success toast | "Saved." |
| Generic API error | "Could not save. {detail}" |
| Delete prompt | "Delete this {resource}? This cannot be undone." |

## What to Avoid
- **Inline errors beside fields**: On narrow viewports or long labels, beside-input errors break the layout or get clipped.
- **Automatic error toast dismissal**: Error toasts should require manual dismiss — auto-dismiss means users may miss critical information.
- **Generic loading text**: "Loading..." is too vague for button states. Use context-specific copy: "Saving...", "Signing in...", "Uploading...".
- **No focus management on validation**: When errors appear, focus should move to the first invalid field.
- **Silent save failures**: Always surface API errors — never swallow them.

## Origin
Synthesized from sketch: 003
Source files available in: sources/003-form-feedback/
