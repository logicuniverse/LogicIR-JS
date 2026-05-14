import {
  EditorFlowInfo,
  EditorFlowData,
  EditorPortType,
  EditorRootFlow,
  FlowInterface,
  Injectable,
  isExecutionConnection,
  isGoBackConnection,
  RunModeKind,
  RunModeOverrideKind,
  EditorNodeTargetKind,
  EditorNodeData,
  getFlowPathKey,
} from '../../common';
import {
  getEditorFlowInfoMap,
  getEditorFlowPortsInfo,
} from '../../common/utils/flow';

import { getNodePortsInfo } from '../../common/utils/node';
import { getAllPortsInfo } from '../../common/utils/port';
import { EditorNodePortsInfo } from '../../common/utils/types';
import { EditContext, FlowPath } from '../types';
import { isConnectionValid } from '../utils/connection';
import { reconcileNode } from './node';

// const getUnifiedNodeTemplate = (context: EditContext,nodeId:string,node:EditorNodeData,) => {
//   let nodeTemplate = context.getNodeTemplate(nodeId, node.target);
//   if (!nodeTemplate && node.target.kind === EditorNodeTargetKind.Injection) {
//     const provisio = editorFlow.provisions[node.target.injectionKey];
//     console.log('found provisio', node, provisio);
//     if (provisio && provisio.isComposite) {
//       nodeTemplate = provisio.items[node.target.key];
//     }
//     console.log('resolved injection node template', nodeTemplate);
//   }
// };

const reconcileSequenceFlow = (
  context: EditContext,
  flow: EditorFlowData,
  flowInfo: EditorFlowInfo
) => {
  const sequenceNodeIds = Object.keys(flow.nodes).filter((nodeId) => {
    const node = flow.nodes[nodeId];
    const nodeTemplate = flowInfo.nodeTemplates[nodeId];
    if (!nodeTemplate) {
      throw new Error(`Node template not found for node ${nodeId}`);
    }
    if (
      nodeTemplate.kind === RunModeKind.Sequence &&
      node.runModeOverride?.kind !== RunModeOverrideKind.Trigger
    ) {
      return true;
    }
    return false;
  });
  Object.keys(flow.sequenceConnections).map((id) => {
    const connection = flow.sequenceConnections[id];
    if (
      isExecutionConnection(connection) &&
      (connection.from === connection.to ||
        (connection.from && !sequenceNodeIds.includes(connection.from)) ||
        (connection.to && !sequenceNodeIds.includes(connection.to)))
    ) {
      delete flow.sequenceConnections[id];
    }
    if (
      isGoBackConnection(connection) &&
      (!sequenceNodeIds.includes(connection.goBackFrom) ||
        !sequenceNodeIds.includes(connection.goBackTo))
    ) {
      delete flow.sequenceConnections[id];
    }
  });
};

const reconcileComponentFlow = (
  context: EditContext,
  flow: EditorFlowData,
  flowInfo: EditorFlowInfo
) => {
  // if (editorFlow.kind !== RunModeKind.Component) {
  //   return;
  // }
  // const componentInputKeys = editorFlow.ports.input
  //   .filter((x) => x.type === EditorPortType.Component)
  //   .map((x) => x.key);
  // const componentOutputKeys = editorFlow.ports.output
  //   .filter((x) => x.type === EditorPortType.Component)
  //   .map((x) => x.key);
  // const componentInputKeys = editorFlow.ports.input
  //   .filter((x) => x.type === EditorPortType.Component)
  //   .map((x) => x.key);
  // const componentNodeIds: string[] = [];
  // Object.entries(flow.nodes).map(([nodeId, node]) => {
  //   const nodeTemplate = context.getNodeTemplate(node.target);
  //   if (nodeTemplate.kind === RunModeKind.Component) {
  //     componentNodeIds.push(nodeId);
  //     if (!flow.componentChildren[nodeId]) {
  //       flow.componentChildren[nodeId] = {};
  //     }
  //     const nodeTemplateComponentInputPorts = nodeTemplate.ports.input.filter(
  //       (x) => x.type === EditorPortType.Component
  //     );
  //     nodeTemplateComponentInputPorts.map((x) => {
  //       if (!flow.componentChildren[nodeId][x.key]) {
  //         flow.componentChildren[nodeId][x.key] = [];
  //       }
  //     });
  //     Object.keys(flow.componentChildren[nodeId])
  //       .filter(
  //         (x) => !nodeTemplateComponentInputPorts.find((c) => c.key === x)
  //       )
  //       .map((x) => {
  //         delete flow.componentChildren[nodeId][x];
  //       });
  //   }
  // });
  // const childrenIds = [...componentNodeIds, ...componentInputKeys];
  // Object.keys(flow.exports).map((k) => {
  //   if (flow.exports[k].children.find((x) => !childrenIds.includes(x))) {
  //     flow.exports[k].children = flow.exports[k].children.filter((x) =>
  //       childrenIds.includes(x)
  //     );
  //   }
  // });
  // Object.values(flow.componentChildren).map((nodeChildren) => {
  //   Object.keys(nodeChildren).map((k) => {
  //     if (nodeChildren[k].find((x) => !childrenIds.includes(x))) {
  //       nodeChildren[k] = nodeChildren[k].filter((x) =>
  //         childrenIds.includes(x)
  //       );
  //     }
  //   });
  // });
};

