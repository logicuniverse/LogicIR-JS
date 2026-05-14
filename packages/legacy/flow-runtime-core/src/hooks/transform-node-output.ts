import { FlowRunnerPlugin, HookEventData, Hooks, Result } from '../types';

export const getTransformNodeOutputHook =
  (
    plugins: FlowRunnerPlugin[],
    onEvent: (event: HookEventData) => void
  ): Hooks['transformNodeOutput'] =>
  (context, flowStore, nodeMeta, nodeOutput) => {
    let transformedOutput: Result | undefined = undefined;
    for (const plugin of plugins) {
      if (plugin.hooks?.transformNodeOutput) {
        const res = plugin.hooks.transformNodeOutput(
          context,
          flowStore,
          nodeMeta,
          transformedOutput ?? nodeOutput
        );
        if (res) {
          transformedOutput = res;
          onEvent({
            name: 'onDidTransformNodeOutput',
            flowSession: context.session,
            kind: 'plugin',
            plugin: { name: plugin.name },
            value: {
              nodeMeta,
              from: nodeOutput,
              to: transformedOutput,
            },
          });
        }
      }
    }
    return transformedOutput;
  };
