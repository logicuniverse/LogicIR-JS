import { FlowPath } from '../../edit';
import {
  RunModeKind,
  EditorPortType,
  GenericEditorPort,
  NodeDependencies,
} from './interfaces';

import { CommonText, Extra, Injectable } from './helpers';

export type Data = unknown;

export enum EditorNodeTargetKind {
  Predefined = 'SM', // predefined node
  Flow = 'FL', // flow defined node
  Injection = 'IJ',
  Reserved = 'RS',
}

export enum EditorReservedPortKey {
  Return = '$RT',
  Execution = '$EXEC',
  GoBackExecution = '$GBE',
  GoBackCondition = '$GBC',
  ReturnCondition = '$RC',
  HookEvent = '$HE',
  SubsystemRx = '$SRX',
  FlowMeta = '$FM',
  OnReady = 'ORDY',
  OnExit = '$OEXT',
  OnError = '$OERR',
}

export enum EditorReservedNodeKey {
  Asset = '$AST',
  GoBackIf = '$GBI',
  ReturnIf = '$RI',
  UserInput = '$UIN',
  // JsCode = '$JC',
}

export type EditorPortDestructuringMap = {
  input: Record<string, number | string[]>;
  output: Record<string, number | string[]>;
  return?: number | string[];
};

export type ReservedNodeTargetData =
  | {
      target: EditorReservedNodeKey.GoBackIf;
    }
  | {
      target: EditorReservedNodeKey.ReturnIf;
    }
  | {
      target: EditorReservedNodeKey.Asset;
      id: string;
    }
  | {
      target: EditorReservedNodeKey.UserInput;
      elementType: string;
      props: Record<string, unknown>;
    };

export type EditorReservedNodeTargetData = {
  kind: EditorNodeTargetKind.Reserved;
} & ReservedNodeTargetData;

export type EditorFlowNodeTargetData = {
  kind: EditorNodeTargetKind.Flow;
  flowId: string;
  subsystemEntry?: string; // for subsystem
};

export type EditorInjectionNodeTargetData = {
  kind: EditorNodeTargetKind.Injection;
  injectionKey: string;
  key: string;
  source: { nodeId: string; subflowKey: string } | null; // for tracing back to source node, null for root
  subsystemEntry?: string; // for subsystem
  defaultSubflowKey?: string; // default subflow to use if any
};

export type EditorPredefinedNodeTargetData = {
  kind: EditorNodeTargetKind.Predefined;
  packageId: string;
  key: string;
  subsystemEntry?: string; // for subsystem
};

// export type EditorUserDefinedNodeTargetData = {
//   kind: EditorNodeTargetKind.UserDefined;
//   interface: NodeInterface;
//   target: string;
//   subsystemEntry?: string; // for subsystem
// };

export type EditorNodeTargetData =
  | EditorReservedNodeTargetData
  | EditorFlowNodeTargetData
  | EditorInjectionNodeTargetData
  | EditorPredefinedNodeTargetData;
// | EditorUserDefinedNodeTargetData;

export enum RunModeOverrideKind {
  CompileTime = 'C',
  Trigger = 'T',
  Awaited = 'A',
}

type EditorNodeExtras = {
  contentWidth?: number; // undefined => auto
  contentHeight?: number; // undefiend => auto
  portsVisibilityOverride: {
    input?: Record<string, boolean>;
    output?: Record<string, boolean>;
    return?: boolean;
  };
  color?: string;
};

export type EditorNodeCommon<HasExtra extends boolean = true> = {
  staticInputs: Record<string, Data>;
  destructuringMap: EditorPortDestructuringMap;
  customDependencies?: NodeDependencies; // custom dependencies for this node，useful for js code nodes, etc. Custom ports can be defined with destructuring
  customData: {
    tags?: string[];
    [key: string]: unknown;
  };
  runModeOverride:
    | null
    | {
        kind: RunModeOverrideKind.CompileTime; // only compute nodes
      }
    | {
        kind: RunModeOverrideKind.Trigger; // compute or sequence nodes
        triggerKey: string;
      }
    | {
        kind: RunModeOverrideKind.Awaited; // async sequence node, await over resolve
      };

  // provides: Provisions;
} & Extra<HasExtra, EditorNodeExtras>;

