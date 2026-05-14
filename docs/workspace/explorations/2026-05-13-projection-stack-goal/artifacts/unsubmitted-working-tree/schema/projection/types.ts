/**
 * Draft projection capability contract types.
 *
 * Projection is a declared capability set plus a lowering/realization pipeline.
 * These types describe capability declarations and diagnostics; they do not
 * implement any projector.
 */

import type {
  ExtensionKey,
  ExtensionRequirement,
  FeatureRef,
  LogicIRCoreSchemaVersion,
  LUKind,
  PortInteraction,
  RequirementFulfillmentScope,
} from '../core/v0-draft/types';

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export type ProjectionDiagnostic = {
  severity: DiagnosticSeverity;
  code: string;
  path: (string | number)[];
  message: string;
};

export type FeatureCapability = {
  feature: FeatureRef;
  extensionKeys: ExtensionKey[];
  supportsRequired: boolean;
  supportsOptional: boolean;
};

export type CoreCapability = {
  coreVersions: LogicIRCoreSchemaVersion[];
  luKinds: LUKind[];
  fulfillmentScopes: RequirementFulfillmentScope[];
  portInteractions: {
    pullReadable: boolean;
    pushNotifiable: boolean;
    retainedCurrent: boolean;
    combinations?: PortInteraction[];
  };
  endpointAddressing: {
    pins: boolean;
    payloadPath: boolean;
    maxPayloadPathDepth?: number;
  };
  structuralComposition: {
    exportAnchors: boolean;
    externalOutlets: boolean;
    childAnchors: boolean;
    childOutlets: boolean;
    collections: boolean;
    maps: boolean;
  };
  requirements: {
    inlineServices: boolean;
    externalServices: boolean;
    nestedPlainRequirements: boolean;
    closureFulfillment: boolean;
    upstreamUnitFulfillment: boolean;
    upstreamSharedServiceFulfillment: boolean;
  };
};

export type TypeSystemCapability = {
  feature: FeatureRef;
  typeForms: (
    | 'primitive'
    | 'record'
    | 'array'
    | 'tuple'
    | 'union'
    | 'named'
  )[];
  compatibilityPolicies: (
    | 'exact'
    | 'assignable'
    | 'widening'
    | 'projector-adapter'
    | 'custom'
  )[];
  pathSchema: boolean;
  requirementCompatibility: boolean;
  compositionCompatibility: boolean;
};

export type JSRuntimeCapability = {
  feature: FeatureRef;
  invocation: ('sync' | 'promise' | 'async-iterator')[];
  retainedCurrentRealization: (
    | 'source-store'
    | 'sink-cache'
    | 'projector-adapter'
    | 'host-observable'
  )[];
  dynamicFulfillment: (
    | 'static-at-startup'
    | 'switchable'
    | 'late-bound'
  )[];
  lifecycleHooks: ('mount' | 'start' | 'stop' | 'dispose')[];
  errorPolicies: (
    | 'fail-projection'
    | 'reject'
    | 'emit-error'
    | 'use-error-port'
  )[];
};

export type PythonRuntimeCapability = {
  feature: FeatureRef;
  invocation: (
    | 'sync-call'
    | 'coroutine'
    | 'async-generator'
    | 'generator'
    | 'threadpool-call'
  )[];
  retainedCurrentRealization: (
    | 'source-property'
    | 'sink-cache'
    | 'asyncio-queue-latest'
    | 'observable'
    | 'projector-adapter'
  )[];
  dynamicFulfillment: (
    | 'constructor-injected'
    | 'contextvar'
    | 'service-container'
    | 'late-bound'
    | 'switchable'
  )[];
  resourceLifecycle: (
    | 'none'
    | 'context-manager'
    | 'async-context-manager'
    | 'start-stop'
    | 'custom'
  )[];
  concurrency: (
    | 'same-thread'
    | 'asyncio-task'
    | 'thread'
    | 'process'
    | 'external-worker'
  )[];
  errorPolicies: (
    | 'raise'
    | 'return-exception'
    | 'emit-error'
    | 'cancel-task'
    | 'use-error-port'
  )[];
};

export type VerilogHDLCapability = {
  feature: FeatureRef;
  signalTypes: boolean;
  clockReset: boolean;
  moduleBinding: boolean;
  /**
   * Optional projector-side bindings for known external target identities.
   * Keys use `namespace/key`. This is capability evidence, not LogicIR core
   * schema data.
   */
  moduleRegistry?: Record<
    string,
    {
      moduleName: string;
      instanceName?: string;
      parameters?: Record<string, string | number | boolean>;
      blackbox?: boolean;
      portMap?: Record<string, string>;
      interface?: Record<
        string,
        {
          direction?: 'input' | 'output' | 'inout';
          width?: number;
        }
      >;
    }
  >;
  combinationalAssigns: boolean;
  stateRegisters: boolean;
  elaboration: ('static-only' | 'generate-loop' | 'unroll' | 'specialize')[];
  structuralSlices: boolean;
  supportsPushNotifiable: boolean;
  supportsRetainedCurrent: boolean;
  unsupportedRequiredBehavior:
    | 'diagnostic'
    | 'lowering-required'
    | 'reject';
};

export type ProjectorTarget =
  | 'core-validator'
  | 'type-system'
  | 'js-runtime'
  | 'python-runtime'
  | 'verilog-hdl';

export type ProjectorCapabilitySet = {
  name: string;
  target: ProjectorTarget;
  core: CoreCapability;
  features: FeatureCapability[];
  typeSystem?: TypeSystemCapability;
  jsRuntime?: JSRuntimeCapability;
  pythonRuntime?: PythonRuntimeCapability;
  verilogHDL?: VerilogHDLCapability;
};

export type UnsupportedExtensionDiagnosticInput = {
  feature: FeatureRef;
  key: ExtensionKey;
  requirement: ExtensionRequirement;
  path: (string | number)[];
};
