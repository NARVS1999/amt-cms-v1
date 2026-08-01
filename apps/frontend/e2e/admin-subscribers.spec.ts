import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

const subscriber = {
  id: 1,
  email: 'user@example.com',
  subscribed_at: '2026-07-27T00:00:00.000000Z',
  created_at: '2026-07-27T00:00:00.000000Z',
  updated_at: '2026-07-27T00:00:00.000000Z',
};

test.describe('Admin Subscribers Page — Phase 7', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/admin\/subscribers/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [subscriber] }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Deleted' }) });
      }
    });

    await loginAsAdmin(page);
  });

  test('renders subscribers table with emails', async ({ page }) => {
    await page.goto('/admin/subscribers');
    await expect(page.getByRole('heading', { name: /subscribers/i })).toBeVisible();
    await expect(page.getByText('user@example.com')).toBeVisible();
  });

  test('shows empty state when no subscribers exist', async ({ page }) => {
    await page.route(/\/api\/admin\/subscribers/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/subscribers');
    await expect(page.getByText('No subscribers yet.')).toBeVisible();
  });

  test('removes subscriber via confirm dialog', async ({ page }) => {
    await page.goto('/admin/subscribers');
    await page.getByRole('button', { name: /remove/i }).first().click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/remove this subscriber/i)).toBeVisible();
    await dialog.getByRole('button', { name: /remove/i }).click();
    await expect(page.getByText(/removed/i)).toBeVisible();
  });
});
