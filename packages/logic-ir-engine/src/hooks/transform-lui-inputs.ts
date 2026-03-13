import { LUProjectorPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformLUIInputsHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformLUIInputs'] =>
  (context, store, luiMeta, luiInputs) => {
    let transformedInputs: Record<string, Result> | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformLUIInputs) {
        const res = plugin.hooks.transformLUIInputs(
          context,
          store,
          luiMeta,
          transformedInputs ?? luiInputs
        );
        if (res) {
          transformedInputs = res;
          onEvent({
            name: 'onDidTransformLUIInputs',
            luSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              luiMeta: luiMeta,
              from: luiInputs,
              to: transformedInputs,
            },
          });
        }
      }
    }
    return transformedInputs;
  };