export type EditorNodeData<HasExtra extends boolean = true> =
  EditorNodeCommon<HasExtra> & {
    target: EditorNodeTargetData;
    subflows: Record<
      string, // subflowId
      {
        flow: EditorFlowData<HasExtra>;
        hookEvent?: boolean;
        target: {
          serviceKey: string;
          methodKey: string;
        } | null; // null => no target, maybe used as default
      } & Extra<
        HasExtra,
        {
          container: {
            id: string;
            isCollapsed: boolean;
          };
        }
      >
    >;
  } & Extra<
      HasExtra,
      {
        position: {
          x: number;
          y: number;
        };
      } & CommonText
    >;

export type EditorPortParent = {
  nodeId: string;
  subflowKey: string | null;
};

export type EditorConnectionPort = {
  key: string;
  parent: EditorPortParent | null;
};

export type EditorConnectionExtras = {
  // keyPoints: { x: number; y: number }[];
  tags?: string[];
  color?: string;
} & CommonText;

export type EditorConnection<HasExtra extends boolean = true> = {
  from: {
    port: EditorConnectionPort;
    pinKey: string | number | null;
  };
  to: {
    port: EditorConnectionPort;
    pinKey: string | number | null;
  };
} & Extra<HasExtra, EditorConnectionExtras>;

export type EditorSequenceConnection<HasExtra extends boolean = true> = (
  | { from: string; to: string | null }
  | { from: string | null; to: string }
  | { goBackFrom: string; goBackTo: string }
) &
  Extra<HasExtra, EditorConnectionExtras>;

// export type EditorGoBackConnection<HasExtra extends boolean = true> = {
//   from: string;
//   to: string;
// } & Extra<HasExtra, EditorConnectionExtras>;

export type EditorComponentConnection<HasExtra extends boolean = true> = {
  from: {
    nodeId: string | null;
    key: string;
  };
  to: {
    nodeId: string | null;
    key: string;
    pinKey: string | number | null;
  };
} & Extra<HasExtra, EditorConnectionExtras>;

export type EditorGroup = {
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  tags: string[];
  color?: string;
} & CommonText;

export type EditorSubflowContainer = {
  position: {
    x: number;
    y: number;
  };
  color?: string;
} & CommonText;

export type EditorFlowExtras = {
  groups: Record<string, EditorGroup>;
  subflowContainers: Record<string, EditorSubflowContainer>;
};

export type EditorCompositionItem = {
  nodeId: string | null;
  key: string;
};

export type EditorComposition = {
  parent: EditorCompositionItem;
} & (
  | {
      children:
        | Record<string, EditorCompositionItem | null>
        | (EditorCompositionItem | null)[];
    }
  | {
      child: EditorCompositionItem | null;
    }
);

export type EditorFlowData<HasExtra extends boolean = true> = {
  nodes: Record<string, EditorNodeData<HasExtra>>;
  connections: Record<string, EditorConnection<HasExtra>>;
  ports: {
    input: GenericEditorPort<EditorPortType>[];
    output: GenericEditorPort<
      EditorPortType.Property | EditorPortType.Stream
    >[];
  };
  metaPorts: {
    flowMeta?: boolean;
    onReady?: boolean; //after state nodes running, before subscribing
    onExit?: boolean;
    onError?: boolean;
  };
  sequenceConnections: Record<string, EditorSequenceConnection<HasExtra>>;
  // goBackConnections: Record<string, EditorGoBackConnection<HasExtra>>;
  componentConnections: Record<string, EditorComponentConnection<HasExtra>>;
  // compositions: EditorComposition[];
  // exports: Record<string, { children: string[] } & CommonText>; // use export as component output destructuring
  // componentChildren: Record<string, Record<string, string[]>>;
} & Extra<HasExtra, EditorFlowExtras>;

// editor flow info should contain all the information needed for editor to render and operate on the flow,

export type EditorRootFlow<HasExtra extends boolean = true> = {
  kind: RunModeKind;
  dependencies: NodeDependencies;
  componentReturn: ({
    key: string;
  } & CommonText)[];
  returnVoid?: boolean;
} & EditorFlowData<HasExtra>;

// core alias
export type EditorConnectionCore = EditorConnection<false>;
export type EditorFlowDataCore = EditorFlowData<false>;
export type EditorNodeDataCore = EditorNodeData<false>;
export type EditorRootFlowCore = EditorRootFlow<false>;
