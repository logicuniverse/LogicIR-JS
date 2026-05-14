import {
  Data,
  FlowEventHandler,
  FlowFunction,
  FlowSubscribeHandler,
  NodeInputEventHandler,
  NodeFunction,
  NodeSubscribeHandler,
  OptionKind,
  Result,
  ResultKind,
  ReturnResult,
  ReturnResultKind,
  Service,
  Services,
  FlowError,
  Node,
} from '../types';

import { Err, Immediate, Nothing, Ok, Some, Thenable } from '../utils';

export interface SimpleService {
  [k: string]: SimpleNodeFunction;
}

export type SimpleServices = Record<string, SimpleService>;

export type SimpleEventHandler = {
  data: (
    key: string,
    value: Data | undefined,
    path?: (string | number)[]
  ) => void;
  error: (key: string, error: FlowError, path?: (string | number)[]) => void;
};

export type SimpleFlowSubscribeHandler = (
  handler: SimpleEventHandler
) => () => void;

export type SimpleNodeEventHandler = {
  data: (
    key: string,
    value: Data | undefined,
    subflowKey: string | null,
    path?: (string | number)[]
  ) => void;
  error: (
    key: string,
    error: FlowError,
    subflowKey: string | null,
    path?: (string | number)[]
  ) => void;
};

export type SimpleNodeSubscribeHandler = (
  handler: SimpleNodeEventHandler
) => () => void;

export type SimpleFlowFunction = (params: {
  inputs: Record<string, Data>; //predefined inputs, provided by parent node,
  emit?: SimpleEventHandler;
  subscribe?: SimpleFlowSubscribeHandler;
}) => Promise<Data | undefined> | Data | undefined; //  error subflow will throw exception

// // use exception to handle error
export type SimpleNodeFunction = (params: {
  inputs: Record<string, Data>;
  inject: (serviceKey: string, methodKey: string) => SimpleNodeFunction | null;
  emit: SimpleEventHandler;
  subscribe: SimpleNodeSubscribeHandler;
  meta?: {
    nodeId: string;
    node: Node;
    nodeRunId: string;
  };
  getState?: (propertyKey: string) => Data;
}) => Promise<Data | undefined> | Data | undefined; //  error node will throw exception

export const inputs2SimpleInputs = (inputs: Record<string, Result>) => {
  const simpleInputs: Record<string, Data> = {};
  for (const key of Object.keys(inputs)) {
    const res = inputs[key];
    if (res.kind === ResultKind.Error) {
      throw new Error(res.error.message);
    } else if (res.resultValue.kind === OptionKind.Some) {
      simpleInputs[key] = res.resultValue.optionValue;
    }
  }
  return simpleInputs;
};

export const simpleInputs2Inputs = (inputs: Record<string, Data>) =>
  Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => [
      key,
      value === undefined ? Ok(Nothing()) : Ok(Some(value)),
    ])
  );

export const flowEventHandler2SimpleFlowEventHandler = (
  flowEventHandler: FlowEventHandler
): SimpleEventHandler => {
  return {
    data: (key, value, path) => {
      flowEventHandler(key, {
        result: value === undefined ? Ok(Nothing()) : Ok(Some(value)),
        path,
      });
    },
    error: (key, error, path) => {
      flowEventHandler(key, { result: Err(error), path });
    },
  };
};

export const simpleFlowEventHandler2FlowEventHandler = (
  simpleFlowEventHandler: SimpleEventHandler
): FlowEventHandler => {
  return (key, { result, path }) => {
    if (result.kind === ResultKind.Ok) {
      const optionValue = result.resultValue;
      if (optionValue.kind === OptionKind.Some) {
        simpleFlowEventHandler.data(key, optionValue.optionValue, path);
      } else {
        simpleFlowEventHandler.data(key, undefined, path);
      }
    } else {
      simpleFlowEventHandler.error(key, result.error, path);
    }
  };
};

export const flowSubscribe2SimpleFlowSubscribe = (
  subscribe: FlowSubscribeHandler
): SimpleFlowSubscribeHandler => {
  return (handler: SimpleEventHandler) => {
    return subscribe(simpleFlowEventHandler2FlowEventHandler(handler));
  };
};

export const simpleFlowSubscribe2FlowSubscribe = (
  simpleSubscribe: SimpleFlowSubscribeHandler
): FlowSubscribeHandler => {
  return (handler: FlowEventHandler) => {
    return simpleSubscribe(flowEventHandler2SimpleFlowEventHandler(handler));
  };
};

