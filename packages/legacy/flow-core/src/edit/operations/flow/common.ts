import {
  EditorPortDestructuringMap,
  EditorPortType,
  GenericEditorPort,
} from '../../..';
import { EditHandler } from '../../types';

type OpUpdateFlowPortsParams<T extends EditorPortType = EditorPortType> = {
  ports: GenericEditorPort<T>[];
  isInput: boolean;
};

export const opUpdateFlowPorts: EditHandler = (
  params: OpUpdateFlowPortsParams
) => {
  return {
    updater: (targetFlow) => {
      // todo: check if port type matching
      if (params.isInput) {
        targetFlow.ports.input = params.ports;
      } else {
        targetFlow.ports.output = params.ports as GenericEditorPort<
          EditorPortType.Stream | EditorPortType.Property
        >[];
      }
    },
  };
};

// type opUpdateFlowDestructionMapParams = {
//   value: EditorPortDestructuringMap;
// };
// export const opUpdateFlowDestructionMap: EditHandler = (
//   params: opUpdateFlowDestructionMapParams
// ) => {
//   return {
//     updater: (targetFlow) => {
//       targetFlow.destructuringMap = params.value;
//     },
//   };
// };

// type OpUpdateFlowTextsParams = {
//   value: Partial<FlowTexts>;
// };

// export const opUpdateFlowTexts: EditHandler = ({
//   value,
// }: OpUpdateFlowTextsParams) => {
//   return {
//     updater: (targetFlow) => {
//       if (value.ports) {
//         if (value.ports.input) {
//           if (!targetFlow.texts.ports.input) {
//             targetFlow.texts.ports.input = {};
//           }
//           Object.assign(targetFlow.texts.ports.input, value.ports.input);
//         }
//         if (value.ports.output) {
//           if (!targetFlow.texts.ports.output) {
//             targetFlow.texts.ports.output = {};
//           }
//           Object.assign(targetFlow.texts.ports.output, value.ports.output);
//         }
//         if (value.ports.return) {
//           targetFlow.texts.ports.return = value.ports.return;
//         }
//       }
//       if (value.connections) {
//         Object.assign(targetFlow.texts.connections, value.connections);
//       }
//       if (value.groups) {
//         Object.assign(targetFlow.texts.groups, value.groups);
//       }
//       if (value.nodes) {
//         Object.assign(targetFlow.texts.nodes, value.nodes);
//       }
//     },
//   };
// };
