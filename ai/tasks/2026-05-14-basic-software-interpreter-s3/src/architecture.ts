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

export const completionFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.software',
  key: 'completion',
  version: '0.0.0-s3',
  definition: {
    title: 'Software completion',
    description:
      'Completion, failure, and thenable-compatible await semantics for software execution.',
    extensionPoints: [
      {
        key: 'completion-policy',
        attachment: 'lui',
        payloadSchema: {
          kind: 'inline-json-schema',
          schema: {
            type: 'object',
            properties: {
              kind: { enum: ['await-provider'] },
              rejectMode: { enum: ['diagnostic'] },
            },
            required: ['kind', 'rejectMode'],
          },
        },
      },
    ],
  },
};

export const basicSoftwareIRProfile: CatalogEntry<IRPipelineProfileDefinition> =
  {
    namespace: 'logicir.profile',
    key: 'basic-software-ir',
    version: '0.0.0-s3',
    definition: {
      profileKind: 'ir-pipeline',
      title: 'Basic software IR with completion',
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
    version: '0.0.0-s3',
    definition: {
      profileKind: 'projection',
      title: 'Interpreter plan with completion policy',
      input: 'logicir',
      output: 'executable-plan',
      acceptedCoreVersions,
      projectionTarget: {
        namespace: 'logicir.projection-target',
        key: 'software-interpreter-plan',
        version: '0.0.0-s3',
      },
      artifactKinds: ['logicir.interpreter-plan.s3'],
      featureContracts: [
        {
          feature: {
            namespace: completionFeature.namespace,
            key: completionFeature.key,
            version: completionFeature.version,
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
    version: '0.0.0-s3',
    definition: {
      profileKind: 'execution',
      title: 'Software execution with awaited provider completion',
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
  version: '0.0.0-s3',
  definition: {
    title: 'Basic software interpreter stack, S3',
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
