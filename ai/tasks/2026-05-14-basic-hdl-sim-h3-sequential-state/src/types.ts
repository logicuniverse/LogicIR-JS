export type {
  ExtensionRecord,
  LogicUnit,
  Port,
} from '@logic-universe/logic-ir-core';

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

export type SignalPayload = {
  width: number;
  signed: boolean;
};

export type StatePayload = {
  register: string;
  width: number;
  resetValue: number;
};

export type ClockingPayload = {
  clock: string;
  reset: string;
  resetActive: 'high';
};

export type HdlArtifacts = {
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
};
