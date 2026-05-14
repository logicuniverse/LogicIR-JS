import {
  EditorFlowInfoCore,
  FlowDependencies,
  Injectable,
  InjectableItem,
  NodeDependencies,
  NodeTemplate,
} from '../types';

export const dependencies2InjectableItems = (
  deps: NodeDependencies | FlowDependencies,
  getService: (
    packageId: string,
    serviceKey: string
  ) => {
    isStateful: boolean;
    displayName: string;
    description?: string;
    nodeTemplates: Record<string, NodeTemplate>;
  } | null
): Injectable['items'] => {
  const injectableItems: Injectable['items'] = {};
  Object.entries(deps).forEach(([depKey, dep]) => {
    let injectableItem: InjectableItem;
    if (dep.isComposite) {
      injectableItem = {
        displayName: dep.displayName ?? depKey,
        description: dep.description,
        service: null,
        nodeTemplates: dep.items,
        isStateful: !!dep.isStateful,
      };
    } else {
      const serviceInfo = getService(dep.packageId, dep.serviceKey);
      if (!serviceInfo) {
        throw new Error(
          `Service not found for dependency ${depKey} with packageId ${dep.packageId} and serviceKey ${dep.serviceKey}`
        );
      }
      injectableItem = {
        displayName: serviceInfo.displayName,
        description: serviceInfo.description,
        service: {
          packageId: dep.packageId,
          serviceKey: dep.serviceKey,
        },
        isStateful: serviceInfo.isStateful,
        nodeTemplates: serviceInfo.nodeTemplates, // for non-composite dependencies, nodeTemplates can be an empty object
      };
    }
    injectableItems[depKey] = injectableItem;
  });
  return injectableItems;
};

// export const getEditorFlowAllInjectables = (
//   editorFlowInfo: EditorFlowCore
// ): Injectable[] => {
//   const allInjectables: Injectable[] = [];
//   if ('injectables' in editorFlowInfo) {
//     allInjectables.push(...(editorFlowInfo.injectables ?? []));
//     allInjectables.push({
//       provider: {
//         nodeId: editorFlowInfo.path!.slice(-1)[0].nodeId,
//         subflowKey: editorFlowInfo.path!.slice(-1)[0].subflowKey,
//       },
//       items: dependencies2InjectableItems(editorFlowInfo.provisions ?? {}),
//     });
//   } else {
//     allInjectables.push({
//       provider: null,
//       items: dependencies2InjectableItems(editorFlowInfo.provisions ?? {}),
//     });
//   }
//   return allInjectables;
// };
