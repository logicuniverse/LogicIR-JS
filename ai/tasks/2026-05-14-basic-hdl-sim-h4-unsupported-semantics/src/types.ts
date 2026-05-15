export type { FeatureUse, LogicUnit } from '@logic-universe/logic-ir-core';

export type {
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  FeatureDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

import type {
  ExecutionProfileDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
} from '@logic-universe/logic-ir-architecture';

export type CatalogEntry<T> = {
  namespace: string;
  key: string;
  version?: string;
  definition: T;
};

export type HdlProfileCatalogEntry =
  | CatalogEntry<IRPipelineProfileDefinition>
  | CatalogEntry<ProjectionProfileDefinition>
  | CatalogEntry<ExecutionProfileDefinition>;

export type Diagnostic = {
  code: 'HDL_UNSUPPORTED_REQUIRED_FEATURE';
  severity: 'error';
  feature: string;
  message: string;
};

export type ProjectionResult =
  | {
      kind: 'projected';
      artifactPath: string;
      diagnostics: Diagnostic[];
    }
  | {
      kind: 'rejected';
      diagnostics: Diagnostic[];
    };
