import { FlowRunnerPlugin, HookEventData, Hooks } from '../types';
import { transformReturnResult } from '../utils';

export const getOverrideNodeRunHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['overrideNodeRun'] =>
  (
    context,
    flowStore,
    nodeMeta,
    nodeInputs,
    injections,
    readSubFlowInputs,
    emit,
    subscribe
  ) => {
    for (const plugin of plugins) {
      if (plugin.hooks?.overrideNodeRun) {
        const res = plugin.hooks.overrideNodeRun(
          context,
          flowStore,
          nodeMeta,
          nodeInputs,
          injections,
          readSubFlowInputs,
          emit,
          subscribe
        );
        if (res) {
          return transformReturnResult(res, (result) => {
            onEvent({
              name: 'onDidOverrideNodeRun',
              flowSession: context.session,
              kind: 'plugin',
              plugin: { name: plugin.name },
              value: {
                nodeMeta,
                nodeInputs,
                nodeOutput: result,
              },
            });
            return result;
          });
        }
      }
    }
  };
