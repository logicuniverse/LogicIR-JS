import { LUProjectorPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformLUIOutputHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformLUIOutput'] =>
  (context, store, luiMeta, luiOutput) => {
    let transformedOutput: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformLUIOutput) {
        const res = plugin.hooks.transformLUIOutput(
          context,
          store,
          luiMeta,
          transformedOutput ?? luiOutput
        );
        if (res) {
          transformedOutput = res;
          onEvent({
            name: 'onDidTransformLUIOutput',
            luSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              luiMeta: luiMeta,
              from: luiOutput,
              to: transformedOutput,
            },
          });
        }
      }
    }
    return transformedOutput;
  };
