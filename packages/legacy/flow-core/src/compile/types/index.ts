import { NodeFunction, Flow } from 'ff-runtime-core';
import {
  CoreContext,
  EditorFlowInfoCore,
  EditorRootFlowCore,
} from '../../common/types';

// import { NodeImplementation } from '../../nodes';

export type CompileDependencies = CoreContext & {
  // getCompileTimeNodeFunction: (target: string) => NodeFunction;
  inject: (injectionKey: string, methodKey: string) => NodeFunction;
  getFlow: (id: string) => Promise<EditorRootFlowCore>;
  getServiceMethodNodeFunction: (
    packageId: string,
    methodKey: string
  ) => NodeFunction;
  // getFlowInfo: (path: FlowPath) => EditorFlowInfo | null;
  // getNodeImplementation: (target: string) => NodeImplementation;
  // readAsset: (id: string) => Promise<File>;
  // services: Services;
};

export type CompileContext = CompileDependencies & {
  // entryId: string;
  // subsystemEntry?: string;
  currentRootFlow: EditorRootFlowCore;
  cachedRuntimeFlows: Record<string, Flow>;
  cachedContents: Record<string, { loader: string; data: unknown }>;
  // cachedNodeImplementations: Record<string, NodeImplementation>;
  cachedFiles: Record<string, ArrayBuffer>;
};
