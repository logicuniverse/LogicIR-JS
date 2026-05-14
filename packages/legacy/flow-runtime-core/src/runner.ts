import {
  Context,
  Flow,
  FlowEventHandler,
  FlowRunnerPlugin,
  NodeFunction,
  Result,
  FlowSession,
  StateStore,
  Provider,
} from './types';
import { createFlowFunction } from './run-flow';
import { createHooks } from './hooks';
import { getRandomRunId } from './utils';

const getSimpleKVStore = (_id: string) => {
  const stateMap = new Map<string, Result>();
  const stateStore: StateStore<Result> = {
    getState: (k) => stateMap.get(k),
    setState: (k, v) => stateMap.set(k, v),
    deleteState: (k) => stateMap.delete(k),
  };
  return stateStore;
};

export const createRunner = (
  entryFlowId: string,
  flows: Record<string, Flow>,
  plugins: FlowRunnerPlugin[],
  getKVStore = getSimpleKVStore
) => {
  const cachedNativeFunctions: Record<string, NodeFunction> = {};
  // const cachedFlow: Record<string, Flow> = {};

  // hooks is running one by one, then later one can override the previous one
  const hooks = createHooks(plugins);

  // getters are running in reverse order so that later ones can override previous ones
  const reversedPlugins = plugins.slice().reverse();

  const inject = (
    provider: Provider,
    methodKey: string
  ): NodeFunction | null => {
    if (provider.parent) {
      throw new Error('Parent should be null!');
    }

    const serviceKey = provider.key;
    const fullKey = `ij_${serviceKey}_${methodKey}`;
    if (cachedNativeFunctions[fullKey]) {
      return cachedNativeFunctions[fullKey];
    }
    for (const p of reversedPlugins) {
      const func = p.inject?.(serviceKey, methodKey);
      if (func) {
        cachedNativeFunctions[fullKey] = func;
        return func;
      }
    }
    return null;
  };

  const getServiceMethod = (
    packageId: string,
    methodKey: string
  ): NodeFunction => {
    const fullKey = `sm_${packageId}_${methodKey}`;
    if (cachedNativeFunctions[fullKey]) {
      return cachedNativeFunctions[fullKey];
    }
    for (const p of reversedPlugins) {
      const func = p.getServiceMethod?.(packageId, methodKey);
      if (func) {
        cachedNativeFunctions[fullKey] = func;
        return func;
      }
    }
    throw new Error(
      `Service method not found: packageId=${packageId}, methodKey=${methodKey}`
    );
  };

  const rootFlow = flows[entryFlowId];

  return (
    inputs: Record<string, Result>,
    emit?: FlowEventHandler,
    subscribe?: (listener: FlowEventHandler) => () => void
  ) => {
    const runId = getRandomRunId();
    const flowSession: FlowSession = {
      rootFlowId: entryFlowId,
      outer: [],
      rootFlowRunId: runId,
      inner: [],
    };

    const context: Context = {
      getStateStore: getKVStore,
      getFlow: (flowId) => flows[flowId],
      getNodeFunction: getServiceMethod,
      inject,
      hooks,
      session: flowSession,
      flow: rootFlow,
    };
    const flowFunction = createFlowFunction(context);
    return flowFunction(
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
