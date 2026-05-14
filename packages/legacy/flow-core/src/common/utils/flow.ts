import {
  RunModeKind,
  EditorPortType,
  EditorReservedPortKey,
  EditorFlowInfoCore,
  EditorFlowData,
  EditorRootFlow,
  EditorNodeTargetKind,
  NodeTemplate,
  Injectable,
  EditorFlowInfo,
  FlowInterface,
  EditorNodeTargetData,
  CoreContext,
} from '../types';
import { EditorPortsInfo } from './types';
import {
  getFlowPathKey,
  getInjectablePortKey,
  getInjectableSourceKey,
  getPortId,
} from './id';
import { reservedNodeTemplates } from '../../nodes';
import { dependencies2InjectableItems } from './injectable';
import { FlowPath } from '../../edit';

// export const getUnifiedEditorFlow = <T extends boolean>(flowInfo: {
//   editorFlowData: EditorFlowData<T>;
//   flowInterface: FlowInterface;
//   injectables: Injectable[];
//   path: FlowPath;
// }): EditorFlowInfo<T> => {
//   return {
//     path: flowInfo.path,
//     injectables: flowInfo.injectables,
//     returnVoid:
//       flowInfo.flowInterface.kind === RunModeKind.Sequence &&
//       flowInfo.flowInterface.returnVoid,
//     kind: flowInfo.flowInterface.kind,
//     provisions: flowInfo.flowInterface.provisions ?? {},
//     componentReturn:
//       flowInfo.flowInterface.kind === RunModeKind.Component
//         ? flowInfo.flowInterface.ports.return
//         : [],
//     ...flowInfo.editorFlowData,
//     ports: {
//       input: [
//         ...flowInfo.flowInterface.ports.input,
//         ...flowInfo.editorFlowData.ports.input,
//       ],
//       output: [
//         ...flowInfo.flowInterface.ports.output,
//         ...flowInfo.editorFlowData.ports.output,
//       ],
//     },
//   };

// if (flowInterface.kind === RunModeKind.Compute) {
//   const flowData = editorFlowData as EditorComputeFlowData;
//   const flow: EditorComputeFlow = {
//     ...flowData,
//     kind: RunModeKind.Compute,
//     services: flowInterface.services,
//   };
//   flow.ports.input.unshift(...flowInterface.ports.input);
//   flow.ports.output.unshift(...flowInterface.ports.output);
//   return flow;
// } else if (flowInterface.kind === RunModeKind.Sequence) {
//   const flowData = editorFlowData as EditorSequenceFlowData;
//   const flow: EditorSequenceFlow = {
//     ...flowData,
//     kind: RunModeKind.Sequence,
//     services: flowInterface.services,
//   };
//   flow.ports.input.unshift(...flowInterface.ports.input);
//   flow.ports.output.unshift(...flowInterface.ports.output);
//   return flow;
// } else if (flowInterface.kind === RunModeKind.StateMachine) {
//   const flowData = editorFlowData as EditorStateMachineFlowData;
//   const flow: EditorStateMachineFlow = {
//     ...flowData,
//     kind: RunModeKind.StateMachine,
//     services: flowInterface.services,
//   };
//   flow.ports.input.unshift(...flowInterface.ports.input);
//   flow.ports.output.unshift(...flowInterface.ports.output);
//   return flow;
// } else {
//   //RunModeKind.Component
//   const flowData = editorFlowData as EditorComponentFlowData;
//   const flow: EditorComponentFlow = {
//     ...flowData,
//     kind: RunModeKind.Component,
//     componentInput: flowInterface.componentInput,
//     componentOutput: flowInterface.componentOutput,
//     services: flowInterface.services,
//   };
//   flow.ports.input.unshift(...flowInterface.ports.input);
//   flow.ports.output.unshift(...flowInterface.ports.output);
//   return flow;
// }
// };

// export const isSequenceFlow = (
//   flowData: EditorFlowDataCore
// ): flowData is EditorSequenceFlowDataCore => {
//   return !!(flowData as any).sequenceConnections;
// };

// export const isComponentFlow = (
//   flowData: EditorFlowDataCore
// ): flowData is EditorComponentFlowDataCore => {
//   return !!(flowData as any).componentTrees;
// };

