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
  version: '0.0.0-h5',
  definition: {
    title: 'HDL signal',
    extensionPoints: [{ key: 'signal', attachment: 'port' }],
  },
};

export const moduleFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.hdl',
  key: 'module',
  version: '0.0.0-h5',
  definition: {
    title: 'HDL module identity',
    extensionPoints: [{ key: 'module', attachment: 'lu-core' }],
  },
};

export const structuralSlicesFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.hdl',
  key: 'structural-slices',
  version: '0.0.0-h5',
  definition: {
    title: 'HDL structural module composition',
    extensionPoints: [{ key: 'module-structure', attachment: 'lu-core' }],
  },
};

export const basicHdlIRProfile: CatalogEntry<IRPipelineProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'basic-hdl-ir',
  version: '0.0.0-h5',
  definition: {
    profileKind: 'ir-pipeline',
    title: 'Basic HDL IR profile, H5',
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
          namespace: moduleFeature.namespace,
          key: moduleFeature.key,
          version: moduleFeature.version,
        },
        requirement: 'required',
      },
      {
        feature: {
          namespace: structuralSlicesFeature.namespace,
          key: structuralSlicesFeature.key,
          version: structuralSlicesFeature.version,
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
  version: '0.0.0-h5',
  definition: {
    profileKind: 'projection',
    title: 'Project structural LogicIR to Verilog HDL',
    input: 'logicir',
    output: 'artifact',
    acceptedCoreVersions,
    projectionTarget: {
      namespace: 'logicir.projection-target',
      key: 'verilog-hdl',
      version: '0.0.0-h5',
    },
    artifactKinds: ['verilog-source', 'verilog-testbench'],
    featureContracts: basicHdlIRProfile.definition.featureContracts,
    stages: [
      {
        key: 'emit-structural-verilog-modules',
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
    version: '0.0.0-h5',
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
  version: '0.0.0-h5',
  definition: {
    title: 'Basic HDL simulation stack, H5',
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
