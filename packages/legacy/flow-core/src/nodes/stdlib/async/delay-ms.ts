import {
  EditorPortType,
  NodeTemplate,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const delayMsNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  isAsync: true,
  displayName: 'Delay Ms',
  ports: {
    input: [{ key: 'ms', type: EditorPortType.Data }],
    output: [],
  },
  runModeOverrideAllowed: [RunModeOverrideKind.Awaited],
  returnVoid: true,
  defaults: {
    runModeOverride: { kind: RunModeOverrideKind.Awaited },
  },
};
