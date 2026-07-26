import { test, expect } from '@playwright/test';

test.describe('Admin Pricing Plans Page — Phase 2 Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 10000 });
  });

  test('shows empty state when no pricing plans exist', async ({ page }) => {
    await page.route(/\/api\/admin\/pricing-plans/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pricing-plans');
    await expect(page.getByText(/no pricing plans yet/i)).toBeVisible();
  });

  test('shows skeleton rows while data loads', async ({ page }) => {
    await page.route(/\/api\/admin\/pricing-plans/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pricing-plans');
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('features can be added in form', async ({ page }) => {
    await page.route(/\/api\/admin\/pricing-plans/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pricing-plans');
    await page.getByRole('button', { name: /new plan/i }).click();

    // Should have one empty feature row by default
    const featureInputs = page.getByPlaceholder(/feature description/i);
    await expect(featureInputs).toHaveCount(1);

    // Add another feature
    await page.getByRole('button', { name: /\+ add feature/i }).click();
    await expect(featureInputs).toHaveCount(2);
  });

  test('features can be removed in form', async ({ page }) => {
    await page.route(/\/api\/admin\/pricing-plans/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pricing-plans');
    await page.getByRole('button', { name: /new plan/i }).click();

    // Add two features
    await page.getByRole('button', { name: /\+ add feature/i }).click();
    const featureInputs = page.getByPlaceholder(/feature description/i);
    await expect(featureInputs).toHaveCount(2);

    // Remove first feature
    await page.getByRole('button', { name: /^x$/i }).first().click();
    await expect(featureInputs).toHaveCount(1);
  });

  test('delete dialog shows plan name', async ({ page }) => {
    await page.route(/\/api\/admin\/pricing-plans/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 1, name: 'Starter Plan', price: 99.99, interval: 'monthly',
              description: 'Best for small teams', cta_text: 'Get Started',
              is_popular: true, is_published: true, sort_order: 0, features: [],
            }],
          }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/pricing-plans');
    await page.getByRole('button', { name: /del/i }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/starter plan/i)).toBeVisible();
    await expect(dialog.getByText(/cannot be undone/i)).toBeVisible();
  });

  test('sort up/down reorders rows', async ({ page }) => {
    let reorderCalled = false;
    await page.route(/\/api\/admin\/pricing-plans/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              { id: 1, name: 'Plan A', price: 10, interval: 'monthly', description: null, cta_text: null, is_popular: false, is_published: true, sort_order: 0, features: [] },
              { id: 2, name: 'Plan B', price: 20, interval: 'monthly', description: null, cta_text: null, is_popular: false, is_published: true, sort_order: 1, features: [] },
            ],
          }),
        });
      } else if (route.request().url().includes('/reorder')) {
        reorderCalled = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { message: 'Reordered.' } }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/pricing-plans');
    await expect(page.getByText('Plan A')).toBeVisible();

    const moveDownButtons = page.getByLabel('Move down');
    await moveDownButtons.first().click();

    await expect(() => expect(reorderCalled).toBe(true)).toPass({ timeout: 5000 });
  });

  test('toast appears on delete success', async ({ page }) => {
    await page.route(/\/api\/admin\/pricing-plans/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 1, name: 'ToDelete Plan', price: 0, interval: 'monthly',
              description: null, cta_text: null, is_popular: false, is_published: false,
              sort_order: 0, features: [],
            }],
          }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/pricing-plans');
    await page.getByRole('button', { name: /del/i }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: /delete/i }).click();
    await expect(page.getByText(/deleted/i)).toBeVisible({ timeout: 5000 });
  });
});
