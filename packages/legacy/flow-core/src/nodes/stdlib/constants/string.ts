import {
  EditorPortType,
  InputKind,
  NodeTemplate,
  PortVisibility,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const stringNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [
      {
        key: 'input',
        type: EditorPortType.Data,
      },
    ],
    output: [],
  },
  displayName: 'String',

  renderTemplate: '<div>{{input}}</div>',
  portsVisibility: {
    input: { input: PortVisibility.AlwaysHidden },
  },
  defaults: {
    runModeOverride: {
      kind: RunModeOverrideKind.CompileTime,
    },
    staticInputs: {
      input: 'abc',
    },
  },
  runModeOverrideAllowed: [],
  staticInputs: [
    {
      key: 'input',
      kind: InputKind.Field,
      component: 'Input',
    },
  ],
};
