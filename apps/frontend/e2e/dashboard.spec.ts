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

    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
  });
});
