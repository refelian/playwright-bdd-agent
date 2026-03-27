export const INSPECT_SCHEMA_VERSION = 1 as const;

export type InspectReport = {
  schemaVersion: typeof INSPECT_SCHEMA_VERSION;
  configs: InspectConfigReport[];
};

export type InspectConfigReport = {
  config: {
    configDir: string;
    outputDir: string;
    featuresRoot: string;
    featuresPatterns: string[];
    stepPatterns: string[];
  };
  discovered: {
    featureFiles: string[];
    stepFiles: string[];
    featureFilePatterns: string[];
    stepFilePatterns: string[];
  };
  features: InspectedFeature[];
  stepDefinitions: InspectedStepDefinition[];
  diagnostics: InspectDiagnostic[];
};

export type LocationRef = {
  line: number;
  column: number;
};

export type InspectedFeature = {
  uri: string;
  name: string;
  language: string;
  tags: string[];
  location: LocationRef;
  scenarios: InspectedScenario[];
};

export type InspectedScenario = {
  id: string;
  name: string;
  sourceName: string;
  tags: string[];
  location: LocationRef;
  steps: InspectedStep[];
};

export type InspectedStep = {
  id: string;
  text: string;
  keyword: string;
  keywordType: 'unknown' | 'context' | 'action' | 'outcome';
  location: LocationRef;
  match: {
    status: 'matched' | 'missing' | 'ambiguous';
    matches: InspectedStepDefinitionRef[];
  };
};

export type InspectedStepDefinition = InspectedStepDefinitionRef & {
  patternType: 'string' | 'regexp';
};

export type InspectedStepDefinitionRef = {
  id: string;
  keyword: string;
  pattern: string;
  location: {
    uri: string;
    line: number;
  };
};

export type ParseErrorDiagnostic = {
  kind: 'parse-error';
  message: string;
  featureUri: string;
  location?: LocationRef;
};

export type MissingStepDiagnostic = {
  kind: 'missing-step';
  featureUri: string;
  scenarioId: string;
  scenarioName: string;
  stepId: string;
  stepText: string;
  stepKeyword: string;
  location: LocationRef;
};

export type AmbiguousStepDiagnostic = {
  kind: 'ambiguous-step';
  featureUri: string;
  scenarioId: string;
  scenarioName: string;
  stepId: string;
  stepText: string;
  stepKeyword: string;
  location: LocationRef;
  matches: InspectedStepDefinitionRef[];
};

export type InspectDiagnostic =
  | ParseErrorDiagnostic
  | MissingStepDiagnostic
  | AmbiguousStepDiagnostic;
