import {
  NodeTemplate,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const nullNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [],
    output: [],
  },
  displayName: 'Null',

  renderTemplate: '<div>null</div>',
  defaults: {
    runModeOverride: {
      kind: RunModeOverrideKind.CompileTime,
    },
  },
  runModeOverrideAllowed: [],
};
