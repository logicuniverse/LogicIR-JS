import { Data, LU, Provider, LUI, PortExpansion, PortKind } from './models';
import { Hooks, PluginHooks } from './hooks';

export type LUError = {
  message: string;
  [key: string]: unknown;
};

export type ErrorData = {
  error: LUError;
  meta: {
    luSession: LUSession;
    luiMeta: LUIMeta;
    luiInputs: Record<string, Result>;
  };
};

export type LUMeta = {
  lu: LU;
  session: LUSession;
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
      error: LUError;
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

export const enum SequentialStepResultKind {
  Next = 'N',
  GoBack = 'G',
  Return = 'R',
}

export type SequentialStepResult =
  | {
      kind: SequentialStepResultKind.Next;
      value: ReturnResult;
    }
  | {
      kind: SequentialStepResultKind.GoBack;
      target: string;
    }
  | {
      kind: SequentialStepResultKind.Return;
      value: Result;
    };

export interface Service {
  [k: string]: LUProjector;
}

export type Services = Record<string, Service>;

export type LUEventHandler = (key: string, value: Packet) => void;

export type LUSubscribeHandler = (handler: LUEventHandler) => () => void;

export type LUClosureProjector = (
  inputs: Record<string, Result>,
  emit: LUEventHandler,
  subscribe: LUSubscribeHandler
) => ReturnResult;

export type LUIEventHandler = (
  key: string,
  value: Packet,
  closureKey: string | null
) => void;

export type LUISubscribeHandler = (handler: LUIEventHandler) => () => void;

export type LUProjector = (
  inputs: Record<string, Result>,
  emit: LUEventHandler,
  subscribe: LUISubscribeHandler,
  inject: (serviceKey: string, unitKey: string) => LUProjector | null,
  meta?: LUIMeta,
  getState?: (propertyKey: string) => Result
) => ReturnResult; // can be skipped or error

export type ComposableContext<FC = unknown, EL = unknown> = {
  compose: (val: {
    item: FC | null;
    children: EL[] | Record<string, EL>;
    props?: Record<string, unknown>;
  }) => EL | null;
};

export type ComposableReturn = (
  context: ComposableContext
) => (composableInputs: Record<string, unknown>) => unknown;

export type LUSession = {
  luId: string; // the id of the LU, if current LU is the entry, then it is the same as the outer session id
  luRunId: string;
  outer: {
    luSessions: {
      luiId: string;
      closureKey: string;
      runId: string;
    }[];
    luiId: string;
    luiRunId: string;
  }[];
  inner: {
    luiId: string;
    closureKey: string;
    runId: string; // the session id of the inner LU, if it is a closure, it is the same as the outer session id
  }[];
};

export type LUIMeta = {
  luiId: string;
  luiRunId: string;
  lui: LUI;
};

export type PortParent = { luiId: string; closureKey: string | null } | null;

export type RuntimePort = {
  key: string | null;
  parent: PortParent;
  isSource: boolean;
  kind: PortKind;
  expansion: PortExpansion | null;
};

export type StateStore<T> = {
  setState: (key: string, value: T) => void;
  getState: (key: string) => T | undefined;
  deleteState: (key: string) => void;
};

// read only
export interface Context {
  getLU: (id: string) => LU;
  inject: (provider: Provider, unitKey: string) => LUProjector | null; // optional=>null
  getLUProjector: (packageId: string, unitKey: string) => LUProjector;
  hooks: Hooks;
  lu: LU;
  session: LUSession;
  getStateStore: (id: string) => StateStore<Result>;
}

// all states, should be able to saved and restored
export type LUClosureStore = {
  emit: LUEventHandler;
  luiListeners: Record<string, LUIEventHandler>;
  tempPortStates: Map<string, Result>;
  portStates: StateStore<Result>;
  runtimePorts: Record<string, RuntimePort>;
};

export type LUProjectorPlugin = {
  name: string;
  getServiceProjector?: (
    serviceId: string,
    unitKey: string
  ) => LUProjector | undefined;
  inject?: (serviceKey: string, unitKey: string) => LUProjector | undefined;
  hooks?: PluginHooks;
};
