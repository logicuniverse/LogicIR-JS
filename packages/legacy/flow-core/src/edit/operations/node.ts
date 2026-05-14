import {
  EditorNodeTargetData,
  EditorNodeData,
  EditorNodeCommon,
  NodeTemplate,
  EditorNodeTargetKind,
  EditorReservedNodeKey,
  ReservedNodeTargetData,
} from '../../common';
import { generateNodeId } from '../../common/utils/id';
import { EditHandler, EditReturn } from '../types';
import { updateObjectProperty } from '../../utils/object';

export type OpAddNodeParams =
  | {
      kind: 'service-node';
      packageId: string;
      // subPath: string[];
      methodKey: string;
      defaults?: NodeTemplate['defaults'];
      position: {
        x: number;
        y: number;
      };
    }
  | {
      kind: 'injection-node';
      injectionKey: string;
      methodKey: string;
      source: { nodeId: string; subflowKey: string } | null;
      defaults?: NodeTemplate['defaults'];
      position: {
        x: number;
        y: number;
      };
    }
  | {
      kind: 'reserved-node';
      targetData: ReservedNodeTargetData;
      position: {
        x: number;
        y: number;
      };
    }
  | {
      kind: 'flow-node';
      flowId: string;
      position: {
        x: number;
        y: number;
      };
    };

export const opAddNodeHandler = (params: OpAddNodeParams): EditReturn => {
  return {
    updater: (targetFlow, rootFlow) => {
      let nodeId: string | undefined;
      if (
        params.kind === 'service-node' ||
        params.kind === 'injection-node' ||
        params.kind === 'reserved-node' ||
        params.kind === 'flow-node'
      ) {
        let targetData: EditorNodeTargetData;
        if (params.kind === 'service-node') {
          targetData = {
            kind: EditorNodeTargetKind.Predefined,
            packageId: params.packageId,
            // subPath: params.subPath,
            key: params.methodKey,
          };
        } else if (params.kind === 'injection-node') {
          targetData = {
            kind: EditorNodeTargetKind.Injection,
            injectionKey: params.injectionKey,
            key: params.methodKey,
            source: params.source,
          };
        } else if (params.kind === 'flow-node') {
          targetData = {
            kind: EditorNodeTargetKind.Flow,
            flowId: params.flowId,
          };
        } else {
          targetData = {
            kind: EditorNodeTargetKind.Reserved,
            ...params.targetData,
          };
        }
        const node: EditorNodeData = {
          target: targetData,
          subflows: {},
          staticInputs: {},
          destructuringMap: {
            input: {},
            output: {},
          },
          customData: {},
          runModeOverride: null,
          portsVisibilityOverride: {},
          position: params.position,
        };
        if ('defaults' in params && params.defaults) {
          Object.assign(node, params.defaults);
        }
        nodeId = generateNodeId();
        targetFlow.nodes[nodeId] = node;
        return [nodeId];
      }
    },
  };
};

type NodeField = keyof EditorNodeCommon;
type OpUpdateNodeFieldParams<T extends NodeField = NodeField> = {
  nodeId: string;
  key: T;
  value: EditorNodeCommon[T];
};

export const opUpdateNodeField: EditHandler<OpUpdateNodeFieldParams> = (
  params: OpUpdateNodeFieldParams
) => {
  return {
    updater: (targetFlow) => {
      const node = targetFlow.nodes[params.nodeId];
      updateObjectProperty(node, params.key, params.value);
    },
  };
};

type OpUpdateNodeSubsystemEntry = {
  nodeId: string;
  subsystemEntry: string;
};
export const opUpdateNodeSubsystemEntry: EditHandler = (
  params: OpUpdateNodeSubsystemEntry
) => {
  return {
    updater: (targetFlow) => {
      const node = targetFlow.nodes[params.nodeId];
      if ('subsystemEntry' in node.target) {
        node.target.subsystemEntry = params.subsystemEntry;
      }
    },
  };
};

// type OpUpdateUserDefinedNodeInterface = {
//   nodeId: string;
//   interface: NodeInterface;
// };
// export const opUpdateUserDefinedNodeInterface: EditHandler = (
//   params: OpUpdateUserDefinedNodeInterface
// ) => {
//   return {
//     updater: (targetFlow) => {
//       const node = targetFlow.nodes[params.nodeId];
//       if (node.target.kind !== EditorNodeTargetKind.UserDefined) {
//         throw new Error('Only user-defined nodes have custom interface');
//       }
//       node.target.interface = params.interface;
//     },
//   };
// };
