import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../common';

export const htmlDivNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Component,
  displayName: 'Div',
  ports: {
    input: [
      { key: 'props', type: EditorPortType.Property },
      { key: 'children', type: EditorPortType.Component },
    ],
    output: [{ key: 'events', type: EditorPortType.Stream }],
    return: [{ key: 'root' }],
  },
  portsDestructuringAllowed: {
    input: {
      props: PortDestructuringKind.Object,
      children: PortDestructuringKind.Array,
    },
    output: {
      events: PortDestructuringKind.Object,
    },
  },
  defaults: {
    destructuringMap: {
      input: {
        children: 1,
      },
      output: {},
    },
  },
};
