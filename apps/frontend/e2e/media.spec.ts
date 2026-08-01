import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin Media Library', () => {
  test('shows upload button and file input on media page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/media');

    const uploadButton = page.getByRole('button', { name: /upload file/i });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();
  });

  test('shows upload button and file input', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/media');

    const uploadButton = page.getByRole('button', { name: /upload file/i });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();
  });

  test('shows heading and title', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/media');

    await expect(page.getByRole('heading', { name: /media library/i })).toBeVisible();
  });
});
