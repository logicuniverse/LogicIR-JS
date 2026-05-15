export type {
  Connection,
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  LUI,
  LUIId,
  LUITarget,
  Port,
  PortKey,
} from '@logic-universe/logic-ir-core';

export type {
  CoreSchemaVersionSelector,
  ExecutionBinding,
  ExecutionProfileDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  ProviderRef,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

import type { LUITarget, PortKey } from '@logic-universe/logic-ir-core';
import type {
  CoreSchemaVersionSelector,
  ExecutionBinding,
  ExecutionProfileDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  ProviderRef,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

export type ExternalTargetIdentity = Omit<
  Extract<LUITarget, { kind: 'external' }>,
  'kind'
>;

export type CatalogEntry<T> = {
  namespace: string;
  key: string;
  version?: string;
  definition: T;
};

export type ProfileCatalogEntry =
  | CatalogEntry<IRPipelineProfileDefinition>
  | CatalogEntry<ProjectionProfileDefinition>
  | CatalogEntry<ExecutionProfileDefinition>;

export type StackCatalogEntry = CatalogEntry<StackDefinition>;

export type ResolvedStack = {
  stackKey: string;
  executionBindings: ExecutionBinding[];
};

export type Diagnostic = {
  code: string;
  message: string;
  subject?: string;
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

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  interpretation: InterpretationMetadata;
  executionKind: 'combinational';
  primaryOutputPort: PortKey;
  inputPorts: PortKey[];
  outputPorts: PortKey[];
  nodes: InterpreterPlanNode[];
  diagnostics: Diagnostic[];
};

export type InterpreterPlanNode = {
  luiId: string;
  target: ExternalTargetIdentity;
  providerKey: string;
  inputMap: Record<PortKey, PortKey>;
  outputMap: Record<PortKey, PortKey>;
};

export type ProviderFunction = (
  inputs: Record<string, unknown>,
) => Record<string, unknown>;

export type ProviderRegistry = Record<string, ProviderFunction>;

export type ExecutionResult = {
  outputs: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export const formatExternalTarget = (target: ExternalTargetIdentity): string =>
  `${target.namespace}/${target.key}${target.version ? `@${target.version}` : ''}`;

export const identityKey = (value: {
  namespace: string;
  key: string;
  version?: string;
}): string =>
  `${value.namespace}/${value.key}${value.version ? `@${value.version}` : ''}`;

export const providerKey = (provider: ProviderRef): string =>
  identityKey(provider);
