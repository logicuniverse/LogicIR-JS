export type {
  ExtensionRecord,
  FeatureUse,
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

export type HdlSignalPayload = {
  width: number;
  signed: boolean;
};

export type HdlModulePayload = {
  moduleName: string;
};

export type StructuralInstance = {
  module: string;
  instance: string;
  connections: { [portKey: string]: string };
};

export type StructuralWire = {
  name: string;
  signal: HdlSignalPayload;
};

export type StructuralPayload = {
  wires: StructuralWire[];
  instances: StructuralInstance[];
};

export type HdlLibraryModule = {
  moduleName: string;
  ports: {
    [portKey: string]: {
      boundary: 'input' | 'output';
      signal: HdlSignalPayload;
    };
  };
  body: string[];
};

export type BitValue = 0 | 1;

export type HdlTestVector = {
  name: string;
  inputs: { [portKey: string]: BitValue };
  outputs: { [portKey: string]: BitValue };
};

export type HdlEmitOptions = {
  libraryModules: HdlLibraryModule[];
  outputDir?: string;
  testVectors: HdlTestVector[];
};

export type HdlArtifacts = {
  interpretation: InterpretationMetadata;
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
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
