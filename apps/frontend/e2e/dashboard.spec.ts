import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('shows loading skeleton while fetching stats', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/admin\/(?!login)/, { timeout: 10000 });
  });

  test('shows dashboard heading after login', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  test('shows stat cards on dashboard after loading', async ({ page }) => {
    await page.route(/\/api\/admin\/stats/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ services: 4, blog_posts: 3, unread_messages: 2, subscribers: 150 }),
      });
    });

    await page.goto('/admin/login');

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 10000 });

    await expect(page.getByText(/total services/i)).toBeVisible({ timeout: 10000 });
  });
});
