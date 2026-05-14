import {
  EditorPortType,
  EditorReservedPortKey,
  NodeTemplate,
  PortVisibility,
  RunModeKind,
} from '../../common';

export const goBackIfNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  displayName: 'Go Back If',
  ports: {
    input: [
      {
        key: EditorReservedPortKey.GoBackCondition,
        type: EditorPortType.Data,
        displayName: 'if',
      },
    ],
    output: [],
  },
  returnVoid: true,
};
