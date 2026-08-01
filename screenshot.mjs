import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUTPUT = path.join(process.cwd(), 'screenshots');

fs.mkdirSync(OUTPUT, { recursive: true });

const publicPages = [
  { name: '01-home', url: '/' },
  { name: '02-blog-listing', url: '/blog' },
  { name: '03-blog-post', url: '/blog/10-seo-strategies-2026' },
  { name: '04-contact', url: '/contact' },
];

const authPages = [
  { name: '05-admin-login', url: '/admin/login' },
  { name: '06-admin-forgot-password', url: '/admin/forgot-password' },
];

const adminPages = [
  { name: '07-admin-dashboard', url: '/admin/dashboard' },
  { name: '08-admin-services', url: '/admin/services' },
  { name: '09-admin-team', url: '/admin/team' },
  { name: '10-admin-blog-posts', url: '/admin/blog-posts' },
  { name: '11-admin-pricing-plans', url: '/admin/pricing-plans' },
  { name: '12-admin-messages', url: '/admin/messages' },
  { name: '13-admin-subscribers', url: '/admin/subscribers' },
  { name: '14-admin-settings-theme', url: '/admin/settings/theme' },
  { name: '15-admin-media', url: '/admin/media' },
  { name: '16-admin-pages', url: '/admin/pages' },
];

async function screenshot(browser, name, url) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const filePath = path.join(OUTPUT, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`✓ ${name} → ${filePath}`);
  } catch (e) {
    console.error(`✗ ${name}: ${e.message}`);
  } finally {
    await context.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  console.log('\n📸 Public pages...');
  for (const p of publicPages) {
    await screenshot(browser, p.name, p.url);
  }

  console.log('\n📸 Auth pages...');
  for (const p of authPages) {
    await screenshot(browser, p.name, p.url);
  }

  console.log('\n🔐 Logging in to admin...');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();
  try {
    await adminPage.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await adminPage.waitForTimeout(2000);

    // Try to fill the login form
    const emailInput = adminPage.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = adminPage.locator('input[type="password"], input[name="password"]').first();
    const submitBtn = adminPage.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")').first();

    await emailInput.fill('admin@example.com');
    await passwordInput.fill('password');
    await submitBtn.click();

    // Wait for navigation after login
    await adminPage.waitForTimeout(5000);

    const currentUrl = adminPage.url();
    console.log(`After login, URL: ${currentUrl}`);

    if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
      console.log('✅ Login successful!');

      for (const p of adminPages) {
        const filePath = path.join(OUTPUT, `${p.name}.png`);
        try {
          await adminPage.goto(`${BASE}${p.url}`, { waitUntil: 'networkidle', timeout: 30000 });
          await adminPage.waitForTimeout(2000);
          await adminPage.screenshot({ path: filePath, fullPage: true });
          console.log(`✓ ${p.name} → ${filePath}`);
        } catch (e) {
          console.error(`✗ ${p.name}: ${e.message}`);
        }
      }
    } else {
      console.log('⚠️ Login may have failed, capturing admin pages anyway...');
      for (const p of adminPages) {
        const filePath = path.join(OUTPUT, `${p.name}.png`);
        try {
          await adminPage.goto(`${BASE}${p.url}`, { waitUntil: 'networkidle', timeout: 30000 });
          await adminPage.waitForTimeout(2000);
          await adminPage.screenshot({ path: filePath, fullPage: true });
          console.log(`✓ ${p.name} → ${filePath}`);
        } catch (e) {
          console.error(`✗ ${p.name}: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.error(`✗ Login failed: ${e.message}`);
    // Still capture admin pages (they might redirect to login)
    for (const p of adminPages) {
      await screenshot(adminContext.browser() ? adminContext : await browser.newContext({ viewport: { width: 1440, height: 900 } }), p.name, p.url);
    }
  } finally {
    await adminContext.close();
  }

  await browser.close();

  console.log('\n📋 Summary of screenshots:');
  const files = fs.readdirSync(OUTPUT).filter(f => f.endsWith('.png'));
  files.forEach(f => console.log(`  - ${f}`));
  console.log(`\nTotal: ${files.length} screenshots saved to ${OUTPUT}`);
}

main().catch(console.error);
