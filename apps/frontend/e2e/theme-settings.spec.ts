import { test, expect } from '@playwright/test';

test.describe('Admin Theme Settings — Phase 5', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/admin\/theme/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              primary_color: '#FF0000',
              secondary_color: '#fb3d03',
              accent_color: '#FFC107',
              background_color: '#FFFFFF',
              foreground_color: '#333333',
              muted_color: '#f5f5f5',
              muted_foreground_color: '#888888',
              border_color: '#f0f0f0',
              success_color: '#22c55e',
              error_color: '#ef4444',
              body_font: 'Poppins',
              heading_font: 'Poppins',
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { message: 'Theme settings updated' } }),
        });
      }
    });

    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 20000 });
  });

  test('loads theme settings into form fields', async ({ page }) => {
    await page.goto('/admin/settings/theme');
    const primaryText = page.getByPlaceholder('#000000').first();
    await expect(primaryText).toHaveValue('#FF0000');
    await expect(page.getByPlaceholder(/e\.g\., Inter, Poppins/).first()).toHaveValue('Poppins');
  });

  test('saves theme settings and shows success toast', async ({ page }) => {
    await page.goto('/admin/settings/theme');
    await page.getByPlaceholder('#000000').first().fill('#123456');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Theme settings saved successfully.')).toBeVisible();
  });
});
