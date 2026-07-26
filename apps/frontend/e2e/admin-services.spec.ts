import { test, expect } from '@playwright/test';

test.describe('Admin Services Page — Phase 2 Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 10000 });
  });

  test('shows empty state when no services exist', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/services');
    await expect(page.getByText(/no services yet/i)).toBeVisible();
  });

  test('shows skeleton rows while data loads', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/services');
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('delete dialog shows service name', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id: 1, title: 'Web Development', icon: 'fa-solid fa-code', is_featured: true, sort_order: 0 }],
          }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/services');
    await page.getByRole('button', { name: /del/i }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/web development/i)).toBeVisible();
    await expect(dialog.getByText(/cannot be undone/i)).toBeVisible();
  });

  test('sort up/down reorders rows', async ({ page }) => {
    let reorderCalled = false;
    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              { id: 1, title: 'Service A', icon: 'fa-solid fa-code', is_featured: false, sort_order: 0 },
              { id: 2, title: 'Service B', icon: 'fa-solid fa-code', is_featured: false, sort_order: 1 },
            ],
          }),
        });
      } else if (route.request().url().includes('/reorder')) {
        reorderCalled = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { message: 'Reordered.' } }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/services');
    await expect(page.getByText('Service A')).toBeVisible();

    // Click down arrow on first row (Service A)
    const moveDownButtons = page.getByLabel('Move down');
    await moveDownButtons.first().click();

    // Verify reorder API was called
    await expect(() => expect(reorderCalled).toBe(true)).toPass({ timeout: 5000 });
  });

  test('toast appears on delete success', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id: 1, title: 'ToDelete Service', icon: 'fa-solid fa-code', is_featured: false, sort_order: 0 }],
          }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/services');
    await page.getByRole('button', { name: /del/i }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: /delete/i }).click();
    await expect(page.getByText(/deleted/i)).toBeVisible({ timeout: 5000 });
  });

  test('validation errors display inline', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Validation failed', errors: { title: ['The title field is required.'] } }),
        });
      }
    });
    await page.goto('/admin/services');
    await page.getByRole('button', { name: /new service/i }).click();
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/title field is required/i)).toBeVisible({ timeout: 5000 });
  });
});
