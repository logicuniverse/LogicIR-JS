import { LUProjectorPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformClosureOutputHook =
  (
    plugins: LUProjectorPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformClosureOutput'] =>
  (context, store, closureOutput) => {
    let transformedOutput: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformClosureOutput) {
        const res = plugin.hooks.transformClosureOutput(
          context,
          store,
          transformedOutput ?? closureOutput
        );
        if (res) {
          transformedOutput = res;
          onEvent({
            name: 'onDidTransformClosureOutput',
            luSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              from: closureOutput,
              to: transformedOutput,
            },
          });
        }
      }
    }
    return transformedOutput;
  };
