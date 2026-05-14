import {
  CoreContext,
  EditorFlowData,
  EditorNodeTargetData,
  EditorRootFlow,
  NodeTemplate,
} from '../../common/types';

// import { EditSettings } from '../settings';

export type MaybePromise<T> = T | Promise<T>;
export type EditContext = CoreContext & {
  // settings: EditSettings;
  // getNodeTemplate: (
  //   nodeId: string,
  //   target: EditorNodeTargetData
  // ) => NodeTemplate | null;
  editorRootFlow: EditorRootFlow;
  // viewState: ViewState;
};

export type EditorFlowUpdater = (
  flowData: EditorFlowData | EditorRootFlow,
  rootFlowData: EditorRootFlow
  // editorFlow: DeepReadonly<EditorFlow>
) => void | string[];

export type FlowPath = {
  nodeId: string;
  subflowKey: string;
}[];

export type ViewSelection = string[];

export type ViewState = {
  outerPath: FlowPath;
  innerPath: FlowPath;
  selection: ViewSelection;
};

export type EditReturn = {
  updater: EditorFlowUpdater;
  selection?: ViewSelection;
};

export type EditHandler<T = any> = (params: T) => MaybePromise<{
  updater: EditorFlowUpdater;
  selection?: ViewSelection;
}>;

export type EditOperation<T> = {
  handler: EditHandler<T>;
  when?: (context: EditContext) => boolean;
};
