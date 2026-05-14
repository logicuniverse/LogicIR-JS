import {
  EditorFlowData,
  EditorNodeData,
  generateSubflowContainerId,
  getSubflowKey,
  Injectable,
  NodeTemplate,
  RunModeKind,
} from '../../common';
import { EditContext, FlowPath } from '../types';
import { createEmptyEditorFlowData } from '../utils/flow';
import { reconcileFlow } from './flow';

export const reconcileNode = (
  context: EditContext,
  nodeId: string,
  node: EditorNodeData,
  flow: EditorFlowData,
  path: FlowPath,
  nodeTemplate: NodeTemplate
) => {
  // const nodeTemplate = context.getNodeTemplate(nodeId, node.target);
  // if (!nodeTemplate) {
  //   throw new Error(`Node template not found for node ${nodeId}`);
  // }
  // const provisions = node.provides || {};
  // const availableSubflowKeys: string[] = [];
  // Object.entries(provisions).map(([key, provision]) => {
  //   if (provision.isComposite) {
  //     Object.entries(provision.items).map(([itemKey, item]) => {
  //       if (item.kind === CompositeProvisionKind.Subflow) {
  //         availableSubflowKeys.push(item.subflowKey);
  //       }
  //     });
  //   }
  // });
  //remove unused subflows
  Object.keys(node.subflows).map((subflowKey) => {
    const subflowData = node.subflows[subflowKey];
    if (subflowData.target) {
      const dep = nodeTemplate.dependencies?.[subflowData.target.serviceKey];
      if (
        !dep ||
        !dep.isComposite ||
        !dep.items[subflowData.target.methodKey]
      ) {
        delete node.subflows[subflowKey];
      }
    }
  });

  // create empty subflows if not optional
  Object.entries(nodeTemplate.dependencies ?? {}).map(([depKey, dep]) => {
    if (dep.isComposite) {
      // if (!node.provides[depKey]) {
      //   node.provides[depKey] = {
      //     isComposite: true,
      //     items: {},
      //   };
      // }

      Object.entries(dep.items).map(([flowKey, flowInterface]) => {
        const subflowKey = getSubflowKey(depKey, flowKey);
        if (!flowInterface.isOptional && !node.subflows[subflowKey]) {
          const id = generateSubflowContainerId();
          node.subflows[subflowKey] = {
            flow: createEmptyEditorFlowData(),
            container: {
              id,
              isCollapsed: false,
            },
            target: {
              serviceKey: depKey,
              methodKey: flowKey,
            },
          };
          flow.subflowContainers[id] = {
            position: {
              x: node.position.x - 200,
              y: node.position.y + 200,
            },
          };
          // node.provides[depKey].items[flowKey] = {
          //   kind: CompositeProvisionKind.Subflow,
          //   subflowKey,
          // };
        }
        // deep reconciliation
        if (node.subflows[subflowKey]) {
          reconcileFlow(context, node.subflows[subflowKey].flow, [
            ...path,
            {
              nodeId: nodeId,
              subflowKey: subflowKey,
            },
          ]);
        }
      });
    }
  });

  // remove unused destructuringMap
  Object.keys(node.destructuringMap.input).map((key) => {
    if (!nodeTemplate.ports.input.find((x) => x.key === key)) {
      delete node.destructuringMap.input[key];
    }
  });
  Object.keys(node.destructuringMap.output).map((key) => {
    if (!nodeTemplate.ports.output.find((x) => x.key === key)) {
      delete node.destructuringMap.output[key];
    }
  });
  if (
    !(
      nodeTemplate.kind === RunModeKind.Compute ||
      nodeTemplate.kind === RunModeKind.Sequence
    ) &&
    node.destructuringMap.return
  ) {
    node.destructuringMap.return = undefined;
  }
};
