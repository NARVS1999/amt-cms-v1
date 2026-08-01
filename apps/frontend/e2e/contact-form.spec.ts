import { test, expect } from '@playwright/test';

test.describe('Contact Form — Phase 5', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('does not submit when required fields are empty (native validation)', async ({ page }) => {
    let apiCalled = false;
    await page.route(/\/api\/contact/, async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    });

    await page.getByRole('button', { name: /send message/i }).click();
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
    await expect(page.getByText(/thank you/i)).not.toBeVisible();
  });

  test('does not submit with invalid email (native type=email validation)', async ({ page }) => {
    let apiCalled = false;
    await page.route(/\/api\/contact/, async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    });

    await page.getByPlaceholder('Your Name', { exact: true }).fill('John Doe');
    await page.getByPlaceholder('Your Email', { exact: true }).fill('not-an-email');
    await page.getByPlaceholder('Tell us about your project...', { exact: true }).fill('Hello there');
    await page.getByRole('button', { name: /send message/i }).click();
    await page.waitForTimeout(500);
    expect(apiCalled).toBe(false);
  });

  test('shows Zod validation error for message over 5000 characters', async ({ page }) => {
    await page.getByPlaceholder('Your Name', { exact: true }).fill('John Doe');
    await page.getByPlaceholder('Your Email', { exact: true }).fill('john@example.com');
    await page.getByPlaceholder('Tell us about your project...', { exact: true }).fill('x'.repeat(5001));
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText('Message must not exceed 5000 characters.')).toBeVisible();
  });

  test('submits successfully and shows thank you banner', async ({ page }) => {
    await page.route(/\/api\/contact/, async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Message sent',
          contact_message: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            created_at: '2026-07-26T00:00:00.000000Z',
          },
        }),
      });
    });

    await page.getByPlaceholder('Your Name', { exact: true }).fill('John Doe');
    await page.getByPlaceholder('Your Email', { exact: true }).fill('john@example.com');
    await page.getByPlaceholder('Tell us about your project...', { exact: true }).fill('I want a website.');
    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/Thank you! We'll get back to you soon/i)).toBeVisible();
  });

  test('shows server error banner on 422 response', async ({ page }) => {
    await page.route(/\/api\/contact/, async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'The given data was invalid.',
          errors: { email: ['The email field is required.'] },
        }),
      });
    });

    await page.getByPlaceholder('Your Name', { exact: true }).fill('John Doe');
    await page.getByPlaceholder('Your Email', { exact: true }).fill('john@example.com');
    await page.getByPlaceholder('Tell us about your project...', { exact: true }).fill('Hello');
    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText('The given data was invalid.')).toBeVisible();
  });
});
