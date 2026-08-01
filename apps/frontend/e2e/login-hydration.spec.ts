import { test, expect, type Route } from '@playwright/test';

test.describe('Login form hydration safety', () => {
  test('submits the typed credentials even when fill() precedes hydration', async ({ page }) => {
    // Capture what the app actually POSTs to the backend.
    let postBody: { email: string; password: string } | null = null;
    await page.route('**/api/admin/login', async (route: Route) => {
      postBody = route.request().postDataJSON();
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'The email field is required.', errors: {} }),
      });
    });

    // Delay all JS bundles so fill() runs while the SSR'd HTML is not yet
    // hydrated. Reproduces the full-suite race (playwright-login-empty-fields):
    // the pre-hydration input events are lost, React state stays '', and the
    // submit sends empty credentials → backend 422.
    await page.route('**/*.js', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.continue();
    });

    await page.goto('/admin/login', { waitUntil: 'commit' });

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByLabel(/password/i).fill('password');

    // Let hydration complete BEFORE submitting (but AFTER the fill).
    await page.waitForFunction(() => {
      let el: Element | null = document.getElementById('email');
      while (el) {
        if (Object.keys(el).some((k) => k.startsWith('__react'))) return true;
        el = el.parentElement;
      }
      return false;
    });

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect.poll(() => postBody, { timeout: 10000 }).not.toBeNull();
    expect(postBody!.email).toBe('admin@example.com');
    expect(postBody!.password).toBe('password');
  });
});
