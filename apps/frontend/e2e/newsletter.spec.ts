import { test, expect } from '@playwright/test';

test.describe('Footer Newsletter Subscribe — Phase 5', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('does not subscribe with invalid email (native type=email validation)', async ({ page }) => {
    let apiCalled = false;
    await page.route(/\/api\/subscribe/, async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    });

    await page.getByPlaceholder('Enter your email').fill('not-an-email');
    await page.getByRole('button', { name: /subscribe/i }).click();
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });

  test('shows success message on valid subscribe', async ({ page }) => {
    await page.route(/\/api\/subscribe/, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Subscribed successfully',
          subscriber: {
            id: 1,
            email: 'user@example.com',
            subscribed_at: '2026-07-26T00:00:00.000000Z',
          },
        }),
      });
    });

    await page.getByPlaceholder('Enter your email').fill('user@example.com');
    await page.getByRole('button', { name: /subscribe/i }).click();

    await expect(page.getByText('Subscribed!')).toBeVisible();
  });

  test('shows duplicate message for already-subscribed email', async ({ page }) => {
    await page.route(/\/api\/subscribe/, async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'The given data was invalid.',
          errors: { email: ['This email is already subscribed.'] },
        }),
      });
    });

    await page.getByPlaceholder('Enter your email').fill('dup@example.com');
    await page.getByRole('button', { name: /subscribe/i }).click();

    await expect(page.getByText('Already subscribed.')).toBeVisible();
  });
});
