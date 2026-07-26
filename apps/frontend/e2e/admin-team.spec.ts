import { test, expect } from '@playwright/test';

test.describe('Admin Team Page — Phase 2 Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 10000 });
  });

  test('shows empty state when no team members exist', async ({ page }) => {
    await page.route(/\/api\/team/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/team');
    await expect(page.getByText(/no team members yet/i)).toBeVisible();
  });

  test('shows skeleton rows while data loads', async ({ page }) => {
    await page.route(/\/api\/team/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/team');
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('shows avatar placeholder when no photo', async ({ page }) => {
    await page.route(/\/api\/team/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id: 1, name: 'John Doe', role: 'CEO', bio: 'Founder', photo_url: null, social_links: null, sort_order: 0 }],
        }),
      });
    });
    await page.goto('/admin/team');
    // Should show the User icon placeholder (rounded-full bg-muted div)
    await expect(page.locator('.rounded-full.bg-muted').first()).toBeVisible();
  });

  test('social links fields present in edit form', async ({ page }) => {
    await page.route(/\/api\/team/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id: 1, name: 'John Doe', role: 'CEO', bio: 'Founder', photo_url: null, social_links: { linkedin: null, twitter: null }, sort_order: 0 }],
        }),
      });
    });
    await page.goto('/admin/team');
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(page.getByPlaceholder(/linkedin/i)).toBeVisible();
    await expect(page.getByPlaceholder(/twitter/i)).toBeVisible();
  });

  test('delete dialog shows member name', async ({ page }) => {
    await page.route(/\/api\/team/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id: 1, name: 'Jane Smith', role: 'Designer', bio: null, photo_url: null, social_links: null, sort_order: 0 }],
          }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/team');
    await page.getByRole('button', { name: /del/i }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/jane smith/i)).toBeVisible();
    await expect(dialog.getByText(/cannot be undone/i)).toBeVisible();
  });

  test('sort up/down reorders rows', async ({ page }) => {
    let reorderCalled = false;
    await page.route(/\/api\/team/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              { id: 1, name: 'Member A', role: 'Role A', bio: null, photo_url: null, social_links: null, sort_order: 0 },
              { id: 2, name: 'Member B', role: 'Role B', bio: null, photo_url: null, social_links: null, sort_order: 1 },
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
    await page.goto('/admin/team');
    await expect(page.getByText('Member A')).toBeVisible();

    const moveDownButtons = page.getByLabel('Move down');
    await moveDownButtons.first().click();

    await expect(() => expect(reorderCalled).toBe(true)).toPass({ timeout: 5000 });
  });

  test('toast appears on delete success', async ({ page }) => {
    await page.route(/\/api\/team/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id: 1, name: 'ToDelete Member', role: 'Role', bio: null, photo_url: null, social_links: null, sort_order: 0 }],
          }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/team');
    await page.getByRole('button', { name: /del/i }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: /delete/i }).click();
    await expect(page.getByText(/deleted/i)).toBeVisible({ timeout: 5000 });
  });

  test('validation errors display inline', async ({ page }) => {
    await page.route(/\/api\/team/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Validation failed', errors: { name: ['The name field is required.'] } }),
        });
      }
    });
    await page.goto('/admin/team');
    await page.getByRole('button', { name: /new member/i }).click();
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/name field is required/i)).toBeVisible({ timeout: 5000 });
  });
});
