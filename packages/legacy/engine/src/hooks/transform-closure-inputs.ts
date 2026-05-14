import { LUProjectorPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformClosureInputsHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformClosureInputs'] =>
  (context, closureInputs) => {
    let transformedInputs: Record<string, Result> | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformClosureInputs) {
        const res = plugin.hooks.transformClosureInputs(
          context,
          transformedInputs ?? closureInputs
        );
        if (res) {
          transformedInputs = res;
          onEvent({
            name: 'onDidTransformClosureInputs',
            luSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              from: closureInputs,
              to: transformedInputs,
            },
          });
        }
      }
    }
    return transformedInputs;
  };
