/**
 * LogicIR V1: LogicUniverse Standard Intermediate Representation
 * This file serves as the Source of Truth (SoT) for the LogicUniverse protocol.
 */

// --- 0. Protocol Information ---
export const LOGIC_IR_VERSION = 1;

// --- 1. Base Types ---
export type Data = unknown;

/**
 * PortExpansion can be either:
 * - a number, indicating the port is an array and the number of pins to expand to
 * - an array of strings, indicating the keys to expand to (used for object destructuring)
 */
export type PortExpansion = number | string[];

export type Address = (string | number)[];

// --- 2. Interaction Layer (X-Axis) ---
export const PortKind = {
  Pull: 'PL',
  Push: 'PS',
  Property: 'PY',
} as const;
export type PortKind = (typeof PortKind)[keyof typeof PortKind];

export type PullPort = {
  id: string;
  key: string;
  kind: typeof PortKind.Pull;
  expansion: PortExpansion | null;
};

export type PushPort = {
  id: string;
  key: string;
  kind: typeof PortKind.Push;
  expansion: PortExpansion | null;
};

export type PropertyPort = {
  id: string;
  key: string;
  kind: typeof PortKind.Property;
  expansion: PortExpansion | null;
};

export type Port = PullPort | PushPort | PropertyPort;

export type Net = {
  source: {
    portId: string;
    address?: Address;
  };
  target: {
    portId: string;
    address?: Address;
  };
};

// --- 3. Manifestation Layer (Y-Axis) ---

export const SequentialStepKind = {
  SequentialLUI: 'S',
  GoBackIf: 'G',
  ReturnIf: 'R',
} as const;
export type SequentialStepKind =
  (typeof SequentialStepKind)[keyof typeof SequentialStepKind];

export type SequentialStep =
  | {
      kind: typeof SequentialStepKind.SequentialLUI;
      id: string;
      isAwaited?: boolean;
    }
  | {
      kind: typeof SequentialStepKind.GoBackIf;
      id: string;
      conditionPortId: string;
      targetStepId: string;
    }
  | {
      kind: typeof SequentialStepKind.ReturnIf;
      id: string;
      conditionPortId: string;
      returnValuePortId: string;
    };

export const ComposableLUIChildrenKind = {
  Collection: 'C',
  Map: 'M',
  Single: 'S',
} as const;
export type ComposableLUIChildrenKind =
  (typeof ComposableLUIChildrenKind)[keyof typeof ComposableLUIChildrenKind];

export type ComposableChild = {
  luiId: string | null;
  key: string;
} | null;

export type RootCompositions = Record<string, ComposableChild>;

export type LUICompositions = Record<
  string,
  Record<
    string,
    | { kind: typeof ComposableLUIChildrenKind.Single; child: ComposableChild }
    | {
        kind: typeof ComposableLUIChildrenKind.Map;
        children: Record<string, ComposableChild>;
      }
    | {
        kind: typeof ComposableLUIChildrenKind.Collection;
        children: ComposableChild[];
      }
  >
>;

// --- 4. Sovereignty Layer (Z-Axis) ---
/** SovereignSource identifies the origin of a logic injection. null => host injection. */
export type SovereignSource = { luiId: string; closureKey: string } | null;

export type Provider = {
  key: string;
  source: SovereignSource;
};

export type LUClosure = {
  lu: LU;
  outerPorts: {
    inputs: {
      id: string;
      key: string;
      expansion: PortExpansion | null;
    }[];
    outputs: {
      id: string;
      key: string;
      expansion: PortExpansion | null;
    }[];
    hookEventId?: string;
  };
};

// --- 5. Port Interfaces ---
export type CombinationalPorts = {
  inputs: PullPort[];
  outputs: PushPort[];
  return: {
    id: string;
    expansion: PortExpansion | null;
  };
};

export type StatefulPorts = {
  inputs: (PullPort | PushPort)[];
  outputs: (PushPort | PropertyPort)[];
};

export type SequentialPorts = {
  inputs: (PullPort | PushPort)[];
  outputs: PushPort[];
  return?: {
    id: string;
    expansion: PortExpansion | null;
  };
};

export type ComposablePorts = {
  inputs: (PullPort | PushPort | PropertyPort)[];
  outputs: PushPort[];
};

