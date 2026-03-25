import { test, expect } from '@playwright/test';

test.describe('Todo Operations', () => {
  test('Add a New Todo', async ({ page }) => {
    // Setup
    await page.goto('https://demo.playwright.dev/todomvc');

    // Actions
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Assertions
    await expect(page.getByTestId('todo-item')).toContainText('Buy groceries');
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
    await expect(page.getByPlaceholder('What needs to be done?')).toHaveValue('');
  });

  test('Complete a Todo', async ({ page }) => {
    // Setup - add a todo first
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Actions
    await page.getByRole('checkbox').check();

    // Assertions
    await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText('0 items left');
  });

  test('Delete a Todo', async ({ page }) => {
    // Setup - add a todo first
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.getByPlaceholder('What needs to be done?').press('Enter');

    // Actions
    await page.getByTestId('todo-item').hover();
    await page.getByRole('button', { name: 'Delete' }).click();

    // Assertions
    await expect(page.getByTestId('todo-item')).not.toBeVisible();
    await expect(page.getByTestId('todo-count')).toHaveText('0 items left');
  });
});
