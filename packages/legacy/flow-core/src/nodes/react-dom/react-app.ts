import {
  EditorPortType,
  NodeTemplate,
  PortVisibility,
  RunModeKind,
} from '../../common';

export const reactAppTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  ports: {
    input: [
      {
        key: 'domNode',
        type: EditorPortType.Data,
      },
    ],
    output: [],
  },
  displayName: 'React App',
  dependencies: {
    default: {
      isComposite: true,
      isStateful: true,
      items: {
        render: {
          kind: RunModeKind.Component,
          ports: {
            input: [],
            output: [],
            return: [{ key: 'root' }],
          },
        },
      },
    },
  },
};
