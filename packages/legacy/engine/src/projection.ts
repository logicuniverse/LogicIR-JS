import {
  Context,
  LUClosureProjector,
  LUKind,
  LUSession,
  LUClosureStore,
  LUI,
  LUIEventHandler,
  LUIMeta,
  LUITargetKind,
  OptionKind,
  PortKind,
  Result,
  ResultKind,
  ReturnResult,
  ReturnResultKind,
  SequentialStep,
  SequentialStepKind,
  SequentialStepResult,
  SequentialStepResultKind,
  LUClosure,
  ThenableReturnResult,
  SequentialLU,
  StatefulLU,
  ComposableLU,
  Address,
  PortExpansion,
  Data,
  Packet,
  ErrorData,
  LUEventHandler,
  LUMeta,
  ComposableReturn,
  LUProjector,
  Provider,
} from './types';
import {
  Err,
  getRandomManifestId,
  getRuntimePorts,
  Immediate,
  Nothing,
  Ok,
  SeqGoBack,
  SeqNext,
  SeqReturn,
  Some,
  Thenable,
  transformReturnResult,
  getResultByPath,
  transformComposable,
} from './utils';

const readLUIInputs = (
  context: Context,
  store: LUClosureStore,
  { luiId, lui }: LUIMeta
) => {
  const inputs: Record<string, Result> = {};
  if (lui.defaultInputs) {
    Object.entries(lui.defaultInputs).map(([k, v]) => {
      inputs[k] = Ok(Some(v));
    });
  }
  const ports = lui.ports.inputs.filter(
    (x) => x.kind === PortKind.Pull || x.kind === PortKind.Property
  );
  ports.map((port) => {
    const result = readTargetPortWithHooks(context, store, port.id);
    if (
      !(
        result.kind === ResultKind.Ok &&
        result.resultValue.kind === OptionKind.Nothing &&
        inputs[port.key]
      )
    ) {
      inputs[port.key] = result;
    }
  });

  if (
    context.lu.kind === LUKind.Sequential &&
    context.lu.sequentialLUIs[luiId]
  ) {
    const ports = lui.ports.inputs.filter((x) => x.kind === PortKind.Push);
    ports.map((port) => {
      const cachedData = store.portStates.getState(port.id);
      if (cachedData) {
        inputs[port.key] = cachedData;
        store.portStates.deleteState(port.id);
      }
    });
  }
  return inputs;
};

const readLUIInputsWithHooks = (
  context: Context,
  store: LUClosureStore,
  luiMeta: LUIMeta
) => {
  context.hooks.onEvent?.({
    name: 'onReadLUIInputsBegin',
    kind: 'lui',
    luiMeta: luiMeta,
    luSession: context.session,
  });
  const inputs = readLUIInputs(context, store, luiMeta);
  context.hooks.onEvent?.({
    name: 'onReadLUIInputsEnd',
    kind: 'lui',
    luiMeta: luiMeta,
    luSession: context.session,
    value: {
      luiInputs: inputs,
    },
  });
  const transformedInputs = context.hooks.transformLUIInputs?.(
    context,
    store,
    luiMeta,
    inputs
  );
  return transformedInputs ?? inputs;
};

const readTargetPortOnAddress = (
  context: Context,
  store: LUClosureStore,
  portId: string,
  address: Address,
  expansion: PortExpansion | null
): Result => {
  if (
    (typeof expansion === 'number' && expansion > 0) ||
    (Array.isArray(expansion) && expansion.length > 0)
  ) {
    if (Array.isArray(expansion)) {
      const data: Record<string, Data> = {};
      for (const item of expansion) {
        const result = readTargetPortOnAddress(
          context,
          store,
          portId,
          [...address, item],
          null
        );
        if (result.kind === ResultKind.Error) {
          return result;
        } else if (result.resultValue.kind === OptionKind.Some) {
          data[item] = result.resultValue.optionValue;
        }
      }
      return Ok(Some(data));
    } else {
      const data: Data[] = [];
      for (let i = 0; i < expansion; i++) {
        const result = readTargetPortOnAddress(
          context,
          store,
          portId,
          [...address, i],
          null
        );
        if (result.kind === ResultKind.Error) {
          return result;
        } else if (result.resultValue.kind === OptionKind.Some) {
          data[i] = result.resultValue.optionValue;
        } else {
          data[i] = undefined;
        }
      }
      return Ok(Some(data));
    }
  } else {
    const connection = Object.values(context.lu.nets).find(
      (x) =>
        x.target.portId === portId &&
        JSON.stringify(x.target.address ?? []) === JSON.stringify(address)
    );
    if (connection) {
      const result = readSourcePort(context, store, connection.source.portId);
      return getResultByPath(result, connection.source.address ?? []);
    }
    return Ok(Nothing());
  }
};

