import type {
  CapabilityDefinition,
  ExecutionProfileDefinition,
  FeatureDefinition,
  IRPipelineProfileDefinition,
  ProfileRef,
  ProjectionProfileDefinition,
  ProviderCapabilityDefinition,
  ProviderContractDefinition,
  StackDefinition,
  ToolCapabilityDefinition,
} from '../../../../../schema/architecture/v0-draft/types';
import { LOGIC_IR_CORE_SCHEMA_VERSION } from '../../../../../schema/core/v0-draft/types';

export const softwareFeature = {
  namespace: 'logicir.software-runtime',
  key: 'basic',
  version: '0.0.0-exploration',
} as const;

export const softwareRuntimeFeature: FeatureDefinition = {
  title: 'Basic Software Runtime',
  description:
    'Portable software runtime semantics extracted from the old JS/TS prototype without embedding JS-specific mechanics in core.',
  extensionPoints: [
    {
      key: 'completion-policy',
      attachment: 'lu-core',
      description:
        'Sequential await policy for core steps. Payload selects before-next-step or detached delivery behavior.',
      payloadSchema: {
        kind: 'inline-json-schema',
        schema: {
          type: 'object',
          required: ['defaultStepCompletion'],
          properties: {
            defaultStepCompletion: {
              enum: ['await-before-next-step', 'detached-delivery'],
            },
            stepOverrides: {
              type: 'object',
              additionalProperties: {
                enum: ['await-before-next-step', 'detached-delivery'],
              },
            },
          },
          additionalProperties: false,
        },
      },
    },
    {
      key: 'provider-contract',
      attachment: 'lui',
      description:
        'External target invocation contract. Payload can name input and output policy without naming JS functions.',
      payloadSchema: {
        kind: 'inline-json-schema',
        schema: {
          type: 'object',
          properties: {
            inputPolicy: { enum: ['pull-current-inputs'] },
            outputPolicy: { enum: ['primary-result', 'push-events'] },
          },
          additionalProperties: false,
        },
      },
    },
    {
      key: 'retained-current-realization',
      attachment: 'port',
      description:
        'Runtime realization note for retained-current ports. Core owns the observable capability; this feature owns the software strategy.',
      payloadSchema: {
        kind: 'inline-json-schema',
        schema: {
          type: 'object',
          required: ['strategy'],
          properties: {
            strategy: {
              enum: ['runtime-store', 'provider-backed', 'adapter-cache'],
            },
          },
          additionalProperties: false,
        },
      },
    },
    {
      key: 'error-policy',
      attachment: 'lu-core',
      description:
        'Software error handling policy for provider failures and execution diagnostics.',
      payloadSchema: {
        kind: 'inline-json-schema',
        schema: {
          type: 'object',
          required: ['unhandledProviderError'],
          properties: {
            unhandledProviderError: { enum: ['return-error', 'throw-host-error'] },
          },
          additionalProperties: false,
        },
      },
    },
  ],
};

export const capabilities = {
  coreValidate: {
    capabilityKind: 'ir-stage',
    title: 'Core validation',
    description: 'Validate current core graph shape before interpretation.',
  },
  runtimeNormalize: {
    capabilityKind: 'ir-stage',
    title: 'Software runtime normalization',
    description:
      'Normalize software-runtime extension defaults before projection or direct execution.',
  },
  interpreterPlan: {
    capabilityKind: 'projection-stage',
    title: 'Interpreter plan projection',
    description:
      'Prepare a LogicIR unit for direct interpretation without changing core semantics.',
  },
  directInterpreter: {
    capabilityKind: 'execution',
    title: 'Direct LogicIR interpreter',
    contracts: [
      {
        namespace: 'logicir.software-runtime',
        key: 'external-provider',
        version: '0.0.0-exploration',
      },
    ],
  },
} satisfies Record<string, CapabilityDefinition>;

