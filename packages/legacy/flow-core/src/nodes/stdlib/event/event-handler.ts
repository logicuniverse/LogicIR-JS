import {
  EditorPortType,
  NodeTemplate,
  RunModeKind,
  RunModeOverrideKind,
} from '../../../common';

export const eventHandlerTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  displayName: 'Event Handler',
  ports: {
    input: [
      {
        key: 'input',
        type: EditorPortType.Data,
      },
    ],
    output: [],
  },
  returnVoid: true,
  defaults: {
    runModeOverride: {
      kind: RunModeOverrideKind.Trigger,
      triggerKey: 'input',
    },
  },
  dependencies: {
    default: {
      isComposite: true,
      isStateful: false,
      items: {
        eventHandler: {
          kind: RunModeKind.Sequence,
          displayName: 'Event Handler',
          description: 'Define the mapping logic here',
          isAsync: true,
          ports: {
            input: [
              {
                key: 'input',
                type: EditorPortType.Data,
              },
            ],
            output: [],
          },
          returnVoid: true,
        },
      },
    },
  },
};
