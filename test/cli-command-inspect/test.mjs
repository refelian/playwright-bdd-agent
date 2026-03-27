import {
  test,
  expect,
  normalize,
  TestDir,
  execPlaywrightTest,
  BDDGEN_CMD,
} from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () => {
  const stdout = execPlaywrightTest(testDir.name, `${BDDGEN_CMD} inspect --json`);
  expect(stdout.trim().startsWith('{')).toEqual(true);

  const report = JSON.parse(stdout);
  expect(report.schemaVersion).toEqual(1);
  expect(report.configs.length).toEqual(1);

  const configReport = report.configs[0];
  expect(configReport.discovered.featureFiles.length).toEqual(2);
  expect(configReport.discovered.stepFiles.length).toEqual(1);
  expect(configReport.stepDefinitions.length).toEqual(4);

  const sampleFeature = configReport.features.find((feature) => {
    return feature.uri === normalize('features/sample.feature');
  });

  expect(sampleFeature).toBeTruthy();
  expect(sampleFeature.scenarios.length).toEqual(3);

  const matchedScenario = sampleFeature.scenarios.find((scenario) => {
    return scenario.name === 'matched scenario';
  });
  expect(matchedScenario.steps[0].match.status).toEqual('matched');
  expect(matchedScenario.steps[1].match.status).toEqual('matched');

  const missingScenario = sampleFeature.scenarios.find((scenario) => {
    return scenario.name === 'missing scenario';
  });
  expect(missingScenario.steps[0].match.status).toEqual('missing');

  const ambiguousScenario = sampleFeature.scenarios.find((scenario) => {
    return scenario.name === 'ambiguous scenario';
  });
  expect(ambiguousScenario.steps[0].match.status).toEqual('ambiguous');
  expect(ambiguousScenario.steps[0].match.matches.length).toEqual(2);

  const diagnosticKinds = configReport.diagnostics.map((diagnostic) => diagnostic.kind).sort();
  expect(diagnosticKinds).toEqual(['ambiguous-step', 'missing-step', 'parse-error']);

  const parseDiagnostic = configReport.diagnostics.find((diagnostic) => {
    return diagnostic.kind === 'parse-error';
  });
  expect(parseDiagnostic.featureUri).toEqual(normalize('features/invalid.feature'));
});
