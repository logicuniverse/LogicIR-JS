import {
  CoreContext,
  EditorNodeDataCore,
  EditorNodeTargetData,
  EditorNodeTargetKind,
  EditorPortType,
  EditorReservedNodeKey,
  EditorReservedPortKey,
  EditorRootFlowCore,
  NodeInterface,
  RunModeKind,
  RunModeOverrideKind,
} from '../types';
import { getPortId } from './id';
import { getEditorComponentRootFlowSubsystems } from './subsystem';
import { EditorNodePortsInfo } from './types';

// export const getEditorNodeInterface = async (
//   context: CoreContext,
//   targetData: EditorNodeTargetData,
//   rootFlow: EditorRootFlowCore
// ) => {
//   let nodeInterface: NodeInterface;
//   if (targetData.kind === EditorNodeTemplateKind.Predefined) {
//     nodeInterface = await context.getPredefinedNodeInterface(
//       targetData.target,
//       targetData.subsystemEntry
//     );
//   } else if (targetData.kind === EditorNodeTemplateKind.Flow) {
//     const rootFlow = await context.getFlow(targetData.flowId);
//     if (rootFlow.kind === RunModeKind.Component && targetData.subsystemEntry) {
//       nodeInterface =
//         getEditorComponentRootFlowSubsystems(rootFlow)[
//           targetData.subsystemEntry
//         ];
//     } else {
//       nodeInterface = rootFlow;
//     }
//   } else if (targetData.kind === EditorNodeTemplateKind.Slot) {
//     nodeInterface = rootFlow.slots.find((x) => x.key === targetData.slotKey)!;
//   } else if (targetData.kind === EditorNodeTemplateKind.ServiceMethod) {
//     nodeInterface = await context.getServiceMethodInterface(
//       targetData.serviceKey,
//       targetData.methodKey
//     );
//   } else {
//     // template.kind === EditorNodeTemplateKind.UserDefined
//     nodeInterface = targetData.interface;
//   }
//   return nodeInterface;
// };

export const getNodePortsInfo = (
  node: EditorNodeDataCore,
  nodeInterface: NodeInterface,
  nodeId: string
) => {
  const isCompileTime =
    node.runModeOverride?.kind === RunModeOverrideKind.CompileTime;
  const portsInfo: EditorNodePortsInfo = {
    inputs: [],
    outputs: [],
    subFlows: {},
    dependencies: {},
  };
  nodeInterface.ports.input.map((x) =>
    portsInfo.inputs.push({
      ...x,
      id: getPortId(false, {
        key: x.key,
        parent: { nodeId, subflowKey: null },
      }),
      destructuringData: node.destructuringMap.input[x.key] ?? null,
      isConstant: isCompileTime,
    })
  );
  nodeInterface.ports.output.map((x) =>
    portsInfo.outputs.push({
      ...x,
      id: getPortId(true, {
        key: x.key,
        parent: { nodeId, subflowKey: null },
      }),
      destructuringData: node.destructuringMap.output[x.key] ?? null,
      isConstant: isCompileTime,
    })
  );
  Object.entries(nodeInterface.dependencies ?? {}).map(([key, dep]) => {
    portsInfo.dependencies[key] = {
      id: getPortId(false, { key, parent: { nodeId, subflowKey: null } }),
      key,
      type: EditorPortType.Data,
      destructuringData: null,
    };
  });
  Object.entries(node.subflows).map(([subflowKey, subflow]) => {
    portsInfo.subFlows[subflowKey] = {
      inputs: subflow.flow.ports.input.map((p) => ({
        ...p,
        id: getPortId(false, { key: p.key, parent: { nodeId, subflowKey } }),
        destructuringData: null,
        isConstant: isCompileTime,
      })),
      outputs: subflow.flow.ports.output.map((p) => ({
        ...p,
        id: getPortId(true, { key: p.key, parent: { nodeId, subflowKey } }),
        destructuringData: null,
      })),
    };
    if (subflow.hookEvent) {
      portsInfo.subFlows[subflowKey].outputs.unshift({
        key: EditorReservedPortKey.HookEvent,
        type: EditorPortType.Stream,
        id: getPortId(true, {
          key: EditorReservedPortKey.HookEvent,
          parent: { nodeId, subflowKey },
        }),
        destructuringData: null,
      });
    }
  });

  // return port
  if (
    nodeInterface.kind === RunModeKind.Compute ||
    nodeInterface.kind === RunModeKind.Sequence
  ) {
    let isStream = false;
    if (
      (nodeInterface.kind === RunModeKind.Sequence &&
        nodeInterface.isAsync &&
        node.runModeOverride?.kind !== RunModeOverrideKind.Awaited) ||
      node.runModeOverride?.kind === RunModeOverrideKind.Trigger
    ) {
      isStream = true;
    }

    portsInfo.outputs.unshift({
      type: isStream ? EditorPortType.Stream : EditorPortType.Data,
      id: getPortId(true, {
        key: EditorReservedPortKey.Return,
        parent: {
          nodeId,
          subflowKey: null,
        },
      }),
      key: EditorReservedPortKey.Return,
      destructuringData: node.destructuringMap.return ?? null,
      displayName: '➔',
      isConstant: isCompileTime,
    });
  }

  if (node.runModeOverride?.kind === RunModeOverrideKind.Trigger) {
    if (
      !(
        nodeInterface.kind === RunModeKind.Compute ||
        nodeInterface.kind === RunModeKind.Sequence
      )
    ) {
      throw new Error(
        'Only compute or sequence nodes can run as trigger nodes'
      );
    }
    const triggerKey = node.runModeOverride.triggerKey;
    const triggerPort = portsInfo.inputs.find((x) => x.key === triggerKey)!;
    triggerPort.type = EditorPortType.Stream;
    triggerPort.isTrigger = true;
  }
  return portsInfo;
};

// export const isAwaitNode = (target: EditorNodeTargetData): boolean => {
//   return (
//     target.kind === EditorNodeTargetKind.Predefined &&
//     target.target === EditorReservedNodeKey.Await
//   );
// };

export const isReturnIfNode = (target: EditorNodeTargetData): boolean => {
  return (
    target.kind === EditorNodeTargetKind.Reserved &&
    target.target === EditorReservedNodeKey.ReturnIf
  );
};

export const isGoBackIfNode = (target: EditorNodeTargetData): boolean => {
  return (
    target.kind === EditorNodeTargetKind.Reserved &&
    target.target === EditorReservedNodeKey.GoBackIf
  );
};

export const isNodeAwaiting = (
  nodeData: EditorNodeDataCore,
  nodeInterface: NodeInterface
): boolean => {
  return (
    nodeInterface.kind === RunModeKind.Sequence &&
    nodeData.runModeOverride?.kind === RunModeOverrideKind.Awaited &&
    !!nodeInterface.isAsync
  );
};
