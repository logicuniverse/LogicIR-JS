import {
  RunModeKind,
  EditorFlowInfoCore,
  NodeTemplate,
  EditorPortType,
  PortDestructuringKind,
} from '../../common/types';
import { CompileContext } from '../types';
import {
  ComponentChild,
  ComponentFlow,
  ComponentNodeChildrenKind,
  ComputeFlow,
  FlowKind,
  NodeCompositions,
  RootCompositions,
  SequenceFlow,
  StateMachineFlow,
} from 'ff-runtime-core';
import {
  editorPortsInfo2ComponentPorts,
  editorPortsInfo2ComputePorts,
  editorPortsInfo2SequencePorts,
  editorPortsInfo2StateMachinePorts,
} from './port';
import { editorConnections2RuntimeConnections } from './connection';
import { getEditorFlowCoreConstants } from './constant';
import { getRuntimeFlowSequenceSteps } from './sequence-steps';
import { editorFlow2RuntimeNodes } from './node';
import { getEditorFlowPortsInfo } from '../../common/utils/flow';

const editorFlow2RuntimeFlowCommon = async (
  context: CompileContext,
  editorFlow: EditorFlowInfoCore,
  skipConstants = false
) => {
  const nodes = await editorFlow2RuntimeNodes(context, editorFlow);
  // console.log('Nodes converted to runtime nodes:', editorFlow);
  const constants = skipConstants
    ? {}
    : await getEditorFlowCoreConstants(context, editorFlow);

  const connections = editorConnections2RuntimeConnections(
    editorFlow.flowData.connections
  );

  return {
    constants,
    connections,
    nodes,
  };
};

export const editorComputeFlowCore2RuntimeFlow = async (
  context: CompileContext,
  flowInfo: EditorFlowInfoCore
): Promise<ComputeFlow> => {
  const { constants, connections, nodes } = await editorFlow2RuntimeFlowCommon(
    context,
    flowInfo
  );
  const portsInfo = getEditorFlowPortsInfo(flowInfo);
  const ports = editorPortsInfo2ComputePorts(portsInfo);
  return {
    kind: FlowKind.Compute,
    connections,
    constants,
    computeNodes: nodes.computeNodes,
    ports,
  };
};

export const editorStateMachineFlowCore2RuntimeFlow = async (
  context: CompileContext,
  flowInfo: EditorFlowInfoCore,
  skipConstants = false
): Promise<StateMachineFlow> => {
  const { constants, connections, nodes } = await editorFlow2RuntimeFlowCommon(
    context,
    flowInfo,
    skipConstants
  );
  const portsInfo = getEditorFlowPortsInfo(flowInfo);
  const ports = editorPortsInfo2StateMachinePorts(portsInfo);
  return {
    kind: FlowKind.StateMachine,
    connections,
    constants,
    ports,
    computeNodes: nodes.computeNodes,
    stateMachineNodes: nodes.stateMachineNodes,
    triggerNodes: nodes.triggerNodes,
    componentNodes: nodes.componentNodes,
  };
};

export const editorSequenceFlowCore2RuntimeFlow = async (
  context: CompileContext,
  flowInfo: EditorFlowInfoCore
): Promise<SequenceFlow> => {
  const { constants, connections, nodes } = await editorFlow2RuntimeFlowCommon(
    context,
    flowInfo
  );
  const portsInfo = getEditorFlowPortsInfo(flowInfo);
  const ports = editorPortsInfo2SequencePorts(portsInfo);

  return {
    kind: FlowKind.Sequence,
    connections,
    constants,
    ports,
    computeNodes: nodes.computeNodes,
    stateMachineNodes: nodes.stateMachineNodes,
    triggerNodes: nodes.triggerNodes,
    sequenceSteps: getRuntimeFlowSequenceSteps(flowInfo),
    sequenceNodes: nodes.sequenceNodes,
  };
};

// export const traverseComponents = (
//   components: ComponentChild[],
//   handler: (
//     params: ComponentChild // subsystem?: Subsystem }
//   ) => void
// ) => {
//   components.map((component) => {
//     if (typeof component === 'string') {
//       handler(component);
//     } else {
//       handler(component);
//       if (component.children) {
//         Object.values(component.children).forEach((children) =>
//           traverseComponents(children, handler)
//         );
//       }
//     }
//   });
// };

