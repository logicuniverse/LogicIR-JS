import {
  EditorFlowData,
  EditorNodeData,
  EditorRootFlow,
  RunModeKind,
} from '../../common';
import { FlowPath } from '../types';

export const getTargetFlowDataByPath = (
  editorRootFlow: EditorRootFlow,
  flowPath: FlowPath
) => {
  let currentNode: EditorNodeData | null = null;
  let currentFlow: EditorFlowData = editorRootFlow;
  let subflowKey: string | null = null;
  for (const path of flowPath) {
    currentNode = currentFlow.nodes[path.nodeId];
    if (!currentNode) {
      throw new Error(`Can not find ${path.nodeId}`);
    }
    const subflows = currentNode.subflows;
    subflowKey = path.subflowKey;
    const subFlow = subflows[subflowKey];
    if (!subFlow) {
      throw new Error(`Can not find ${path.nodeId} ${path.subflowKey}`);
    }
    currentFlow = subFlow.flow;
  }
  return currentFlow;
};

// export const getTargetFlowInfoByPath = (
//   context: EditContext,
//   flowPath: FlowPath
// ) => {
//   if (flowPath.length === 0) {
//     return {
//       editorFlowData: context.editorRootFlow,
//       flowInterface: null,
//     };
//   }
//   let currentNode: EditorNodeData | null = null;
//   let currentFlow: EditorFlowData = context.editorRootFlow;
//   let subflowKey: string | null = null;
//   let flowInterface: FlowInterface | undefined;
//   for (const path of flowPath) {
//     currentNode = currentFlow.nodes[path.nodeId];
//     if (!currentNode) {
//       throw new Error(`Can not find ${path.nodeId}`);
//     }
//     const nodeTemplate = context.getNodeTemplate(
//       path.nodeId,
//       currentNode.target
//     );
//     if (!nodeTemplate) {
//       throw new Error(`Can not find template for node ${path.nodeId}`);
//     }
//     const subflows = currentNode.subflows;
//     subflowKey = path.subflowKey;
//     const subFlow = subflows[subflowKey];
//     if (!subFlow) {
//       throw new Error(`Can not find ${path.nodeId} ${path.subflowKey}`);
//     }
//     const dependencies = nodeTemplate.dependencies ?? {};

//     // const provides = currentNode.provides ?? {};
//     // let key: { injectionKey: string; serviceMethod: string } | undefined;
//     // console.log('provides', provides);
//     // Object.entries(provides).map(([k, provision]) => {
//     //   if (provision.isComposite) {
//     //     Object.entries(provision.items).map(([itemKey, item]) => {
//     //       if (
//     //         item.kind === CompositeProvisionKind.Subflow &&
//     //         item.subflowKey === subflowKey
//     //       ) {
//     //         key = { injectionKey: k, serviceMethod: itemKey };
//     //       }
//     //     });
//     //   }
//     // });
//     let flowInterface: FlowInterface | undefined;
//     if (subFlow.target) {
//       const injection = dependencies[subFlow.target?.serviceKey];
//       if (injection && injection.isComposite) {
//         flowInterface = injection.items[subFlow.target.methodKey];
//       }
//     }
//     if (!flowInterface) {
//       throw new Error(
//         `Can not find slot interface for ${path.nodeId} ${path.subflowKey}`
//       );
//     }
//     currentFlow = subFlow.flow;
//   }
//   return { editorFlowData: currentFlow, flowInterface: flowInterface! };
// };

export const createEmptyEditorFlowData = (): EditorFlowData => {
  const flow: EditorFlowData = {
    nodes: {},
    connections: {},
    subflowContainers: {},
    groups: {},
    ports: {
      input: [],
      output: [],
    },
    metaPorts: {},
    sequenceConnections: {},
    componentConnections: {},
  };
  return flow;
};

export const createEmptyEditorRootFlow = (
  kind: RunModeKind
): EditorRootFlow => {
  const flowData = createEmptyEditorFlowData();
  const result: EditorRootFlow = {
    ...flowData,
    kind,
    dependencies: {},
    componentReturn: [],
  };
  return result;
};