const readTargetPortWithHooks = (
  context: Context,
  store: LUClosureStore,
  portId: string
): Result => {
  context.hooks.onEvent?.({
    kind: 'closure',
    name: 'onReadDataBegin',
    luSession: context.session,
    value: {
      portId,
    },
  });
  const port = store.runtimePorts[portId];
  const result = readTargetPortOnAddress(
    context,
    store,
    portId,
    [],
    port.expansion ?? null
  );
  context.hooks.onEvent?.({
    kind: 'closure',
    name: 'onReadDataEnd',
    luSession: context.session,
    value: {
      portId,
      value: result,
    },
  });
  const transformedResult = context.hooks.transformDataAfterRead?.(
    context,
    store,
    portId,
    result
  );
  return transformedResult ?? result;
};

const readClosureInputs = (
  context: Context,
  store: LUClosureStore,
  closureInputPorts: { id: string; key: string }[]
) => {
  store.tempPortStates.clear();
  const inputs: Record<string, Result> = {};
  const ports = closureInputPorts.filter(
    (x) =>
      store.runtimePorts[x.id].kind === PortKind.Pull ||
      store.runtimePorts[x.id].kind === PortKind.Property
  );
  ports.map((port) => {
    inputs[port.key] = readTargetPortWithHooks(context, store, port.id);
  });
  return inputs;
};

const readClosureInputsWithHooks = (
  context: Context,
  store: LUClosureStore,
  luiMeta: LUIMeta,
  closureKey: string,
  ports: { id: string; key: string }[]
) => {
  context.hooks.onEvent?.({
    kind: 'lui',
    luiMeta: luiMeta,
    name: 'onReadClosureInputsBegin',
    luSession: context.session,
    value: {
      closureKey: closureKey,
    },
  });
  const closureInputs = readClosureInputs(context, store, ports);
  context.hooks.onEvent?.({
    kind: 'lui',
    luiMeta: luiMeta,
    name: 'onReadClosureInputsEnd',
    luSession: context.session,
    value: {
      closureKey: closureKey,
      closureInputs: closureInputs,
    },
  });
  return closureInputs;
};

const getLUSessionId = (session: LUSession) => {
  return session.inner.slice(-1)[0]?.runId || session.luRunId;
};

const readSourcePort = (
  context: Context,
  store: LUClosureStore,
  portId: string
): Result => {
  if (context.lu.ports.luMetaId === portId) {
    const luMeta: LUMeta = {
      lu: context.lu,
      session: context.session,
    };
    return Ok(Some(luMeta));
  }
  // first read portStates, then constants
  // async state / property may change
  const portState = store.portStates.getState(portId);
  if (portState) {
    return portState;
  }
  if (context.lu.constants[portId] !== undefined) {
    return Ok(Some(context.lu.constants[portId]));
  }
  const runtimePort = store.runtimePorts[portId];
  if (!runtimePort) {
    throw new Error('No runtime port found' + portId);
  }
  const luiId = runtimePort.parent?.luiId;
  if (luiId && context.lu.combinationalLUIs[luiId]) {
    //Combinational LUI
    const lui = context.lu.combinationalLUIs[luiId];
    const returnId = luiId;
    const computeResult = store.tempPortStates.get(returnId);
    if (computeResult) {
      return computeResult;
    }
    const luiRunId = getRandomManifestId();
    const returnResult = projectLUIWithHooks(
      context,
      store,
      { luiId, lui, luiRunId },
      readLUIInputsWithHooks(context, store, {
        luiId,
        lui,
        luiRunId,
      })
    );
    if (returnResult.kind === ReturnResultKind.Thenable) {
      throw new Error('Combinational LUIs should not return a thenable');
    }
    store.tempPortStates.set(returnId, returnResult.returnValue);
    return returnResult.returnValue;
  }
  return Ok(Nothing());
};