export const nodeEventHandler2SimpleNodeEventHandler = (
  nodeEventHandler: NodeInputEventHandler
): SimpleNodeEventHandler => {
  return {
    data: (key, value, subflowKey, path) => {
      nodeEventHandler(
        key,
        { result: value === undefined ? Ok(Nothing()) : Ok(Some(value)), path },
        subflowKey
      );
    },
    error: (key, error, subflowKey, path) => {
      nodeEventHandler(key, { result: Err(error), path: path }, subflowKey);
    },
  };
};

export const simpleNodeEventHandler2NodeEventHandler = (
  simpleNodeEventHandler: SimpleNodeEventHandler
): NodeInputEventHandler => {
  return (key, { result, path }, subflowKey) => {
    if (result.kind === ResultKind.Ok) {
      const optionValue = result.resultValue;
      if (optionValue.kind === OptionKind.Some) {
        simpleNodeEventHandler.data(
          key,
          optionValue.optionValue,
          subflowKey,
          path
        );
      } else {
        simpleNodeEventHandler.data(key, undefined, subflowKey, path);
      }
    } else {
      simpleNodeEventHandler.error(key, result.error, subflowKey, path);
    }
  };
};

export const nodeSubscribe2SimpleNodeSubscribe = (
  subscribe: NodeSubscribeHandler
): SimpleNodeSubscribeHandler => {
  return (handler: SimpleNodeEventHandler) => {
    return subscribe(simpleNodeEventHandler2NodeEventHandler(handler));
  };
};

export const simpleNodeSubscribe2NodeSubscribe = (
  simpleSubscribe: SimpleNodeSubscribeHandler
): NodeSubscribeHandler => {
  return (handler: NodeInputEventHandler) => {
    return simpleSubscribe(nodeEventHandler2SimpleNodeEventHandler(handler));
  };
};

export const returnResult2SimpleReturnResult = (
  result: ReturnResult
): Promise<Data | undefined> | Data | undefined => {
  if (result.kind === ReturnResultKind.Thenable) {
    return new Promise((resolve, reject) => {
      result.then((awaitedResult) => {
        if (awaitedResult.kind === ResultKind.Ok) {
          const optionValue = awaitedResult.resultValue;
          if (optionValue.kind === OptionKind.Some) {
            resolve(optionValue.optionValue);
          } else {
            resolve(undefined);
          }
        } else {
          reject(new Error(awaitedResult.error.message));
        }
      });
    });
  } else {
    const resultValue = result.returnValue;
    if (resultValue.kind === ResultKind.Ok) {
      const optionValue = resultValue.resultValue;
      if (optionValue.kind === OptionKind.Some) {
        return optionValue.optionValue;
      } else {
        return undefined;
      }
    } else {
      throw new Error(resultValue.error.message);
    }
  }
};

export const simpleReturnResult2ReturnResult = (
  res: Promise<Data | undefined> | Data | undefined
): ReturnResult => {
  if (!!res && typeof (res as { then?: unknown })['then'] === 'function') {
    return Thenable((resolve) => {
      (res as Promise<Data | undefined>)
        .then((awaitedResult) => {
          if (awaitedResult === undefined) {
            resolve(Ok(Nothing()));
          } else {
            resolve(Ok(Some(awaitedResult)));
          }
        })
        .catch((err) => {
          resolve(Err({ message: String(err) }));
        });
    });
  }
  if (res === undefined) {
    return Immediate(Ok(Nothing()));
  }
  return Immediate(Ok(Some(res)));
};

export const service2SimpleService = (service: Service): SimpleService => {
  const simpleService: SimpleService = {};
  Object.entries(service).map(([key, value]) => {
    simpleService[key] = nodeFunction2SimpleNodeFunction(value);
  });
  return simpleService;
};

export const services2SimpleServices = (services: Services) =>
  Object.fromEntries(
    Object.entries(services).map(([k, v]) => [k, service2SimpleService(v)])
  );

export const simpleService2Service = (
  simpleService: SimpleService
): Service => {
  const service: Service = {};
  Object.entries(simpleService).map(([key, value]) => {
    service[key] = simpleNodeFunction2NodeFunction(value);
  });
  return service;
};

export const simpleServices2Services = (simpleServices: SimpleServices) =>
  Object.fromEntries(
    Object.entries(simpleServices).map(([k, v]) => [
      k,
      simpleService2Service(v),
    ])
  );

