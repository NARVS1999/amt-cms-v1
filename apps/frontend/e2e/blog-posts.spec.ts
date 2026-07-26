import { test, expect } from '@playwright/test';

test.describe('Blog Posts — Toast & Error Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 10000 });
  });

  test('shows error banner on API failure during save', async ({ page }) => {
    await page.route(/\/api\/blog-posts/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Save failed' }) });
      }
    });
    await page.goto('/admin/blog-posts');
    await page.getByRole('button', { name: /new blog post/i }).click();
    await page.getByRole('textbox').first().fill('Test Post');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/save failed/i)).toBeVisible({ timeout: 5000 });
  });

  test('shows skeleton rows while blog posts load', async ({ page }) => {
    await page.route(/\/api\/blog-posts/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/blog-posts');
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('renders empty state for blog posts', async ({ page }) => {
    await page.route(/\/api\/blog-posts/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/blog-posts');
    await expect(page.getByText(/no posts yet/i)).toBeVisible();
  });
});
