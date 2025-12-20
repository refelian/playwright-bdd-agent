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
    
    const generator = new AgentGenerator(loopType);
    await generator.generate();
    
    logger.log('✅ Agent definitions generated successfully!');
    logger.log('');
    logger.log('Next steps:');
    logger.log('  1. Review the generated agents in .github/agents/');
    logger.log('  2. Create a seed test in tests/seed.spec.ts');
    logger.log('  3. Use your AI tool to command the agents:');
    logger.log('     - 🎭 planner: Generate test plans');
    logger.log('     - 🎭 generator: Create Playwright tests from plans');
    logger.log('     - 🎭 healer: Fix failing tests');
  });
