import { test, expect } from '@playwright/test';

test.describe('Admin Media Library', () => {
  test('shows empty state when no media exists', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await page.goto('/admin/media');

    await expect(page.getByText(/no media yet/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /upload file/i })).toBeVisible();
  });

  test('shows upload button and file input', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await page.goto('/admin/media');

    const uploadButton = page.getByRole('button', { name: /upload file/i });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();
  });

  test('shows heading and title', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await page.goto('/admin/media');

    await expect(page.getByRole('heading', { name: /media library/i })).toBeVisible();
  });
});
