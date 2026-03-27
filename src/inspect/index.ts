import {
  Background,
  Feature,
  FeatureChild,
  Pickle,
  PickleStep,
  PickleStepType,
  Rule,
  RuleChild,
  Scenario,
  Step,
} from '@cucumber/messages';
import { BDDConfig } from '../config/types';
import { FeaturesLoader, resolveFeatureFiles } from '../gherkin/featuresLoader';
import { getTagNames } from '../gherkin/helpers';
import { GherkinDocumentWithPickles, PickleWithLocation } from '../gherkin/types';
import { loadSteps, resolveStepFiles } from '../steps/loader';
import { StepDefinition } from '../steps/stepDefinition';
import { StepFinder } from '../steps/finder';
import { stepDefinitions } from '../steps/stepRegistry';
import { toArray } from '../utils';
import { toPosixPath } from '../utils/paths';
import {
  INSPECT_SCHEMA_VERSION,
  InspectConfigReport,
  InspectDiagnostic,
  InspectReport,
  InspectedFeature,
  InspectedScenario,
  InspectedStep,
  InspectedStepDefinition,
  InspectedStepDefinitionRef,
  LocationRef,
} from './types';

type DocumentIndex = {
  stepById: Map<string, Step>;
  scenarioById: Map<string, Scenario>;
  scenarioByExampleRowId: Map<string, Scenario>;
};

export class BddInspector {
  async inspectConfigs(configs: BDDConfig[]): Promise<InspectReport> {
    const reports: InspectConfigReport[] = [];
    for (const config of configs) {
      reports.push(await this.inspectConfig(config));
    }

    return {
      schemaVersion: INSPECT_SCHEMA_VERSION,
      configs: reports,
    };
  }

  async inspectConfig(config: BDDConfig): Promise<InspectConfigReport> {
    const { files: featureFiles, finalPatterns: featureFilePatterns } = await resolveFeatureFiles(
      config.configDir,
      config.features,
    );
    const { files: stepFiles, finalPatterns: stepFilePatterns } = await resolveStepFiles(
      config.configDir,
      config.steps,
    );

    const featuresLoader = new FeaturesLoader();
    await featuresLoader.load(featureFiles, {
      relativeTo: config.configDir,
      defaultDialect: config.language,
    });

    await loadSteps(stepFiles);

    const stepDefinitionsForConfig = this.getStepDefinitionsForFiles(stepFiles);
    const stepFinder = new StepFinder(config);
    const diagnostics: InspectDiagnostic[] = [];

    diagnostics.push(
      ...featuresLoader.parseErrors.map((parseError) => {
        const location = parseError.source.location;
        return {
          kind: 'parse-error' as const,
          message: parseError.message,
          featureUri: parseError.source.uri || '',
          location: location
            ? {
                line: location.line,
                column: location.column || 0,
              }
            : undefined,
        };
      }),
    );

    const featureDocuments = featuresLoader.getDocumentsWithPickles();
    const features = featureDocuments.map((document) => {
      return this.inspectFeature(document, stepFinder, diagnostics);
    });

    return {
      config: {
        configDir: toPosixPath(config.configDir),
        outputDir: toPosixPath(config.outputDir),
        featuresRoot: toPosixPath(config.featuresRoot),
        featuresPatterns: toArray(config.features),
        stepPatterns: toArray(config.steps),
      },
      discovered: {
        featureFiles: featureFiles.map((filePath) => toPosixPath(filePath)),
        stepFiles: stepFiles.map((filePath) => toPosixPath(filePath)),
        featureFilePatterns,
        stepFilePatterns,
      },
      features,
      stepDefinitions: stepDefinitionsForConfig.map((definition) => {
        return this.serializeStepDefinition(definition);
      }),
      diagnostics,
    };
  }

  private inspectFeature(
    document: GherkinDocumentWithPickles,
    stepFinder: StepFinder,
    diagnostics: InspectDiagnostic[],
  ): InspectedFeature {
    const feature = document.feature as Feature;
    const index = this.buildDocumentIndex(feature);

    return {
      uri: document.uri || '',
      name: feature.name,
      language: feature.language || 'en',
      tags: getTagNames(feature.tags),
      location: toLocationRef(feature.location),
      scenarios: document.pickles.map((pickle) => {
        return this.inspectScenario(pickle, document.uri || '', index, stepFinder, diagnostics);
      }),
    };
  }

  private inspectScenario(
    pickle: PickleWithLocation,
    featureUri: string,
    index: DocumentIndex,
    stepFinder: StepFinder,
    diagnostics: InspectDiagnostic[],
  ): InspectedScenario {
    const sourceScenario = this.findSourceScenario(index, pickle);
    const scenarioId = this.buildScenarioId(featureUri, pickle);
    const scenarioName = sourceScenario?.name || pickle.name;

    return {
      id: scenarioId,
      name: pickle.name,
      sourceName: scenarioName,
      tags: getTagNames(pickle.tags),
      location: toLocationRef(pickle.location),
      steps: pickle.steps.map((pickleStep, indexInScenario) => {
        return this.inspectStep({
          featureUri,
          scenarioId,
          scenarioName,
          pickle,
          scenarioLocation: toLocationRef(pickle.location),
          pickleStep,
          indexInScenario,
          index,
          stepFinder,
          diagnostics,
        });
      }),
    };
  }