export const externalProviderContract: ProviderContractDefinition = {
  title: 'External Target Provider',
  description:
    'Callable provider for current-core external LUI targets. The interface is intentionally data-only and target-neutral.',
  capabilities: [
    {
      namespace: 'logicir.software-runtime',
      key: 'direct-interpreter',
      version: '0.0.0-exploration',
    },
  ],
  bindingSubjects: ['external-target'],
  interfaceSchema: {
    kind: 'inline-json-schema',
    schema: {
      type: 'object',
      required: ['invoke'],
      properties: {
        invoke: {
          description:
            'Runtime-level callable supplied by a host registry, not serialized in architecture data.',
        },
      },
    },
  },
  semanticObligations: [
    'Provider must accept named input results keyed by the LUI port surface.',
    'Provider may complete immediately or by continuation.',
    'Provider must return Result-like data or push events through the runtime channel.',
  ],
};

const basicSoftwareIrProfileRef: ProfileRef = {
  namespace: 'logicir.profile',
  key: 'basic-software-ir',
  version: '0.0.0-exploration',
};

const basicSoftwareProjectionProfileRef: ProfileRef = {
  namespace: 'logicir.profile',
  key: 'basic-software-interpreter-plan',
  version: '0.0.0-exploration',
};

const basicSoftwareExecutionProfileRef: ProfileRef = {
  namespace: 'logicir.profile',
  key: 'basic-software-direct-execution',
  version: '0.0.0-exploration',
};

export const basicSoftwareIrProfile: IRPipelineProfileDefinition = {
  profileKind: 'ir-pipeline',
  title: 'Basic Software IR Pipeline',
  description:
    'Validation and normalization pipeline for direct software interpretation.',
  input: 'logicir',
  output: 'logicir',
  acceptedCoreVersions: {
    kind: 'one-of',
    versions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  },
  featureContracts: [
    {
      feature: softwareFeature,
      requirement: 'required',
      extensionPoints: [
        {
          key: 'completion-policy',
          attachment: 'lu-core',
          requirement: 'recommended',
        },
        {
          key: 'provider-contract',
          attachment: 'lui',
          requirement: 'required',
        },
        {
          key: 'retained-current-realization',
          attachment: 'port',
          requirement: 'conditional-required',
          condition:
            'Required when a port declares interaction.retainedCurrent and the runtime cannot infer a default store strategy.',
        },
        {
          key: 'error-policy',
          attachment: 'lu-core',
          requirement: 'recommended',
        },
      ],
    },
  ],
  diagnostics: {
    unsupportedRequiredContract: 'fail',
    unsupportedFeature: 'fail',
    unsafeFallback: 'fail',
  },
  stages: [
    {
      key: 'core-validate',
      title: 'Core validation',
      capability: {
        namespace: 'logicir.core',
        key: 'core-validate',
        version: '0.0.0-exploration',
      },
      requirement: 'required',
    },
    {
      key: 'runtime-normalize',
      title: 'Software runtime normalize',
      capability: {
        namespace: 'logicir.software-runtime',
        key: 'normalize',
        version: '0.0.0-exploration',
      },
      consumesFeatures: [softwareFeature],
      requirement: 'recommended',
    },
  ],
};

export const basicSoftwareProjectionProfile: ProjectionProfileDefinition = {
  profileKind: 'projection',
  title: 'Basic Software Interpreter Plan Projection',
  description:
    'Projection contract for preparing LogicIR for a direct software interpreter.',
  input: 'logicir',
  output: 'executable-plan',
  acceptedCoreVersions: {
    kind: 'one-of',
    versions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  },
  projectionTarget: {
    namespace: 'logicir.software-runtime',
    key: 'interpreter-plan',
    version: '0.0.0-exploration',
  },
  artifactKinds: ['logicir-interpreter-plan'],
  featureContracts: basicSoftwareIrProfile.featureContracts,
  diagnostics: basicSoftwareIrProfile.diagnostics,
  stages: [
    {
      key: 'prepare-interpreter-plan',
      title: 'Prepare interpreter plan',
      capability: {
        namespace: 'logicir.software-runtime',
        key: 'interpreter-plan',
        version: '0.0.0-exploration',
      },
      consumesFeatures: [softwareFeature],
      requirement: 'required',
    },
  ],
  unsupportedSemantics: {
    structuralComposition: 'warn',
    closureFulfillment: 'requires-feature',
  },
};

