import {
  EditorPortType,
  InputKind,
  NodeTemplate,
  PortVisibility,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const numberNodeTemplate: NodeTemplate = {
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
  displayName: 'Number',

  renderTemplate: '<div>{{value}}</div>',
  portsVisibility: {
    input: { value: PortVisibility.AlwaysHidden },
  },
  defaults: {
    runModeOverride: {
      kind: RunModeOverrideKind.CompileTime,
    },
    staticInputs: {
      value: 0,
    },
  },
  runModeOverrideAllowed: [],
  staticInputs: [
    {
      key: 'value',
      kind: InputKind.Field,
      component: 'Input',
      componentProps: {
        type: 'number',
      },
    },
  ],
};
