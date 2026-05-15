import type { LogicUnit as CoreLogicUnit } from '@logic-universe/logic-ir-core';

export type {
  Connection,
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  LUI,
  LUIId,
  LUITarget,
  PayloadPath,
  Port,
  PortKey,
  UnitFulfillment,
} from '@logic-universe/logic-ir-core';

export type {
  ExecutionProfileDefinition,
  FeatureDefinition,
  IRPipelineProfileDefinition,
  ProjectionProfileDefinition,
  StackDefinition,
} from '@logic-universe/logic-ir-architecture';

export type Option<T = unknown> =
  | { kind: 'some'; value: T }
  | { kind: 'none' };

export type RuntimeError = {
  code: string;
  message: string;
  subject?: string;
};

export type Result<T = unknown> =
  | { kind: 'ok'; value: Option<T> }
  | { kind: 'error'; error: RuntimeError };

export type Packet<T = unknown> = {
  result: Result<T>;
  path?: (string | number)[];
};

export type ReturnValue<T = unknown> =
  | { kind: 'immediate'; result: Result<T> }
  | { kind: 'thenable'; then: (resolve: (result: Result<T>) => void) => void };

export type Diagnostic = {
  code: string;
  severity: 'info' | 'warning' | 'error';
  phase: 'compile' | 'execute';
  message: string;
  subject?: string;
};

export type InterpretationMetadata = {
  authority: 'sandbox-evidence';
  baselineOnly: true;
  realizationStrategy: string;
  semanticPreservation: string[];
  note: string;
};

export const baselineInterpretation = (
  realizationStrategy: string,
  semanticPreservation: string[],
): InterpretationMetadata => ({
  authority: 'sandbox-evidence',
  baselineOnly: true,
  realizationStrategy,
  semanticPreservation,
  note: 'This latest-schema replica is review evidence and a runnable baseline, not final schema authority or a mandatory engine algorithm.',
});

export type ExecutionNodeKind =
  | 'provider'
  | 'state-read'
  | 'state-write'
  | 'closure'
  | 'upstream'
  | 'nested-lu'
  | 'sequential-control'
  | 'structural-render';

export type ExecutionNode = {
  id: string;
  kind: ExecutionNodeKind;
  targetKey?: string;
  luRef?: string;
  serviceKey?: string;
  unitKey?: string;
  closureId?: string;
  storeKey?: string;
  inputMap: Record<string, PortMapping>;
  outputMap: Record<string, PortMapping>;
  extensions?: Record<string, unknown>;
};

export type PortMapping = {
  portKey: string;
  payloadPath?: (string | number)[];
  targetPayloadPath?: (string | number)[];
};

export type InterpreterPlan = {
  key: string;
  interpretation: InterpretationMetadata;
  unitKind: CoreLogicUnit['core']['kindOrganization']['kind'];
  inputPorts: string[];
  outputPorts: string[];
  nodes: ExecutionNode[];
  diagnostics: Diagnostic[];
};

export type ProviderFunction = (
  inputs: Record<string, unknown>,
  context: ProviderContext,
) =>
  | Record<string, unknown>
  | Promise<Record<string, unknown>>
  | ReturnValue<Record<string, unknown>>;

export type ProviderContext = {
  getState: (key: string) => unknown;
  setState: (key: string, value: unknown) => void;
  emit: (key: string, value: Packet) => void;
};

export type StateStore = {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  delete: (key: string) => void;
  snapshot: () => Record<string, unknown>;
};

export type HookEvent = {
  name: string;
  nodeId?: string;
  planKey: string;
  value?: unknown;
};

export type ExecutionSession = {
  runId: string;
  planKey: string;
  parentRunId?: string;
};

export type EngineHooks = {
  onEvent?: (event: HookEvent) => void;
  overrideLUIExecution?: (
    context: ExecutionContext,
    node: ExecutionNode,
    inputs: Record<string, unknown>,
  ) => Record<string, unknown> | Result | undefined;
  overrideClosureExecution?: (
    context: ExecutionContext,
    node: ExecutionNode,
    inputs: Record<string, unknown>,
  ) => Record<string, unknown> | Result | undefined;
  transformDataAfterRead?: (
    context: ExecutionContext,
    node: ExecutionNode,
    portKey: string,
    value: Result,
  ) => Result | undefined;
  transformDataBeforeEmit?: (
    context: ExecutionContext,
    node: ExecutionNode,
    portKey: string,
    value: Result,
  ) => Result | undefined;
  transformLUIInputs?: (
    context: ExecutionContext,
    node: ExecutionNode,
    inputs: Record<string, Result>,
  ) => Record<string, Result> | undefined;
  transformLUIOutput?: (
    context: ExecutionContext,
    node: ExecutionNode,
    output: Result,
  ) => Result | undefined;
};

export type EnginePlugin = {
  name: string;
  hooks?: EngineHooks;
};

export type EngineOptions = {
  providers: Record<string, ProviderFunction>;
  plans?: Record<string, InterpreterPlan>;
  plugins?: EnginePlugin[];
  stateStore?: StateStore;
};

export type ExecutionContext = {
  plan: InterpreterPlan;
  providers: Record<string, ProviderFunction>;
  plans: Record<string, InterpreterPlan>;
  stateStore: StateStore;
  hooks: EngineHooks;
  emitted: Record<string, Packet[]>;
  sessions: ExecutionSession[];
};

export type ExecutionResult = {
  status: 'ok' | 'error';
  outputs: Record<string, unknown>;
  state: Record<string, unknown>;
  emitted: Record<string, Packet[]>;
  sessions: ExecutionSession[];
  diagnostics: Diagnostic[];
};

export type Engine = {
  run: (
    plan: InterpreterPlan,
    inputs: Record<string, unknown>,
  ) => ExecutionResult;
  runAsync: (
    plan: InterpreterPlan,
    inputs: Record<string, unknown>,
  ) => Promise<ExecutionResult>;
  runReactive: (
    plan: InterpreterPlan,
    inputs: Record<string, unknown>,
    events: Record<string, Packet[]>,
  ) => Promise<ExecutionResult>;
};

export type CoverageStatus =
  | 'covered'
  | 'partial'
  | 'defer'
  | 'drop-intentionally';

export type CoverageRow = {
  capability: string;
  legacyReference: string;
  latestSchemaMapping: string;
  status: CoverageStatus;
  notes: string;
};
