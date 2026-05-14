import { EditorPortType, NodeTemplate, RunModeKind } from '../../../common';

export const booleanPropertyTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  displayName: 'Boolean Property',
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
        key: 'toggle',
        type: EditorPortType.Stream,
      },
      {
        key: 'setTrue',
        type: EditorPortType.Stream,
      },
      {
        key: 'setFalse',
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
