import { SequenceStep, SequenceStepKind } from 'ff-runtime-core';
import {
  EditorFlowInfoCore,
  EditorNodeTargetKind,
  EditorReservedNodeKey,
  EditorReservedPortKey,
  RunModeOverrideKind,
} from '../../common/types';
import { getPortId } from '../../common/utils/id';
import { isExecutionConnection, isGoBackConnection } from '../../common';

export const getRuntimeFlowSequenceSteps = (
  flowInfo: EditorFlowInfoCore
): SequenceStep[] => {
  const { flowData } = flowInfo;
  const sequenceSteps: SequenceStep[] = [];
  const allGoBackConnections = Object.values(
    flowData.sequenceConnections
  ).filter((x) => isGoBackConnection(x));
  const executionConnections = Object.values(
    flowData.sequenceConnections
  ).filter((x) => isExecutionConnection(x));
  const startConnections = executionConnections.filter((x) => !x.from);
  const endConnections = executionConnections.filter((x) => !x.to);
  if (startConnections.length === 0 && endConnections.length === 0) {
    return [];
  }
  if (startConnections.length !== 1) {
    throw new Error('Invalid start execution connection');
  }

  if (endConnections.length !== 1) {
    throw new Error('Invalid end execution connection');
  }
  const startConnection = startConnections[0];
  let currentNodeId = startConnection.to;
  while (currentNodeId) {
    const seqNode = flowData.nodes[currentNodeId];
    if (
      seqNode.target.kind === EditorNodeTargetKind.Reserved &&
      seqNode.target.target === EditorReservedNodeKey.GoBackIf
    ) {
      const goBackConnections = allGoBackConnections.filter(
        (x) => x.goBackFrom === currentNodeId
      );
      if (goBackConnections.length !== 1) {
        throw new Error('Invalid goBack connection on node ' + currentNodeId);
      }
      sequenceSteps.push({
        id: currentNodeId,
        kind: SequenceStepKind.GoBackIf,
        conditionPortId: getPortId(false, {
          key: EditorReservedPortKey.GoBackCondition,
          parent: { nodeId: currentNodeId, subflowKey: null },
        }),
        targetStepId: goBackConnections[0].goBackTo,
      });
    } else if (
      seqNode.target.kind === EditorNodeTargetKind.Reserved &&
      seqNode.target.target === EditorReservedNodeKey.ReturnIf
    ) {
      sequenceSteps.push({
        id: currentNodeId,
        kind: SequenceStepKind.ReturnIf,
        conditionPortId: getPortId(false, {
          key: EditorReservedPortKey.ReturnCondition,
          parent: { nodeId: currentNodeId, subflowKey: null },
        }),
        returnValuePortId: getPortId(false, {
          key: EditorReservedPortKey.Return,
          parent: { nodeId: currentNodeId, subflowKey: null },
        }),
      });
      // } else if (
      //   seqNode.target.kind === EditorNodeTargetKind.Predefined &&
      //   seqNode.target.target === EditorReservedNodeKey.Await
      // ) {
      //   sequenceSteps.push({
      //     id: currentNodeId,
      //     kind: SequenceStepKind.Await,
      //     awaitPortId: getPortId(false, {
      //       key: EditorReservedPortKey.Await,
      //       parent: { nodeId: currentNodeId, subflowKey: null },
      //     }),
      //     returnPortId: getPortId(true, {
      //       key: EditorReservedPortKey.Return,
      //       parent: { nodeId: currentNodeId, subflowKey: null },
      //     }),
      //   });
    } else {
      sequenceSteps.push({
        id: currentNodeId,
        kind: SequenceStepKind.SequenceNode,
        isAwaited:
          seqNode.runModeOverride?.kind === RunModeOverrideKind.Awaited
            ? true
            : undefined,
      });
    }
    const connection = executionConnections.find(
      (x) => !isGoBackConnection(x) && x.from === currentNodeId
    );
    if (!connection) {
      throw new Error('Incomplete execution path');
    }
    if (sequenceSteps.some((x) => x.id === connection.to)) {
      throw new Error('Unexpected execution loop');
    }
    currentNodeId = connection.to;
  }
  return sequenceSteps;
};
