// Names of duration events follow the onVerbNoun[Begin|End] pattern.
// The name signals what happened (verb), the context (noun), and if the event is starting or ending.
// Names of instant events follow the on[Will|Did]VerbNoun? pattern.
// The name signals if the event is going to happen (onWill) or already happened (onDid),
// what happened (verb), and the context (noun) unless obvious from the context.

import { Provider } from './models';
import {
  FlowError,
  FlowEventHandler,
  NodeInputEventHandler,
  Result,
  ReturnResult,
  FlowSession,
  NodeMeta,
  Packet,
  Context,
  FlowStore,
  NodeFunction,
} from './runtime';

type NodeHookEvents = {
  kind: 'node';
  nodeMeta: NodeMeta;
} & (
  | {
      name: 'onReadNodeInputsBegin';
      value?: {};
    }
  | {
      name: 'onReadNodeInputsEnd';
      value: {
        nodeInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onRunNodeBegin';
      value: {
        nodeInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onRunNodeEnd';
      value: {
        nodeOutput: Result;
      };
    }
  | {
      name: 'onReadSubFlowInputsBegin';
      value: {
        subflowKey: string;
      };
    }
  | {
      name: 'onReadSubFlowInputsEnd';
      value: {
        subflowKey: string;
        subflowInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onAwaitNodeBegin';
      value?: {};
    }
  | {
      name: 'onAwaitNodeEnd';
      value?: {};
    }
  | {
      name: 'onError';
      value: {
        error: FlowError;
      };
    }
);

type FlowHookEvents = { kind: 'flow' } & (
  | {
      name: 'onRunFlowBegin';
      value: {
        flowInputs: Record<string, Result>;
      };
    }
  | {
      name: 'onRunFlowEnd';
      value: {
        flowOutput: Result;
      };
    }
  | {
      name: 'onReadFlowOutputBegin';
      value: object;
    }
  | {
      name: 'onReadFlowOutputEnd';
      value: {
        flowOutput: Result;
      };
    }
  | {
      name: 'onGoBack';
      value: {
        fromNodeId: string;
        toNodeId: string;
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
      name: 'onDidOverrideNodeRun';
      value: {
        nodeMeta: NodeMeta;
        nodeInputs: Record<string, Result>;
        nodeOutput: Result;
      };
    }
  | {
      name: 'onDidOverrideFlowRun';
      value: {
        flowInputs: Record<string, Result>;
        flowOutput: Result;
      };
    }
  // transforms
  | {
      name: 'onDidTransformFlowInputs';
      value: {
        from: Record<string, Result>;
        to: Record<string, Result>;
      };
    }
  | {
      name: 'onDidTransformFlowOutput';
      value: {
        from: Result;
        to: Result;
      };
    }
  | {
      name: 'onDidTransformNodeInputs';
      value: {
        nodeMeta: NodeMeta;
        from: Record<string, Result>;
        to: Record<string, Result>;
      };
    }
  | {
      name: 'onDidTransformNodeOutput';
      value: {
        nodeMeta: NodeMeta;
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
  | NodeHookEvents
  | FlowHookEvents
  | PluginHookEvents
) & {
  flowSession: FlowSession;
};

export type HookEvent = HookEventData & {
  id: string; // unique identifier for the event, useful for tracking events in logs
  timestamp: number;
};

export type PluginHooks = {
  onEvent?: (event: HookEvent) => void;
  overrideNodeRun?: (
    context: Context,
    flowStore: FlowStore,
    nodeMeta: NodeMeta,
    nodeInputs: Record<string, Result>,
    injections: Record<string, Provider>,
    subflowFunctions: Record<string, NodeFunction>,
    emit: NodeInputEventHandler,
    subscribe: (listener: NodeInputEventHandler) => () => void
  ) => ReturnResult | undefined;
  overrideFlowRun?: (
    context: Context,
    flowInputs: Record<string, Result>,
    emit: FlowEventHandler,
    subscribe: (listener: FlowEventHandler) => void
  ) => ReturnResult | undefined;
  transformFlowInputs?: (
    context: Context,
    flowInputs: Record<string, Result>
  ) => Record<string, Result> | undefined;
  transformFlowOutput?: (
    context: Context,
    flowStore: FlowStore,
    flowOutput: Result
  ) => Result | undefined;
  transformNodeInputs?: (
    context: Context,
    flowStore: FlowStore,
    nodeMeta: NodeMeta,
    nodeInputs: Record<string, Result>
  ) => Record<string, Result> | undefined;
  transformNodeOutput?: (
    context: Context,
    flowStore: FlowStore,
    nodeMeta: NodeMeta,
    nodeOutput: Result
  ) => Result | undefined;
  transformDataAfterRead?: (
    context: Context,
    flowStore: FlowStore,
    portId: string,
    value: Result
  ) => Result | undefined;
  transformDataBeforeEmit?: (
    context: Context,
    flowStore: FlowStore,
    portId: string,
    value: Result
  ) => Result | undefined;
};

export type Hooks = Omit<PluginHooks, 'onEvent'> & {
  onEvent?: (event: HookEventData) => void;
};
