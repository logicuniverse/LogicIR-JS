import type {
  CatalogEntry,
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  FeatureDefinition,
  HdlProfileCatalogEntry,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  StackDefinition,
} from './types';

const diagnostics = {
  unsupportedRequiredContract: 'fail',
  unsupportedFeature: 'fail',
  unsafeFallback: 'fail',
} as const;

const acceptedCoreVersions: CoreSchemaVersionSelector = {
  kind: 'one-of',
  versions: ['0.0.0-draft'],
};

export const signalFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.hdl',
  key: 'signal',
  version: '0.0.0-h3',
  definition: {
    title: 'HDL signal',
    extensionPoints: [
      {
        key: 'signal',
        attachment: 'port',
      },
    ],
  },
};

export const clockingFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.hdl',
  key: 'clocking',
  version: '0.0.0-h3',
  definition: {
    title: 'HDL clock/reset',
    extensionPoints: [
      {
        key: 'clock-reset',
        attachment: 'lu-core',
      },
      {
        key: 'clock-reset',
        attachment: 'lui',
      },
    ],
  },
};

export const stateFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.hdl',
  key: 'state',
  version: '0.0.0-h3',
  definition: {
    title: 'HDL register state',
    extensionPoints: [
      {
        key: 'register',
        attachment: 'lui',
      },
    ],
  },
};

export const basicHdlIRProfile: CatalogEntry<IRPipelineProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'basic-hdl-ir',
  version: '0.0.0-h3',
  definition: {
    profileKind: 'ir-pipeline',
    title: 'Basic HDL IR profile, H3',
    input: 'logicir',
    output: 'logicir',
    acceptedCoreVersions,
    featureContracts: [
      {
        feature: {
          namespace: signalFeature.namespace,
          key: signalFeature.key,
          version: signalFeature.version,
        },
        requirement: 'required',
      },
      {
        feature: {
          namespace: clockingFeature.namespace,
          key: clockingFeature.key,
          version: clockingFeature.version,
        },
        requirement: 'conditional-required',
      },
      {
        feature: {
          namespace: stateFeature.namespace,
          key: stateFeature.key,
          version: stateFeature.version,
        },
        requirement: 'conditional-required',
      },
    ],
    stages: [
      {
        key: 'core-validate',
        capability: { namespace: 'logicir.pipeline', key: 'core-validate' },
        requirement: 'required',
      },
    ],
    diagnostics,
  },
};

export const toVerilogProfile: CatalogEntry<ProjectionProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'to-verilog-hdl',
  version: '0.0.0-h3',
  definition: {
    profileKind: 'projection',
    title: 'Project H3 LogicIR to Verilog HDL',
    input: 'logicir',
    output: 'artifact',
    acceptedCoreVersions,
    projectionTarget: {
      namespace: 'logicir.projection-target',
      key: 'verilog-hdl',
      version: '0.0.0-h3',
    },
    artifactKinds: ['verilog-source', 'verilog-testbench'],
    featureContracts: basicHdlIRProfile.definition.featureContracts,
    stages: [
      {
        key: 'emit-sequential-verilog-module',
        capability: { namespace: 'logicir.projection', key: 'verilog-module' },
        requirement: 'required',
      },
    ],
    diagnostics,
  },
};

export const verilogSimExecutionProfile: CatalogEntry<ExecutionProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'verilog-sim-execution',
    version: '0.0.0-h3',
    definition: {
      profileKind: 'execution',
      title: 'Icarus Verilog simulation',
      input: 'artifact',
      output: 'execution',
      executionTarget: 'verilog-simulator',
      environments: ['iverilog'],
      featureContracts: [],
      providerContracts: [],
      bindings: [],
      diagnostics,
    },
  };

export const basicHdlSimStack: CatalogEntry<StackDefinition> = {
  namespace: 'logicir.stack',
  key: 'basic-hdl-sim',
  version: '0.0.0-h3',
  definition: {
    title: 'Basic HDL simulation stack, H3',
    profiles: {
      irPipeline: {
        namespace: basicHdlIRProfile.namespace,
        key: basicHdlIRProfile.key,
        version: basicHdlIRProfile.version,
      },
      projection: {
        namespace: toVerilogProfile.namespace,
        key: toVerilogProfile.key,
        version: toVerilogProfile.version,
      },
      execution: {
        namespace: verilogSimExecutionProfile.namespace,
        key: verilogSimExecutionProfile.key,
        version: verilogSimExecutionProfile.version,
      },
    },
  },
};

export const profiles: HdlProfileCatalogEntry[] = [
  basicHdlIRProfile,
  toVerilogProfile,
  verilogSimExecutionProfile,
];
