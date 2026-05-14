import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../../common';

export const mergeNodeTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  ports: {
    input: [{ key: 'in', type: EditorPortType.Stream }],
    output: [
      {
        key: 'out',
        type: EditorPortType.Stream,
      },
    ],
  },
  displayName: 'Merge',

  defaults: {
    destructuringMap: {
      input: {
        in: 2,
      },
      output: {},
    },
  },
  portsDestructuringAllowed: {
    input: { in: PortDestructuringKind.Array },
  },
};
