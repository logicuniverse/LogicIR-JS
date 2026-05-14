import { FlowInterface, Injection } from '../../../common';
import { EditHandler } from '../../types';

type OpUpdateRootFlowDependenciesParams = {
  dependencies: Record<string, Injection<FlowInterface>>;
};
export const opUpdateRootFlowDependencies: EditHandler = (
  params: OpUpdateRootFlowDependenciesParams
) => {
  return {
    updater: (targetFlow) => {
      if ('dependencies' in targetFlow) {
        targetFlow.dependencies = params.dependencies;
      }
    },
  };
};

// todo: add/delete/update slots
// type OpUpdateRootFlowInjectedFlowsParams = {
//   injectedFlows: Record<string, RootFlowSlotInterface>;
// };

// export const opUpdateRootFlowInjectedFlows: EditHandler = (
//   params: OpUpdateRootFlowInjectedFlowsParams
// ) => {
//   return {
//     updater: (targetFlow) => {
//       if (!isRootFlow(targetFlow)) {
//         throw new Error('Only root flows have injected flows');
//       }
//       targetFlow.injectedFlows = params.injectedFlows;
//     },
//   };
// };

// type OpUpdateRootFlowTexts = Partial<EditorRootFlowExtras['texts']>;
// export const opUpdateRootFlowTexts: EditHandler = (
//   params: OpUpdateRootFlowTexts
// ) => {
//   return {
//     updater: (targetFlow) => {
//       if (!isRootFlow(targetFlow)) {
//         throw new Error('Root flow required');
//       }
//       if (params.services) {
//         Object.assign(targetFlow.texts.services, params.services);
//       }
//       if (params.slots) {
//         Object.assign(targetFlow.texts.slots, params.slots);
//       }
//     },
//   };
// };
