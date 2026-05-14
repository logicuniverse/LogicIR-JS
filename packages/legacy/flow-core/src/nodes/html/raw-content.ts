import { EditorPortType, NodeTemplate, RunModeKind } from '../../common';

export const rawContentTemplate: NodeTemplate = {
  kind: RunModeKind.Component,
  displayName: 'Raw Content',
  ports: {
    input: [
      {
        key: 'content',
        type: EditorPortType.Property,
      },
    ],
    output: [],
    return: [{ key: 'root' }],
  },
};
