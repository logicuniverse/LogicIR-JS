import { NodeTemplate } from './node-template';

export type CoreContext = {
  // getFlow: (id: string) => Promise<EditorRootFlowCore>;
  // getNodeTemplate: (
  //   nodeId: string,
  //   nodeTarget: EditorNodeTargetData
  // ) => NodeTemplate | null;
  getPredefinedNodeTemplate: (
    packageId: string,
    methodKey: string
  ) => NodeTemplate | null;
  getFlowNodeTemplate: (
    flowId: string,
    subflowEntry?: string
  ) => NodeTemplate | null;
  // getFlowInfo: (path: FlowPath) => EditorFlowInfo | null;
  getService: (
    packageId: string,
    serviceKey: string
  ) => {
    isStateful: boolean;
    displayName: string;
    description?: string;
    nodeTemplates: Record<string, NodeTemplate>;
  } | null;
  // getPredefinedNodeInterface: (
  //   target: string,
  //   subsystemEntry?: string
  // ) => Promise<NodeInterface>;
  // getServiceMethodInterface: (
  //   serviceKey: string,
  //   methodKey: string
  // ) => Promise<NodeInterface>;
  // getServiceInfo: (id: string) => {
  //   displayName: string;
  //   description?: string;
  // };
};
