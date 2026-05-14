import {
  Data,
  LUEventHandler,
  LUClosureProjector,
  LUSubscribeHandler,
  LUIEventHandler,
  LUProjector,
  LUISubscribeHandler,
  OptionKind,
  Result,
  ResultKind,
  ReturnResult,
  ReturnResultKind,
  Service,
  Services,
  LUError,
  LUI,
} from '../types';

import { Err, Immediate, Nothing, Ok, Some, Thenable } from '../utils';

export interface SimpleService {
  [k: string]: SimpleLUProjector;
}

export type SimpleServices = Record<string, SimpleService>;

export type SimpleEventHandler = {
  data: (
    key: string,
    value: Data | undefined,
    path?: (string | number)[]
  ) => void;
  error: (key: string, error: LUError, path?: (string | number)[]) => void;
};

export type SimpleLUSubscribeHandler = (
  handler: SimpleEventHandler
) => () => void;

export type SimpleLUIEventHandler = {
  data: (
    key: string,
    value: Data | undefined,
    closureKey: string | null,
    path?: (string | number)[]
  ) => void;
  error: (
    key: string,
    error: LUError,
    closureKey: string | null,
    path?: (string | number)[]
  ) => void;
};

export type SimpleLUISubscribeHandler = (
  handler: SimpleLUIEventHandler
) => () => void;

export type SimpleLUClosureProjector = (params: {
  inputs: Record<string, Data>; //predefined inputs, provided by parent LUI,
  emit?: SimpleEventHandler;
  subscribe?: SimpleLUSubscribeHandler;
}) => Promise<Data | undefined> | Data | undefined; //  error closure will throw exception

// // use exception to handle error
export type SimpleLUProjector = (params: {
  inputs: Record<string, Data>;
  inject: (serviceKey: string, methodKey: string) => SimpleLUProjector | null;
  emit: SimpleEventHandler;
  subscribe: SimpleLUISubscribeHandler;
  meta?: {
    luiId: string;
    lui: LUI;
    luiRunId: string;
  };
  getState?: (propertyKey: string) => Data;
}) => Promise<Data | undefined> | Data | undefined; //  error LUI will throw exception

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

export const luEventHandler2SimpleLUEventHandler = (
  luEventHandler: LUEventHandler
): SimpleEventHandler => {
  return {
    data: (key, value, path) => {
      luEventHandler(key, {
        result: value === undefined ? Ok(Nothing()) : Ok(Some(value)),
        path,
      });
    },
    error: (key, error, path) => {
      luEventHandler(key, { result: Err(error), path });
    },
  };
};

export const simpleLUEventHandler2LUEventHandler = (
  simpleLUEventHandler: SimpleEventHandler
): LUEventHandler => {
  return (key, { result, path }) => {
    if (result.kind === ResultKind.Ok) {
      const optionValue = result.resultValue;
      if (optionValue.kind === OptionKind.Some) {
        simpleLUEventHandler.data(key, optionValue.optionValue, path);
      } else {
        simpleLUEventHandler.data(key, undefined, path);
      }
    } else {
      simpleLUEventHandler.error(key, result.error, path);
    }
  };
};

export const luSubscribe2SimpleLUSubscribe = (
  subscribe: LUSubscribeHandler
): SimpleLUSubscribeHandler => {
  return (handler: SimpleEventHandler) => {
    return subscribe(simpleLUEventHandler2LUEventHandler(handler));
  };
};

export const simpleLUSubscribe2LUSubscribe = (
  simpleSubscribe: SimpleLUSubscribeHandler
): LUSubscribeHandler => {
  return (handler: LUEventHandler) => {
    return simpleSubscribe(luEventHandler2SimpleLUEventHandler(handler));
  };
};

export const luiEventHandler2SimpleLUIEventHandler = (
  luiEventHandler: LUIEventHandler
): SimpleLUIEventHandler => {
  return {
    data: (key, value, closureKey, path) => {
      luiEventHandler(
        key,
        { result: value === undefined ? Ok(Nothing()) : Ok(Some(value)), path },
        closureKey
      );
    },
    error: (key, error, closureKey, path) => {
      luiEventHandler(key, { result: Err(error), path: path }, closureKey);
    },
  };
};