// export const isComputeFlow = (
//   flowData: EditorFlowDataCore
// ): flowData is EditorComputeFlowDataCore => {
//   return (flowData as any).stateMachineNodeOrders === undefined;
// };

// export const isStateMachineFlow = (
//   flowData: EditorFlowDataCore
// ): flowData is EditorStateFlowDataCore => {
//   return !(
//     isComponentFlow(flowData) ||
//     isComputeFlow(flowData) ||
//     isSequenceFlow(flowData)
//   );
// };

// export const isRootFlow = (
//   flowData: EditorFlowDataCore | EditorRootFlowCore
// ): flowData is EditorRootFlowCore => {
//   return !!(flowData as any).kind;
// };

// export const getComponentFlowExports = (
//   flow: EditorFlowDataCore
// ): Record<string, ComponentChild[]> => {
//   const { exports: exportChildren, componentChildren } = flow;
//   const result: Record<string, ComponentChild[]> = {};
//   const getComponentChildren = (children: string[]): ComponentChild[] => {
//     const result: ComponentChild[] = [];
//     children.map((x) => {
//       const nodeChildren = componentChildren[x];
//       if (!nodeChildren) {
//         //component input
//         result.push(x);
//       } else {
//         const component: Component = {
//           nodeId: x,
//           children: {},
//         };
//         Object.entries(nodeChildren).map(([key, value]) => {
//           component.children![key] = getComponentChildren(value);
//         });
//       }
//     });
//     return result;
//   };

//   Object.entries(exportChildren).map(([key, exportItem]) => {
//     result[key] = getComponentChildren(exportItem.children);
//   });
//   return result;
// };