const onDataManifested = (
  context: Context,
  store: LUClosureStore,
  targetPortId: string,
  packet: Packet
) => {
  const port = store.runtimePorts[targetPortId];
  if (!port.parent) {
    store.emit(port.key!, packet);
  } else if (
    context.lu.kind !== LUKind.Combinational &&
    context.lu.handlerLUIs[port.parent.luiId]
  ) {
    //Handler LUI
    store.tempPortStates.clear();
    const luiId = port.parent.luiId;
    const lui = context.lu.handlerLUIs[port.parent.luiId];
    const luiRunId = getRandomManifestId();
    const luiInputs = readLUIInputsWithHooks(context, store, {
      luiId,
      lui,
      luiRunId,
    });
    luiInputs[port.key!] = packet.result;
    const returnResult = projectLUIWithHooks(
      context,
      store,
      { luiId, lui, luiRunId },
      luiInputs
    );

    transformReturnResult(returnResult, (result) => {
      dispatch(context, store, lui.ports.return.id, { result });
      return result;
    });
  } else if (store.luiListeners[port.parent.luiId]) {
    store.luiListeners[port.parent.luiId](
      port.key!,
      packet,
      port.parent.closureKey
    );
  } else if (
    context.lu.kind === LUKind.Sequential &&
    context.lu.sequentialSteps.some((x) => x.id === port.parent!.luiId)
  ) {
    store.portStates.setState(targetPortId, packet.result);
  }
};

const dispatch = (
  context: Context,
  store: LUClosureStore,
  sourcePortId: string,
  packet: Packet
) => {
  if (store.runtimePorts[sourcePortId].kind === PortKind.Property) {
    store.portStates.setState(sourcePortId, packet.result);
  }
  context.hooks.onEvent?.({
    kind: 'closure',
    name: 'onWillEmitData',
    luSession: context.session,
    value: {
      portId: sourcePortId,
      value: packet,
    },
  });
  packet.result =
    context.hooks.transformDataBeforeEmit?.(
      context,
      store,
      sourcePortId,
      packet.result
    ) ?? packet.result;

  const path = packet.path ?? [];
  for (let i = 0; i < path.length + 1; i++) {
    const address = path.slice(0, path.length - i);
    const destinations = Object.values(context.lu.nets).filter(
      (x) =>
        x.source.portId === sourcePortId &&
        JSON.stringify(x.source.address ?? []) === JSON.stringify(address) &&
        store.runtimePorts[x.target.portId].kind !== PortKind.Pull
    );
    for (const d of destinations) {
      const newPacket: Packet = {
        result: packet.result,
        path: [...(d.target.address ?? []), ...path.slice(path.length - i)],
      };
      context.hooks.onEvent?.({
        kind: 'closure',
        name: 'onDidReceiveData',
        luSession: context.session,
        value: {
          fromPortId: sourcePortId,
          toPortId: d.target.portId,
          value: newPacket,
        },
      });
      onDataManifested(context, store, d.target.portId, newPacket);
    }
  }
};

const readLUOutput = (context: Context, store: LUClosureStore) => {
  if (
    (context.lu.kind === LUKind.Combinational ||
      context.lu.kind === LUKind.Sequential) &&
    context.lu.ports.return
  ) {
    store.tempPortStates.clear();
    return readTargetPortWithHooks(context, store, context.lu.ports.return.id);
  } else if (context.lu.kind === LUKind.Stateful) {
    const result: Record<string, unknown> = {};
    for (const port of context.lu.ports.outputs) {
      if (port.kind === PortKind.Property) {
        const data = readTargetPortWithHooks(context, store, port.id);
        if (data.kind === ResultKind.Error) {
          return data;
        }
        if (data.resultValue.kind === OptionKind.Some) {
          result[port.key] = data.resultValue.optionValue;
        }
      }
    }
    return Ok(Some(result));
  }
  return Ok(Nothing());
};

const readLUOutputWithHooks = (context: Context, store: LUClosureStore) => {
  context.hooks.onEvent?.({
    kind: 'closure',
    name: 'onReadClosureOutputBegin',
    luSession: context.session,
    value: {},
  });
  const luOutput = readLUOutput(context, store);
  context.hooks.onEvent?.({
    kind: 'closure',
    name: 'onReadClosureOutputEnd',
    luSession: context.session,
    value: {
      closureOutput: luOutput,
    },
  });

  const transformedResult = context.hooks.transformClosureOutput?.(
    context,
    store,
    luOutput
  );

  return transformedResult ?? luOutput;
};

