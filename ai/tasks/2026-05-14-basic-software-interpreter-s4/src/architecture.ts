import type {
  CatalogEntry,
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  FeatureDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  SoftwareProfileCatalogEntry,
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

export const fulfillmentFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.software',
  key: 'fulfillment',
  version: '0.0.0-s4',
  definition: {
    title: 'Software fulfillment',
    description:
      'Provider and closure fulfillment shape for requirement-backed LUI execution.',
    extensionPoints: [
      {
        key: 'closure-fulfillment',
        attachment: 'unit-fulfillment',
      },
      {
        key: 'upstream-provider-fulfillment',
        attachment: 'unit-fulfillment',
      },
    ],
  },
};

export const basicSoftwareIRProfile: CatalogEntry<IRPipelineProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'basic-software-ir',
    version: '0.0.0-s4',
    definition: {
      profileKind: 'ir-pipeline',
      title: 'Basic software IR with fulfillment',
      input: 'logicir',
      output: 'logicir',
      acceptedCoreVersions,
      featureContracts: [],
      stages: [],
      diagnostics,
    },
  };

export const toInterpreterPlanProfile: CatalogEntry<ProjectionProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'to-interpreter-plan',
    version: '0.0.0-s4',
    definition: {
      profileKind: 'projection',
      title: 'Interpreter plan with fulfillment',
      input: 'logicir',
      output: 'executable-plan',
      acceptedCoreVersions,
      projectionTarget: {
        namespace: 'logicir.projection-target',
        key: 'software-interpreter-plan',
        version: '0.0.0-s4',
      },
      artifactKinds: ['logicir.interpreter-plan.s4'],
      featureContracts: [
        {
          feature: {
            namespace: fulfillmentFeature.namespace,
            key: fulfillmentFeature.key,
            version: fulfillmentFeature.version,
          },
          requirement: 'required',
        },
      ],
      stages: [],
      diagnostics,
    },
  };

export const softwareInterpreterExecutionProfile: CatalogEntry<ExecutionProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'software-interpreter-execution',
    version: '0.0.0-s4',
    definition: {
      profileKind: 'execution',
      title: 'Software execution with closure/upstream fulfillment',
      input: 'executable-plan',
      output: 'execution',
      executionTarget: 'interpreter',
      environments: ['js-host'],
      featureContracts: [],
      providerContracts: [],
      bindings: [],
      diagnostics,
    },
  };

export const basicSoftwareInterpreterStack: CatalogEntry<StackDefinition> = {
  namespace: 'logicir.stack',
  key: 'basic-software-interpreter',
  version: '0.0.0-s4',
  definition: {
    title: 'Basic software interpreter stack, S4',
    profiles: {
      irPipeline: {
        namespace: basicSoftwareIRProfile.namespace,
        key: basicSoftwareIRProfile.key,
        version: basicSoftwareIRProfile.version,
      },
      projection: {
        namespace: toInterpreterPlanProfile.namespace,
        key: toInterpreterPlanProfile.key,
        version: toInterpreterPlanProfile.version,
      },
      execution: {
        namespace: softwareInterpreterExecutionProfile.namespace,
        key: softwareInterpreterExecutionProfile.key,
        version: softwareInterpreterExecutionProfile.version,
      },
    },
  },
};

export const profiles: SoftwareProfileCatalogEntry[] = [
  basicSoftwareIRProfile,
  toInterpreterPlanProfile,
  softwareInterpreterExecutionProfile,
];
