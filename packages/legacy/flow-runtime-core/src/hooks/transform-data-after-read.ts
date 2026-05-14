import { FlowRunnerPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformDataAfterReadHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformDataAfterRead'] =>
  (context, flowStore, portId, value) => {
    let transformedValue: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformDataAfterRead) {
        const res = plugin.hooks.transformDataAfterRead(
          context,
          flowStore,
          portId,
          transformedValue ?? value
        );
        if (res) {
          transformedValue = res;
          onEvent({
            name: 'onDidTransformDataAfterRead',
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