const createClosureProjectors = (
  context: Context,
  store: LUClosureStore,
  luiId: string,
  lui: LUI,
  luiRunId: string
): Record<string, LUProjector> => {
  const closures: Record<string, LUClosure> = lui.closures ?? {};
  const result: Record<string, LUProjector> = {};
  for (const [closureKey, closure] of Object.entries(closures)) {
    const projector: LUProjector = (
      builtInInputs,
      emitToLUI,
      subscribeFromLUI,
      inject,
      meta
      // providedServices
    ) => {
      const newInnerSessions = [
        ...context.session.inner,
        {
          luiId: luiId,
          closureKey: closureKey,
          runId: luiRunId,
        },
      ];
      const closureContext: Context = {
        ...context,
        inject: (provider: Provider, unitKey: string) => {
          if (
            provider.source?.luiId === luiId &&
            provider.source?.closureKey === closureKey
          ) {
            return inject(provider.key, unitKey);
          }
          return context.inject(provider, unitKey);
        },
        session: {
          ...context.session,
          inner: newInnerSessions,
        },
        lu: closure.lu,
      };
      if (closure.outerPorts.hookEventId) {
        closureContext.hooks.onEvent = (event) => {
          if (event.luSession.inner.length === 0) {
            dispatch(context, store, closure.outerPorts.hookEventId!, {
              result: Ok(Some(event)),
            });
          }
          context.hooks.onEvent?.(event);
        };
      }

      const closureInputs = {
        ...builtInInputs,
        ...readClosureInputsWithHooks(
          context,
          store,
          {
            luiId: luiId,
            lui: lui,
            luiRunId: luiRunId,
          },
          closureKey,
          closure.outerPorts.inputs
        ),
      };
      const closureProjector = createLUClosureProjector(closureContext);
      return closureProjector(
        closureInputs,
        (key, value) => {
          const outerPort = closure.outerPorts.outputs.find(
            (port) => port.key === key
          );
          if (outerPort) {
            dispatch(context, store, outerPort.id, value);
          } else {
            emitToLUI(key, value);
          }
        },
        subscribeFromLUI
      );
    };
    result[closureKey] = projector;
  }
  return result;
};

