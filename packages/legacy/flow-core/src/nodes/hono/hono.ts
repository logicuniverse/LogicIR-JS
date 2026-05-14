import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../common';

export const honoAppNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  displayName: 'Hono App',
  ports: {
    input: [],
    output: [],
  },
  dependencies: {
    default: {
      isComposite: true,
      isStateful: true,
      items: {
        default: {
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

export const honoRouteNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Component,
  displayName: 'Hono Route',
  ports: {
    input: [
      // { key: 'path', type: EditorPortType.Data },
      { key: 'children', type: EditorPortType.Component },
    ],
    output: [],
    return: [{ key: 'root' }],
  },
  portsDestructuringAllowed: {
    input: {
      children: PortDestructuringKind.Object,
    },
  },
  defaults: {
    destructuringMap: {
      input: {
        children: ['foo', 'bar'],
      },
      output: {},
    },
  },
};

export const honoGetNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Component,
  displayName: 'Hono Get',
  ports: {
    input: [],
    output: [],
    return: [{ key: 'root' }],
  },
  dependencies: {
    default: {
      isComposite: true,
      items: {
        default: {
          kind: RunModeKind.Sequence,
          ports: {
            input: [],
            output: [],
          },
          dependencies: {},
        },
      },
    },
  },
};
