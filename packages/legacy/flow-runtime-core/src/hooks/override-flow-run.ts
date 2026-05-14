import { FlowRunnerPlugin, HookEventData, Hooks } from '../types';
import { transformReturnResult } from '../utils';

export const getOverrideFlowRunHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['overrideFlowRun'] =>
  (context, flowInputs, emit, subscribe) => {
    for (const plugin of plugins) {
      if (plugin.hooks?.overrideFlowRun) {
        const res = plugin.hooks.overrideFlowRun(
          context,
          flowInputs,
          emit,
          subscribe
        );
        if (res) {
          return transformReturnResult(res, (result) => {
            onEvent({
              kind: 'plugin',
              plugin: { name: plugin.name },
              name: 'onDidOverrideFlowRun',
              flowSession: context.session,
              value: {
                flowInputs,
                flowOutput: result,
              },
            });
            return result;
          });
        }
      }
    }
  };