const projectLUI = (
  context: Context,
  store: LUClosureStore,
  luiMeta: LUIMeta,
  luiInputs: Record<string, Result>,
  injections: Record<string, Provider>,
  closureProjectors: Record<string, LUProjector>,
  emit: LUEventHandler,
  subscribe: (listener: LUIEventHandler) => () => void
): ReturnResult => {
  const { lui, luiId, luiRunId } = luiMeta;
  let listener: LUIEventHandler | undefined = undefined;

  const unsubscribe = subscribe((key, val, closureKey) => {
    listener?.(key, val, closureKey);
  });

  const registerListener = (_listener: LUIEventHandler) => {
    listener = _listener;
    return unsubscribe;
  };

  const luiInject = (
    serviceKey: string,
    unitKey: string
  ): LUProjector | null => {
    const closureMap = lui.dependencies[serviceKey].closureMappings[unitKey];
    if (closureMap && !closureMap.isFallback) {
      return closureProjectors[closureMap.closureKey];
    }
    const injection = injections[serviceKey];
    if (injection) {
      return context.inject(injection, unitKey);
    }
    if (closureMap) {
      // fallback closure
      return closureProjectors[closureMap.closureKey];
    }
    return null;
  };

  let getState: ((key: string) => Result) | undefined = undefined;
  if (
    context.lu.kind !== LUKind.Combinational &&
    context.lu.statefulLUIs[luiId]
  ) {
    getState = (key: string): Result => {
      const portId = lui.ports.outputs.find((x) => x.key === key)?.id;
      if (portId) {
        const state = store.portStates.getState(portId);
        if (state) {
          return state;
        }
      }
      return Ok(Nothing());
    };
  }

  if (lui.target.kind === LUITargetKind.Native) {
    const projector = context.getLUProjector(
      lui.target.packageId,
      lui.target.unitKey
    );
    if (!projector) {
      throw new Error(
        `Service unit ${lui.target.packageId}.${lui.target.unitKey} is not found`
      );
    }
    return projector(
      luiInputs,
      emit,
      registerListener,
      luiInject,
      {
        lui: lui,
        luiId: luiId,
        luiRunId: luiRunId,
      },
      getState
    );
  } else if (lui.target.kind === LUITargetKind.LU) {
    const luId = lui.target.luId;
    const proxyLU = context.getLU(luId);
    if (!proxyLU) {
      throw new Error(`LU ${luId} is not found`);
    }
    const newLUSession: LUSession = {
      luId: luId,
      luRunId: luiRunId,
      inner: [],
      outer: [
        ...context.session.outer,
        {
          luiId: luiId,
          luiRunId: luiRunId,
          luSessions: context.session.inner,
        },
      ],
    };

    const newContext: Context = {
      ...context,
      inject: (provider, unitKey) => {
        if (provider.source) {
          throw new Error('Source should be null!');
        }
        return luiInject(provider.key, unitKey);
      },
      session: newLUSession,
      lu: proxyLU,
    };

    const projector = createLUClosureProjector(newContext);
    const result = projector(luiInputs, emit, (handler) => {
      return registerListener((key, value, _closureKey) => handler(key, value));
    });
    return result;
  } else {
    // abstract LUT
    const projector = context.inject(
      {
        key: lui.target.abstractKey,
        source: lui.target.source,
      },
      lui.target.unitKey
    );
    if (!projector) {
      if (
        lui.target.fallbackClosureKey &&
        closureProjectors[lui.target.fallbackClosureKey]
      ) {
        const defaultProjector =
          closureProjectors[lui.target.fallbackClosureKey];
        const result = defaultProjector(
          luiInputs,
          emit,
          registerListener,
          luiInject,
          {
            lui: lui,
            luiId: luiId,
            luiRunId: luiRunId,
          },
          getState
        );
        return result;
      } else {
        throw new Error(
          `Injection ${lui.target.abstractKey}.${lui.target.unitKey} is not found`
        );
      }
    }
    return projector(
      luiInputs,
      emit,
      registerListener,
      luiInject,
      {
        lui: lui,
        luiId: luiId,
        luiRunId: luiRunId,
      },
      getState
    );
  }
};

export const projectLUIWithHooks = (
  context: Context,
  store: LUClosureStore,
  luiMeta: LUIMeta,
  luiInputs: Record<string, Result>
): ReturnResult => {
  const { luiId, lui, luiRunId } = luiMeta;
  // read dependency keys
  const injections: Record<string, Provider> = {};
  for (const [key, dep] of Object.entries(lui.dependencies ?? {})) {
    const pId = dep.portId;
    const value = readTargetPortWithHooks(context, store, pId);
    if (value.kind === ResultKind.Error) {
      return Immediate(Err(value.error));
    } else if (value.resultValue.kind === OptionKind.Some) {
      injections[key] = value.resultValue.optionValue as Provider;
    } else if (dep.defaultProvider) {
      injections[key] = dep.defaultProvider;
    }
  }

  const subscribe = (callback: LUIEventHandler) => {
    if (
      !Object.values(store.runtimePorts).find(
        (x) =>
          !x.isSource && x.parent?.luiId === luiId && x.kind !== PortKind.Pull
      )
    ) {
      return () => ({});
    }
    store.luiListeners[luiId] = callback;
    return () => delete store.luiListeners[luiId];
  };
  const emit: LUEventHandler = (key, value) => {
    const result = Object.entries(store.runtimePorts).find(
      ([_, port]) =>
        port.kind !== PortKind.Pull &&
        port.isSource &&
        port.key === key &&
        port.parent?.luiId === luiId &&
        !port.parent.closureKey
    );
    if (result) {
      dispatch(context, store, result[0], value);
    }
  };

  const closureProjectors = createClosureProjectors(
    context,
    store,
    luiId,
    lui,
    luiRunId
  );

  context.hooks.onEvent?.({
    kind: 'lui',
    luiMeta: luiMeta,
    name: 'onManifestLUIBegin',
    luSession: context.session,
    value: {
      luiInputs: luiInputs,
    },
  });
  const res =
    context.hooks.overrideLUIManifestation?.(
      context,
      store,
      luiMeta,
      luiInputs,
      injections,
      closureProjectors,
      emit,
      subscribe
    ) ??
    projectLUI(
      context,
      store,
      luiMeta,
      luiInputs,
      injections,
      closureProjectors,
      emit,
      subscribe
    );

  return transformReturnResult(res, (result) => {
    if (
      result.kind === ResultKind.Error &&
      context.lu.kind !== LUKind.Combinational &&
      context.lu.ports.onErrorId
    ) {
      const errorData: ErrorData = {
        error: result.error,
        meta: {
          luSession: context.session,
          luiMeta: luiMeta,
          luiInputs: luiInputs,
        },
      };
      dispatch(context, store, context.lu.ports.onErrorId, {
        result: Ok(Some(errorData)),
      });
    }
    context.hooks.onEvent?.({
      kind: 'lui',
      luiMeta: luiMeta,
      name: 'onManifestLUIEnd',
      luSession: context.session,
      value: {
        luiOutput: result,
      },
    });

    const transformedResult = context.hooks.transformLUIOutput?.(
      context,
      store,
      luiMeta,
      result
    );
    return transformedResult ?? result;
  });
};

