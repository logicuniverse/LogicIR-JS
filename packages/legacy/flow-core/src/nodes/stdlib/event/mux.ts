import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../../common';

export const muxNodeTemplate: NodeTemplate = {
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
  displayName: 'Mux',

  defaults: {
    destructuringMap: {
      input: {
        in: ['foo', 'bar'],
      },
      output: {},
    },
  },
  portsDestructuringAllowed: {
    input: { in: PortDestructuringKind.Object },
  },
};
