import { LOGIC_IR_CORE_SCHEMA_VERSION } from '../../../../../schema/core/v0-draft/types';
import type {
  ExecutionProfile,
  IRPipelineProfile,
  ProjectionProfile,
  StackDefinition,
} from './architecture-types';
import { provider, requiredDiagnosticPolicy } from './architecture-types';
import {
  coreValidationFeature,
  softwareCompletionFeature,
  softwareErrorFeature,
  softwareFulfillmentFeature,
  softwareInvocationFeature,
  softwareLifecycleFeature,
  softwareObservationFeature,
  softwareRetainedCurrentFeature,
  softwareValueFeature,
  typeSystemFeature,
} from './features';

export const basicSoftwareIRProfile: IRPipelineProfile = {
  id: 'logicir.profile.basic-software-ir',
  kind: 'ir-pipeline',
  title: 'Basic Software IR Pipeline',
  status: 'exploration',
  description:
    'Validates and normalizes LogicIR for language-neutral software realization.',
  input: 'logicir',
  output: 'logicir',
  acceptedCoreVersions: [LOGIC_IR_CORE_SCHEMA_VERSION],
  features: [
    {
      feature: coreValidationFeature,
      requirement: 'required',
      extensionKeys: [],
      notes: 'Capability marker for core validation support.',
    },
    {
      feature: typeSystemFeature,
      requirement: 'recommended',
      extensionKeys: [
        'type-definitions',
        'payload-types',
        'path-schema',
        'port-compatibility',
        'requirement-compatibility',
        'composition-compatibility',
      ],
      notes:
        'Recommended for pre-runtime compatibility checks; may be consumed by the IR pipeline.',
    },
  ],
  stages: [
    {
      id: 'core-validate',
      capability: 'logicir.capability.core-validate.v0',
      requirement: 'required',
      consumesFeatures: [coreValidationFeature],
      produces: 'validated core topology',
    },
    {
      id: 'resolve-target-contracts',
      capability: 'logicir.capability.resolve-target-contracts',
      requirement: 'required',
      produces: 'resolved LU/external/requirement LUI contracts',
    },
    {
      id: 'resolve-requirement-contracts',
      capability: 'logicir.capability.resolve-requirement-contracts',
      requirement: 'required',
      produces: 'resolved requirement service contracts',
    },
    {
      id: 'check-extension-capabilities',
      capability: 'logicir.capability.check-extension-capabilities',
      requirement: 'required',
      produces: 'required extension coverage diagnostics',
    },
    {
      id: 'normalize-surfaces',
      capability: 'logicir.capability.normalize-surfaces',
      requirement: 'required',
      produces: 'normalized port/composition surfaces',
    },
    {
      id: 'validate-fulfillment',
      capability: 'logicir.capability.validate-fulfillment',
      requirement: 'required',
      produces: 'validated closure/upstream fulfillment graph',
    },
    {
      id: 'validate-composition',
      capability: 'logicir.capability.validate-composition',
      requirement: 'required',
      produces: 'validated structural anchors/outlets/fills',
    },
    {
      id: 'type-check',
      capability: 'logicir.capability.type-system.core',
      requirement: 'recommended',
      consumesFeatures: [typeSystemFeature],
      produces: 'payload/path/requirement/composition compatibility evidence',
    },
    {
      id: 'adapter-insertion',
      capability: 'logicir.capability.adapter-insertion',
      requirement: 'optional',
      consumesFeatures: [typeSystemFeature],
      produces: 'explicit adapter LUIs when required',
    },
  ],
  stripPolicy: {
    authoringData: 'profile-defined',
    consumedTypeData: 'profile-defined',
  },
  diagnostics: requiredDiagnosticPolicy,
};