const manifestStep = (
  context: Context,
  store: LUClosureStore,
  sequenctialStep: SequentialStep,
  luiRunId: string
): SequentialStepResult => {
  const lu = context.lu as SequentialLU;
  store.tempPortStates.clear();
  if (sequenctialStep.kind === SequentialStepKind.SequentialLUI) {
    const luiId = sequenctialStep.id;
    const lui = lu.sequentialLUIs[luiId];
    const luiInputs = readLUIInputsWithHooks(context, store, {
      luiId: luiId,
      lui: lui,
      luiRunId: luiRunId,
    });
    const result = projectLUIWithHooks(
      context,
      store,
      { luiId: luiId, lui: lui, luiRunId: luiRunId },
      luiInputs
    );
    return SeqNext(result);
  } else if (sequenctialStep.kind === SequentialStepKind.GoBackIf) {
    const conditionPortId = sequenctialStep.conditionPortId;
    const conditionResult = readTargetPortWithHooks(
      context,
      store,
      conditionPortId
    );
    switch (conditionResult.kind) {
      case ResultKind.Error: {
        return SeqNext(Immediate(conditionResult));
      }
      case ResultKind.Ok: {
        if (
          conditionResult.resultValue.kind === OptionKind.Some &&
          conditionResult.resultValue.optionValue
        ) {
          return SeqGoBack(sequenctialStep.targetStepId);
        } else {
          return SeqNext(Immediate(Ok(Nothing())));
        }
      }
    }
  } else if (sequenctialStep.kind === SequentialStepKind.ReturnIf) {
    // read and check if returns
    const conditionPortId = sequenctialStep.conditionPortId;
    const conditionResult = readTargetPortWithHooks(
      context,
      store,
      conditionPortId
    );
    switch (conditionResult.kind) {
      case ResultKind.Error: {
        return SeqNext(Immediate(conditionResult));
      }
      case ResultKind.Ok: {
        if (
          conditionResult.resultValue.kind === OptionKind.Some &&
          conditionResult.resultValue.optionValue
        ) {
          const returnPortId = sequenctialStep.returnValuePortId;
          return SeqReturn(
            readTargetPortWithHooks(context, store, returnPortId)
          );
        } else {
          return SeqNext(Immediate(Ok(Nothing())));
        }
      }
    }
  } else {
    throw new Error('Unknown sequence step');
  }
};

