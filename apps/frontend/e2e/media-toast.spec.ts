import { test, expect } from '@playwright/test';

test.describe('Media Page — Toast Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 10000 });
  });

  test('shows upload button and heading', async ({ page }) => {
    await page.route(/\/api\/media/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/media');
    await expect(page.getByRole('heading', { name: /media library/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /upload file/i })).toBeVisible();
  });

  test('shows success toast on file upload', async ({ page }) => {
    await page.route(/\/api\/media/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 1, name: 'test.png', file_name: 'test.png', mime_type: 'image/png', size: 1024, url: '/media/test.png', thumbnail: null } }) });
      }
    });
    await page.goto('/admin/media');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload file/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('fake-png') });
    const toast = page.getByRole('status').filter({ hasText: /file uploaded successfully/i });
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('shows error toast on upload failure', async ({ page }) => {
    await page.route(/\/api\/media/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ message: 'Validation failed', errors: { file: ['File must be an image'] } }) });
      }
    });
    await page.goto('/admin/media');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /upload file/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') });
    const toast = page.getByRole('status').filter({ hasText: /upload failed|file must be an image/i });
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
