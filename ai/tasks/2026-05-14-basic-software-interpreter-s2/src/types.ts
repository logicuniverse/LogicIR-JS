export type {
  Connection,
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  LUI,
  LUITarget,
  Port,
  PortKey,
} from '@logic-universe/logic-ir-core';

export type {
  BindingRequirementLevel,
  CoreSchemaVersionSelector,
  ExecutionBinding,
  ExecutionProfileDefinition,
  FeatureDefinition,
  FeatureRef,
  IRPipelineProfileDefinition,
  ProfileDefinition,
  ProfileFeatureContract,
  ProjectionProfileDefinition,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

import type {
  ExecutionBinding,
  ExecutionProfileDefinition,
  FeatureRef,
  IRPipelineProfileDefinition,
  ProfileDefinition,
  ProfileFeatureContract,
  ProjectionProfileDefinition,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

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
  profiles: ProfileDefinition[];
  requiredFeatures: ProfileFeatureContract[];
  executionBindings: ExecutionBinding[];
};

export type Diagnostic = {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
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

export type RetainedCurrentOperation =
  | {
      kind: 'read-current';
      storeKey: string;
      outputPort: string;
    }
  | {
      kind: 'write-current';
      storeKey: string;
      inputPort: string;
      outputPort: string;
    };

export type InterpreterPlan = {
  key: string;
  stackKey: string;
  interpretation: InterpretationMetadata;
  operations: RetainedCurrentOperation[];
  diagnostics: Diagnostic[];
};

export type StateStoreProvider = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  snapshot: () => Record<string, unknown>;
};

export type ExecutionResult = {
  outputs: Record<string, unknown>;
  state: Record<string, unknown>;
  diagnostics: Diagnostic[];
};

export const identityKey = (value: FeatureRef): string =>
  `${value.namespace}/${value.key}${value.version ? `@${value.version}` : ''}`;

export type StackCatalogEntry = CatalogEntry<StackDefinition>;
