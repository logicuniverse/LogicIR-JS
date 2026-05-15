export type JsonPrimitive = null | boolean | number | string;
export type RuntimeValue =
  | JsonPrimitive
  | RuntimeValue[]
  | { [key: string]: RuntimeValue };

export type NodeId = string;
export type PortKey = string;
export type EventKey = string;

export type NodeKind =
  | 'property'
  | 'number-property'
  | 'event-merge'
  | 'event-mux'
  | 'operator';

export type OperatorKey =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'eq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'and'
  | 'or';

export type NodeTemplateSnapshot = {
  key: string;
  displayName: string;
  kind: NodeKind;
  inputs: PortKey[];
  outputs: PortKey[];
  retainedOutputs?: PortKey[];
  commands?: EventKey[];
  operator?: OperatorKey;
};

export type RuntimeNode =
  | {
      id: NodeId;
      kind: 'property';
      initial: RuntimeValue;
    }
  | {
      id: NodeId;
      kind: 'number-property';
      initial: number;
    }
  | {
      id: NodeId;
      kind: 'event-merge' | 'event-mux';
    }
  | {
      id: NodeId;
      kind: 'operator';
      operator: OperatorKey;
      inputs: Record<PortKey, EndpointRef>;
    };

export type EndpointRef = {
  nodeId: NodeId;
  portKey: PortKey;
};

export type StreamConnection = {
  from: EndpointRef;
  to: EndpointRef;
};

export type RuntimeGraph = {
  nodes: RuntimeNode[];
  streamConnections: StreamConnection[];
};

export type TraceEntry =
  | {
      kind: 'initialize';
      nodeId: NodeId;
      portKey: PortKey;
      value: RuntimeValue;
    }
  | {
      kind: 'event';
      nodeId: NodeId;
      eventKey: EventKey;
      value: RuntimeValue;
    }
  | {
      kind: 'state';
      nodeId: NodeId;
      portKey: PortKey;
      value: RuntimeValue;
    }
  | {
      kind: 'derived';
      nodeId: NodeId;
      portKey: PortKey;
      value: RuntimeValue;
    }
  | {
      kind: 'forward';
      from: EndpointRef;
      to: EndpointRef;
      value: RuntimeValue;
    };

export type RuntimeSnapshot = {
  values: Record<NodeId, Record<PortKey, RuntimeValue>>;
  trace: TraceEntry[];
};

export type SmokeReport = {
  task: 'headless-reactive-node-runtime';
  status: 'passed' | 'failed';
  finalCounter: RuntimeValue;
  finalTotal: RuntimeValue;
  forwardedEvents: number;
  traceLength: number;
};
