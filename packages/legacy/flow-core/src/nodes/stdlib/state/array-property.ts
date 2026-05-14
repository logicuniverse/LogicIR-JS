import { EditorPortType, NodeTemplate, RunModeKind } from '../../../common';

export const arrayPropertyTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  displayName: 'Array Property',
  ports: {
    input: [
      {
        key: 'initial',
        type: EditorPortType.Data,
      },
      // {
      //   key: 'fill',
      //   type: EditorPortType.Stream,
      // },
      {
        key: 'pop',
        type: EditorPortType.Stream,
      },
      {
        key: 'push',
        type: EditorPortType.Stream,
      },
      {
        key: 'shift',
        type: EditorPortType.Stream,
      },
      // {
      //   key: 'splice',
      //   type: EditorPortType.Stream,
      // },
      {
        key: 'unshift',
        type: EditorPortType.Stream,
      },
      {
        key: 'sort',
        type: EditorPortType.Stream,
      },
      {
        key: 'reverse',
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
