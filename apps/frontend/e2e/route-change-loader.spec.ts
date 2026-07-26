import { test, expect } from '@playwright/test';

test.describe('RouteChangeLoader', () => {
  test('navigation and overlay behaviors', async ({ page }) => {
    await page.route('**/api/admin/stats', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ services: 0, blog_posts: 0, unread_messages: 0, subscribers: 0 }) });
    });
    await page.route('**/api/services', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 15000 });

    await page.goto('/admin/dashboard');
    await page.getByRole('link', { name: 'Services', exact: true }).click();
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible({ timeout: 10000 });

    await page.goto('/admin/services');
    await expect(page.getByRole('navigation').first()).toBeVisible();

    await page.waitForTimeout(600);
    await expect(page.getByText('Loading')).not.toBeVisible();
  });
});
