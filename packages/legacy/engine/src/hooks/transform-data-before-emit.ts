import { LUProjectorPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformDataBeforeEmitHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformDataBeforeEmit'] =>
  (context, store, portId, value) => {
    let transformedValue: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformDataBeforeEmit) {
        const res = plugin.hooks.transformDataBeforeEmit(
          context,
          store,
          portId,
          transformedValue ?? value
        );
        if (res) {
          transformedValue = res;
          onEvent({
            name: 'onDidTransformDataBeforeEmit',
            luSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              portId,
              from: value,
              to: transformedValue,
            },
          });
        }
      }
    }
    return transformedValue;
  };
