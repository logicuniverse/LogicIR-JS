import { FlowPath } from '../../edit';
import { EditorFlowData, EditorRootFlow } from './editor-models';
import {
  FlowDependencies,
  FlowInterface,
  NodeDependencies,
  RunModeKind,
} from './interfaces';
import { NodeTemplate } from './node-template';

export type CommonText = {
  displayName?: string;
  description?: string;
};

export type Extra<HasExtra extends boolean, D> = HasExtra extends true ? D : {};
export type WithId<T> = T & { id: string };

export type EditorFlowInfoData<HasExtra extends boolean = true> =
  | {
      editorFlowData: EditorRootFlow<HasExtra>;
      flowInterface?: null;
    }
  | {
      editorFlowData: EditorFlowData<HasExtra>;
      flowInterface: FlowInterface;
      injectables: Injectable[];
      path: FlowPath;
    };

export type InjectableItem = {
  displayName: string;
  description?: string;
  service: {
    packageId: string;
    serviceKey: string;
  } | null;
  nodeTemplates: Record<string, NodeTemplate>;
  isStateful: boolean;
};

export type Injectable = {
  provider: { nodeId: string; subflowKey: string } | null;
  items: Record<string, InjectableItem>;
};

export type EditorFlowInfo<HasExtra extends boolean = true> = {
  injectables: Injectable[];
  path: FlowPath;
  nodeTemplates: Record<string, NodeTemplate>;
  flowInterface: FlowInterface;
  flowData: EditorFlowData<HasExtra>;
};

// export type EditorRootFlowInfo<HasExtra extends boolean = true> = {
//   nodeTemplates: Record<string, NodeTemplate>;
//   flowInfos: Record<
//     string,
//     EditorFlowInfoData<HasExtra> & {
//       injectables: Injectable[];
//     }
//   >;
// };

export type EditorFlowInfoCore = EditorFlowInfo<false>;
// type EditorRootFlowExtensEditorFlow =
//   EditorRootFlow<false> extends EditorFlow<false> ? true : false;
// type EditorRootFlowCoreExtendsEditorFlowCore =
//   EditorRootFlowCore extends EditorFlowCore ? true : false;
