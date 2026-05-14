import { FlowRunnerPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformFlowInputsHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformFlowInputs'] =>
  (context, flowInputs) => {
    let transformedInputs: Record<string, Result> | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformFlowInputs) {
        const res = plugin.hooks.transformFlowInputs(
          context,
          transformedInputs ?? flowInputs
        );
        if (res) {
          transformedInputs = res;
          onEvent({
            name: 'onDidTransformFlowInputs',
            flowSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              from: flowInputs,
              to: transformedInputs,
            },
          });
        }
      }
    }
    return transformedInputs;
  };
