import { LUProjectorPlugin, HookEventData, Hooks } from '../types';
import { transformReturnResult } from '../utils';

export const getOverrideLUIManifestationHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['overrideLUIManifestation'] =>
  (
    context,
    store,
    luiMeta,
    luiInputs,
    injections,
    readClosureInputs,
    emit,
    subscribe
  ) => {
    for (const plugin of plugins) {
      if (plugin.hooks?.overrideLUIManifestation) {
        const res = plugin.hooks.overrideLUIManifestation(
          context,
          store,
          luiMeta,
          luiInputs,
          injections,
          readClosureInputs,
          emit,
          subscribe
        );
        if (res) {
          return transformReturnResult(res, (result) => {
            onEvent({
              name: 'onDidOverrideLUIManifestation',
              luSession: context.session,
              kind: 'plugin',
              plugin: { name: plugin.name },
              value: {
                luiMeta: luiMeta,
                luiInputs: luiInputs,
                luiOutput: result,
              },
            });
            return result;
          });
        }
      }
    }
  };
