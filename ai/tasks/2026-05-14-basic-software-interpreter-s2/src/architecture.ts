import type {
  CatalogEntry,
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  FeatureDefinition,
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

export const retainedCurrentFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.software',
  key: 'retained-current',
  version: '0.0.0-s2',
  definition: {
    title: 'Software retained current',
    description:
      'Retained-current state surface with explicit state-store contract linkage.',
    extensionPoints: [
      {
        key: 'state-key',
        attachment: 'port',
        payloadSchema: {
          kind: 'inline-json-schema',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: { storeKey: { type: 'string' } },
            required: ['storeKey'],
          },
        },
      },
      {
        key: 'state-operation',
        attachment: 'lui',
        payloadSchema: {
          kind: 'inline-json-schema',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              kind: { enum: ['read-current', 'write-current'] },
              storeKey: { type: 'string' },
            },
            required: ['kind', 'storeKey'],
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
    version: '0.0.0-s2',
    definition: {
      profileKind: 'ir-pipeline',
      title: 'Basic software IR profile with retained-current',
      input: 'logicir',
      output: 'logicir',
      acceptedCoreVersions,
      featureContracts: [
        {
          feature: {
            namespace: retainedCurrentFeature.namespace,
            key: retainedCurrentFeature.key,
            version: retainedCurrentFeature.version,
          },
          requirement: 'required',
        },
      ],
      stages: [
        {
          key: 'core-validate',
          requirement: 'required',
          capability: { namespace: 'logicir.pipeline', key: 'core-validate' },
        },
        {
          key: 'resolve-retained-current',
          requirement: 'required',
          capability: {
            namespace: 'logicir.pipeline',
            key: 'retained-current-resolve',
          },
        },
      ],
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
      featureContracts: [
        {
          feature: {
            namespace: retainedCurrentFeature.namespace,
            key: retainedCurrentFeature.key,
            version: retainedCurrentFeature.version,
          },
          requirement: 'required',
        },
      ],
      stages: [
        {
          key: 'emit-retained-current-plan',
          requirement: 'required',
          capability: {
            namespace: 'logicir.projection',
            key: 'interpreter-plan',
          },
          produces: 'logicir.interpreter-plan.s2',
        },
      ],
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
      featureContracts: [
        {
          feature: {
            namespace: retainedCurrentFeature.namespace,
            key: retainedCurrentFeature.key,
            version: retainedCurrentFeature.version,
          },
          requirement: 'required',
        },
      ],
      providerContracts: [
        {
          contract: {
            namespace: 'logicir.software.provider-contract',
            key: 'state-store',
            version: '0.0.0-s2',
          },
          requirement: 'required',
        },
      ],
      bindings: [
        {
          key: 'counter-state-store',
          subject: {
            kind: 'named',
            namespace: 'logicir.software.state',
            key: 'counter',
          },
          provider: {
            namespace: 'logicir.examples.providers',
            key: 'memory-state-store',
            version: '0.0.0-s2',
          },
          requirement: 'required',
        },
      ],
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