export const getEditorFlowPortsInfo = (
  editorFlow: EditorFlowInfoCore
): EditorPortsInfo => {
  const result: EditorPortsInfo = {
    inputs: [],
    outputs: [],
  };
  const inputPorts = [
    ...editorFlow.flowInterface.ports.input,
    ...editorFlow.flowData.ports.input,
  ];
  const outputPorts = [
    ...editorFlow.flowInterface.ports.output,
    ...editorFlow.flowData.ports.output,
  ];

  const flowInterface = editorFlow.flowInterface;
  // map ports
  inputPorts.map((x) => {
    result.inputs.push({
      key: x.key,
      type: x.type,
      displayName: x.displayName,
      description: x.description,
      // template: params.flowInterface?.ports.input.find((p) => p.key === x.key)
      //   ? EditorFlowPortTemplateType.Predefiend
      //   : EditorFlowPortTemplateType.Custom,
      id: getPortId(true, { key: x.key, parent: null }),
      destructuringData: null, // editorFlow.destructuringMap.input[x.key] ?? null,
    });
  });
  outputPorts.map((x) => {
    result.outputs.push({
      key: x.key,
      type: x.type,
      displayName: x.displayName,
      description: x.description,
      // template: params.flowInterface?.ports.output.find((p) => p.key === x.key)
      //   ? EditorFlowPortTemplateType.Predefiend
      //   : EditorFlowPortTemplateType.Custom,
      id: getPortId(false, { key: x.key, parent: null }),
      destructuringData: null, // editorFlow.destructuringMap.output[x.key] ?? null,
    });
  });
  //return
  if (
    flowInterface.kind === RunModeKind.Compute ||
    (flowInterface.kind === RunModeKind.Sequence && !flowInterface.returnVoid)
  ) {
    result.outputs.unshift({
      id: getPortId(false, { key: EditorReservedPortKey.Return, parent: null }),
      destructuringData: null, //editorFlow.destructuringMap.return ?? null,
      type: EditorPortType.Data,
      key: EditorReservedPortKey.Return,
      displayName: '➔',
    });
  }
  if (editorFlow.flowInterface.kind === RunModeKind.Component) {
    editorFlow.flowInterface.ports.return.map((x) => {
      result.outputs.push({
        id: getPortId(false, { key: x.key, parent: null }),
        type: EditorPortType.Component,
        key: x.key,
        displayName: x.displayName,
        description: x.description,
        destructuringData: null, //editorFlow.destructuringMap.return?.[x.key]  ?? null,
      });
    });
  }
  // add meta
  if (editorFlow.flowData.metaPorts.flowMeta) {
    result.inputs.push({
      key: EditorReservedPortKey.FlowMeta,
      type: EditorPortType.Data,
      // template: EditorFlowPortTemplateType.Meta,
      id: getPortId(true, {
        key: EditorReservedPortKey.FlowMeta,
        parent: null,
      }),
      destructuringData: null, //
      // editorFlow.destructuringMap.input[EditorReservedPortKey.FlowMeta] ??
      // null,
    });
  }
  if (flowInterface.kind !== RunModeKind.Compute) {
    if (editorFlow.flowData.metaPorts.onReady) {
      result.inputs.push({
        key: EditorReservedPortKey.OnReady,
        type: EditorPortType.Stream,
        // template: EditorFlowPortTemplateType.Meta,
        id: getPortId(true, {
          key: EditorReservedPortKey.OnReady,
          parent: null,
        }),
        destructuringData: null, //
        // editorFlow.destructuringMap.input[EditorReservedPortKey.OnReady] ??
        // null,
      });
    }
    if (editorFlow.flowData.metaPorts.onError) {
      result.inputs.push({
        key: EditorReservedPortKey.OnError,
        type: EditorPortType.Stream,
        // template: EditorFlowPortTemplateType.Meta,
        id: getPortId(true, {
          key: EditorReservedPortKey.OnError,
          parent: null,
        }),
        destructuringData: null, //
        // editorFlow.destructuringMap.input[EditorReservedPortKey.OnError] ??
        // null,
      });
    }
    if (editorFlow.flowData.metaPorts.onExit) {
      result.inputs.push({
        key: EditorReservedPortKey.OnExit,
        type: EditorPortType.Stream,
        // template: EditorFlowPortTemplateType.Meta,
        id: getPortId(true, {
          key: EditorReservedPortKey.OnExit,
          parent: null,
        }),
        destructuringData: null, //
        // editorFlow.destructuringMap.input[EditorReservedPortKey.OnExit] ??
        // null,
      });
    }
  }
  // const allInjectables = getEditorFlowAllInjectables(editorFlow);

  editorFlow.injectables.map((inj) => {
    Object.entries(inj.items).forEach(([key, item]) => {
      if (item.service) {
        const portKey = getInjectablePortKey(inj.provider, key);
        result.inputs.push({
          key: portKey,
          type: EditorPortType.Data,
          id: getPortId(true, { key: portKey, parent: null }),
          displayName: item.displayName,
          destructuringData: null,
          isConstant: true,
        });
      }
    });
  });
  // Object.entries(editorFlow.provisions).forEach(([key, prov]) => {
  //   const lastPath = editorFlow.path ? editorFlow.path.slice(-1)[0] : null;
  //   const portKey = getInjectablePortKey(lastPath, key);
  //   result.inputs.push({
  //     key: portKey,
  //     type: EditorPortType.Data,
  //     id: getPortId(true, { key: portKey, parent: null }),
  //     displayName: prov.displayName ?? key,
  //     destructuringData: null,
  //     isConstant: true,
  //   });
  // });
  return result;
};

// export const isEditorFlowAsync = (
//   context: CoreContext,
//   editorFlow: EditorFlowDataCore
// ): boolean => {
//   for (const [nodeId, node] of Object.entries(editorFlow.nodes)) {
//     const nodeTemplate = context.getNodeTemplate(nodeId, node.target);
//     if (!nodeTemplate) {
//       throw new Error(`Node template not found for ${nodeId}`);
//     }
//     if (isNodeAwaiting(node, nodeTemplate)) {
//       return true;
//     }
//   }
//   return false;
// };

// export const traverseEditorRootFlow = <HasExtra extends boolean>(
//   flow: EditorRootFlow<HasExtra>,
//   handler: (
//     currentFlow: EditorFlowData<HasExtra>,
//     currentPath: { nodeId: string; subflowKey: string }[],
//     flowInterface: FlowInterface
//   ) => void
// ) => {
//   traverseEditorFlow(flow, [], handler);
// };

// const traverseEditorFlow = <HasExtra extends boolean>(
//   val: {
//     flowData: EditorFlowData<HasExtra>;
//     path: { nodeId: string; subflowKey: string }[];
//   },
//   handler: (val: {
//     flowData: EditorFlowData<HasExtra>;
//     path: { nodeId: string; subflowKey: string }[];
//   }) => void
// ) => {
//   handler(val);
//   for (const [nodeId, nodeData] of Object.entries(val.flowData.nodes)) {
//     for (const [subflowKey, subflowData] of Object.entries(nodeData.subflows)) {
//       traverseEditorFlow(
//         {
//           flowData: subflowData.flow,
//           path: [...val.path, { nodeId, subflowKey }],
//         },
//         handler
//       );
//     }
//   }
// };

