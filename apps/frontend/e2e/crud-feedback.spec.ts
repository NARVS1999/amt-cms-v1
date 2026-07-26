import { test, expect } from '@playwright/test';

test.describe('Admin CRUD Page Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 20000 });
  });

  test('services page shows skeleton rows while data loads', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/services');
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('services page renders empty state on success', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/services');
    await expect(page.getByText(/no services yet/i)).toBeVisible();
  });

  test('services page shows error banner on API failure during save', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Server error' }) });
      }
    });
    await page.goto('/admin/services');
    await page.getByRole('button', { name: /new service/i }).click();
    await page.getByRole('textbox').first().fill('Test');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/server error/i)).toBeVisible({ timeout: 5000 });
  });

  test('delete opens AlertDialog with confirmation copy', async ({ page }) => {
    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 1, title: 'Web Development', icon: 'fa-solid fa-code', is_featured: true, sort_order: 0 }] }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/services');
    await page.getByRole('button', { name: /del/i }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /delete/i })).toBeVisible();
    await expect(dialog.getByText(/cannot be undone/i)).toBeVisible();
    await expect(dialog.getByRole('button', { name: /delete/i })).toBeVisible();
  });
});
