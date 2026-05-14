import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const toArrayNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [{ key: 'input', type: EditorPortType.Data }],
    output: [],
  },
  displayName: 'To Array',
  defaults: {
    destructuringMap: {
      input: {
        input: 2,
      },
      output: {},
    },
  },
  portsDestructuringAllowed: {
    input: {
      input: PortDestructuringKind.Array,
    },
  },
  runModeOverrideAllowed: [RunModeOverrideKind.CompileTime],
};
