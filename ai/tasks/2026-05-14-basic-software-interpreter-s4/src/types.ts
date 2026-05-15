export type {
  LogicUnit,
  Port,
  RequirementServiceFulfillment,
  UnitFulfillment,
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

import type { UnitFulfillment } from '@logic-universe/logic-ir-core';
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

export type FulfillmentPlanNode = {
  luiId: string;
  serviceKey: string;
  unitKey: string;
  fulfillment: UnitFulfillment;
  inputMap: Record<string, string>;
  outputMap: Record<string, string>;
};

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  interpretation: InterpretationMetadata;
  nodes: FulfillmentPlanNode[];
  diagnostics: Diagnostic[];
};

export type RequirementProvider = (
  serviceKey: string,
  unitKey: string,
  inputs: Record<string, unknown>,
) => Record<string, unknown> | undefined;

export type ClosureProvider = (
  inputs: Record<string, unknown>,
) => Record<string, unknown>;

export type ClosureProviderRegistry = Record<string, ClosureProvider>;

export type ExecutionResult = {
  status: 'ok' | 'error';
  outputs: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export const identityKey = (value: FeatureRef): string =>
  `${value.namespace}/${value.key}${value.version ? `@${value.version}` : ''}`;

export type StackCatalogEntry = CatalogEntry<StackDefinition>;
