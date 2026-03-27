import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

export default defineConfig({
  testDir: defineBddConfig({
    outputDir: '.features-gen',
    features: 'features/*.feature',
    steps: 'steps/*.ts',
  }),
});
