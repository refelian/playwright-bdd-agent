import { createBdd } from 'playwright-bdd';

const { Given, Then, When } = createBdd();

Given('existing step', async () => {
  // noop
});

Then('existing outcome', async () => {
  // noop
});

When('duplicate step', async () => {
  // noop
});

When('duplicate step', async () => {
  // noop
});
