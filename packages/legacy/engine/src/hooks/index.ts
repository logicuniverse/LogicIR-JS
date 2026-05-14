import { LUProjectorPlugin, HookEventData, Hooks } from '../types';
import { getOverrideClosureProjectionHook } from './override-closure-projection';
import { getOverrideLUIManifestationHook } from './override-lui-manifestation';
import { getTransformClosureInputsHook } from './transform-closure-inputs';
import { getTransformClosureOutputHook } from './transform-closure-output';
import { getTransformLUIInputsHook } from './transform-lui-inputs';
import { getTransformLUIOutputHook } from './transform-lui-output';
import { getTransformDataAfterReadHook } from './transform-data-after-read';
import { getTransformDataBeforeEmitHook } from './transform-data-before-emit';
import { getRandomManifestId } from '../utils';

export const createHooks = (plugins: LUProjectorPlugin[]): Hooks => {
  const onEvent = (event: HookEventData) => {
    const timestamp = new Date().valueOf();
    const eventId = `evt-${getRandomManifestId()}`;
    plugins.map((x) =>
      x.hooks?.onEvent?.({ ...event, timestamp, id: eventId })
    );
  };
  return {
    onEvent,
    overrideClosureProjection: getOverrideClosureProjectionHook(
      plugins,
      onEvent
    ),
    overrideLUIManifestation: getOverrideLUIManifestationHook(plugins, onEvent),
    transformClosureInputs: getTransformClosureInputsHook(plugins, onEvent),
    transformClosureOutput: getTransformClosureOutputHook(plugins, onEvent),
    transformLUIInputs: getTransformLUIInputsHook(plugins, onEvent),
    transformLUIOutput: getTransformLUIOutputHook(plugins, onEvent),
    transformDataAfterRead: getTransformDataAfterReadHook(plugins, onEvent),
    transformDataBeforeEmit: getTransformDataBeforeEmitHook(plugins, onEvent),
  };
};