export const simpleLUIEventHandler2LUIEventHandler = (
  simpleLUIEventHandler: SimpleLUIEventHandler
): LUIEventHandler => {
  return (key, { result, path }, closureKey) => {
    if (result.kind === ResultKind.Ok) {
      const optionValue = result.resultValue;
      if (optionValue.kind === OptionKind.Some) {
        simpleLUIEventHandler.data(
          key,
          optionValue.optionValue,
          closureKey,
          path
        );
      } else {
        simpleLUIEventHandler.data(key, undefined, closureKey, path);
      }
    } else {
      simpleLUIEventHandler.error(key, result.error, closureKey, path);
    }
  };
};

export const luiSubscribe2SimpleLUISubscribe = (
  subscribe: LUISubscribeHandler
): SimpleLUISubscribeHandler => {
  return (handler: SimpleLUIEventHandler) => {
    return subscribe(simpleLUIEventHandler2LUIEventHandler(handler));
  };
};

export const simpleLUISubscribe2LUISubscribe = (
  simpleSubscribe: SimpleLUISubscribeHandler
): LUISubscribeHandler => {
  return (handler: LUIEventHandler) => {
    return simpleSubscribe(luiEventHandler2SimpleLUIEventHandler(handler));
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
    simpleService[key] = luProjector2SimpleLUProjector(value);
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
    service[key] = simpleLUProjector2LUProjector(value);
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

export const closureProjectors2SimpleClosureProjectors = (
  closureProjectors: Record<string, LUClosureProjector>
): Record<string, SimpleLUClosureProjector> => {
  const simpleProjectors: Record<string, SimpleLUClosureProjector> = {};
  Object.entries(closureProjectors).map(([key, closureProjector]) => {
    simpleProjectors[key] =
      closureProjector2SimpleClosureProjector(closureProjector);
  });
  return simpleProjectors;
};

export const simpleClosureProjectors2ClosureProjectors = (
  simpleProjectors: Record<string, SimpleLUClosureProjector>
): Record<string, LUClosureProjector> => {
  const projectors: Record<string, LUClosureProjector> = {};
  Object.entries(simpleProjectors).map(([key, simpleClosureProjector]) => {
    projectors[key] = simpleClosureProjector2ClosureProjector(
      simpleClosureProjector
    );
  });
  return projectors;
};

export const closureProjector2SimpleClosureProjector = (
  closureProjector: LUClosureProjector
): SimpleLUClosureProjector => {
  return ({ inputs, emit, subscribe }) => {
    const _inputs = simpleInputs2Inputs(inputs);
    const _emit: LUEventHandler = emit
      ? simpleLUEventHandler2LUEventHandler(emit)
      : () => {};
    const _subscribe = subscribe
      ? simpleLUSubscribe2LUSubscribe(subscribe)
      : () => () => {};

    const result = closureProjector(_inputs, _emit, _subscribe);
    return returnResult2SimpleReturnResult(result);
  };
};

export const simpleClosureProjector2ClosureProjector = (
  simpleProjector: SimpleLUClosureProjector
): LUClosureProjector => {
  return (inputs, emit, subscribe) => {
    try {
      const simpleInputs = inputs2SimpleInputs(inputs);
      const simpleEmit = luEventHandler2SimpleLUEventHandler(emit);
      const simpleSubscribe = luSubscribe2SimpleLUSubscribe(subscribe);

      const result = simpleProjector({
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

export const luProjector2SimpleLUProjector = (
  projector: LUProjector
): SimpleLUProjector => {
  return ({ inputs, emit, subscribe, inject, meta, getState }) => {
    const _inputs = simpleInputs2Inputs(inputs);
    const _emit = simpleLUEventHandler2LUEventHandler(emit);
    const _subscribe = simpleLUISubscribe2LUISubscribe(subscribe);
    const result = projector(
      _inputs,
      _emit,
      _subscribe,
      (serviceKey, methodKey) => {
        const serviceMethod = inject(serviceKey, methodKey);
        return simpleLUProjector2LUProjector(serviceMethod!);
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

export const simpleLUProjector2LUProjector = (
  simpleProjector: SimpleLUProjector
): LUProjector => {
  return (inputs, emit, subscribe, inject, meta, getState) => {
    try {
      const simpleInputs = inputs2SimpleInputs(inputs);
      const simpleEmit = luEventHandler2SimpleLUEventHandler(emit);
      const simpleSubscribe = luiSubscribe2SimpleLUISubscribe(subscribe);
      const result = simpleProjector({
        inputs: simpleInputs,
        inject: (servicePath, methodKey) => {
          const method = inject(servicePath, methodKey);
          if (method) {
            return luProjector2SimpleLUProjector(method);
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
