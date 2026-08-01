import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin Dashboard', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('shows loading skeleton while fetching stats', async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('shows dashboard heading after login', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 20000 });
  });

  test('shows stat cards on dashboard after loading', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 20000 });

    await page.route(/\/api\/admin\/stats/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ services: 4, blog_posts: 3, unread_messages: 2, subscribers: 150 }),
      });
    });

    await page.reload();
    await expect(page.getByText(/total services/i)).toBeVisible({ timeout: 20000 });
  });
});
