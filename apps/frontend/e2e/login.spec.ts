import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('shows login form with all required elements', async ({ page }) => {
    await page.goto('/admin/login');

    await expect(page.getByRole('heading', { name: /adsvance cms/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/remember me/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('alert').filter({ hasText: /incorrect/i })).toBeVisible({ timeout: 10000 });
  });

  test('navigates to forgot password page', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByRole('link', { name: /forgot password/i }).click();

    await expect(page).toHaveURL(/\/admin\/forgot-password/);
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
  });

  test('forgot password page renders email form', async ({ page }) => {
    await page.goto('/admin/forgot-password');

    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible();
  });

  test('forgot password shows success message on submit', async ({ page }) => {
    await page.goto('/admin/forgot-password');

    await page.getByLabel(/email/i).fill('admin@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible();
  });
});
