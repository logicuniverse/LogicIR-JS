export type ExtensionRecord = {
  featureKey: string;
  key: string;
  payload: unknown;
};

export type FeatureUse = {
  namespace: string;
  key: string;
  version?: string;
};

export type HdlSignalPayload = {
  width: number;
  signed: boolean;
};

export type HdlModulePayload = {
  moduleName: string;
};

export type Port = {
  boundary: 'input' | 'output';
  interaction: {
    pullReadable: boolean;
    pushNotifiable: boolean;
    retainedCurrent: boolean;
  };
  extensions?: ExtensionRecord[];
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

export type LogicUnit = {
  schemaVersion: '0.0.0-draft';
  features: { [localKey: string]: FeatureUse };
  requirements: { [requirementKey: string]: unknown };
  core: {
    kindOrganization: {
      kind: 'structural';
      exportAnchors: { [anchorKey: string]: { required: boolean } };
      externalOutlets: {
        [outletKey: string]: { shape: 'single'; required: boolean };
      };
      exportAnchorFills: { [anchorKey: string]: unknown };
      luiFills: { [luiId: string]: unknown };
    };
    ports: { [portKey: string]: Port };
    connections: { [connectionId: string]: unknown };
    closures: { [closureId: string]: unknown };
    luis: { [luiId: string]: unknown };
    extensions?: ExtensionRecord[];
  };
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
  modulePath: string;
  testbenchPath: string;
  moduleText: string;
  testbenchText: string;
};
