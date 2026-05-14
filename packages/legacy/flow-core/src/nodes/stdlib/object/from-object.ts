import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const fromObjectNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [{ key: 'input', type: EditorPortType.Data }],
    output: [],
  },
  displayName: 'From Object',

  defaults: {
    destructuringMap: {
      input: {},
      output: {},
      return: ['foo', 'bar'],
    },
  },
  portsDestructuringAllowed: {
    return: PortDestructuringKind.Object,
  },
  runModeOverrideAllowed: [RunModeOverrideKind.CompileTime],
};
