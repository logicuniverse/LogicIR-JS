import {
  Context,
  LU,
  LUEventHandler,
  LUProjectorPlugin,
  LUProjector,
  Result,
  LUSession,
  StateStore,
  Provider,
} from './types';
import { createLUClosureProjector } from './projection';
import { createHooks } from './hooks';
import { getRandomManifestId } from './utils';

const getSimpleKVStore = (_id: string) => {
  const stateMap = new Map<string, Result>();
  const stateStore: StateStore<Result> = {
    getState: (k) => stateMap.get(k),
    setState: (k, v) => stateMap.set(k, v),
    deleteState: (k) => stateMap.delete(k),
  };
  return stateStore;
};

export const createLUProjector = (
  entryId: string,
  lus: Record<string, LU>,
  plugins: LUProjectorPlugin[],
  getKVStore = getSimpleKVStore
) => {
  const cachedLUProjectors: Record<string, LUProjector> = {};

  // hooks is running one by one, then later one can override the previous one
  const hooks = createHooks(plugins);

  // getters are running in reverse order so that later ones can override previous ones
  const reversedPlugins = plugins.slice().reverse();

  const inject = (provider: Provider, unitKey: string): LUProjector | null => {
    if (provider.source) {
      throw new Error('Source should be null!');
    }

    const serviceKey = provider.key;
    const fullKey = `ij_${serviceKey}_${unitKey}`;
    if (cachedLUProjectors[fullKey]) {
      return cachedLUProjectors[fullKey];
    }
    for (const p of reversedPlugins) {
      const projector = p.inject?.(serviceKey, unitKey);
      if (projector) {
        cachedLUProjectors[fullKey] = projector;
        return projector;
      }
    }
    return null;
  };

  const getServiceMethod = (
    packageId: string,
    methodKey: string
  ): LUProjector => {
    const fullKey = `sm_${packageId}_${methodKey}`;
    if (cachedLUProjectors[fullKey]) {
      return cachedLUProjectors[fullKey];
    }
    for (const p of reversedPlugins) {
      const func = p.getServiceProjector?.(packageId, methodKey);
      if (func) {
        cachedLUProjectors[fullKey] = func;
        return func;
      }
    }
    throw new Error(
      `Service method not found: packageId=${packageId}, methodKey=${methodKey}`
    );
  };

  const lu = lus[entryId];

  return (
    inputs: Record<string, Result>,
    emit?: LUEventHandler,
    subscribe?: (listener: LUEventHandler) => () => void
  ) => {
    const runId = getRandomManifestId();
    const luSession: LUSession = {
      luId: entryId,
      outer: [],
      luRunId: runId,
      inner: [],
    };

    const context: Context = {
      getStateStore: getKVStore,
      getLU: (luId) => lus[luId],
      getLUProjector: getServiceMethod,
      inject,
      hooks,
      session: luSession,
      lu: lu,
    };
    const luClosureProjector = createLUClosureProjector(context);
    return luClosureProjector(
      inputs,
      (key, packet) => {
        emit?.(key, packet);
      },
      (listener) => {
        if (subscribe) {
          return subscribe(listener);
        }
        return () => {};
      }
    );
  };
};