export const editorRootFlow2FlowInterface = (
  rootFlow: EditorRootFlow<false>
): FlowInterface => {
  if (rootFlow.kind === RunModeKind.Sequence) {
    return {
      kind: RunModeKind.Sequence,
      ports: {
        input: [],
        output: [],
      },
      dependencies: rootFlow.dependencies,
    };
  } else if (rootFlow.kind === RunModeKind.Compute) {
    return {
      kind: RunModeKind.Compute,
      ports: {
        input: [],
        output: [],
      },
      dependencies: rootFlow.dependencies,
    };
  } else if (rootFlow.kind === RunModeKind.StateMachine) {
    return {
      kind: RunModeKind.StateMachine,
      ports: {
        input: [],
        output: [],
      },
      dependencies: rootFlow.dependencies,
    };
  } else {
    return {
      kind: RunModeKind.Component,
      ports: {
        input: [],
        output: [],
        return: rootFlow.componentReturn,
      },
      dependencies: rootFlow.dependencies,
    };
  }
};

export const editorRootFlow2NodeTemplate = (
  rootFlow: EditorRootFlow<true>
): NodeTemplate => {
  const flowInterface = editorRootFlow2FlowInterface(rootFlow);
  flowInterface.ports.input.push(...(rootFlow.ports.input as any));
  flowInterface.ports.output.push(...(rootFlow.ports.output as any));
  const template: NodeTemplate = {
    ...flowInterface,
    dependencies: rootFlow.dependencies,
  };
  return template;
};

