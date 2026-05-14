import {
  EditorPortType,
  EditorReservedPortKey,
  NodeTemplate,
  PortVisibility,
  RunModeKind,
} from '../../common';

export const returnIfTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  ports: {
    input: [
      {
        key: EditorReservedPortKey.ReturnCondition,
        type: EditorPortType.Data,
        displayName: 'if',
      },
      {
        key: EditorReservedPortKey.Return,
        type: EditorPortType.Data,
        displayName: 'return',
      },
    ],
    output: [],
  },
  displayName: 'Return If',
  returnVoid: true,
};
