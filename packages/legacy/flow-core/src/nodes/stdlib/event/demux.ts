import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../../common';

export const demuxNodeTemplate: NodeTemplate = {
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
  displayName: 'Demux',

  defaults: {
    destructuringMap: {
      input: {},
      output: {
        out: ['foo', 'bar'],
      },
    },
  },
  portsDestructuringAllowed: {
    output: { out: PortDestructuringKind.Object },
  },
};
