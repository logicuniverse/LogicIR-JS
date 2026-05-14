import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const fromArrayNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [{ key: 'input', type: EditorPortType.Data }],
    output: [],
  },
  displayName: 'From Array',

  defaults: {
    destructuringMap: {
      input: {},
      output: {},
      return: 2,
    },
  },
  portsDestructuringAllowed: {
    return: PortDestructuringKind.Array,
  },
  runModeOverrideAllowed: [RunModeOverrideKind.CompileTime],
};
