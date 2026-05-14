import {
  EditorPortType,
  NodeTemplate,
  PackageDefinition,
  PortDestructuringKind,
  RunModeKind,
  ServiceItemKind,
} from '../../common';

// export const piAiGetModelNodeTemplate: NodeTemplate = {
//   displayName: 'Get Model',
//   kind: RunModeKind.Sequence,
//   isAsync: true,
//   ports: {
//     input: [
//       {
//         key: 'provider',
//         type: EditorPortType.Data,
//       },
//       {
//         key: 'modelId',
//         type: EditorPortType.Data,
//       },
//     ],
//     output: [],
//   },
// };

export const piAiCompleteNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  isAsync: true,
  ports: {
    input: [
      {
        key: 'messages',
        type: EditorPortType.Data,
      },
      {
        key: 'systemPrompt',
        type: EditorPortType.Data,
      },
    ],
    output: [
      {
        key: 'toolCall',
        type: EditorPortType.Stream,
      },
    ],
  },
  dependencies: {
    provider: {
      isComposite: false,
      packageId: 'piAi',
      serviceKey: 'provider',
    },
  },
  displayName: 'Complete',
  portsDestructuringAllowed: {
    output: {
      toolCall: PortDestructuringKind.Object,
    },
  },
};

export const piAiStreamNodeTemplate: NodeTemplate = {
  kind: RunModeKind.Sequence,
  isAsync: true,
  ports: {
    input: [
      {
        key: 'messages',
        type: EditorPortType.Data,
      },
      {
        key: 'systemPrompt',
        type: EditorPortType.Data,
      },
    ],
    output: [
      {
        key: 'event',
        type: EditorPortType.Stream,
      },
      {
        key: 'toolCall',
        type: EditorPortType.Stream,
      },
    ],
  },
  dependencies: {
    provider: {
      isComposite: false,
      packageId: 'piAi',
      serviceKey: 'provider',
    },
  },
  displayName: 'Stream',
  portsDestructuringAllowed: {
    output: {
      toolCall: PortDestructuringKind.Object,
    },
  },
};

export const piAiProviderNodeTemplate: NodeTemplate = {
  kind: RunModeKind.StateMachine,
  ports: {
    input: [
      {
        key: 'provider',
        type: EditorPortType.Data,
      },
      {
        key: 'modelId',
        type: EditorPortType.Data,
      },
      {
        key: 'apiKey',
        type: EditorPortType.Data,
      },
    ],
    output: [],
  },
  displayName: 'Provider',
  dependencies: {
    default: {
      isComposite: true,
      isStateful: false,
      items: {
        context: {
          kind: RunModeKind.Sequence,
          isAsync: true,
          ports: {
            input: [],
            output: [],
          },
          dependencies: {
            provider: {
              isComposite: false,
              packageId: 'piAi',
              serviceKey: 'provider',
            },
          },
        },
      },
    },
  },
};

export const piAiPackage: PackageDefinition = {
  displayName: 'pi-ai',
  nodeTemplates: {
    // 'pi-ai.getModel': piAiGetModelNodeTemplate,
    'pi-ai.provider': piAiProviderNodeTemplate,
    'pi-ai.complete': piAiCompleteNodeTemplate,
    'pi-ai.stream': piAiStreamNodeTemplate,
  },
  children: [
    // { displayName: 'Get Model', key: 'pi-ai.getModel' },
    { displayName: 'Provider', key: 'pi-ai.provider' },
    { displayName: 'Complete', key: 'pi-ai.complete' },
    { displayName: 'Stream', key: 'pi-ai.stream' },
  ],
  services: {
    provider: {
      items: {
        stream: {
          kind: ServiceItemKind.NodeTemplate,
          nodeTemplateKey: 'pi-ai.stream',
        },
        complete: {
          kind: ServiceItemKind.NodeTemplate,
          nodeTemplateKey: 'pi-ai.complete',
        },
      },
    },
  },
};
