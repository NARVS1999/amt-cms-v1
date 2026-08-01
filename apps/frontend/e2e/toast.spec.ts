import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Toast Notification System', () => {
  test('shows success toast on save', async ({ page }) => {
    await loginAsAdmin(page);

    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else if (method === 'POST') {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 1, title: 'Test', icon: 'fa-code', is_featured: false, sort_order: 0 } }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/services');
    await page.getByRole('button', { name: /new service/i }).click();
    await page.getByRole('textbox').first().fill('Toast Test');
    await page.getByRole('button', { name: /save/i }).click();
    const toast = page.getByRole('status').filter({ hasText: /created/i });
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('shows error toast on API failure', async ({ page }) => {
    await loginAsAdmin(page);

    await page.route(/\/api\/services/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal server error' }) });
      }
    });
    await page.goto('/admin/services');
    await page.getByRole('button', { name: /new service/i }).click();
    await page.getByRole('textbox').first().fill('Failing Service');
    await page.getByRole('button', { name: /save/i }).click();
    const toast = page.getByRole('status').filter({ hasText: /save failed/i });
    await expect(toast).toBeVisible({ timeout: 5000 });
    await expect(toast.getByRole('button', { name: /dismiss/i })).toBeVisible();
  });
});
