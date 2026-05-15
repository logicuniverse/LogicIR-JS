import type {
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  StackDefinition,
} from './types';
import type {
  CatalogEntry,
  ProfileCatalogEntry,
  StackCatalogEntry,
} from './types';

const coreVersions: CoreSchemaVersionSelector = {
  kind: 'one-of',
  versions: ['0.0.0-draft'],
};

export const basicSoftwareIRProfile: CatalogEntry<IRPipelineProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'basic-software-ir',
    version: '0.0.0-s1',
    definition: {
      profileKind: 'ir-pipeline',
      title: 'Basic software IR profile',
      input: 'logicir',
      output: 'logicir',
      acceptedCoreVersions: coreVersions,
      featureContracts: [],
      stages: [],
      diagnostics: {
        unsupportedRequiredContract: 'fail',
        unsupportedFeature: 'fail',
        unsafeFallback: 'fail',
      },
    },
  };

export const toInterpreterPlanProfile: CatalogEntry<ProjectionProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'to-interpreter-plan',
    version: '0.0.0-s1',
    definition: {
      profileKind: 'projection',
      title: 'Project to interpreter plan',
      input: 'logicir',
      output: 'executable-plan',
      acceptedCoreVersions: coreVersions,
      projectionTarget: {
        namespace: 'logicir.projection-target',
        key: 'software-interpreter-plan',
        version: '0.0.0-s1',
      },
      artifactKinds: ['logicir.interpreter-plan.s1'],
      featureContracts: [],
      stages: [],
      diagnostics: {
        unsupportedRequiredContract: 'fail',
        unsupportedFeature: 'fail',
        unsafeFallback: 'fail',
      },
    },
  };

export const softwareInterpreterExecutionProfile: CatalogEntry<ExecutionProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'software-interpreter-execution',
    version: '0.0.0-s1',
    definition: {
      profileKind: 'execution',
      title: 'Software interpreter execution',
      input: 'executable-plan',
      output: 'execution',
      executionTarget: 'interpreter',
      environments: ['js-host'],
      featureContracts: [],
      providerContracts: [],
      bindings: [
        {
          key: 'add-pair-provider',
          subject: {
            kind: 'external-target',
            namespace: 'logicir.examples.math',
            key: 'add-pair',
          },
          provider: {
            namespace: 'logicir.examples.providers',
            key: 'add-pair-function',
            version: '0.0.0-s1',
          },
          contract: {
            namespace: 'logicir.software.provider-contract',
            key: 'external-function',
            version: '0.0.0-s1',
          },
          requirement: 'required',
        },
      ],
      diagnostics: {
        unsupportedRequiredContract: 'fail',
        unsupportedFeature: 'fail',
        unsafeFallback: 'fail',
      },
    },
  };

export const basicSoftwareInterpreterStack: StackCatalogEntry = {
  namespace: 'logicir.stack',
  key: 'basic-software-interpreter',
  version: '0.0.0-s1',
  definition: {
    title: 'Basic software interpreter stack',
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

export const profiles: ProfileCatalogEntry[] = [
  basicSoftwareIRProfile,
  toInterpreterPlanProfile,
  softwareInterpreterExecutionProfile,
];
