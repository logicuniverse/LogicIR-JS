/**
 * Draft feature extension payload types.
 *
 * These are schema-facing TypeScript types for extension payloads. They are not
 * runtime implementations and do not change LogicIR core semantics.
 */

import type {
  CompositionAnchorKey,
  CompositionOutletKey,
  ConnectionId,
  EndpointRef,
  ExtensionKey,
  FeatureRef,
  LUIId,
  PortKey,
  RequirementServiceKey,
  RequirementUnitKey,
  PayloadPath,
  PinKey,
} from '../../core/v0-draft/types';

// --- Shared selectors ---

export type ExtensionSelector = {
  luiId?: LUIId;
  connectionId?: ConnectionId;
  portKey?: PortKey;
  pinKey?: PinKey;
  payloadPath?: PayloadPath;
  serviceKey?: RequirementServiceKey;
  unitKey?: RequirementUnitKey;
  stepIndex?: number;
  anchorKey?: CompositionAnchorKey;
  outletKey?: CompositionOutletKey;
  closureId?: string;
};

export type ExtensionSchemaRef = {
  feature: FeatureRef;
  key: ExtensionKey;
};

// --- Type-system feature payloads ---

export type TypeExpression =
  | { kind: 'primitive'; name: 'bool' | 'int' | 'float' | 'string' }
  | { kind: 'record'; fields: Record<string, TypeExpression | TypeField> }
  | { kind: 'array'; item: TypeExpression; length?: number }
  | { kind: 'tuple'; items: TypeExpression[] }
  | { kind: 'union'; variants: TypeExpression[] }
  | { kind: 'named'; namespace: string; key: string };

export type TypeField = {
  type: TypeExpression;
  optional?: boolean;
};

export type TypeDefinitionsPayload = {
  definitions: Record<
    string,
    TypeExpression & { namespace?: string; key?: string }
  >;
};

export type PayloadTypesPayload = {
  selector?: Pick<
    ExtensionSelector,
    'portKey' | 'pinKey' | 'payloadPath'
  >;
  type: TypeExpression;
};

export type PortCompatibilityPolicy =
  | 'exact'
  | 'assignable'
  | 'widening'
  | 'projector-adapter'
  | 'custom';

export type PortCompatibilityPayload = {
  selector?: {
    connectionId?: ConnectionId;
    from?: { portKey: PortKey; payloadPath?: PayloadPath };
    to?: { portKey: PortKey; payloadPath?: PayloadPath };
  };
  policy: PortCompatibilityPolicy;
  adapterTarget?: { namespace: string; key: string };
};

export type RequirementCompatibilityPayload = {
  relation:
    | 'same-contract'
    | 'structural-subtype'
    | 'nominal-implements'
    | 'adapter-required';
  evidence?: {
    namespace: string;
    key: string;
    version?: string;
  };
};

export type CompositionCompatibilityPayload = {
  selector: Pick<ExtensionSelector, 'anchorKey' | 'outletKey'>;
  type: { namespace: string; key: string };
  accepts?: 'exact' | 'assignable' | 'custom';
};

export type PathNode =
  | { kind: 'leaf'; type: string }
  | { kind: 'record'; fields: Record<string, PathNode> }
  | { kind: 'tuple'; items: PathNode[] }
  | { kind: 'array'; item: PathNode };

export type PathSchemaPayload = {
  selector?: Pick<ExtensionSelector, 'portKey'>;
  root: PathNode;
};

export type TypeSystemExtensionPayload =
  | TypeDefinitionsPayload
  | PayloadTypesPayload
  | PortCompatibilityPayload
  | RequirementCompatibilityPayload
  | CompositionCompatibilityPayload
  | PathSchemaPayload;

// --- JS runtime feature payloads ---

export type JSAsyncPolicyPayload = {
  selector?: Pick<ExtensionSelector, 'stepIndex' | 'luiId'>;
  invocation: 'sync' | 'promise' | 'async-iterator';
  awaitBeforeNext?: boolean;
};

export type JSRetainedCurrentPayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'portKey' | 'payloadPath'>;
  realization:
    | 'source-store'
    | 'sink-cache'
    | 'projector-adapter'
    | 'host-observable';
  notification?: 'push' | 'subscribe' | 'microtask' | 'custom';
};

export type JSDynamicFulfillmentPayload = {
  selector?: Pick<ExtensionSelector, 'serviceKey' | 'unitKey'>;
  mode: 'static-at-startup' | 'switchable' | 'late-bound';
  consistency:
    | 'no-live-switch'
    | 'quiescent-switch'
    | 'transactional-switch';
};

export type JSLifecyclePayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'closureId'>;
  hooks: ('mount' | 'start' | 'stop' | 'dispose')[];
  ordering?: 'parent-before-child' | 'child-before-parent';
};

export type JSErrorPolicyPayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'portKey'>;
  onThrow: 'fail-projection' | 'reject' | 'emit-error' | 'use-error-port';
  cancellation?: 'unsupported' | 'abort-signal' | 'custom';
};

export type JSRuntimeExtensionPayload =
  | JSAsyncPolicyPayload
  | JSRetainedCurrentPayload
  | JSDynamicFulfillmentPayload
  | JSLifecyclePayload
  | JSErrorPolicyPayload;

// --- Python runtime feature payloads ---

export type PythonAsyncPolicyPayload = {
  selector?: Pick<
    ExtensionSelector,
    'stepIndex' | 'luiId' | 'portKey'
  >;
  invocation:
    | 'sync-call'
    | 'coroutine'
    | 'async-generator'
    | 'generator'
    | 'threadpool-call';
  awaitBeforeNext?: boolean;
};

export type PythonRetainedCurrentPayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'portKey' | 'payloadPath'>;
  realization:
    | 'source-property'
    | 'sink-cache'
    | 'asyncio-queue-latest'
    | 'observable'
    | 'projector-adapter';
  notification?: 'callback' | 'asyncio-event' | 'queue' | 'poll';
};

export type PythonDynamicFulfillmentPayload = {
  selector?: Pick<ExtensionSelector, 'serviceKey' | 'unitKey'>;
  binding:
    | 'constructor-injected'
    | 'contextvar'
    | 'service-container'
    | 'late-bound'
    | 'switchable';
  consistency:
    | 'startup-only'
    | 'task-local'
    | 'quiescent-switch'
    | 'transactional-switch';
};

export type PythonResourceLifecyclePayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'closureId'>;
  protocol:
    | 'none'
    | 'context-manager'
    | 'async-context-manager'
    | 'start-stop'
    | 'custom';
  ordering?: 'parent-before-child' | 'child-before-parent';
};

export type PythonConcurrencyPayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'connectionId'>;
  execution:
    | 'same-thread'
    | 'asyncio-task'
    | 'thread'
    | 'process'
    | 'external-worker';
  backpressure?: 'drop' | 'latest' | 'buffer' | 'block' | 'custom';
  ordering?: 'preserve' | 'best-effort' | 'unordered';
};

export type PythonErrorPolicyPayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'portKey'>;
  onException:
    | 'raise'
    | 'return-exception'
    | 'emit-error'
    | 'cancel-task'
    | 'use-error-port';
  cancellation?: 'unsupported' | 'asyncio-cancel' | 'cooperative' | 'custom';
};

export type PythonRuntimeExtensionPayload =
  | PythonAsyncPolicyPayload
  | PythonRetainedCurrentPayload
  | PythonDynamicFulfillmentPayload
  | PythonResourceLifecyclePayload
  | PythonConcurrencyPayload
  | PythonErrorPolicyPayload;

// --- Verilog HDL feature payloads ---

export type HDLSignalTypesPayload = {
  selector?: Pick<
    ExtensionSelector,
    'portKey' | 'pinKey' | 'payloadPath'
  >;
  width: number;
  signed?: boolean;
  packed?: boolean;
  encoding?: 'bits' | 'one-hot' | 'gray' | 'custom';
};

export type HDLClockResetPayload = {
  domain: string;
  clock: { portKey: PortKey; edge: 'posedge' | 'negedge' };
  reset?: {
    portKey: PortKey;
    active: 'high' | 'low';
    kind: 'sync' | 'async';
  };
  selectors?: { luiIds?: LUIId[]; stateKeys?: string[] };
};

export type HDLModuleBindingPayload = {
  moduleName: string;
  instanceName?: string;
  parameters?: Record<string, string | number | boolean>;
  blackbox?: boolean;
  portMap?: Record<PortKey, string>;
};

export type HDLExpression =
  | { kind: 'endpoint'; endpoint: EndpointRef }
  | { kind: 'constant'; value: string | number | boolean; width?: number }
  | { kind: 'unary'; op: '~' | '!' | '-'; expr: HDLExpression }
  | {
      kind: 'reduction';
      op: '&' | '|' | '^' | '~&' | '~|' | '~^';
      expr: HDLExpression;
    }
  | {
      kind: 'binary';
      op:
        | '+'
        | '-'
        | '*'
        | '&'
        | '|'
        | '^'
        | '=='
        | '!='
        | '<'
        | '<='
        | '>'
        | '>=';
      left: HDLExpression;
      right: HDLExpression;
    }
  | { kind: 'mux'; cond: HDLExpression; then: HDLExpression; else: HDLExpression }
  | { kind: 'concat'; items: HDLExpression[] }
  | {
      kind: 'cast';
      expr: HDLExpression;
      signed?: boolean;
      width?: number;
    };

export type HDLCombinationalAssignsPayload = {
  assigns: {
    to: EndpointRef;
    expr: HDLExpression;
  }[];
};

export type HDLStateRegistersPayload = {
  registers: {
    target: EndpointRef;
    enable?: HDLExpression;
    next: HDLExpression;
    resetValue?: HDLExpression;
    clockResetDomain?: string;
  }[];
};

export type HDLElaborationPayload = {
  selector?: Pick<ExtensionSelector, 'luiId' | 'connectionId'>;
  policy: 'static-only' | 'generate-loop' | 'unroll' | 'specialize';
  parameters?: Record<string, string | number | boolean>;
};

export type HDLStructuralSlicesPayload = {
  slices: Record<
    CompositionAnchorKey,
    {
      moduleName?: string;
      placement?: string;
      txPort?: PortKey;
      rxPort?: PortKey;
      tx?: HDLSliceInterface;
      rx?: HDLSliceInterface;
    }
  >;
  bus?: {
    routing: 'payload-path' | 'pin-channel' | 'custom';
    channelPath?: PayloadPath;
  };
  fanIn?: Record<
    CompositionAnchorKey,
    {
      policy: 'or' | 'and' | 'xor';
    }
  >;
};

export type HDLSliceInterface = {
  portName?: PortKey;
  width: number;
  signed?: boolean;
  packed?: boolean;
  encoding?: 'bits' | 'one-hot' | 'gray' | 'custom';
};

export type VerilogHDLExtensionPayload =
  | HDLSignalTypesPayload
  | HDLClockResetPayload
  | HDLModuleBindingPayload
  | HDLCombinationalAssignsPayload
  | HDLStateRegistersPayload
  | HDLElaborationPayload
  | HDLStructuralSlicesPayload;

export type DraftFeatureExtensionPayload =
  | TypeSystemExtensionPayload
  | JSRuntimeExtensionPayload
  | PythonRuntimeExtensionPayload
  | VerilogHDLExtensionPayload;