  private inspectStep(options: {
    featureUri: string;
    scenarioId: string;
    scenarioName: string;
    pickle: PickleWithLocation;
    scenarioLocation: LocationRef;
    pickleStep: PickleStep;
    indexInScenario: number;
    index: DocumentIndex;
    stepFinder: StepFinder;
    diagnostics: InspectDiagnostic[];
  }): InspectedStep {
    const {
      featureUri,
      scenarioId,
      scenarioName,
      pickle,
      scenarioLocation,
      pickleStep,
      indexInScenario,
      index,
      stepFinder,
      diagnostics,
    } = options;

    const sourceStep = this.findSourceStep(index, pickleStep);
    const location = sourceStep?.location ? toLocationRef(sourceStep.location) : scenarioLocation;
    const keyword = sourceStep?.keyword.trim() || '';
    const stepId = this.buildStepId(scenarioId, indexInScenario);
    const matchedDefinitions = stepFinder.findDefinitions(
      pickleStep.type,
      pickleStep.text,
      getTagNames(pickle.tags),
    );
    const matches = matchedDefinitions.map((definition) => {
      return this.serializeStepDefinitionRef(definition.definition);
    });

    let status: 'matched' | 'missing' | 'ambiguous' = 'matched';
    if (matchedDefinitions.length === 0) status = 'missing';
    if (matchedDefinitions.length > 1) status = 'ambiguous';

    if (status === 'missing') {
      diagnostics.push({
        kind: 'missing-step',
        featureUri,
        scenarioId,
        scenarioName,
        stepId,
        stepText: pickleStep.text,
        stepKeyword: keyword,
        location,
      });
    }

    if (status === 'ambiguous') {
      diagnostics.push({
        kind: 'ambiguous-step',
        featureUri,
        scenarioId,
        scenarioName,
        stepId,
        stepText: pickleStep.text,
        stepKeyword: keyword,
        location,
        matches,
      });
    }

    return {
      id: stepId,
      text: pickleStep.text,
      keyword,
      keywordType: mapPickleStepType(pickleStep.type),
      location,
      match: {
        status,
        matches,
      },
    };
  }

  private getStepDefinitionsForFiles(files: string[]) {
    const filesSet = new Set(files.map((filePath) => toPosixPath(filePath)));
    return stepDefinitions.filter((definition) => {
      return filesSet.has(toPosixPath(definition.uri));
    });
  }

  private buildDocumentIndex(feature: Feature): DocumentIndex {
    const stepById = new Map<string, Step>();
    const scenarioById = new Map<string, Scenario>();
    const scenarioByExampleRowId = new Map<string, Scenario>();

    const collectScenario = (scenario: Scenario) => {
      scenarioById.set(scenario.id, scenario);
      scenario.steps.forEach((step) => stepById.set(step.id, step));
      scenario.examples.forEach((examples) => {
        examples.tableBody.forEach((row) => {
          scenarioByExampleRowId.set(row.id, scenario);
        });
      });
    };

    const collectBackground = (background: Background) => {
      background.steps.forEach((step) => stepById.set(step.id, step));
    };

    const collectChildren = (children: readonly (FeatureChild | RuleChild)[]) => {
      children.forEach((child) => {
        if ('scenario' in child && child.scenario) collectScenario(child.scenario);
        if ('background' in child && child.background) collectBackground(child.background);
        if ('rule' in child && child.rule) collectRule(child.rule);
      });
    };

    const collectRule = (rule: Rule) => {
      collectChildren(rule.children);
    };

    collectChildren(feature.children);

    return {
      stepById,
      scenarioById,
      scenarioByExampleRowId,
    };
  }

  private findSourceScenario(index: DocumentIndex, pickle: Pickle) {
    for (const astNodeId of pickle.astNodeIds) {
      const scenario = index.scenarioById.get(astNodeId);
      if (scenario) return scenario;

      const scenarioByExampleRow = index.scenarioByExampleRowId.get(astNodeId);
      if (scenarioByExampleRow) return scenarioByExampleRow;
    }
  }

  private findSourceStep(index: DocumentIndex, pickleStep: PickleStep) {
    for (const astNodeId of pickleStep.astNodeIds) {
      const step = index.stepById.get(astNodeId);
      if (step) return step;
    }
  }

  private buildScenarioId(featureUri: string, pickle: PickleWithLocation) {
    return [featureUri, pickle.location.line, pickle.location.column || 0, pickle.name].join(':');
  }

  private buildStepId(scenarioId: string, stepIndex: number) {
    return `${scenarioId}:step:${stepIndex + 1}`;
  }

  private serializeStepDefinition(definition: StepDefinition): InspectedStepDefinition {
    const base = this.serializeStepDefinitionRef(definition);
    return {
      ...base,
      patternType: typeof definition.pattern === 'string' ? 'string' : 'regexp',
    };
  }

  private serializeStepDefinitionRef(definition: StepDefinition): InspectedStepDefinitionRef {
    return {
      id: buildStepDefinitionId(definition),
      keyword: definition.keyword,
      pattern: definition.patternString,
      location: {
        uri: toPosixPath(definition.uri),
        line: definition.line,
      },
    };
  }
}

function toLocationRef(location: { line: number; column?: number }): LocationRef {
  return {
    line: location.line,
    column: location.column || 0,
  };
}

function buildStepDefinitionId(definition: StepDefinition) {
  return [
    toPosixPath(definition.uri),
    definition.line,
    definition.keyword,
    definition.patternString,
  ].join(':');
}

function mapPickleStepType(type: PickleStepType | undefined) {
  switch (type) {
    case PickleStepType.CONTEXT:
      return 'context';
    case PickleStepType.ACTION:
      return 'action';
    case PickleStepType.OUTCOME:
      return 'outcome';
    default:
      return 'unknown';
  }
}
