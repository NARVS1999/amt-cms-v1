import { test, expect } from '@playwright/test';

test.describe('Admin Pages Page — Phase 2 Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 20000 });
  });

  test('shows empty state when no pages exist', async ({ page }) => {
    await page.route(/\/api\/admin\/pages/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pages');
    await expect(page.getByText(/no pages yet/i)).toBeVisible();
  });

  test('shows skeleton rows while data loads', async ({ page }) => {
    await page.route(/\/api\/admin\/pages/, async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pages');
    await expect(page.locator('.animate-pulse').first()).toBeVisible();
  });

  test('JSON sections editor validates syntax', async ({ page }) => {
    await page.route(/\/api\/admin\/pages/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pages');
    await page.getByRole('button', { name: /new page/i }).click();

    // Type invalid JSON
    const jsonEditor = page.locator('textarea').last();
    await jsonEditor.fill('{ invalid json }');
    await expect(page.locator('p.text-red-600')).toBeVisible();
  });

  test('"Load Example" button populates sections', async ({ page }) => {
    await page.route(/\/api\/admin\/pages/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/pages');
    await page.getByRole('button', { name: /new page/i }).click();

    await page.getByRole('button', { name: /load example/i }).click();

    // JSON editor should now contain the example sections
    const jsonEditor = page.locator('textarea').last();
    const value = await jsonEditor.inputValue();
    expect(value).toContain('hero');
    expect(value).toContain('features');
  });

  test('delete dialog shows page title', async ({ page }) => {
    await page.route(/\/api\/admin\/pages/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id: 1, title: 'Home Page', slug: 'home', hero_heading: 'Welcome', hero_subtext: 'Hello', sections: null, is_published: true, sort_order: 0 }],
          }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/pages');
    await page.getByRole('button', { name: /del/i }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: /home page/i })).toBeVisible();
    await expect(dialog.getByText(/cannot be undone/i)).toBeVisible();
  });

  test('sort up/down reorders rows', async ({ page }) => {
    let reorderCalled = false;
    await page.route(/\/api\/admin\/pages/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              { id: 1, title: 'Page A', slug: 'page-a', hero_heading: null, hero_subtext: null, sections: null, is_published: true, sort_order: 0 },
              { id: 2, title: 'Page B', slug: 'page-b', hero_heading: null, hero_subtext: null, sections: null, is_published: true, sort_order: 1 },
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
    await page.goto('/admin/pages');
    await expect(page.getByText('Page A')).toBeVisible();

    const moveDownButtons = page.getByLabel('Move down');
    await moveDownButtons.first().click();

    await expect(() => expect(reorderCalled).toBe(true)).toPass({ timeout: 5000 });
  });

  test('toast appears on delete success', async ({ page }) => {
    await page.route(/\/api\/(admin\/)?pages/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id: 1, title: 'ToDelete Page', slug: 'delete-me', hero_heading: null, hero_subtext: null, sections: null, is_published: false, sort_order: 0 }],
          }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
      }
    });
    await page.goto('/admin/pages');
    await page.getByRole('button', { name: /del/i }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: /delete/i }).click();
    await expect(page.getByText(/deleted/i)).toBeVisible({ timeout: 5000 });
  });

  test('validation errors display inline', async ({ page }) => {
    await page.route(/\/api\/admin\/pages/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      } else {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Validation failed', errors: { title: ['The title field is required.'] } }),
        });
      }
    });
    await page.goto('/admin/pages');
    await page.getByRole('button', { name: /new page/i }).click();
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/title field is required/i)).toBeVisible({ timeout: 5000 });
  });
});
