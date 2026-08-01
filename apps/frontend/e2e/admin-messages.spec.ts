import { test, expect } from '@playwright/test';

const message = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello, I need a website built.',
  read_at: null,
  created_at: '2026-07-27T00:00:00.000000Z',
  updated_at: '2026-07-27T00:00:00.000000Z',
};

const readMessage = {
  ...message,
  id: 2,
  name: 'Jane Smith',
  read_at: '2026-07-27T10:00:00.000000Z',
};

test.describe('Admin Messages Page — Phase 7', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/admin\/messages/, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [readMessage, message] }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Deleted' }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { ...message, read_at: '2026-07-27T12:00:00.000000Z' } }) });
      }
    });

    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/(?!login)/, { timeout: 20000 });
  });

  test('renders messages table with read badges', async ({ page }) => {
    await page.goto('/admin/messages');
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'John Doe' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Jane Smith' })).toBeVisible();
    await expect(page.getByText('Read').first()).toBeVisible();
    await expect(page.getByText('Unread').first()).toBeVisible();
  });

  test('shows empty state when no messages exist', async ({ page }) => {
    await page.route(/\/api\/admin\/messages/, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.goto('/admin/messages');
    await expect(page.getByText('No messages yet.')).toBeVisible();
  });

  test('opens detail modal with full message', async ({ page }) => {
    await page.goto('/admin/messages');
    await page.getByRole('button', { name: /view/i }).nth(1).click();
    const modal = page.locator('.fixed.inset-0.z-50');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Hello, I need a website built.')).toBeVisible();
    await expect(modal.getByText('john@example.com')).toBeVisible();
    await expect(modal.getByRole('button', { name: /mark read/i })).toBeVisible();
  });

  test('toggles read status from table badge', async ({ page }) => {
    await page.goto('/admin/messages');
    await page.getByText('Unread').first().click();
    await expect(page.getByText('Read').first()).toBeVisible();
  });

  test('deletes message via confirm dialog', async ({ page }) => {
    await page.goto('/admin/messages');
    await page.getByRole('button', { name: /del/i }).first().click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Delete this message?')).toBeVisible();
    await dialog.getByRole('button', { name: /delete/i }).click();
    await expect(page.getByText(/deleted/i)).toBeVisible();
  });
});
