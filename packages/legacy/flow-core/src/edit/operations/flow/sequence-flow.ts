import { isExecutionConnection, isGoBackConnection } from '../../..';
import { generateConnectionId } from '../../../common/utils/id';
import { EditHandler, EditReturn } from '../../types';

type OpAddSequenceConnectionParams =
  | { from: string; to: string | null }
  | { from: string | null; to: string };

export const opAddSequenceConnection = (
  params: OpAddSequenceConnectionParams
): EditReturn => {
  const connectionId = generateConnectionId();
  return {
    updater: (targetFlow) => {
      Object.keys(targetFlow.sequenceConnections).map((k) => {
        if (
          isExecutionConnection(targetFlow.sequenceConnections[k]) &&
          (targetFlow.sequenceConnections[k].from === params.from ||
            targetFlow.sequenceConnections[k].to === params.to)
        ) {
          delete targetFlow.sequenceConnections[k];
        }
      });
      targetFlow.sequenceConnections[connectionId] = {
        ...params,
      };
    },
  };
};

type OpAddGoBackConnectionParams = { from: string; to: string };
export const opAddGoBackConnection = (
  params: OpAddGoBackConnectionParams
): EditReturn => {
  return {
    updater: (targetFlow) => {
      Object.keys(targetFlow.sequenceConnections).map((k) => {
        if (
          isGoBackConnection(targetFlow.sequenceConnections[k]) &&
          targetFlow.sequenceConnections[k].goBackFrom === params.from
        ) {
          delete targetFlow.sequenceConnections[k];
        }
      });
      const connectionId = generateConnectionId();
      targetFlow.sequenceConnections[connectionId] = {
        goBackFrom: params.from,
        goBackTo: params.to,
      };
    },
  };
};

// type OpSetSequenceNodeAwaitValueParams = {
//   nodeId: string;
//   isAwait: boolean;
// };
// export const opSetSequenceNodeAwaitValue: EditHandler = (
//   params: OpSetSequenceNodeAwaitValueParams
// ) => {
//   return {
//     updater: (targetFlow) => {
//       if (!isSequenceFlow(targetFlow)) {
//         throw new Error('Await value can only be set in sequence flows');
//       }
//       if (!params.isAwait) {
//         targetFlow.awaitNodeIds = targetFlow.awaitNodeIds.filter(
//           (x) => x !== params.nodeId
//         );
//       } else {
//         if (!targetFlow.awaitNodeIds.includes(params.nodeId)) {
//           targetFlow.awaitNodeIds.push(params.nodeId);
//         }
//       }
//     },
//   };
// };
