import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';

Given('I am on the Playwright docs site', async ({ page }) => {
  await page.goto('https://playwright.dev');
});

When('I click the {string} link', async ({ page }, name: string) => {
  await page.getByRole('link', { name }).click();
});

When('I click the {string} link in the navigation', async ({ page }, name: string) => {
  await page.getByRole('navigation').getByRole('link', { name }).click();
});

When('I open the search dialog', async ({ page }) => {
  await page.getByRole('button', { name: 'Search' }).click();
});

When('I search for {string}', async ({ page }, query: string) => {
  await page.getByRole('searchbox').fill(query);
});

Then('I see the page title {string}', async ({ page }, title: string) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
});

Then('I see the heading {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(text);
});

Then('the URL contains {string}', async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(path));
});

Then('I see search results containing {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('listbox')).toContainText(text);
});

Then('I see a list with more than {int} items', async ({ page }, count: number) => {
  // intentionally uses a wrong selector to trigger failure
  const items = page.getByRole('main').getByRole('listitem');
  await expect(items).toHaveCount(count);
});
