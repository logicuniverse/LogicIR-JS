import { FlowRunnerPlugin, HookEventData, Hooks } from '../types';
import { getOverrideFlowRunHook } from './override-flow-run';
import { getOverrideNodeRunHook } from './override-node-run';
import { getTransformFlowInputsHook } from './transform-flow-inputs';
import { getTransformFlowOutputHook } from './transform-flow-output';
import { getTransformNodeInputsHook } from './transform-node-inputs';
import { getTransformNodeOutputHook } from './transform-node-output';
import { getTransformDataAfterReadHook } from './transform-data-after-read';
import { getTransformDataBeforeEmitHook } from './transform-data-before-emit';
import { getRandomRunId } from '../utils';

export const createHooks = (plugins: FlowRunnerPlugin[]): Hooks => {
  const onEvent = (event: HookEventData) => {
    const timestamp = new Date().valueOf();
    const eventId = `evt-${getRandomRunId()}`;
    plugins.map((x) =>
      x.hooks?.onEvent?.({ ...event, timestamp, id: eventId })
    );
  };
  return {
    onEvent,
    overrideFlowRun: getOverrideFlowRunHook(plugins, onEvent),
    overrideNodeRun: getOverrideNodeRunHook(plugins, onEvent),
    transformFlowInputs: getTransformFlowInputsHook(plugins, onEvent),
    transformFlowOutput: getTransformFlowOutputHook(plugins, onEvent),
    transformNodeInputs: getTransformNodeInputsHook(plugins, onEvent),
    transformNodeOutput: getTransformNodeOutputHook(plugins, onEvent),
    transformDataAfterRead: getTransformDataAfterReadHook(plugins, onEvent),
    transformDataBeforeEmit: getTransformDataBeforeEmitHook(plugins, onEvent),
  };
};