export const basicSoftwareProjectionProfile: ProjectionProfile = {
  id: 'logicir.profile.basic-software-plan',
  kind: 'projection',
  title: 'Basic Software Executable Plan Projection',
  status: 'exploration',
  description:
    'Projects validated LogicIR into a target-neutral software executable plan. Direct interpreters may treat the plan as a thin wrapper around LogicIR plus resolved contracts.',
  input: 'logicir',
  output: 'executable-plan',
  projectionTarget: 'basic-software-plan',
  artifactKinds: [
    'interpreter-ready-plan',
    'generated-code-plan',
    'diagnostics-report',
  ],
  features: [
    {
      feature: softwareInvocationFeature,
      requirement: 'required',
      extensionKeys: [
        'call-contract',
        'input-read-policy',
        'push-delivery-policy',
        'packet-path-policy',
      ],
    },
    {
      feature: softwareCompletionFeature,
      requirement: 'required',
      extensionKeys: [
        'completion-contract',
        'step-await-policy',
        'completion-error-policy',
      ],
    },
    {
      feature: softwareRetainedCurrentFeature,
      requirement: 'required',
      extensionKeys: [
        'retained-current-realization',
        'state-backing',
        'latest-value-cache',
      ],
    },
    {
      feature: softwareFulfillmentFeature,
      requirement: 'required',
      extensionKeys: [
        'provider-binding-policy',
        'dynamic-fulfillment',
        'late-bound-provider',
        'switching-policy',
      ],
      notes: 'Static-at-startup is the baseline supported subset.',
    },
    {
      feature: softwareValueFeature,
      requirement: 'recommended',
      extensionKeys: ['literal-values', 'default-inputs', 'initial-values'],
    },
    {
      feature: softwareErrorFeature,
      requirement: 'recommended',
      extensionKeys: ['error-policy', 'error-port', 'error-channel'],
    },
    {
      feature: softwareLifecycleFeature,
      requirement: 'optional',
      extensionKeys: ['resource-lifecycle', 'start-stop', 'dispose'],
    },
  ],
  stages: [
    {
      id: 'collect-execution-units',
      capability: 'logicir.capability.software.collect-execution-units',
      requirement: 'required',
      produces: 'unit invocation plan',
    },
    {
      id: 'plan-provider-calls',
      capability: 'logicir.capability.software.plan-provider-calls',
      requirement: 'required',
      consumesFeatures: [softwareInvocationFeature],
    },
    {
      id: 'plan-port-routing',
      capability: 'logicir.capability.software.plan-port-routing',
      requirement: 'required',
      consumesFeatures: [softwareInvocationFeature],
      produces: 'pull/push/payloadPath routing plan',
    },
    {
      id: 'plan-retained-current',
      capability: 'logicir.capability.software.plan-retained-current',
      requirement: 'required',
      consumesFeatures: [softwareRetainedCurrentFeature],
      produces: 'state/cache/provider retained-current plan',
    },
    {
      id: 'plan-sequential-completion',
      capability: 'logicir.capability.software.plan-sequential-completion',
      requirement: 'required',
      consumesFeatures: [softwareCompletionFeature],
      produces: 'ordered immediate/continuation completion plan',
    },
    {
      id: 'plan-fulfillment-bindings',
      capability: 'logicir.capability.software.plan-fulfillment-bindings',
      requirement: 'required',
      consumesFeatures: [softwareFulfillmentFeature],
      produces: 'provider binding plan',
    },
    {
      id: 'emit-executable-plan',
      capability: 'logicir.capability.software.emit-executable-plan',
      requirement: 'required',
      produces: 'basic software executable plan',
    },
  ],
  unsupportedSemantics: {
    'live-provider-switching-without-feature': 'fail',
    'reentrant-push-ordering-without-policy': 'fail',
    'host-exception-semantics-without-error-policy': 'fail',
    'untyped-unsafe-adapter': 'requires-feature',
  },
  diagnostics: requiredDiagnosticPolicy,
};

