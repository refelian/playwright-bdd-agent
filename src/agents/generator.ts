import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { plannerTemplate } from './templates/planner';
import { generatorTemplate } from './templates/generator';
import { healerTemplate } from './templates/healer';

export class AgentGenerator {
  private loopType: string;
  private outputDir: string;

  constructor(loopType: string) {
    this.loopType = loopType;
    this.outputDir = path.join(process.cwd(), '.github', 'agents');
  }

  async generate(): Promise<void> {
    // Create output directory if it doesn't exist
    if (!existsSync(this.outputDir)) {
      await fs.mkdir(this.outputDir, { recursive: true });
    }

    // Generate agent definitions based on loop type
    await this.generateAgent('planner', plannerTemplate(this.loopType));
    await this.generateAgent('generator', generatorTemplate(this.loopType));
    await this.generateAgent('healer', healerTemplate(this.loopType));

    // Create directories for features and step definitions
    await this.createDirectory('features');
    await this.createDirectory('features/steps');

    // Generate a basic seed test and fixtures if they don't exist
    await this.generateSeedTest();
    await this.generateFixtures();
  }

  private async generateAgent(name: string, content: string): Promise<void> {
    const fileName = this.getAgentFileName(name);
    const filePath = path.join(this.outputDir, fileName);
    await fs.writeFile(filePath, content, 'utf8');
  }

  private getAgentFileName(name: string): string {
    // For VS Code, use .md extension
    if (this.loopType === 'vscode') {
      return `${name}.md`;
    }
    // For other types, use .json
    return `${name}.json`;
  }

  private async createDirectory(dirName: string): Promise<void> {
    const dirPath = path.join(process.cwd(), dirName);
    if (!existsSync(dirPath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private async generateSeedTest(): Promise<void> {
    const seedTestPath = path.join(process.cwd(), 'features', 'seed.feature');
    if (!existsSync(seedTestPath)) {
      const seedContent = `Feature: Seed Test

  This is a seed feature that provides a ready-to-use page context
  for the planner agent to explore your application.

  Scenario: Setup application context
    Given I navigate to the application
    # Replace the URL in the step definition with your application URL

  # You can add authentication or setup scenarios here
  # Scenario: Authenticated user
  #   Given I am on the login page
  #   When I enter "user" as username
  #   And I enter "password" as password
  #   And I click the "Login" button
  #   Then I should be logged in
`;
      await fs.writeFile(seedTestPath, seedContent, 'utf8');
    }
  }

  private async generateFixtures(): Promise<void> {
    const fixturesPath = path.join(process.cwd(), 'features', 'steps', 'fixtures.ts');
    if (!existsSync(fixturesPath)) {
      const fixturesContent = `import { test as base } from 'playwright-bdd';

// Define custom fixtures here if needed
// export const test = base.extend<{}>({});

export const test = base;
`;
      await fs.writeFile(fixturesPath, fixturesContent, 'utf8');
    }

    // Generate initial step definitions for the seed feature
    const seedStepsPath = path.join(process.cwd(), 'features', 'steps', 'seed.ts');
    if (!existsSync(seedStepsPath)) {
      const seedStepsContent = `import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given } = createBdd(test);

Given('I navigate to the application', async ({ page }) => {
  // Replace the URL below with your application URL:
  await page.goto('https://demo.playwright.dev/todomvc');
  
  // Add any necessary setup or authentication steps here
});
`;
      await fs.writeFile(seedStepsPath, seedStepsContent, 'utf8');
    }
  }
}
