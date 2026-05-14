import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../../common';

export const stringPropertyTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  displayName: 'String Property',
  ports: {
    input: [
      {
        key: 'initial',
        type: EditorPortType.Data,
      },
      {
        key: 'prepend',
        type: EditorPortType.Stream,
      },
      {
        key: 'concat',
        type: EditorPortType.Stream,
      },
    ],
    output: [
      {
        key: 'value',
        type: EditorPortType.Property,
      },
    ],
  },
};
