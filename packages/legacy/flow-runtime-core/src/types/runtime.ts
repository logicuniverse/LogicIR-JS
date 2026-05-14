import {
  Data,
  Flow,
  Provider,
  Node,
  PortDestructuringData,
  PortType,
} from './models';
import { Hooks, PluginHooks } from './hooks';

export type FlowError = {
  message: string;
  [key: string]: unknown;
};

export type ErrorData = {
  error: FlowError;
  meta: {
    flowSession: FlowSession;
    nodeMeta: NodeMeta;
    nodeInputs: Record<string, Result>;
  };
};

export type FlowMeta = {
  flow: Flow;
  session: FlowSession;
};

export const enum OptionKind {
  Some = 'S',
  Nothing = 'N',
}

export type Option<T extends Data = Data> =
  | {
      kind: OptionKind.Some;
      optionValue: T;
    }
  | {
      kind: OptionKind.Nothing;
    };

export const enum ResultKind {
  Ok = 'O',
  Error = 'E',
}

export type Result<T extends Data = Data> =
  | {
      kind: ResultKind.Ok;
      resultValue: Option<T>;
    }
  | {
      kind: ResultKind.Error;
      error: FlowError;
    };

export const enum ReturnResultKind {
  Immediate = 'I',
  Thenable = 'T',
}

export type ImmediateReturnResult<T extends Data = Data> = {
  kind: ReturnResultKind.Immediate;
  returnValue: Result<T>;
};

export type ThenableReturnResult<T extends Data = Data> = {
  kind: ReturnResultKind.Thenable;
  then: (onResolve: (result: Result<T>) => void) => void;
};

export type ReturnResult<T extends Data = Data> =
  | ImmediateReturnResult<T>
  | ThenableReturnResult<T>;

export type Packet<T extends Data = Data> = {
  result: Result<T>;
  path?: (string | number)[];
};

export const enum SequenceStepResultKind {
  Next = 'N',
  GoBack = 'G',
  Return = 'R',
}

export type SequenceStepResult =
  | {
      kind: SequenceStepResultKind.Next;
      value: ReturnResult;
    }
  | {
      kind: SequenceStepResultKind.GoBack;
      target: string;
    }
  | {
      kind: SequenceStepResultKind.Return;
      value: Result;
    };

export interface Service {
  [k: string]: NodeFunction;
}

export type Services = Record<string, Service>;

export type FlowEventHandler = (key: string, value: Packet) => void;

export type FlowSubscribeHandler = (handler: FlowEventHandler) => () => void;

export type NodeInputEventHandler = (
  key: string,
  value: Packet,
  subflowKey: string | null
) => void;

export type NodeSubscribeHandler = (
  handler: NodeInputEventHandler
) => () => void;

export type FlowFunction = (
  inputs: Record<string, Result>,
  emit: FlowEventHandler,
  subscribe: FlowSubscribeHandler
) => ReturnResult;

export type NodeFunction = (
  inputs: Record<string, Result>,
  emit: FlowEventHandler,
  subscribe: NodeSubscribeHandler,
  inject: (serviceKey: string, methodKey: string) => NodeFunction | null,
  meta?: NodeMeta,
  getState?: (propertyKey: string) => Result
) => ReturnResult; // can be skipped or error

export type ComponentContext<FC = unknown, EL = unknown> = {
  compose: (
    val: {
      item: FC | null;
      children: EL[] | Record<string, EL>;
      props?: Record<string, unknown>;
      // lifeCycleCallbacks?: {
      //   onStart?: () => void;
      //   onEnd?: () => void;
      // };
    }
    // | { item: null; children: EL[] | Record<string, EL> }
  ) => EL | null;
};

export type ComponentReturn = (
  context: ComponentContext
) => (componentInputs: Record<string, unknown>) => unknown;

export type FlowSession = {
  rootFlowId: string; // the id of the root flow, if current root flow is the entry, then it is the same as the outer session id
  rootFlowRunId: string;
  outer: {
    flowSessions: {
      nodeId: string;
      subflowKey: string;
      runId: string;
    }[];
    flowNodeId: string;
    flowNodeRunId: string;
  }[];
  inner: {
    nodeId: string;
    subflowKey: string;
    runId: string; // the session id of the inner flow, if it is a subflow, it is the same as the outer session id
  }[];
};

export type NodeMeta = {
  nodeId: string;
  nodeRunId: string;
  node: Node;
};

export type PortParent = { nodeId: string; subflowKey: string | null } | null;

export type RuntimePort = {
  key: string | null;
  parent: PortParent;
  isSource: boolean;
  type: PortType;
  destructuringData: PortDestructuringData | null;
};

export type StateStore<T> = {
  setState: (key: string, value: T) => void;
  getState: (key: string) => T | undefined;
  deleteState: (key: string) => void;
};

// read only
export interface Context {
  // getNativeFunction: (target: string) => NodeFunction | undefined;
  getFlow: (id: string) => Flow;
  inject: (provider: Provider, methodKey: string) => NodeFunction | null; // optional=>null
  getNodeFunction: (packageId: string, methodKey: string) => NodeFunction;
  // subflowFunctions: Record<string, FlowFunction>;
  // externalServices: Services;
  // internalServices: Record<string, Services>; // <providerNodeId, Services>
  hooks: Hooks;
  flow: Flow;
  session: FlowSession;
  getStateStore: (id: string) => StateStore<Result>;
}

// all states, should be able to saved and restored
export type FlowStore = {
  emit: FlowEventHandler;
  nodeListeners: Record<string, NodeInputEventHandler>;
  tempPortStates: Map<string, Result>;
  portStates: StateStore<Result>;
  runtimePorts: Record<string, RuntimePort>;
};

export type FlowRunnerPlugin = {
  name: string;
  // getNativeFunction?: (target: string) => NodeFunction | undefined;
  // getFlow?: (flowId: string) => Flow | undefined;
  getServiceMethod?: (
    serviceId: string,
    methodKey: string
  ) => NodeFunction | undefined;
  inject?: (serviceKey: string, methodKey: string) => NodeFunction | undefined;
  hooks?: PluginHooks;
  // services?: Services;
};
