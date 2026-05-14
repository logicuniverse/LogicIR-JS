import { LUProjectorPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformDataAfterReadHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformDataAfterRead'] =>
  (context, store, portId, value) => {
    let transformedValue: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformDataAfterRead) {
        const res = plugin.hooks.transformDataAfterRead(
          context,
          store,
          portId,
          transformedValue ?? value
        );
        if (res) {
          transformedValue = res;
          onEvent({
            name: 'onDidTransformDataAfterRead',
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
