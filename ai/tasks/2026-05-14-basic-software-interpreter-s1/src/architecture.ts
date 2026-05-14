import type {
  CapabilityDefinition,
  CoreSchemaVersionSelector,
  ExecutionProfileDefinition,
  FeatureDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  ProviderContractDefinition,
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

export const softwareInvocationFeature: CatalogEntry<FeatureDefinition> = {
  namespace: 'logicir.software',
  key: 'invocation',
  version: '0.0.0-s1',
  definition: {
    title: 'Software invocation',
    description:
      'Callable provider invocation semantics for a software interpreter plan.',
    extensionPoints: [
      {
        key: 'provider-binding',
        attachment: 'lui',
        title: 'Provider binding hint',
        description:
          'Optional LUI-level hint that an external target is executed through a provider binding.',
        payloadSchema: {
          kind: 'inline-json-schema',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              bindingKey: { type: 'string' },
            },
            required: ['bindingKey'],
          },
        },
      },
    ],
  },
};

export const coreValidateCapability: CatalogEntry<CapabilityDefinition> = {
  namespace: 'logicir.pipeline',
  key: 'core-validate',
  version: '0.0.0-s1',
  definition: {
    capabilityKind: 'ir-stage',
    title: 'Core validation',
  },
};

export const featureManifestResolveCapability: CatalogEntry<CapabilityDefinition> =
  {
    namespace: 'logicir.pipeline',
    key: 'feature-manifest-resolve',
    version: '0.0.0-s1',
    definition: {
      capabilityKind: 'ir-stage',
      title: 'Feature manifest resolve',
    },
  };

export const interpreterPlanCapability: CatalogEntry<CapabilityDefinition> = {
  namespace: 'logicir.projection',
  key: 'interpreter-plan',
  version: '0.0.0-s1',
  definition: {
    capabilityKind: 'projection-stage',
    title: 'Interpreter plan projection',
  },
};

export const softwareExecutionCapability: CatalogEntry<CapabilityDefinition> = {
  namespace: 'logicir.execution',
  key: 'software-interpreter',
  version: '0.0.0-s1',
  definition: {
    capabilityKind: 'execution',
    title: 'Software interpreter execution',
  },
};

export const invocationProviderContract: CatalogEntry<ProviderContractDefinition> =
  {
    namespace: 'logicir.software.provider-contract',
    key: 'invocation-function',
    version: '0.0.0-s1',
    definition: {
      title: 'Invocation function provider',
      capabilities: [
        {
          namespace: softwareExecutionCapability.namespace,
          key: softwareExecutionCapability.key,
          version: softwareExecutionCapability.version,
        },
      ],
      bindingSubjects: ['external-target'],
      semanticObligations: [
        'Provider consumes an input object and returns an output object synchronously for S1.',
      ],
    },
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
      featureContracts: [
        {
          feature: {
            namespace: softwareInvocationFeature.namespace,
            key: softwareInvocationFeature.key,
            version: softwareInvocationFeature.version,
          },
          requirement: 'required',
          extensionPoints: [
            {
              key: 'provider-binding',
              attachment: 'lui',
              requirement: 'optional',
              notes:
                'S1 can resolve the provider through execution binding even when the hint is absent.',
            },
          ],
        },
      ],
      stages: [
        {
          key: 'core-validate',
          capability: {
            namespace: coreValidateCapability.namespace,
            key: coreValidateCapability.key,
            version: coreValidateCapability.version,
          },
          requirement: 'required',
        },
        {
          key: 'resolve-feature-manifest',
          capability: {
            namespace: featureManifestResolveCapability.namespace,
            key: featureManifestResolveCapability.key,
            version: featureManifestResolveCapability.version,
          },
          requirement: 'required',
          consumesFeatures: [
            {
              namespace: softwareInvocationFeature.namespace,
              key: softwareInvocationFeature.key,
              version: softwareInvocationFeature.version,
            },
          ],
        },
      ],
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
      featureContracts: [
        {
          feature: {
            namespace: softwareInvocationFeature.namespace,
            key: softwareInvocationFeature.key,
            version: softwareInvocationFeature.version,
          },
          requirement: 'required',
        },
      ],
      stages: [
        {
          key: 'emit-interpreter-plan',
          capability: {
            namespace: interpreterPlanCapability.namespace,
            key: interpreterPlanCapability.key,
            version: interpreterPlanCapability.version,
          },
          requirement: 'required',
          consumesFeatures: [
            {
              namespace: softwareInvocationFeature.namespace,
              key: softwareInvocationFeature.key,
              version: softwareInvocationFeature.version,
            },
          ],
          produces: 'logicir.interpreter-plan.s1',
        },
      ],
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
      featureContracts: [
        {
          feature: {
            namespace: softwareInvocationFeature.namespace,
            key: softwareInvocationFeature.key,
            version: softwareInvocationFeature.version,
          },
          requirement: 'required',
        },
      ],
      providerContracts: [
        {
          contract: {
            namespace: invocationProviderContract.namespace,
            key: invocationProviderContract.key,
            version: invocationProviderContract.version,
          },
          requirement: 'required',
        },
      ],
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
            namespace: invocationProviderContract.namespace,
            key: invocationProviderContract.key,
            version: invocationProviderContract.version,
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

export const features = [softwareInvocationFeature];
