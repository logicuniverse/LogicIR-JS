// Names of duration events follow the onVerbNoun[Begin|End] pattern.
// The name signals what happened (verb), the context (noun), and if the event is starting or ending.
// Names of instant events follow the on[Will|Did]VerbNoun? pattern.
// The name signals if the event is going to happen (onWill) or already happened (onDid),
// what happened (verb), and the context (noun) unless obvious from the context.

import { Provider } from './models';
import {
  LUError,
  LUEventHandler,
  LUIEventHandler,
  Result,
  ReturnResult,
  LUSession,
  LUIMeta,
  Packet,
  Context,
  LUClosureStore,
  LUProjector,
} from './runtime';

type LUIHookEvents = {
  kind: 'lui';
  luiMeta: LUIMeta;
} & (
  | {
      name: 'onReadLUIInputsBegin';
      value?: {};
    }
  | {
      name: 'onReadLUIInputsEnd';
      value: {
        luiInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onManifestLUIBegin';
      value: {
        luiInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onManifestLUIEnd';
      value: {
        luiOutput: Result;
      };
    }
  | {
      name: 'onReadClosureInputsBegin';
      value: {
        closureKey: string;
      };
    }
  | {
      name: 'onReadClosureInputsEnd';
      value: {
        closureKey: string;
        closureInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onAwaitLUIBegin';
      value?: {};
    }
  | {
      name: 'onAwaitLUIEnd';
      value?: {};
    }
  | {
      name: 'onError';
      value: {
        error: LUError;
      };
    }
);

type ClosureHookEvents = { kind: 'closure' } & (
  | {
      name: 'onProjectClosureBegin';
      value: {
        closureInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onProjectClosureEnd';
      value: {
        closureOutput: Result;
      };
    }
  | {
      name: 'onReadClosureOutputBegin';
      value: object;
    }
  | {
      name: 'onReadClosureOutputEnd';
      value: {
        closureOutput: Result;
      };
    }
  | {
      name: 'onGoBack';
      value: {
        fromId: string;
        toId: string;
      };
    }
  | {
      name: 'onReadDataBegin';
      value: {
        portId: string;
      };
    }
  | {
      name: 'onReadDataEnd';
      value: {
        portId: string;
        value: Result;
      };
    }
  | {
      name: 'onWillEmitData';
      value: {
        portId: string;
        value: Packet;
      };
    }
  | {
      name: 'onDidReceiveData';
      value: {
        fromPortId: string;
        toPortId: string;
        value: Packet;
      };
    }
);

type PluginHookEvents = { kind: 'plugin'; plugin: { name: string } } & ( // overrides
  | {
      name: 'onDidOverrideLUIManifestation';
      value: {
        luiMeta: LUIMeta;
        luiInputs: Record<string, Result>;
        luiOutput: Result;
      };
    }
  | {
      name: 'onDidOverrideClosureProjection';
      value: {
        closureInputs: Record<string, Result>;
        closureOutput: Result;
      };
    }
  // transforms
  | {
      name: 'onDidTransformClosureInputs';
      value: {
        from: Record<string, Result>;
        to: Record<string, Result>;
      };
    }
  | {
      name: 'onDidTransformClosureOutput';
      value: {
        from: Result;
        to: Result;
      };
    }
  | {
      name: 'onDidTransformLUIInputs';
      value: {
        luiMeta: LUIMeta;
        from: Record<string, Result>;
        to: Record<string, Result>;
      };
    }
  | {
      name: 'onDidTransformLUIOutput';
      value: {
        luiMeta: LUIMeta;
        from: Result;
        to: Result;
      };
    }
  | {
      name: 'onDidTransformDataAfterRead';
      value: {
        portId: string;
        from: Result;
        to: Result;
      };
    }
  | {
      name: 'onDidTransformDataBeforeEmit';
      value: {
        portId: string;
        from: Result;
        to: Result;
      };
    }
);

export type HookEventData = (
  | LUIHookEvents
  | ClosureHookEvents
  | PluginHookEvents
) & {
  luSession: LUSession;
};

export type HookEvent = HookEventData & {
  id: string; // unique identifier for the event, useful for tracking events in logs
  timestamp: number;
};

export type PluginHooks = {
  onEvent?: (event: HookEvent) => void;
  overrideLUIManifestation?: (
    context: Context,
    store: LUClosureStore,
    luiMeta: LUIMeta,
    luiInputs: Record<string, Result>,
    injections: Record<string, Provider>,
    closureProjectors: Record<string, LUProjector>,
    emit: LUIEventHandler,
    subscribe: (listener: LUIEventHandler) => () => void
  ) => ReturnResult | undefined;
  overrideClosureProjection?: (
    context: Context,
    closureInputs: Record<string, Result>,
    emit: LUEventHandler,
    subscribe: (listener: LUEventHandler) => void
  ) => ReturnResult | undefined;
  transformClosureInputs?: (
    context: Context,
    closureInputs: Record<string, Result>
  ) => Record<string, Result> | undefined;
  transformClosureOutput?: (
    context: Context,
    store: LUClosureStore,
    closureOutput: Result
  ) => Result | undefined;
  transformLUIInputs?: (
    context: Context,
    store: LUClosureStore,
    luiMeta: LUIMeta,
    luiInputs: Record<string, Result>
  ) => Record<string, Result> | undefined;
  transformLUIOutput?: (
    context: Context,
    store: LUClosureStore,
    luiMeta: LUIMeta,
    luiOutput: Result
  ) => Result | undefined;
  transformDataAfterRead?: (
    context: Context,
    store: LUClosureStore,
    portId: string,
    value: Result
  ) => Result | undefined;
  transformDataBeforeEmit?: (
    context: Context,
    store: LUClosureStore,
    portId: string,
    value: Result
  ) => Result | undefined;
};

export type Hooks = Omit<PluginHooks, 'onEvent'> & {
  onEvent?: (event: HookEventData) => void;
};
