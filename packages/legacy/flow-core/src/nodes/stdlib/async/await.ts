import { EditorPortType, NodeTemplate, RunModeKind } from '../../../common';

export const awaitNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  isAsync: true,
  displayName: 'Await',
  ports: {
    input: [{ key: 'in', type: EditorPortType.Stream }],
    output: [],
  },
  runModeOverrideAllowed: [],
};
