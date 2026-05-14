import { CompileContext, CompileDependencies } from './types';
import { editorFlow2RuntimeFlow } from './transforms/flow';
import { getEditorFlowInfoMap, getFlowPathKey } from '../common';
// import { NodeImplementation } from '../nodes';

export * from './types';

// Compile result is language agnostic, it can be used for any target language
export const compile = async (
  entryId: string,
  compileData: CompileDependencies
) => {
  const rootFlow = await compileData.getFlow(entryId);
  const context: CompileContext = {
    ...compileData,
    currentRootFlow: rootFlow,
    // currentRootFlow: await compileData.getFlow(entryId),
    cachedRuntimeFlows: {},
    cachedContents: {},
    cachedFiles: {},
  };

  context.cachedRuntimeFlows[entryId] = await editorFlow2RuntimeFlow(
    context,
    getEditorFlowInfoMap(context, rootFlow).get(getFlowPathKey([]))!
    // getEditorRootFlowInfo(
    //   context.currentRootFlow,
    //   compileData.getServiceMethod,
    //   compileData.getFlowInterface
    // ).nodeTemplates
  );

  // const nodeImplementations: Record<string, NodeImplementation> = {};
  // todo
  return {
    flows: context.cachedRuntimeFlows,
    contents: context.cachedContents,
    staticFiles: context.cachedFiles,
    // nodeImplementations,
  };
};

export type CompileResult = ReturnType<typeof compile>;
