import { EditHandler, EditReturn, ViewSelection } from '../types';

type OpDeleteSelectionParams = {
  selection: ViewSelection;
};

export const opDeleteSelection: EditHandler = (
  params: OpDeleteSelectionParams
) => {
  console.log('opDeleteSelection', params.selection);
  return {
    updater: (targetFlow) => {
      Object.keys(targetFlow.nodes).map((nodeId) => {
        if (params.selection.includes(nodeId)) {
          delete targetFlow.nodes[nodeId];
        }
      });
      Object.keys(targetFlow.groups).map((groupId) => {
        if (params.selection.includes(groupId)) {
          delete targetFlow.groups[groupId];
        }
      });
      Object.keys(targetFlow.connections).map((connectionId) => {
        if (params.selection.includes(connectionId)) {
          delete targetFlow.connections[connectionId];
        }
      });

      Object.keys(targetFlow.sequenceConnections).map((connectionId) => {
        if (params.selection.includes(connectionId)) {
          delete targetFlow.sequenceConnections[connectionId];
        }
      });
      Object.keys(targetFlow.componentConnections).map((connectionId) => {
        if (params.selection.includes(connectionId)) {
          delete targetFlow.componentConnections[connectionId];
        }
      });
      // targetFlow.awaitNodeIds = targetFlow.awaitNodeIds.filter(
      //   (x) => !params.selection.nodes.includes(x)
      // );
    },
    selection: [],
  };
};

type OpMoveSelectionParams = {
  selection: ViewSelection;
  delta: { x: number; y: number };
};

export const opMoveSelection = (params: OpMoveSelectionParams): EditReturn => {
  return {
    updater: (targetFlow) => {
      params.selection.map((id) => {
        if (targetFlow.nodes[id]) {
          targetFlow.nodes[id].position = {
            x: targetFlow.nodes[id].position.x + params.delta.x,
            y: targetFlow.nodes[id].position.y + params.delta.y,
          };
        }
        if (targetFlow.groups[id]) {
          targetFlow.groups[id].position = {
            x: targetFlow.groups[id].position.x + params.delta.x,
            y: targetFlow.groups[id].position.y + params.delta.y,
          };
        }
        if (targetFlow.subflowContainers[id]) {
          targetFlow.subflowContainers[id].position = {
            x: targetFlow.subflowContainers[id].position.x + params.delta.x,
            y: targetFlow.subflowContainers[id].position.y + params.delta.y,
          };
        }
      });
    },
  };
};