export type HandlerPorts = {
  inputs: (PullPort | PushPort)[];
  outputs: PushPort[];
  return: {
    id: string;
    expansion: PortExpansion | null;
  };
};

export type Ports =
  | CombinationalPorts
  | SequentialPorts
  | StatefulPorts
  | ComposablePorts
  | HandlerPorts;

// --- 6. Logic Unit Instance (LUI) ---
export const LUITargetKind = {
  Native: 'N',
  LU: 'L',
  AbstractLUT: 'A',
} as const;
export type LUITargetKind = (typeof LUITargetKind)[keyof typeof LUITargetKind];

export type LUITargetData =
  | {
      kind: typeof LUITargetKind.LU;
      luId: string;
    }
  | {
      kind: typeof LUITargetKind.AbstractLUT;
      abstractKey: string;
      unitKey: string;
      source: SovereignSource;
      fallbackClosureKey?: string;
    }
  | {
      kind: typeof LUITargetKind.Native;
      packageId: string;
      unitKey: string;
    };

export type LUIBase = {
  dependencies: Record<
    string,
    {
      portId: string;
      defaultProvider?: Provider;
      closureMappings: Record<
        string,
        {
          closureKey: string;
          isFallback?: boolean;
        }
      >;
    }
  >;
  closures?: Record<string, LUClosure>;
  defaultInputs?: Record<string, Data>;
  customData?: Record<string, unknown>;
};

export type CombinationalLUI = LUIBase & {
  target: LUITargetData;
  ports: CombinationalPorts;
};
export type StatefulLUI = LUIBase & {
  target: LUITargetData;
  ports: StatefulPorts;
};
export type SequentialLUI = LUIBase & {
  target: LUITargetData;
  ports: SequentialPorts;
};
export type ComposableLUI = LUIBase & {
  target: LUITargetData;
  ports: ComposablePorts;
};
export type HandlerLUI = LUIBase & {
  target: LUITargetData;
  ports: HandlerPorts;
};

export type LUI =
  | CombinationalLUI
  | SequentialLUI
  | StatefulLUI
  | ComposableLUI
  | HandlerLUI;

// --- 7. Logic Unit (LU) ---
export const LUKind = {
  Sequential: 'SEQU',
  Combinational: 'COMB',
  Stateful: 'STAT',
  Composable: 'COMP',
} as const;
export type LUKind = (typeof LUKind)[keyof typeof LUKind];

export type LUBase = {
  version: typeof LOGIC_IR_VERSION;
  nets: Record<string, Net>;
  constants: Record<string, Data>;
  combinationalLUIs: Record<string, CombinationalLUI>;
};

export type CombinationalLU = LUBase & {
  kind: typeof LUKind.Combinational;
  ports: CombinationalPorts & {
    luMetaId?: string;
  };
};

export type StatefulLU = LUBase & {
  kind: typeof LUKind.Stateful;
  ports: StatefulPorts & {
    luMetaId?: string;
    onReadyId?: string;
    onExitId?: string;
    onErrorId?: string;
  };
  statefulLUIs: Record<string, StatefulLUI>;
  handlerLUIs: Record<string, HandlerLUI>;
};

export type SequentialLU = LUBase & {
  kind: typeof LUKind.Sequential;
  ports: SequentialPorts & {
    luMetaId?: string;
    onReadyId?: string;
    onExitId?: string;
    onErrorId?: string;
  };
  statefulLUIs: Record<string, StatefulLUI>;
  handlerLUIs: Record<string, HandlerLUI>;
  sequentialLUIs: Record<string, SequentialLUI>;
  sequentialSteps: SequentialStep[];
};

export type ComposableLU = LUBase & {
  kind: typeof LUKind.Composable;
  ports: ComposablePorts & {
    luMetaId?: string;
    onReadyId?: string;
    onExitId?: string;
    onErrorId?: string;
  };
  statefulLUIs: Record<string, StatefulLUI>;
  handlerLUIs: Record<string, HandlerLUI>;
  composableLUIs: Record<string, ComposableLUI>;
  rootCompositions: RootCompositions;
  luiCompositions: LUICompositions;
};

export type LU = CombinationalLU | SequentialLU | StatefulLU | ComposableLU;
