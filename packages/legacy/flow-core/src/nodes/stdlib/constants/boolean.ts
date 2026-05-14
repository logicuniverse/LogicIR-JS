import {
  EditorPortType,
  InputKind,
  NodeTemplate,
  PortVisibility,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const booleanNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [
      {
        key: 'value',
        type: EditorPortType.Data,
      },
    ],
    output: [],
  },
  displayName: 'Boolean',

  renderTemplate: '<div>{{value}}</div>',
  portsVisibility: {
    input: { value: PortVisibility.AlwaysHidden },
  },
  defaults: {
    runModeOverride: {
      kind: RunModeOverrideKind.CompileTime,
    },
    staticInputs: {
      value: true,
    },
  },
  runModeOverrideAllowed: [],
  staticInputs: [
    {
      key: 'value',
      kind: InputKind.Field,
      component: 'Switch',
    },
  ],
};
