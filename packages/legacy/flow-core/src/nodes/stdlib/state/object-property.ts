import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../../common';

export const objectPropertyTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  displayName: 'Object Property',
  ports: {
    input: [
      {
        key: 'initial',
        type: EditorPortType.Data,
      },
      {
        key: 'set',
        type: EditorPortType.Stream,
      },
      {
        key: 'delete',
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
  portsDestructuringAllowed: {
    input: {
      set: PortDestructuringKind.Object,
    },
  },
};
