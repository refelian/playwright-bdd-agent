import { defineConfig } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';

const testDir = defineBddConfig({
  featuresRoot: './features',
});

export default defineConfig({
  testDir,
  reporter: [
    cucumberReporter('html', {
      outputFile: 'cucumber-report/report-disabled.html',
    }),
    ['html', { open: 'never' }],
  ],
  use: {
    screenshot: 'only-on-failure',
  },
});
