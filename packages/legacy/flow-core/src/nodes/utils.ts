import {
  CompositeInjection,
  EditorPortType,
  FlowInterface,
  NodeTemplate,
  RunModeKind,
} from '..';

export type SimpleNodeTemplate = {
  kind?: RunModeKind.Compute | RunModeKind.Sequence; // default to Compute
  displayName: string;
  description?: string;
  params: {
    key: string;
    displayName?: string;
    description?: string;
    fn?: {
      params: { key: string; displayName?: string; description?: string }[];
      kind?: RunModeKind.Sequence | RunModeKind.Compute; // default to Sequence
      returnVoid?: boolean; // default to false
    };
  }[];
  returnVoid?: boolean;
};

export const simpleNodeTemplateToNodeTemplate = (
  simpleNodeTemplate: SimpleNodeTemplate
): NodeTemplate => {
  const nodeTemplate: NodeTemplate = {
    kind: simpleNodeTemplate.kind ?? RunModeKind.Compute,
    displayName: simpleNodeTemplate.displayName,
    description: simpleNodeTemplate.description,
    ports: {
      input: simpleNodeTemplate.params
        .filter((x) => !x.fn)
        .map((param) => ({
          key: param.key,
          type: EditorPortType.Data,
          displayName: param.displayName,
          description: param.description,
        })),
      output: [],
    },
    returnVoid: simpleNodeTemplate.returnVoid ?? undefined,
  };
  const items: CompositeInjection<FlowInterface>['items'] = {};
  simpleNodeTemplate.params.forEach((param) => {
    if (param.fn) {
      items[param.key] = {
        displayName: param.displayName,
        description: param.description,
        kind: param.fn.kind ?? RunModeKind.Sequence,
        returnVoid: param.fn.returnVoid ?? false,
        ports: {
          input: param.fn.params.map((fnParam) => ({
            key: fnParam.key,
            type: EditorPortType.Data,
          })),
          output: [],
        },
      };
    }
  });
  if (Object.keys(items).length > 0) {
    nodeTemplate.dependencies = {
      default: {
        isComposite: true,
        isStateful: false,
        items,
      },
    };
  }
  return nodeTemplate;
};
