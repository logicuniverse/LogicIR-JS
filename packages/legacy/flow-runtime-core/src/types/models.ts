export type Data = unknown;

export const enum NodeKind {
  Native = 'N',
  Flow = 'F',
  Injection = 'I',
}

export type SubFlow = {
  flow: Flow;
  outerPorts: {
    input: {
      id: string;
      key: string;
      destructuringData: PortDestructuringData | null;
    }[];
    output: {
      id: string;
      key: string;
      destructuringData: PortDestructuringData | null;
    }[];
    hookEventId?: string;
  };
};

export const enum PortType {
  Data = 'D', // pull
  Stream = 'S', // push
  Property = 'P', // pull and push
}

export const enum FlowKind {
  Sequence = 'SEQ',
  Compute = 'CPT',
  StateMachine = 'STM',
  Component = 'CPN',
}

export const enum SequenceStepKind {
  SequenceNode = 'N',
  GoBackIf = 'G',
  ReturnIf = 'R',
}

export type SequenceStep =
  | {
      kind: SequenceStepKind.SequenceNode;
      id: string;
      isAwaited?: boolean;
    }
  | {
      id: string;
      kind: SequenceStepKind.GoBackIf;
      conditionPortId: string;
      targetStepId: string;
    }
  | {
      id: string;
      kind: SequenceStepKind.ReturnIf;
      conditionPortId: string;
      returnValuePortId: string;
    };

export type PortSubPath = (string | number)[];

export type Connection = {
  from: {
    portId: string;
    subPath?: PortSubPath;
  };
  to: {
    portId: string;
    subPath?: PortSubPath;
  };
};

export type ComponentChild = {
  nodeId: string | null; // null => external
  key: string;
} | null;

export enum ComponentNodeChildrenKind {
  Array = 'A',
  Object = 'O',
  Single = 'S',
}

export type RootCompositions = Record<string, ComponentChild>;
export type NodeCompositions = Record<
  string,
  Record<
    string,
    | { kind: ComponentNodeChildrenKind.Single; child: ComponentChild }
    | {
        kind: ComponentNodeChildrenKind.Object;
        children: Record<string, ComponentChild>;
      }
    | { kind: ComponentNodeChildrenKind.Array; children: ComponentChild[] }
  >
>;

export type GenericPort<T extends PortType> = {
  id: string;
  key: string;
  type: T;
  destructuringData: PortDestructuringData | null;
};

export type Provider = {
  key: string;
  parent: { nodeId: string; subflowKey: string } | null;
};

export type GenericPorts<
  I extends PortType,
  O extends PortType.Property | PortType.Stream,
> = {
  inputs: GenericPort<I>[];
  outputs: GenericPort<O>[];
  // destructuringMap?: Record<string, PortDestructuringData>; //<portId,PortDestructuring>
};

export type ComputePorts = GenericPorts<PortType.Data, never> & {
  // returnId: string;
  return: {
    id: string;
    destructuringData: PortDestructuringData | null;
  };
};

export type TriggerPorts = GenericPorts<
  PortType.Data | PortType.Stream,
  PortType.Stream
> & {
  return: {
    id: string;
    destructuringData: PortDestructuringData | null;
  };
};

export type StatePorts = GenericPorts<
  PortType.Data | PortType.Stream,
  PortType.Stream | PortType.Property
>;

export type SequencePorts = GenericPorts<
  PortType.Data | PortType.Stream,
  PortType.Stream
> & {
  return?: {
    id: string;
    destructuringData: PortDestructuringData | null;
  };
};

export type ComponentPorts = GenericPorts<PortType, PortType.Stream>;

export type Ports =
  | ComputePorts
  | SequencePorts
  | StatePorts
  | ComponentPorts
  | TriggerPorts;

export type PortDestructuringData = number | string[];

export type NodeCommonData = {
  dependencies: Record<
    string,
    {
      portId: string;
      defaultProvider?: Provider;
      subflowKeys: Record<string, string>; // methodKey -> subflowKey
    }
  >;
  staticInputs?: Record<string, Data>;
  subflows?: Record<string, SubFlow>;
  customData?: {
    tags?: string[];
    [key: string]: unknown;
  };
};

export type NodeTargetData =
  | {
      kind: NodeKind.Flow;
      flowId: string;
    }
  | {
      kind: NodeKind.Injection;
      injectionKey: string;
      methodKey: string;
      source: { nodeId: string; subflowKey: string } | null;
      defaultSubflowKey?: string; // if injection is null, use the related subflow
    }
  | {
      kind: NodeKind.Native;
      packageId: string;
      methodKey: string;
    };

export type GenericNode<T extends Ports> = {
  ports: T;
} & NodeCommonData & {
    target: NodeTargetData;
  };

export type ComputeNode = GenericNode<ComputePorts>;
export type TriggerNode = GenericNode<TriggerPorts>;
export type StateMachineNode = GenericNode<StatePorts>;
export type SequenceNode = GenericNode<SequencePorts>;
export type ComponentNode = GenericNode<ComponentPorts>;

export type FlowBase = {
  connections: Record<string, Connection>;
  constants: Record<string, Data>; // key is the port id
  computeNodes: Record<string, ComputeNode>;
};

export type ComputeFlow = FlowBase & {
  kind: FlowKind.Compute;
  ports: ComputePorts & {
    flowMetaId?: string;
  };
};
export type StateMachineFlow = FlowBase & {
  kind: FlowKind.StateMachine;
  ports: StatePorts & {
    flowMetaId?: string;
    onReadyId?: string; //after state nodes running, before subscribing
    onExitId?: string;
    onErrorId?: string;
  };
  componentNodes: Record<string, ComponentNode>;
  stateMachineNodes: Record<string, StateMachineNode>;
  triggerNodes: Record<string, TriggerNode>;
};
export type SequenceFlow = FlowBase & {
  kind: FlowKind.Sequence;
  ports: SequencePorts & {
    flowMetaId?: string;
    onReadyId?: string; //after state nodes running
    onExitId?: string;
    onErrorId?: string;
  };
  stateMachineNodes: Record<string, StateMachineNode>;
  triggerNodes: Record<string, TriggerNode>;
  sequenceNodes: Record<string, SequenceNode>;
  sequenceSteps: SequenceStep[];
};

export type ComponentFlow = FlowBase & {
  kind: FlowKind.Component;
  ports: ComponentPorts & {
    flowMetaId?: string;
    onReadyId?: string;
    onExitId?: string;
    onErrorId?: string;
  };
  stateMachineNodes: Record<string, StateMachineNode>;
  triggerNodes: Record<string, TriggerNode>;
  componentNodes: Record<string, ComponentNode>;
  rootCompositions: RootCompositions;
  nodeCompositions: NodeCompositions;
};

export type Flow =
  | ComputeFlow
  | SequenceFlow
  | StateMachineFlow
  | ComponentFlow;

export type Node =
  | ComputeNode
  | SequenceNode
  | StateMachineNode
  | ComponentNode
  | TriggerNode;
