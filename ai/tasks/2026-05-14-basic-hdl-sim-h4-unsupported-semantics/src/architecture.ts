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

export const unsupportedSemanticsFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.diagnostics',
  key: 'unsupported-semantics',
  version: '0.0.0-h4',
  definition: {
    title: 'Unsupported HDL semantics diagnostics',
    extensionPoints: [],
  },
};

export const basicHdlIRProfile: CatalogEntry<IRPipelineProfileDefinition> = {
  namespace: 'logicir.profile',
  key: 'basic-hdl-ir',
  version: '0.0.0-h4',
  definition: {
    profileKind: 'ir-pipeline',
    title: 'Basic HDL IR profile, H4',
    input: 'logicir',
    output: 'logicir',
    acceptedCoreVersions,
    featureContracts: [
      {
        feature: {
          namespace: unsupportedSemanticsFeature.namespace,
          key: unsupportedSemanticsFeature.key,
          version: unsupportedSemanticsFeature.version,
        },
        requirement: 'required',
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
  version: '0.0.0-h4',
  definition: {
    profileKind: 'projection',
    title: 'Reject unsupported required HDL semantics',
    input: 'logicir',
    output: 'artifact',
    acceptedCoreVersions,
    projectionTarget: {
      namespace: 'logicir.projection-target',
      key: 'verilog-hdl',
      version: '0.0.0-h4',
    },
    artifactKinds: ['verilog-source'],
    featureContracts: basicHdlIRProfile.definition.featureContracts,
    stages: [
      {
        key: 'reject-unsupported-semantics',
        capability: {
          namespace: 'logicir.projection',
          key: 'unsupported-semantics-diagnostic',
        },
        requirement: 'required',
      },
    ],
    unsupportedSemantics: {
      softwareInvocation: 'fail',
    },
    diagnostics,
  },
};

export const verilogSimExecutionProfile: CatalogEntry<ExecutionProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'verilog-sim-execution',
    version: '0.0.0-h4',
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
  version: '0.0.0-h4',
  definition: {
    title: 'Basic HDL simulation stack, H4',
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

export const supportedRequiredFeatures = [
  'logicir.hdl/signal',
  'logicir.hdl/module',
  'logicir.hdl/combinational',
  'logicir.hdl/clocking',
  'logicir.hdl/state',
  'logicir.hdl/elaboration',
  'logicir.diagnostics/unsupported-semantics',
] as const;
