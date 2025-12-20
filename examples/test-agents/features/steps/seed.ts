import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('I navigate to the application', async ({ page }) => {
  // Seed test provides a ready-to-use page context
  // for the planner agent to explore the application
  await page.goto('https://demo.playwright.dev/todomvc');
});