export const editorComponentFlowCore2RuntimeFlow = async (
  context: CompileContext,
  flowInfo: EditorFlowInfoCore
): Promise<ComponentFlow> => {
  const { flowData, nodeTemplates, flowInterface } = flowInfo;
  if (flowInterface.kind !== RunModeKind.Component) {
    throw new Error(
      'Flow interface kind must be Component for editorComponentFlowCore2RuntimeFlow'
    );
  }
  const { constants, connections, nodes } = await editorFlow2RuntimeFlowCommon(
    context,
    flowInfo
  );
  const portsInfo = getEditorFlowPortsInfo(flowInfo);
  const ports = editorPortsInfo2ComponentPorts(portsInfo);
  const rootCompositions: RootCompositions = {};
  const nodeCompositions: NodeCompositions = {};

  const updateNodeComposition = (nodeId: string) => {
    if (nodeCompositions[nodeId]) {
      return;
    }
    nodeCompositions[nodeId] = {};
    const editorNode = flowInfo.flowData.nodes[nodeId];
    const nodeTemplate = nodeTemplates[nodeId];
    nodeTemplate.ports.input
      .filter((x) => x.type === EditorPortType.Component)
      .forEach((inputPort) => {
        const destructuringKind =
          nodeTemplate.portsDestructuringAllowed?.input?.[inputPort.key];
        if (!destructuringKind) {
          const connection = Object.values(flowData.componentConnections).find(
            (x) =>
              x.to.nodeId === nodeId &&
              x.to.key === inputPort.key &&
              x.to.pinKey === null
          );
          if (connection) {
            if (connection.from.nodeId) {
              updateNodeComposition(connection.from.nodeId);
            }
            nodeCompositions[nodeId][inputPort.key] = {
              kind: ComponentNodeChildrenKind.Single,
              child: {
                nodeId: connection.from.nodeId,
                key: connection.from.key,
              },
            };
          }
        } else if (destructuringKind === PortDestructuringKind.Array) {
          const destructuring =
            editorNode.destructuringMap.input[inputPort.key] || 0;
          if (typeof destructuring !== 'number') {
            throw new Error('Invalid destructuring for array port');
          }
          const result: ComponentChild[] = [];
          for (let i = 0; i < destructuring; i++) {
            const connection = Object.values(
              flowData.componentConnections
            ).find(
              (x) =>
                x.to.nodeId === nodeId &&
                x.to.key === inputPort.key &&
                x.to.pinKey === i
            );
            if (connection) {
              if (connection.from.nodeId) {
                updateNodeComposition(connection.from.nodeId);
              }
              result[i] = {
                nodeId: connection.from.nodeId,
                key: connection.from.key,
              };
            } else {
              result[i] = null;
            }
          }
          nodeCompositions[nodeId][inputPort.key] = {
            kind: ComponentNodeChildrenKind.Array,
            children: result,
          };
        } else {
          const destructuring =
            editorNode.destructuringMap.input[inputPort.key] || [];
          if (!Array.isArray(destructuring)) {
            throw new Error('Invalid destructuring for object port');
          }
          const result: Record<string, ComponentChild> = {};
          for (const key of destructuring) {
            const connection = Object.values(
              flowData.componentConnections
            ).find(
              (x) =>
                x.to.nodeId === nodeId &&
                x.to.key === inputPort.key &&
                x.to.pinKey === key
            );
            if (connection) {
              if (connection.from.nodeId) {
                updateNodeComposition(connection.from.nodeId);
              }
              result[key as string] = {
                nodeId: connection.from.nodeId,
                key: connection.from.key,
              };
            } else {
              result[key as string] = null;
            }
          }
          nodeCompositions[nodeId][inputPort.key] = {
            kind: ComponentNodeChildrenKind.Object,
            children: result,
          };
        }
      });
  };

  // root compositions
  for (const returnItem of flowInterface.ports.return) {
    const connection = Object.values(flowData.componentConnections).find(
      (x) => x.to.key === returnItem.key && x.to.nodeId === null
    );
    if (connection && connection.from.nodeId) {
      updateNodeComposition(connection.from.nodeId);
    }
    rootCompositions[returnItem.key] = connection
      ? {
          nodeId: connection.from.nodeId,
          key: connection.from.key,
        }
      : null;
  }

  return {
    kind: FlowKind.Component,
    connections,
    constants,
    ports,
    computeNodes: nodes.computeNodes,
    stateMachineNodes: nodes.stateMachineNodes,
    triggerNodes: nodes.triggerNodes,
    rootCompositions,
    nodeCompositions,
    componentNodes: nodes.componentNodes,
  };
};

export const editorFlow2RuntimeFlow = (
  context: CompileContext,
  flowInfo: EditorFlowInfoCore
  // nodeTemplates: Record<string, NodeTemplate>
) => {
  if (flowInfo.flowInterface.kind === RunModeKind.Component) {
    return editorComponentFlowCore2RuntimeFlow(
      context,
      flowInfo
      // nodeTemplates
    );
  } else if (flowInfo.flowInterface.kind === RunModeKind.Compute) {
    return editorComputeFlowCore2RuntimeFlow(context, flowInfo);
  } else if (flowInfo.flowInterface.kind === RunModeKind.Sequence) {
    return editorSequenceFlowCore2RuntimeFlow(context, flowInfo);
  } else {
    return editorStateMachineFlowCore2RuntimeFlow(
      context,
      flowInfo
      // nodeTemplates
    );
  }
};