const manifestSteps = (
  context: Context,
  store: LUClosureStore,
  startIndex: number
): ReturnResult => {
  const lu = context.lu as SequentialLU;
  const sequentialSteps = lu.sequentialSteps;
  let index = startIndex;
  while (index < sequentialSteps.length) {
    const step = sequentialSteps[index];
    const luiRunId = getRandomManifestId();
    const seqResult = manifestStep(context, store, step, luiRunId);
    if (step.kind === SequentialStepKind.GoBackIf) {
      if (seqResult.kind === SequentialStepResultKind.GoBack) {
        const toIndex = sequentialSteps
          .map((x) => x.id)
          .indexOf(seqResult.target);
        context.hooks.onEvent?.({
          kind: 'closure',
          name: 'onGoBack',
          luSession: context.session,
          value: {
            fromId: step.id,
            toId: seqResult.target,
          },
        });
        sequentialSteps.slice(toIndex, index).map((step) => {
          if (step.kind === SequentialStepKind.SequentialLUI) {
            delete store.luiListeners[step.id];
            store.portStates.deleteState(step.id);
          }
        });
        index = toIndex;
      } else {
        index += 1;
      }
    } else if (step.kind === SequentialStepKind.ReturnIf) {
      if (seqResult.kind === SequentialStepResultKind.Return) {
        return Immediate(seqResult.value);
      } else {
        index += 1;
      }
    } else {
      const luiId = step.id;
      const lui = lu.sequentialLUIs[luiId];
      const returnPortId = lui.ports.return?.id;
      const result = (
        seqResult as {
          kind: SequentialStepResultKind.Next;
          value: ReturnResult;
        }
      ).value;

      if (result.kind === ReturnResultKind.Immediate) {
        if (returnPortId) {
          store.portStates.setState(returnPortId, result.returnValue);
        }
        if (result.returnValue.kind === ResultKind.Error) {
          const error = result.returnValue.error;
          context.hooks.onEvent?.({
            kind: 'lui',
            luiMeta: { lui: lui, luiId: luiId, luiRunId: luiRunId },
            name: 'onError',
            luSession: context.session,
            value: {
              error,
            },
          });
          return Immediate(Err(error));
        }
      } else if (step.isAwaited) {
        // await
        context.hooks.onEvent?.({
          kind: 'lui',
          luiMeta: { lui: lui, luiId: luiId, luiRunId: luiRunId },
          name: 'onAwaitLUIBegin',
          luSession: context.session,
        });

        return Thenable((resolve) => {
          (result as ThenableReturnResult).then((awaitedResult) => {
            context.hooks.onEvent?.({
              kind: 'lui',
              luiMeta: { lui: lui, luiId: luiId, luiRunId: luiRunId },
              name: 'onAwaitLUIEnd',
              luSession: context.session,
            });
            if (returnPortId) {
              store.portStates.setState(returnPortId, awaitedResult);
            }

            if (awaitedResult.kind === ResultKind.Error) {
              const error = awaitedResult.error;
              context.hooks.onEvent?.({
                kind: 'lui',
                luiMeta: { lui: lui, luiId: luiId, luiRunId: luiRunId },
                name: 'onError',
                luSession: context.session,
                value: {
                  error: error,
                },
              });
              resolve(awaitedResult);
            } else {
              const nextResult = manifestSteps(context, store, index + 1);
              if (nextResult.kind === ReturnResultKind.Immediate) {
                resolve(nextResult.returnValue);
              } else {
                nextResult.then((val) => {
                  resolve(val);
                });
              }
            }
          });
        });
      } else {
        // no-await, resolve it
        const portId = lui.ports.return?.id;
        result.then((res) => {
          if (portId) {
            dispatch(context, store, portId, { result: res });
          }
        });
      }
      index += 1;
    }
  }
  return Immediate(readLUOutputWithHooks(context, store));
};

const initializeState = (context: Context, store: LUClosureStore) => {
  const lu = context.lu as SequentialLU | StatefulLU | ComposableLU;
  for (const [luiId, lui] of Object.entries(lu.statefulLUIs)) {
    const luiRunId = getRandomManifestId();
    const luiInputs = readLUIInputsWithHooks(context, store, {
      luiId: luiId,
      lui: lui,
      luiRunId: luiRunId,
    });
    const result = projectLUIWithHooks(
      context,
      store,
      { luiId: luiId, lui: lui, luiRunId: luiRunId },
      luiInputs
    );
    if (result.kind === ReturnResultKind.Thenable) {
      throw new Error('Stateful LUIs should not return thenable');
    } else {
      if (result.returnValue.kind === ResultKind.Error) {
        return result.returnValue;
      } else {
        if (result.returnValue.resultValue.kind === OptionKind.Some) {
          const finalResult = result.returnValue.resultValue.optionValue;
          const propertyValues = finalResult as Record<string, unknown>;
          if (propertyValues && Object.keys(propertyValues).length > 0) {
            Object.entries(store.runtimePorts)
              .filter(
                ([id, x]) =>
                  x.parent?.luiId === luiId &&
                  x.kind === PortKind.Property &&
                  x.key &&
                  propertyValues[x.key] !== undefined
              )
              .map(([portId, port]) => {
                store.portStates.setState(
                  portId,
                  Ok(Some(propertyValues[port.key!]))
                );
              });
          }
        }
      }
    }
  }
};

