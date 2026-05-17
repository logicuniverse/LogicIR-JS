import type {
  CatalogEntry,
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  StackDefinition,
  SoftwareProfileCatalogEntry,
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

export const basicSoftwareIRProfile: CatalogEntry<IRPipelineProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'basic-software-ir',
    version: '0.0.0-s2',
    definition: {
      profileKind: 'ir-pipeline',
      title: 'Basic software IR profile with retained-current',
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
    version: '0.0.0-s2',
    definition: {
      profileKind: 'projection',
      title: 'Project retained-current to interpreter plan',
      input: 'logicir',
      output: 'executable-plan',
      acceptedCoreVersions,
      projectionTarget: {
        namespace: 'logicir.projection-target',
        key: 'software-interpreter-plan',
        version: '0.0.0-s2',
      },
      artifactKinds: ['logicir.interpreter-plan.s2'],
      featureContracts: [],
      stages: [],
      diagnostics,
    },
  };

export const softwareInterpreterExecutionProfile: CatalogEntry<ExecutionProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'software-interpreter-execution',
    version: '0.0.0-s2',
    definition: {
      profileKind: 'execution',
      title: 'Software interpreter execution with state store',
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
  version: '0.0.0-s2',
  definition: {
    title: 'Basic software interpreter stack, S2',
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