export const subflowFunctions2SimpleSubflowFunctions = (
  subflowFunctions: Record<string, FlowFunction>
): Record<string, SimpleFlowFunction> => {
  const simpleSubFlowFunctions: Record<string, SimpleFlowFunction> = {};
  Object.entries(subflowFunctions).map(([key, flowFunction]) => {
    simpleSubFlowFunctions[key] = flowFunction2SimpleFlowFunction(flowFunction);
  });
  return simpleSubFlowFunctions;
};

export const simpleSubFlowFunctions2SubFlowFunctions = (
  simpleSubFlowFunctions: Record<string, SimpleFlowFunction>
): Record<string, FlowFunction> => {
  const subflowFunctions: Record<string, FlowFunction> = {};
  Object.entries(simpleSubFlowFunctions).map(([key, simpleFlowFunction]) => {
    subflowFunctions[key] = simpleFlowFunction2FlowFunction(simpleFlowFunction);
  });
  return subflowFunctions;
};

export const flowFunction2SimpleFlowFunction = (
  flowFunction: FlowFunction
): SimpleFlowFunction => {
  return ({ inputs, emit, subscribe }) => {
    const _inputs = simpleInputs2Inputs(inputs);
    const _emit: FlowEventHandler = emit
      ? simpleFlowEventHandler2FlowEventHandler(emit)
      : () => {};
    const _subscribe = subscribe
      ? simpleFlowSubscribe2FlowSubscribe(subscribe)
      : () => () => {};

    const result = flowFunction(_inputs, _emit, _subscribe);
    return returnResult2SimpleReturnResult(result);
  };
};

export const simpleFlowFunction2FlowFunction = (
  simpleFunction: SimpleFlowFunction
): FlowFunction => {
  return (inputs, emit, subscribe) => {
    try {
      const simpleInputs = inputs2SimpleInputs(inputs);
      const simpleEmit = flowEventHandler2SimpleFlowEventHandler(emit);
      const simpleSubscribe = flowSubscribe2SimpleFlowSubscribe(subscribe);

      const result = simpleFunction({
        inputs: simpleInputs,
        emit: simpleEmit,
        subscribe: simpleSubscribe,
      });
      return simpleReturnResult2ReturnResult(result);
    } catch (e) {
      return Immediate(Err({ message: String(e) }));
    }
  };
};

export const nodeFunction2SimpleNodeFunction = (
  nodeFunction: NodeFunction
): SimpleNodeFunction => {
  return ({ inputs, emit, subscribe, inject, meta, getState }) => {
    const _inputs = simpleInputs2Inputs(inputs);
    const _emit = simpleFlowEventHandler2FlowEventHandler(emit);
    const _subscribe = simpleNodeSubscribe2NodeSubscribe(subscribe);
    const result = nodeFunction(
      _inputs,
      _emit,
      _subscribe,
      (serviceKey, methodKey) => {
        const serviceMethod = inject(serviceKey, methodKey);
        return simpleNodeFunction2NodeFunction(serviceMethod!);
      },
      meta,
      (propertyKey: string) => {
        if (!getState) {
          return Err({ message: 'getState is not provided' });
        }
        try {
          const state = getState(propertyKey);
          if (state === undefined) {
            return Ok(Nothing());
          }
          return Ok(Some(state));
        } catch (e) {
          return Err({ message: String(e) });
        }
      }
    );
    return returnResult2SimpleReturnResult(result);
  };
};

export const simpleNodeFunction2NodeFunction = (
  simpleCompute: SimpleNodeFunction
): NodeFunction => {
  return (inputs, emit, subscribe, inject, meta, getState) => {
    try {
      const simpleInputs = inputs2SimpleInputs(inputs);
      const simpleEmit = flowEventHandler2SimpleFlowEventHandler(emit);
      const simpleSubscribe = nodeSubscribe2SimpleNodeSubscribe(subscribe);
      const result = simpleCompute({
        inputs: simpleInputs,
        inject: (servicePath, methodKey) => {
          const method = inject(servicePath, methodKey);
          if (method) {
            return nodeFunction2SimpleNodeFunction(method);
          }
          return null;
        },
        emit: simpleEmit,
        subscribe: simpleSubscribe,
        meta,
        getState: (propertyKey) => {
          if (!getState) {
            throw new Error('getState is not provided');
          }
          const state = getState(propertyKey);
          if (state.kind === ResultKind.Error) {
            throw new Error(state.error.message);
          }
          const optionValue = state.resultValue;
          if (optionValue.kind === OptionKind.Some) {
            return optionValue.optionValue;
          }
        },
      });
      return simpleReturnResult2ReturnResult(result);
    } catch (e) {
      return Immediate(Err({ message: String(e) }));
    }
  };
};