export const reconcileFlow = (
  context: EditContext,
  flowData: EditorFlowData,
  path: FlowPath
) => {
  const flowInfo = getEditorFlowInfoMap(context, context.editorRootFlow).get(
    getFlowPathKey(path)
  );
  if (!flowInfo) {
    throw new Error(`Flow info not found for path ${path.join(' -> ')}`);
  }
  // const flowData = flowInfo.flowData;
  const flowPortsInfo = getEditorFlowPortsInfo(flowInfo);
  const nodesPortsInfo: Record<string, EditorNodePortsInfo> = {};

  // if ('injectables' in editorFlowInfo) {
  //   allInjectables.push(...editorFlowInfo.injectables);
  //   allInjectables.push({
  //     provider: {
  //       nodeId: editorFlowInfo.path.slice(-1)[0].nodeId,
  //       subflowKey: editorFlowInfo.path.slice(-1)[0].subflowKey,
  //     },
  //     items: dependencies2InjectableItems(
  //       editorFlowInfo.flowInterface.provisions ?? {}
  //     ),
  //   });
  // } else {
  //   allInjectables.push({
  //     provider: null,
  //     items: dependencies2InjectableItems(
  //       editorFlowInfo.editorFlowData.provisions ?? {}
  //     ),
  //   });
  // }
  console.log(
    'flowData before reconciliation',
    JSON.parse(JSON.stringify(flowData)),
    JSON.parse(JSON.stringify(flowInfo))
  );
  Object.entries(flowData.nodes).map(([nodeId, node]) => {
    const nodeTemplate = flowInfo.nodeTemplates[nodeId];
    // if (!nodeTemplate && node.target.kind === EditorNodeTargetKind.Injection) {
    //   const provisio = editorFlow.provisions[node.target.injectionKey];
    //   console.log('found provisio', node, provisio);
    //   if (provisio && provisio.isComposite) {
    //     nodeTemplate = provisio.items[node.target.key];
    //   }
    //   console.log('resolved injection node template', nodeTemplate);
    // }
    if (!nodeTemplate) {
      throw new Error(`Node template not found for node ${nodeId}`);
    }
    reconcileNode(context, nodeId, node, flowData, flowInfo.path, nodeTemplate);
    nodesPortsInfo[nodeId] = getNodePortsInfo(node, nodeTemplate, nodeId);
  });
  const allPortsInfo = getAllPortsInfo(flowPortsInfo, nodesPortsInfo);

  // remove unused connections
  Object.keys(flowData.connections).map((connectionId) => {
    const connection = flowData.connections[connectionId];
    if (!isConnectionValid(allPortsInfo, connection)) {
      console.log('removing invalid connection', connection);
      delete flowData.connections[connectionId];
    }
  });

  //remove unused subflowContainers
  const allSubflowContainerIds = Object.values(flowData.nodes)
    .map((x) => Object.values(x.subflows).map((x) => x.container.id))
    .flat();
  Object.keys(flowData.subflowContainers).map((k) => {
    if (!allSubflowContainerIds.includes(k)) {
      delete flowData.subflowContainers[k];
    }
  });

  // extra reconciliations for sequence and component flows
  if (flowInfo.flowInterface.kind === RunModeKind.Sequence) {
    reconcileSequenceFlow(context, flowData, flowInfo);
  } else if (flowInfo.flowInterface.kind === RunModeKind.Component) {
    reconcileComponentFlow(context, flowData, flowInfo);
  }

  //todo: remove nodes whose template are missing
};
