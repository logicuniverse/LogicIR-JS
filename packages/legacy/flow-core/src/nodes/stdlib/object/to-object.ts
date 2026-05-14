import {
  EditorPortType,
  NodeTemplate,
  PortDestructuringKind,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const toObjectNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [{ key: 'input', type: EditorPortType.Data }],
    output: [],
  },
  displayName: 'To Object',

  defaults: {
    destructuringMap: {
      input: {
        input: ['foo', 'bar'],
      },
      output: {},
    },
  },
  portsDestructuringAllowed: {
    input: { input: PortDestructuringKind.Object },
  },
  runModeOverrideAllowed: [RunModeOverrideKind.CompileTime],
};