export const basicSoftwareExecutionProfile: ExecutionProfile = {
  id: 'logicir.profile.basic-software-execution',
  kind: 'execution',
  title: 'Basic Software Execution',
  status: 'exploration',
  description:
    'Executes LogicIR or a basic software executable plan using environment-bound providers.',
  input: 'executable-plan',
  output: 'execution',
  target: 'interpreter',
  environments: [
    'node-process',
    'browser-runtime',
    'python-process',
    'native-host-process',
    'cloud-worker',
  ],
  features: [
    {
      feature: softwareInvocationFeature,
      requirement: 'required',
      extensionKeys: [
        'call-contract',
        'input-read-policy',
        'push-delivery-policy',
      ],
    },
    {
      feature: softwareCompletionFeature,
      requirement: 'required',
      extensionKeys: ['completion-contract', 'step-await-policy'],
    },
    {
      feature: softwareRetainedCurrentFeature,
      requirement: 'required',
      extensionKeys: ['retained-current-realization', 'state-backing'],
    },
    {
      feature: softwareFulfillmentFeature,
      requirement: 'required',
      extensionKeys: ['provider-binding-policy'],
    },
    {
      feature: softwareObservationFeature,
      requirement: 'optional',
      extensionKeys: ['trace-events', 'runtime-hooks', 'override-policy'],
    },
  ],
  providerContracts: [
    {
      id: 'software-unit-provider',
      title: 'Software unit provider',
      requirement: 'required',
      capabilities: [
        'logicir.capability.provider.invoke-unit',
        'logicir.capability.provider.emit',
        'logicir.capability.provider.subscribe',
      ],
      notes:
        'Abstracts old LUProjector functions and host-native service implementations.',
    },
    {
      id: 'state-store-provider',
      title: 'State store provider',
      requirement: 'required',
      capabilities: [
        'logicir.capability.provider.state.get',
        'logicir.capability.provider.state.set',
        'logicir.capability.provider.state.delete',
      ],
      notes: 'Abstracts old StateStore.',
    },
    {
      id: 'fulfillment-provider',
      title: 'Requirement fulfillment provider',
      requirement: 'required',
      capabilities: ['logicir.capability.provider.fulfillment.static-startup'],
    },
    {
      id: 'completion-provider',
      title: 'Completion provider',
      requirement: 'required',
      capabilities: [
        'logicir.capability.provider.completion.immediate',
        'logicir.capability.provider.completion.continuation',
      ],
    },
    {
      id: 'event-observation-provider',
      title: 'Event observation provider',
      requirement: 'optional',
      capabilities: ['logicir.capability.provider.observe-events'],
    },
  ],
  bindings: [
    {
      kind: 'state-store',
      abstractRef: 'logicir.basic-software/state-store/default',
      provider: provider('local.memory', 'state-store'),
      requirement: 'required',
      notes: 'Exploration equivalent of getKVStore.',
    },
    {
      kind: 'completion-scheduler',
      abstractRef: 'logicir.basic-software/completion/default',
      provider: provider('host', 'continuation-scheduler'),
      requirement: 'required',
      notes: 'Abstract continuation scheduler, not JS Promise.',
    },
    {
      kind: 'external-target',
      abstractRef: 'external-target:*',
      provider: provider('runtime.registry', 'software-unit-provider'),
      requirement: 'required',
      notes: 'Exploration equivalent of getServiceProjector.',
    },
    {
      kind: 'requirement-service',
      abstractRef: 'requirement-service:*',
      provider: provider('runtime.registry', 'fulfillment-provider'),
      requirement: 'required',
      notes: 'Exploration equivalent of inject.',
    },
  ],
  policies: {
    providerLookup: 'profile-order',
    missingProvider: 'fail',
    dynamicFulfillmentDefault: 'static-at-startup',
    retainedCurrentDefault: 'execution-engine-adapter',
    behaviorChangingObservation: 'requires-explicit-binding',
  },
  diagnostics: requiredDiagnosticPolicy,
};

export const basicSoftwareStack: StackDefinition = {
  id: 'logicir.stack.basic-software',
  title: 'Basic Software Stack',
  status: 'exploration',
  description:
    'Language-neutral software stack for direct interpretation or generated software execution.',
  irPipeline: basicSoftwareIRProfile,
  projection: basicSoftwareProjectionProfile,
  execution: basicSoftwareExecutionProfile,
  variants: [
    {
      id: 'logicir.stack.basic-software.interpreter',
      title: 'Basic Software Interpreter',
      execution: basicSoftwareExecutionProfile,
      notes:
        'Projection may be a thin interpreter-ready plan over validated LogicIR.',
    },
    {
      id: 'logicir.stack.basic-software.codegen',
      title: 'Basic Software Codegen',
      execution: {
        ...basicSoftwareExecutionProfile,
        id: 'logicir.profile.basic-software-generated-execution',
        title: 'Basic Software Generated Artifact Execution',
        target: 'generated-software',
        environments: ['node-process', 'browser-runtime', 'python-process'],
      },
      notes:
        'Generated code still uses provider contracts and bindings from the execution profile.',
    },
  ],
};

