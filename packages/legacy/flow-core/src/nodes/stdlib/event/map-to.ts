import {
  EditorPortType,
  NodeTemplate,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const mapToTemplate: NodeTemplate = {
  kind: RunModeKind.Compute,
  displayName: 'Map To',
  ports: {
    input: [
      {
        key: 'event',
        type: EditorPortType.Data,
      },
      {
        key: 'value',
        type: EditorPortType.Data,
      },
    ],
    output: [],
  },
  runModeOverrideAllowed: [],
  defaults: {
    runModeOverride: {
      kind: RunModeOverrideKind.Trigger,
      triggerKey: 'event',
    },
  },
};
