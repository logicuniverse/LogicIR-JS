export type {
  Connection,
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  LUI,
  Port,
  PortKey,
} from '@logic-universe/logic-ir-core';

export type {
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  FeatureRef,
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

export type HdlSignalPayload = {
  width: 1;
  signed: false;
};

export type HdlOperationPayload = {
  op: 'and';
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
  note: 'This task-local HDL artifact is review evidence and a runnable baseline, not final schema authority or a mandatory projector algorithm.',
});

export type HdlArtifacts = {
  interpretation: InterpretationMetadata;
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
};
