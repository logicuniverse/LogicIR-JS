import { FlowRunnerPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformFlowOutputHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformFlowOutput'] =>
  (context, flowStore, flowOutput) => {
    let transformedOutput: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformFlowOutput) {
        const res = plugin.hooks.transformFlowOutput(
          context,
          flowStore,
          transformedOutput ?? flowOutput
        );
        if (res) {
          transformedOutput = res;
          onEvent({
            name: 'onDidTransformFlowOutput',
            flowSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              from: flowOutput,
              to: transformedOutput,
            },
          });
        }
      }
    }
    return transformedOutput;
  };
