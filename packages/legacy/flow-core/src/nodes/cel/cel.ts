import {
  EditorPortType,
  InputKind,
  NodeTemplate,
  PortDestructuringKind,
  PortVisibility,
  RunModeKind,
} from '../..';

export const celExpressionNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  ports: {
    input: [
      {
        key: 'context',
        type: EditorPortType.Data,
      },
      { key: 'expression', type: EditorPortType.Data },
    ],
    output: [],
  },
  displayName: 'CEL Expression',
  portsDestructuringAllowed: {
    input: {
      context: PortDestructuringKind.Object,
    },
  },
  renderTemplate: '<div>{{expression}}</div>',
  portsVisibility: {
    input: {
      expression: PortVisibility.AlwaysHidden,
    },
  },
  defaults: {
    staticInputs: {
      expression: '1 + 2',
    },
  },
  staticInputs: [
    {
      key: 'expression',
      kind: InputKind.Field,
      component: 'Input',
    },
  ],
};
