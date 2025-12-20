import { Command } from 'commander';
import { ConfigOption } from '../options';
import { Logger } from '../../utils/logger';
import { AgentGenerator } from '../../agents/generator';

const logger = new Logger({ verbose: true });

type InitAgentsCommandOptions = ConfigOption & {
  loop?: string;
};

export const initAgentsCommand = new Command('init-agents')
  .description('Generate Playwright Test Agent definitions')
  .configureHelp({ showGlobalOptions: true })
  .option('--loop <type>', 'Agent loop type (vscode, claude-code, opencode)', 'vscode')
  /* eslint-disable-next-line max-statements */
  .action(async () => {
    const opts = initAgentsCommand.optsWithGlobals<InitAgentsCommandOptions>();
    const loopType = opts.loop || 'vscode';

    logger.log(`Generating Playwright Test Agent definitions for ${loopType}...`);

    try {
      const generator = new AgentGenerator(loopType);
      await generator.generate();

      logger.log('✅ Agent definitions generated successfully!');
      logger.log('');
      logger.log('Next steps:');
      logger.log('  1. Review the generated agents in .github/agents/');
      logger.log('  2. Review the seed feature in features/seed.feature');
      logger.log('  3. Use your AI tool to command the agents:');
      logger.log('     - 🎭 planner: Generate Gherkin feature files');
      logger.log('     - 🎭 generator: Create step definitions from feature files');
      logger.log('  4. Run `npx bddgen` to generate Playwright test specs');
      logger.log('  5. Run `npx playwright test` to execute the tests');
    } catch (error) {
      logger.log('❌ Failed to generate agent definitions');
      logger.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });
