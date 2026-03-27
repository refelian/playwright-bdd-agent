import { Command } from 'commander';
import { getEnvConfigs } from '../../config/env';
import { setBddGenPhase } from '../helpers/bddgenPhase';
import { loadConfig as loadPlaywrightConfig } from '../../playwright/loadConfig';
import { ConfigOption } from '../options';
import { assertConfigsCount } from './test';
import { BddInspector } from '../../inspect';
import { exit } from '../../utils/exit';

type InspectCommandOptions = ConfigOption & {
  json?: boolean;
};

export const inspectCommand = new Command('inspect')
  .description('Inspect discovered BDD data')
  .configureHelp({ showGlobalOptions: true })
  .option('--json', 'Output machine-readable JSON')
  .action(async () => {
    const opts = inspectCommand.optsWithGlobals<InspectCommandOptions>();

    if (!opts.json) {
      exit(`Inspect currently supports JSON output only. Use "bddgen inspect --json".`);
    }

    setBddGenPhase();
    await loadPlaywrightConfig(opts.config);

    const configs = Object.values(getEnvConfigs());
    assertConfigsCount(configs);

    const report = await new BddInspector().inspectConfigs(configs);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  });
