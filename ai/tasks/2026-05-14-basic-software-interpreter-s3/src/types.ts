export type {
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  Port,
} from '@logic-universe/logic-ir-core';

export type {
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  FeatureDefinition,
  FeatureRef,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

import type {
  ExecutionProfileDefinition,
  FeatureRef,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

export type Diagnostic = {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  subject?: string;
  detail?: Record<string, unknown>;
};

export type InterpretationMetadata = {
  authority: 'sandbox-evidence';
  baselineOnly: true;
  realizationStrategy: string;
  semanticPreservation: string[];
  note: string;
};

export const baselineInterpretation = (
  realizationStrategy: string,
  semanticPreservation: string[],
): InterpretationMetadata => ({
  authority: 'sandbox-evidence',
  baselineOnly: true,
  realizationStrategy,
  semanticPreservation,
  note: 'This task-local plan is review evidence and a runnable baseline, not final schema authority or a mandatory engine algorithm.',
});

export type CatalogEntry<T> = {
  namespace: string;
  key: string;
  version?: string;
  definition: T;
};

export type SoftwareProfileCatalogEntry =
  | CatalogEntry<IRPipelineProfileDefinition>
  | CatalogEntry<ProjectionProfileDefinition>
  | CatalogEntry<ExecutionProfileDefinition>;

export type ResolvedStack = {
  stackKey: string;
  requiredFeatures: FeatureRef[];
};

export type CompletionPolicy = {
  kind: 'await-provider';
  rejectMode: 'diagnostic';
};

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  interpretation: InterpretationMetadata;
  completion: CompletionPolicy;
  node: {
    luiId: string;
    providerKey: string;
    inputMap: Record<string, string>;
    outputMap: Record<string, string>;
  };
  diagnostics: Diagnostic[];
};

export type ProviderOutput = Record<string, unknown>;
export type AsyncProviderFunction = (
  inputs: Record<string, unknown>,
) => ProviderOutput | Promise<ProviderOutput>;

export type AsyncProviderRegistry = Record<string, AsyncProviderFunction>;

export type ExecutionResult = {
  status: 'ok' | 'error';
  outputs: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export const identityKey = (value: FeatureRef): string =>
  `${value.namespace}/${value.key}${value.version ? `@${value.version}` : ''}`;

export type StackCatalogEntry = CatalogEntry<StackDefinition>;
