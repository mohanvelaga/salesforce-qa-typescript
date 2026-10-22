import { test, expect } from '@playwright/test';

test('Playwright framework smoke test @smoke', async ({ page }) => {
  await page.goto('data:text/html,<title>QA Framework</title><h1>Playwright is working</h1>');
  await expect(page).toHaveTitle('QA Framework');
  await expect(page.getByRole('heading', { name: 'Playwright is working' })).toBeVisible();
});