export const getEditorFlowInfoMap = <HasExtra extends boolean>(
  context: CoreContext,
  rootFlow: EditorRootFlow<HasExtra>
): Map<string, EditorFlowInfo<HasExtra>> => {
  const flowInfoMap = new Map<string, EditorFlowInfo<HasExtra>>();

  const injectablesMap = new Map<string, Injectable>();

  // const allNodeTemplates: Record<string, NodeTemplate> = {};
  // const result: EditorRootFlowInfo<HasExtra> = {
  //   nodeTemplates: {},
  //   flowInfos: {},
  // };

  // const rootInjectable: Injectable = {
  //   provider: null,
  //   items: dependencies2InjectableItems(rootFlow.provisions, getService),
  // };
  // injectablesMap.set(null, rootInjectable);
  // Object.entries(rootFlow.provisions).map(([key, prov]) => {
  //   const injectableItem: InjectableItem = {
  //     displayName: prov.displayName ?? key,
  //     description: prov.description,
  //     service: prov.isComposite
  //       ? null
  //       : {
  //           packageId: prov.packageId,
  //           serviceKey: prov.serviceKey,
  //         },
  //     nodeTemplates: {},
  //   };
  //   if (prov.isComposite) {
  //     injectableItem.nodeTemplates = { ...prov.items };
  //   }

  //   rootInjectable.items[key] = injectableItem;
  // });

  // result.flowInfos[getFlowPathKey(null)] = {
  //   editorFlowData: rootFlow,
  //   injectables: [rootInjectable], // todo
  // };
  const getNodeTemplate = (nodeTarget: EditorNodeTargetData) => {
    let nodeTemplate: NodeTemplate | null = null;
    if (nodeTarget.kind === EditorNodeTargetKind.Injection) {
      const injectable = injectablesMap.get(
        getInjectableSourceKey(nodeTarget.source)
      );
      if (injectable) {
        const item = injectable.items[nodeTarget.injectionKey];
        nodeTemplate = item?.nodeTemplates?.[nodeTarget.key] ?? null;
      }
    } else if (nodeTarget.kind === EditorNodeTargetKind.Flow) {
      const flowNodeTemplate = context.getFlowNodeTemplate(
        nodeTarget.flowId,
        nodeTarget.subsystemEntry
      );
      if (flowNodeTemplate) {
        nodeTemplate = flowNodeTemplate;
      }
    } else if (nodeTarget.kind === EditorNodeTargetKind.Predefined) {
      const flowNodeTemplate = context.getPredefinedNodeTemplate(
        nodeTarget.packageId,
        nodeTarget.key
      );
      if (flowNodeTemplate) {
        nodeTemplate = flowNodeTemplate;
      }
    } else {
      // Reserved
      nodeTemplate = reservedNodeTemplates[nodeTarget.target];
    }
    return nodeTemplate;
  };

  const processFlow = (
    flowData: EditorFlowData<HasExtra>,
    path: { nodeId: string; subflowKey: string }[],
    flowInterface: FlowInterface
  ) => {
    const flowPathValue = path.slice(-1)[0] ?? null;
    // console.log('Processing flow with path', path, flowInterface);
    const injectable: Injectable = {
      provider: flowPathValue,
      items: dependencies2InjectableItems(
        flowInterface.dependencies ?? {},
        context.getService
      ),
    };
    // console.log(
    //   'Generated injectable for flow path',
    //   flowPathValue,
    //   injectable
    // );
    injectablesMap.set(getInjectableSourceKey(flowPathValue), injectable);

    const injectables: Injectable[] = [
      injectablesMap.get(getInjectableSourceKey(null))!,
    ];
    path.forEach((x) => {
      const inj = injectablesMap.get(getInjectableSourceKey(x));
      if (inj) {
        injectables.push(inj);
      }
    });

    const nodeTemplates: Record<string, NodeTemplate> = {};
    Object.entries(flowData.nodes).map(([nodeId, nodeData]) => {
      const nodeTemplate = getNodeTemplate(nodeData.target);
      if (!nodeTemplate) {
        console.warn(`Can not find template for node ${nodeId}`, nodeData);
        return;
      }
      nodeTemplates[nodeId] = nodeTemplate;
      // traverse subflows
      Object.entries(nodeData.subflows).map(([subflowKey, subflowData]) => {
        const subflowPath = [...path, { nodeId, subflowKey }];
        if (subflowData.target) {
          const service =
            nodeTemplate.dependencies?.[subflowData.target.serviceKey];
          if (service) {
            if (service.isComposite) {
              const flowInterface = service.items[subflowData.target.methodKey];
              processFlow(subflowData.flow, subflowPath, flowInterface);
            } else {
              const serviceInfo = context.getService(
                service.packageId,
                service.serviceKey
              );
              if (!serviceInfo) {
                console.warn(
                  `Service not found for node ${nodeId} subflow ${subflowKey} with packageId ${service.packageId} and serviceKey ${service.serviceKey}`
                );
              } else {
                const flowInterface =
                  serviceInfo.nodeTemplates[subflowData.target.methodKey];
                if (!flowInterface) {
                  console.warn(
                    `Flow interface not found for node ${nodeId} subflow ${subflowKey} with packageId ${service.packageId} and serviceKey ${service.serviceKey} methodKey ${subflowData.target.methodKey}`
                  );
                } else {
                  processFlow(subflowData.flow, subflowPath, flowInterface);
                }
              }
            }
          }
        } else {
          // if no target, it means it's an default implementation for an optional
          const flowInterface = nodeTemplate;
          processFlow(subflowData.flow, subflowPath, flowInterface);
        }
      });
    });
    flowInfoMap.set(getFlowPathKey(path), {
      flowData,
      flowInterface,
      injectables,
      nodeTemplates,
      path,
    });
  };

  processFlow(rootFlow, [], editorRootFlow2FlowInterface(rootFlow));
  // traverseEditorFlow({ flowData: rootFlow, path: [] }, ({ flowData, path }) => {
  //   // get flow interface from path
  //   if (path.length === 0) {
  //     flowInfoMap.set(null, {
  //       injectables: [rootInjectable],
  //       flowData,
  //       flowInterface: rootFlow,
  //       nodeTemplates: {},
  //     });
  //   }

  //   //

  //   for (const [nodeId, nodeData] of Object.entries(flowData.nodes)) {
  //     const nodeTarget = nodeData.target;
  //     let nodeTemplate: NodeTemplate | null = null;
  //     if (nodeTarget.kind === EditorNodeTargetKind.Injection) {
  //       const injectable = injectablesMap.get(nodeTarget.source);
  //       if (injectable) {
  //         const item = injectable.items[nodeTarget.key];
  //         nodeTemplate = item?.nodeTemplates?.[nodeId];
  //       }
  //     } else if (nodeTarget.kind === EditorNodeTargetKind.Flow) {
  //       const flowNodeTemplate = getFlowInterface(
  //         nodeTarget.flowId,
  //         nodeTarget.subsystemEntry
  //       );
  //       if (flowNodeTemplate) {
  //         nodeTemplate = flowNodeTemplate;
  //       }
  //     } else if (nodeTarget.kind === EditorNodeTargetKind.Predefined) {
  //       const flowNodeTemplate = getPredefinedNodeTemplate(
  //         nodeTarget.packageId,
  //         // nodeTarget.subPath,
  //         nodeTarget.key
  //       );
  //       if (flowNodeTemplate) {
  //         nodeTemplate = flowNodeTemplate;
  //       }
  //     } else {
  //       // Reserved
  //       nodeTemplate = reservedNodeTemplates[nodeTarget.target];
  //     }
  //     if (!nodeTemplate) {
  //       console.warn(`Can not find template for node ${nodeId}`, nodeData);
  //       continue;
  //     }
  //     result.nodeTemplates[nodeId] = nodeTemplate;

  //     const injectables: Injectable[] = [rootInjectable];
  //     path.forEach((x) => {
  //       const inj = injectablesMap.get(x);
  //       if (inj) {
  //         injectables.push(inj);
  //       }
  //     });

  //     Object.entries(nodeData.subflows).map(([subflowKey, subflowData]) => {
  //       const target = subflowData.target;
  //       if (target) {
  //         const key = getFlowPathKey({ nodeId, subflowKey });
  //         const service = nodeTemplate.dependencies?.[target.serviceKey];
  //         if (service && service.isComposite) {
  //           const flowInterface = service.items[target.methodKey];
  //           const subFlowInjectable: Injectable = {
  //             provider: { nodeId, subflowKey },
  //             items: dependencies2InjectableItems(
  //               flowInterface.provisions ?? {},
  //               getService
  //             ),
  //           };
  //           // Object.entries(flowInterface.provisions ?? {}).map(
  //           //   ([key, prov]) => {
  //           //     subFlowInjectable.items[key] = {
  //           //       displayName: prov.displayName ?? key,
  //           //       description: prov.description,
  //           //       service: prov.isComposite
  //           //         ? null
  //           //         : {
  //           //             packageId: prov.packageId,
  //           //             serviceKey: prov.serviceKey,
  //           //           },
  //           //     };
  //           //   }
  //           // );
  //           injectablesMap.set({ nodeId, subflowKey }, subFlowInjectable);
  //           result.flowInfos[key] = {
  //             flowInterface,
  //             editorFlowData: subflowData.flow,
  //             injectables: injectables,
  //             path: [...path, { nodeId, subflowKey }],
  //           };
  //         }
  //       }
  //     });
  //     // Object.entries(nodeTemplate.dependencies ?? {}).forEach(
  //     //   ([depKey, depValue]) => {
  //     //     if (depValue.isComposite) {
  //     //       Object.entries(depValue.items).forEach(
  //     //         ([flowKey, flowInterface]) => {
  //     //           if (nodeData.provides[depKey]?.isComposite) {
  //     //             const provision = nodeData.provides[depKey];
  //     //             const item = provision?.items?.[flowKey];
  //     //             if (item?.kind === CompositeProvisionKind.Subflow) {
  //     //               const subflowKey = item.subflowKey;
  //     //               const subflowData = nodeData.subflows[subflowKey];
  //     //               if (subflowData) {
  //     //                 const key = getFlowPathKey({ nodeId, subflowKey });
  //     //                 flowInfos[key] = {
  //     //                   flowInterface,
  //     //                   editorFlowData: subflowData.flow,
  //     //                 };
  //     //               }
  //     //             }
  //     //           }
  //     //         }
  //     //       );
  //     //     }
  //     //   }
  //     // );
  //   }
  // });

  return flowInfoMap;
};

// export const editorRootFlow2EditorFlowInfo = <T extends boolean>(
//   rootFlow: EditorRootFlow<T>
// ): EditorFlowInfo<T, true> => {
//   return {
//     injectables: [] as Injectable[],
//     ...rootFlow,
//   };
// };
