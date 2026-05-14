import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
} from '../../../common';

export const fromObjectNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Component,
  displayName: 'From Object',
  ports: {
    input: [{ key: 'children', type: EditorPortType.Component }],
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

export const fromArrayNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Component,
  displayName: 'From Array',
  ports: {
    input: [{ key: 'children', type: EditorPortType.Component }],
    output: [],
    return: [{ key: 'root' }],
  },
  portsDestructuringAllowed: {
    input: {
      children: PortDestructuringKind.Array,
    },
  },
  defaults: {
    destructuringMap: {
      input: {
        children: 2,
      },
      output: {},
    },
  },
};

export const componentNodeTemplates: Record<string, NodeTemplate> = {
  'component.fromObject': fromObjectNodeTemplate,
  'component.fromArray': fromArrayNodeTemplate,
};
