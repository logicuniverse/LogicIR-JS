import { EditorPortType, NodeTemplate, RunModeKind } from '../../common';

export const testMimoNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Component,
  displayName: 'MIMO',
  ports: {
    input: [
      { key: 'inA', type: EditorPortType.Component },
      { key: 'inB', type: EditorPortType.Component },
      { key: 'inC', type: EditorPortType.Component },
    ],
    output: [],
    return: [{ key: 'outA' }, { key: 'outB' }],
  },
};
