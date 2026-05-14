import { LUProjectorPlugin, HookEventData, Hooks } from '../types';
import { transformReturnResult } from '../utils';

export const getOverrideClosureProjectionHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['overrideClosureProjection'] =>
  (context, inputs, emit, subscribe) => {
    for (const plugin of plugins) {
      if (plugin.hooks?.overrideClosureProjection) {
        const res = plugin.hooks.overrideClosureProjection(
          context,
          inputs,
          emit,
          subscribe
        );
        if (res) {
          return transformReturnResult(res, (result) => {
            onEvent({
              kind: 'plugin',
              plugin: { name: plugin.name },
              name: 'onDidOverrideClosureProjection',
              luSession: context.session,
              value: {
                closureInputs: inputs,
                closureOutput: result,
              },
            });
            return result;
          });
        }
      }
    }
  };
