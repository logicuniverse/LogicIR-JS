import { FlowRunnerPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformNodeInputsHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformNodeInputs'] =>
  (context, flowStore, nodeMeta, nodeInputs) => {
    let transformedInputs: Record<string, Result> | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformNodeInputs) {
        const res = plugin.hooks.transformNodeInputs(
          context,
          flowStore,
          nodeMeta,
          transformedInputs ?? nodeInputs
        );
        if (res) {
          transformedInputs = res;
          onEvent({
            name: 'onDidTransformNodeInputs',
            flowSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              nodeMeta,
              from: nodeInputs,
              to: transformedInputs,
            },
          });
        }
      }
    }
    return transformedInputs;
  };
