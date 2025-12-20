import { test, expect } from '@playwright/test';

test('seed', async ({ page }) => {
  // This seed test provides a ready-to-use page context
  // for the planner agent to explore the application.
  await page.goto('https://demo.playwright.dev/todomvc');

  // You can add authentication or setup steps here
  // Example:
  // await page.getByLabel('Username').fill('user');
  // await page.getByLabel('Password').fill('password');
  // await page.getByRole('button', { name: 'Login' }).click();
});
