import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test);

// Background step
Given('I am on the TodoMVC application', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

// Given steps - setup
Given('I have a todo {string}', async ({ page }, todoText: string) => {
  await page.getByPlaceholder('What needs to be done?').fill(todoText);
  await page.getByPlaceholder('What needs to be done?').press('Enter');
});

// When steps - actions
When('I add a todo {string}', async ({ page }, todoText: string) => {
  await page.getByPlaceholder('What needs to be done?').fill(todoText);
  await page.getByPlaceholder('What needs to be done?').press('Enter');
});

When('I mark the todo {string} as complete', async ({ page }, todoText: string) => {
  await page.getByRole('checkbox').check();
});

When('I delete the todo {string}', async ({ page }, todoText: string) => {
  await page.getByTestId('todo-item').hover();
  await page.getByRole('button', { name: 'Delete' }).click();
});

// Then steps - assertions
Then('I should see the todo {string} in the list', async ({ page }, todoText: string) => {
  await expect(page.getByTestId('todo-item')).toContainText(todoText);
});

Then('the todo counter should show {string}', async ({ page }, counterText: string) => {
  await expect(page.getByTestId('todo-count')).toHaveText(counterText);
});

Then('the input field should be cleared', async ({ page }) => {
  await expect(page.getByPlaceholder('What needs to be done?')).toHaveValue('');
});

Then('the todo {string} should be marked as completed', async ({ page }, todoText: string) => {
  await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
});

Then('the todo {string} should not be visible', async ({ page }, todoText: string) => {
  await expect(page.getByTestId('todo-item')).not.toBeVisible();
});
