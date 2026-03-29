import fs from 'node:fs';
import path from 'node:path';
import { BDDConfig } from '../config/types';
import { BddInspector } from './index';
import { InspectConfigReport } from './types';

/**
 * Write pre-computed inspect reports to disk for configs that have inspectOutput set.
 * Reports array must be index-aligned with configs array.
 */
export async function writeInspectOutputs(configs: BDDConfig[], reports: InspectConfigReport[]) {
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    if (!config.inspectOutput) continue;
    const outputPath = path.resolve(config.configDir, config.inspectOutput);
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, JSON.stringify(reports[i], null, 2));
  }
}

/**
 * Run the inspector and write reports for configs that have inspectOutput set.
 * Used after bddgen test, where inspect results are not yet available.
 */
export async function inspectAndSaveOutputs(configs: BDDConfig[]) {
  const relevant = configs.filter((c) => c.inspectOutput);
  if (!relevant.length) return;
  const inspector = new BddInspector();
  const reports = await Promise.all(relevant.map((c) => inspector.inspectConfig(c)));
  await writeInspectOutputs(relevant, reports);
}
