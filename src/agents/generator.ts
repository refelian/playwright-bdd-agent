import fs from 'fs';
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
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate agent definitions based on loop type
    await this.generateAgent('planner', plannerTemplate(this.loopType));
    await this.generateAgent('generator', generatorTemplate(this.loopType));
    await this.generateAgent('healer', healerTemplate(this.loopType));

    // Create directories for specs and tests if they don't exist
    this.createDirectory('specs');
    this.createDirectory('tests');

    // Generate a basic seed test if it doesn't exist
    await this.generateSeedTest();
  }

  private async generateAgent(name: string, content: string): Promise<void> {
    const fileName = this.getAgentFileName(name);
    const filePath = path.join(this.outputDir, fileName);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  private getAgentFileName(name: string): string {
    // For VS Code, use .md extension
    if (this.loopType === 'vscode') {
      return `${name}.md`;
    }
    // For other types, use .json
    return `${name}.json`;
  }

  private createDirectory(dirName: string): void {
    const dirPath = path.join(process.cwd(), dirName);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private async generateSeedTest(): Promise<void> {
    const seedTestPath = path.join(process.cwd(), 'tests', 'seed.spec.ts');
    if (!fs.existsSync(seedTestPath)) {
      const seedContent = `import { test, expect } from '@playwright/test';

test('seed', async ({ page }) => {
  // This is a seed test that provides a ready-to-use page context
  // for the planner agent to explore your application.
  // 
  // Replace the URL below with your application URL:
  await page.goto('https://demo.playwright.dev/todomvc');
  
  // Add any necessary setup or authentication steps here
  // await page.getByLabel('Username').fill('user');
  // await page.getByLabel('Password').fill('password');
  // await page.getByRole('button', { name: 'Login' }).click();
});
`;
      fs.writeFileSync(seedTestPath, seedContent, 'utf8');
    }
  }
}