export const basicSoftwareExecutionProfile: ExecutionProfileDefinition = {
  profileKind: 'execution',
  title: 'Basic Software Direct Execution',
  description:
    'Direct execution profile for interpreting a current-core LogicUnit with external providers.',
  input: 'logicir',
  output: 'execution',
  acceptedCoreVersions: {
    kind: 'one-of',
    versions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  },
  executionTarget: 'interpreter',
  environments: ['software-host'],
  featureContracts: basicSoftwareIrProfile.featureContracts,
  diagnostics: basicSoftwareIrProfile.diagnostics,
  providerContracts: [
    {
      contract: {
        namespace: 'logicir.software-runtime',
        key: 'external-provider',
        version: '0.0.0-exploration',
      },
      requirement: 'required',
    },
  ],
  bindings: [
    {
      key: 'external-target-providers',
      subject: {
        kind: 'external-target',
        namespace: 'logicir.example',
        key: '*',
      },
      provider: {
        namespace: 'logicir.software-runtime',
        key: 'host-provider-registry',
        version: '0.0.0-exploration',
      },
      contract: {
        namespace: 'logicir.software-runtime',
        key: 'external-provider',
        version: '0.0.0-exploration',
      },
      requirement: 'required',
    },
    {
      key: 'retained-current-store',
      subject: {
        kind: 'named',
        namespace: 'logicir.software-runtime',
        key: 'retained-current-store',
        version: '0.0.0-exploration',
      },
      provider: {
        namespace: 'logicir.software-runtime',
        key: 'in-memory-store',
        version: '0.0.0-exploration',
      },
      requirement: 'required',
    },
  ],
};

export const basicSoftwareStack: StackDefinition = {
  title: 'Basic Software Runtime Stack',
  description:
    'Exploration stack for latest-schema direct software interpretation.',
  profiles: {
    irPipeline: basicSoftwareIrProfileRef,
    projection: basicSoftwareProjectionProfileRef,
    execution: basicSoftwareExecutionProfileRef,
  },
  variants: [
    {
      key: 'direct-logicir',
      title: 'Direct LogicIR execution',
      profileOverrides: {
        projection: basicSoftwareProjectionProfileRef,
        execution: basicSoftwareExecutionProfileRef,
      },
    },
  ],
};

export const hostProviderCapability: ProviderCapabilityDefinition = {
  title: 'Host Provider Registry',
  description:
    'Exploration provider capability for host-supplied external target functions.',
  capabilities: [
    {
      namespace: 'logicir.software-runtime',
      key: 'direct-interpreter',
      version: '0.0.0-exploration',
    },
  ],
  contracts: [
    {
      namespace: 'logicir.software-runtime',
      key: 'external-provider',
      version: '0.0.0-exploration',
    },
  ],
  environments: ['software-host'],
};

export const runtimeToolCapability: ToolCapabilityDefinition = {
  toolKind: 'execution-engine',
  title: 'Latest Schema Software Runtime Draft',
  description:
    'Exploration interpreter that consumes current-core LogicUnits and software-runtime architecture contracts.',
  implementsProfiles: [basicSoftwareExecutionProfileRef],
  acceptedCoreVersions: {
    kind: 'one-of',
    versions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  },
  supportedFeatures: [softwareFeature],
  capabilities: [
    {
      namespace: 'logicir.software-runtime',
      key: 'direct-interpreter',
      version: '0.0.0-exploration',
    },
  ],
  environments: ['software-host'],
};

export const architectureDefinitions = {
  features: [softwareRuntimeFeature],
  capabilities,
  providerContracts: [externalProviderContract],
  providerCapabilities: [hostProviderCapability],
  profiles: [
    basicSoftwareIrProfile,
    basicSoftwareProjectionProfile,
    basicSoftwareExecutionProfile,
  ],
  stacks: [basicSoftwareStack],
  tools: [runtimeToolCapability],
};