const projectCompositions = (context: Context, store: LUClosureStore) => {
  const lu = context.lu as ComposableLU;
  const luiResults: Record<string, any> = {};
  // const runnables: (() => void)[] = [];
  for (const [luiId, lui] of Object.entries(lu.composableLUIs)) {
    const luiRunId = getRandomManifestId();
    const luiInputs = readLUIInputsWithHooks(context, store, {
      luiId: luiId,
      lui: lui,
      luiRunId: luiRunId,
    });
    const result = projectLUIWithHooks(
      context,
      store,
      { luiId: luiId, lui: lui, luiRunId: luiRunId },
      luiInputs
    );
    if (result.kind === ReturnResultKind.Thenable) {
      throw new Error('Composable LUIs should not return thenable');
    } else {
      if (result.returnValue.kind === ResultKind.Error) {
        return result.returnValue;
      } else if (result.returnValue.resultValue.kind === OptionKind.Some) {
        luiResults[luiId] = result.returnValue.resultValue.optionValue;
      }
    }
  }

  const result: Record<string, ComposableReturn> = {};
  Object.entries(lu.rootCompositions).map(([key, composition]) => {
    result[key] = (context) => (componentInputs) =>
      transformComposable(
        context,
        componentInputs,
        luiResults,
        lu.luiCompositions,
        composition
      );
  });
  if (Object.keys(result).length === 0) {
    return Ok(Nothing());
  }
  return Ok(Some(result));
};

export const createLUClosureProjector = <T extends Context>(
  context: T
): LUClosureProjector => {
  return (inputs, emit, subscribe) => {
    context.hooks.onEvent?.({
      kind: 'closure',
      name: 'onProjectClosureBegin',
      luSession: context.session,
      value: {
        closureInputs: inputs,
      },
    });

    const transformedInputs = context.hooks.transformClosureInputs?.(
      context,
      inputs
    );
    if (transformedInputs) {
      inputs = transformedInputs;
    }

    const overriddenResult = context.hooks.overrideClosureProjection?.(
      context,
      inputs,
      emit,
      subscribe
    );
    let result: ReturnResult;
    if (overriddenResult) {
      result = overriddenResult;
      return result;
    } else {
      const runtimePorts = getRuntimePorts(context.lu);
      const store: LUClosureStore = {
        emit: emit,
        luiListeners: {},
        tempPortStates: new Map(),
        runtimePorts,
        portStates: context.getStateStore(getLUSessionId(context.session)),
      };

      Object.entries(inputs).map(([key, value]) => {
        const port = context.lu.ports.inputs
          .filter(
            (x) => x.kind === PortKind.Pull || x.kind === PortKind.Property
          )
          .find((x) => x.key === key);
        if (port) {
          store.portStates.setState(port.id, value);
        }
      });

      // non-reactive
      if (context.lu.kind === LUKind.Combinational) {
        result = Immediate(readLUOutputWithHooks(context, store));
      } else {
        const stateErrorResult = initializeState(context, store);
        if (stateErrorResult?.kind === ResultKind.Error) {
          result = Immediate(stateErrorResult);
        } else {
          if (context.lu.ports.onReadyId) {
            dispatch(context, store, context.lu.ports.onReadyId, {
              result: Ok(Nothing()),
            });
          }
          if (context.lu.kind === LUKind.Sequential) {
            result = manifestSteps(context, store, 0);
          } else {
            // reactive, need subscribing
            subscribe((portKey, packet) => {
              const port = context.lu.ports.inputs.find(
                (x) => x.key === portKey
              );
              if (port) {
                dispatch(context, store, port.id, packet);
              }
            });
            if (context.lu.kind === LUKind.Composable) {
              result = Immediate(projectCompositions(context, store));
            } else {
              result = Immediate(readLUOutputWithHooks(context, store));
            }
          }
        }
      }
      return transformReturnResult(result, (val) => {
        if (
          context.lu.kind !== LUKind.Combinational &&
          context.lu.ports.onExitId
        ) {
          dispatch(context, store, context.lu.ports.onExitId, {
            result: val,
          });
        }
        context.hooks.onEvent?.({
          kind: 'closure',
          name: 'onProjectClosureEnd',
          luSession: context.session,
          value: {
            closureOutput: val,
          },
        });
        return val;
      });
    }
  };
};
