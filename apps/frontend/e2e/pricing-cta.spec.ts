import { test, expect } from '@playwright/test';

test.describe('PricingTable CTA — Phase 4', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders pricing section with seeded plans', async ({ page }) => {
    const section = page.locator('#pricing');
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { name: 'Our Pricing' })).toBeVisible();
  });

  test('CTA links to /contact page', async ({ page }) => {
    const section = page.locator('#pricing');
    await expect(section).toBeVisible();
    const cta = section.getByRole('link', { name: 'Get Started' }).first();
    await expect(cta).toHaveAttribute('href', '/contact');
    await cta.click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('uses custom cta_text when provided', async ({ page }) => {
    const section = page.locator('#pricing');
    await expect(section.getByRole('link', { name: 'Start Growing' })).toBeVisible();
  });

  test('shows Most Popular ribbon for popular plan', async ({ page }) => {
    await expect(page.locator('#pricing').getByText('Most Popular')).toBeVisible();
  });

  test('formats price with peso sign', async ({ page }) => {
    await expect(page.locator('#pricing').getByText('₱99.00')).toBeVisible();
  });
});
