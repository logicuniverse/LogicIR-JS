import { EditorPortType, NodeTemplate, RunModeKind } from '../../../common';

export const numberPropertyTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  displayName: 'Number Property',
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
        key: 'add',
        type: EditorPortType.Stream,
      },
      {
        key: 'subtract',
        type: EditorPortType.Stream,
      },
      {
        key: 'increment',
        type: EditorPortType.Stream,
      },
      {
        key: 'decrement',
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
