import { FlowRunnerPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformDataBeforeEmitHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformDataBeforeEmit'] =>
  (context, flowStore, portId, value) => {
    let transformedValue: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformDataBeforeEmit) {
        const res = plugin.hooks.transformDataBeforeEmit(
          context,
          flowStore,
          portId,
          transformedValue ?? value
        );
        if (res) {
          transformedValue = res;
          onEvent({
            name: 'onDidTransformDataBeforeEmit',
            flowSession: context.session,
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
