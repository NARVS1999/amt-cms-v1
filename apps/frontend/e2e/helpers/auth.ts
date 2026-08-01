import { expect, type Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@example.com';
export const ADMIN_PASSWORD = 'password';

/**
 * Logs in as the seeded admin user and waits for navigation away from the
 * login page.
 *
 * Extracted to a single shared helper to eliminate the duplicated login
 * blocks that previously lived in each spec's beforeEach. The value
 * verification (toHaveValue) after fill() guards against the hydration race
 * documented in .planning/debug/playwright-login-empty-fields.md: if a fill
 * value were ever wiped by React reconciliation, this assertion fails fast
 * with a clear message instead of surfacing later as a confusing 422/empty
 * form submission.
 */
export async function loginAsAdmin(page: Page, options: { timeout?: number } = {}) {
  const { timeout = 20000 } = options;

  await page.goto('/admin/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);

  // Value verification: retry until the values stick (hydration-safe).
  await expect(page.getByLabel(/email/i)).toHaveValue(ADMIN_EMAIL);
  await expect(page.getByLabel(/password/i)).toHaveValue(ADMIN_PASSWORD);

  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/admin\/(?!login)/, { timeout });
}
