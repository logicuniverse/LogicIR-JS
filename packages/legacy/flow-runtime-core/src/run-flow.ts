import {
  Context,
  FlowFunction,
  FlowKind,
  FlowSession,
  FlowStore,
  Node,
  NodeInputEventHandler,
  NodeMeta,
  NodeKind,
  OptionKind,
  PortType,
  Result,
  ResultKind,
  ReturnResult,
  ReturnResultKind,
  SequenceStep,
  SequenceStepKind,
  SequenceStepResult,
  SequenceStepResultKind,
  SubFlow,
  ThenableReturnResult,
  SequenceFlow,
  StateMachineFlow,
  ComponentFlow,
  PortSubPath,
  PortDestructuringData,
  Data,
  Packet,
  ErrorData,
  FlowEventHandler,
  FlowMeta,
  ComponentReturn,
  NodeFunction,
  Provider,
} from './types';
import {
  Err,
  getRandomRunId,
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
  transformComponent,
} from './utils';

const readNodeInputs = (
  context: Context,
  flowStore: FlowStore,
  { nodeId, node }: NodeMeta
) => {
  const nodeInputs: Record<string, Result> = {};
  if (node.staticInputs) {
    Object.entries(node.staticInputs).map(([k, v]) => {
      nodeInputs[k] = Ok(Some(v));
    });
  }
  const ports = node.ports.inputs.filter(
    (x) => x.type === PortType.Data || x.type === PortType.Property
  );
  ports.map((port) => {
    const result = readDestPortWithHooks(context, flowStore, port.id);
    if (
      !(
        result.kind === ResultKind.Ok &&
        result.resultValue.kind === OptionKind.Nothing &&
        nodeInputs[port.key]
      )
    ) {
      nodeInputs[port.key] = result;
    }
  });

  if (
    context.flow.kind === FlowKind.Sequence &&
    context.flow.sequenceNodes[nodeId]
  ) {
    const ports = node.ports.inputs.filter((x) => x.type === PortType.Stream);
    ports.map((port) => {
      const cachedData = flowStore.portStates.getState(port.id);
      if (cachedData) {
        nodeInputs[port.key] = cachedData;
        flowStore.portStates.deleteState(port.id);
      }
    });
  }
  return nodeInputs;
};

const readNodeInputsWithHooks = (
  context: Context,
  flowStore: FlowStore,
  nodeMeta: NodeMeta
) => {
  context.hooks.onEvent?.({
    name: 'onReadNodeInputsBegin',
    kind: 'node',
    nodeMeta,
    flowSession: context.session,
  });
  const nodeInputs = readNodeInputs(context, flowStore, nodeMeta);
  context.hooks.onEvent?.({
    name: 'onReadNodeInputsEnd',
    kind: 'node',
    nodeMeta,
    flowSession: context.session,
    value: {
      nodeInputs,
    },
  });
  const transformedNodeInputs = context.hooks.transformNodeInputs?.(
    context,
    flowStore,
    nodeMeta,
    nodeInputs
  );
  return transformedNodeInputs ?? nodeInputs;
};

const readDestPortOnSubPath = (
  context: Context,
  flowStore: FlowStore,
  portId: string,
  subPath: PortSubPath,
  destructuringData: PortDestructuringData | null
): Result => {
  if (
    (typeof destructuringData === 'number' && destructuringData > 0) ||
    (Array.isArray(destructuringData) && destructuringData.length > 0)
  ) {
    if (Array.isArray(destructuringData)) {
      const data: Record<string, Data> = {};
      for (const item of destructuringData) {
        const result = readDestPortOnSubPath(
          context,
          flowStore,
          portId,
          [...subPath, item],
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
      for (let i = 0; i < destructuringData; i++) {
        const result = readDestPortOnSubPath(
          context,
          flowStore,
          portId,
          [...subPath, i],
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
    const connection = Object.values(context.flow.connections).find(
      (x) =>
        x.to.portId === portId &&
        JSON.stringify(x.to.subPath ?? []) === JSON.stringify(subPath)
    );
    if (connection) {
      const result = readSourcePort(context, flowStore, connection.from.portId);
      return getResultByPath(result, connection.from.subPath ?? []);
    }
    return Ok(Nothing());
  }
};

const readDestPortWithHooks = (
  context: Context,
  flowStore: FlowStore,
  portId: string
): Result => {
  context.hooks.onEvent?.({
    kind: 'flow',
    name: 'onReadDataBegin',
    flowSession: context.session,
    value: {
      portId,
    },
  });
  const port = flowStore.runtimePorts[portId];
  const result = readDestPortOnSubPath(
    context,
    flowStore,
    portId,
    [],
    port.destructuringData ?? null
  );
  context.hooks.onEvent?.({
    kind: 'flow',
    name: 'onReadDataEnd',
    flowSession: context.session,
    value: {
      portId,
      value: result,
    },
  });
  const transformedResult = context.hooks.transformDataAfterRead?.(
    context,
    flowStore,
    portId,
    result
  );
  return transformedResult ?? result;
};

const readSubFlowInputs = (
  context: Context,
  flowStore: FlowStore,
  subflowInputPorts: { id: string; key: string }[]
) => {
  flowStore.tempPortStates.clear();
  const subflowInputs: Record<string, Result> = {};
  const ports = subflowInputPorts.filter(
    (x) =>
      flowStore.runtimePorts[x.id].type === PortType.Data ||
      flowStore.runtimePorts[x.id].type === PortType.Property
  );
  ports.map((port) => {
    subflowInputs[port.key] = readDestPortWithHooks(
      context,
      flowStore,
      port.id
    );
  });
  return subflowInputs;
};

const readSubFlowInputsWithHooks = (
  context: Context,
  flowStore: FlowStore,
  nodeMeta: NodeMeta,
  subflowKey: string,
  ports: { id: string; key: string }[]
) => {
  context.hooks.onEvent?.({
    kind: 'node',
    nodeMeta,
    name: 'onReadSubFlowInputsBegin',
    flowSession: context.session,
    value: {
      subflowKey,
    },
  });
  const subflowInputs = readSubFlowInputs(context, flowStore, ports);
  context.hooks.onEvent?.({
    kind: 'node',
    nodeMeta,
    name: 'onReadSubFlowInputsEnd',
    flowSession: context.session,
    value: {
      subflowKey,
      subflowInputs,
    },
  });
  return subflowInputs;
};

const getFlowSessionId = (session: FlowSession) => {
  return session.inner.slice(-1)[0]?.runId || session.rootFlowRunId;
};

const readSourcePort = (
  context: Context,
  flowStore: FlowStore,
  portId: string
): Result => {
  if (context.flow.ports.flowMetaId === portId) {
    const flowMeta: FlowMeta = {
      flow: context.flow,
      session: context.session,
    };
    return Ok(Some(flowMeta));
  }
  // first read portStates, then constants
  // async state / property may change
  const portState = flowStore.portStates.getState(portId);
  if (portState) {
    return portState;
  }
  if (context.flow.constants[portId] !== undefined) {
    return Ok(Some(context.flow.constants[portId]));
  }
  const runtimePort = flowStore.runtimePorts[portId];
  if (!runtimePort) {
    throw new Error('No runtime port found' + portId);
  }
  const nodeId = runtimePort.parent?.nodeId;
  if (nodeId && context.flow.computeNodes[nodeId]) {
    //compute node
    const node = context.flow.computeNodes[nodeId];
    const returnId = nodeId;
    const computeResult = flowStore.tempPortStates.get(returnId);
    if (computeResult) {
      return computeResult;
    }
    const nodeRunId = getRandomRunId();
    const returnResult = runNodeWithHooks(
      context,
      flowStore,
      { nodeId, node, nodeRunId },
      readNodeInputsWithHooks(context, flowStore, {
        nodeId,
        node,
        nodeRunId,
      })
    );
    if (returnResult.kind === ReturnResultKind.Thenable) {
      throw new Error('Compute node should not return a thenable');
    }
    flowStore.tempPortStates.set(returnId, returnResult.returnValue);
    return returnResult.returnValue;
  }
  return Ok(Nothing());
};

const handleReceivedData = (
  context: Context,
  flowStore: FlowStore,
  destPortId: string,
  packet: Packet
) => {
  const port = flowStore.runtimePorts[destPortId];
  if (!port.parent) {
    flowStore.emit(port.key!, packet);
  } else if (
    context.flow.kind !== FlowKind.Compute &&
    context.flow.triggerNodes[port.parent.nodeId]
  ) {
    //trigger node
    flowStore.tempPortStates.clear();
    const nodeId = port.parent.nodeId;
    const node = context.flow.triggerNodes[port.parent.nodeId];
    const nodeRunId = getRandomRunId();
    const nodeInputs = readNodeInputsWithHooks(context, flowStore, {
      nodeId,
      node,
      nodeRunId: nodeRunId,
    });
    nodeInputs[port.key!] = packet.result;
    const returnResult = runNodeWithHooks(
      context,
      flowStore,
      { nodeId, node, nodeRunId },
      nodeInputs
    );

    transformReturnResult(returnResult, (result) => {
      dispatch(context, flowStore, node.ports.return.id, { result });
      return result;
    });
  } else if (flowStore.nodeListeners[port.parent.nodeId]) {
    flowStore.nodeListeners[port.parent.nodeId](
      port.key!,
      packet,
      port.parent.subflowKey
    );
  } else if (
    context.flow.kind === FlowKind.Sequence &&
    context.flow.sequenceSteps.some((x) => x.id === port.parent!.nodeId)
  ) {
    // await node, cache it
    flowStore.portStates.setState(destPortId, packet.result);
  }
};

const dispatch = (
  context: Context,
  flowStore: FlowStore,
  sourcePortId: string,
  packet: Packet
) => {
  if (flowStore.runtimePorts[sourcePortId].type === PortType.Property) {
    flowStore.portStates.setState(sourcePortId, packet.result);
  }
  context.hooks.onEvent?.({
    kind: 'flow',
    name: 'onWillEmitData',
    flowSession: context.session,
    value: {
      portId: sourcePortId,
      value: packet,
    },
  });
  packet.result =
    context.hooks.transformDataBeforeEmit?.(
      context,
      flowStore,
      sourcePortId,
      packet.result
    ) ?? packet.result;

  const path = packet.path ?? [];
  for (let i = 0; i < path.length + 1; i++) {
    const subPath = path.slice(0, path.length - i);
    const destinations = Object.values(context.flow.connections).filter(
      (x) =>
        x.from.portId === sourcePortId &&
        JSON.stringify(x.from.subPath ?? []) === JSON.stringify(subPath) &&
        flowStore.runtimePorts[x.to.portId].type !== PortType.Data
    );
    for (const d of destinations) {
      const newPacket: Packet = {
        result: packet.result,
        path: [...(d.to.subPath ?? []), ...path.slice(path.length - i)],
      };
      context.hooks.onEvent?.({
        kind: 'flow',
        name: 'onDidReceiveData',
        flowSession: context.session,
        value: {
          fromPortId: sourcePortId,
          toPortId: d.to.portId,
          value: newPacket,
        },
      });
      handleReceivedData(context, flowStore, d.to.portId, newPacket);
    }
  }
};

const readFlowOutput = (context: Context, flowStore: FlowStore) => {
  if (
    (context.flow.kind === FlowKind.Compute ||
      context.flow.kind === FlowKind.Sequence) &&
    context.flow.ports.return
  ) {
    flowStore.tempPortStates.clear();
    return readDestPortWithHooks(
      context,
      flowStore,
      context.flow.ports.return.id
    );
  } else if (context.flow.kind === FlowKind.StateMachine) {
    const result: Record<string, unknown> = {};
    for (const port of context.flow.ports.outputs) {
      if (port.type === PortType.Property) {
        const data = readDestPortWithHooks(context, flowStore, port.id);
        if (data.kind === ResultKind.Error) {
          return data;
        }
        if (data.resultValue.kind === OptionKind.Some) {
          result[port.key] = data.resultValue.optionValue;
        }
      }
    }
    console.log('Reading flow output for StateMachine flow', result);
    return Ok(Some(result));
  }
  return Ok(Nothing());
};

const readFlowOutputWithHooks = (context: Context, flowStore: FlowStore) => {
  context.hooks.onEvent?.({
    kind: 'flow',
    name: 'onReadFlowOutputBegin',
    flowSession: context.session,
    value: {},
  });
  const flowOutput = readFlowOutput(context, flowStore);
  context.hooks.onEvent?.({
    kind: 'flow',
    name: 'onReadFlowOutputEnd',
    flowSession: context.session,
    value: {
      flowOutput,
    },
  });

  const transformedResult = context.hooks.transformFlowOutput?.(
    context,
    flowStore,
    flowOutput
  );

  return transformedResult ?? flowOutput;
};

const createSubFlowFunctions = (
  context: Context,
  flowStore: FlowStore,
  nodeId: string,
  node: Node,
  nodeRunId: string
): Record<string, NodeFunction> => {
  const subflows: Record<string, SubFlow> = node.subflows ?? {};
  const result: Record<string, NodeFunction> = {};
  for (const [subflowKey, subflow] of Object.entries(subflows)) {
    const fn: NodeFunction = (
      builtInInputs,
      emitToNode,
      subscribeFromNode,
      inject,
      meta
      // providedServices
    ) => {
      const newInnerSessions = [
        ...context.session.inner,
        {
          nodeId: nodeId,
          subflowKey,
          runId: nodeRunId, // todo: should be unique id
        },
      ];
      const subflowContext: Context = {
        ...context,
        inject: (provider: Provider, methodKey: string) => {
          if (
            provider.parent?.nodeId === nodeId &&
            provider.parent?.subflowKey === subflowKey
          ) {
            return inject(provider.key, methodKey);
          }
          return context.inject(provider, methodKey);
        },
        session: {
          ...context.session,
          inner: newInnerSessions,
        },
        flow: subflow.flow,
      };
      if (subflow.outerPorts.hookEventId) {
        subflowContext.hooks.onEvent = (event) => {
          if (event.flowSession.inner.length === 0) {
            dispatch(context, flowStore, subflow.outerPorts.hookEventId!, {
              result: Ok(Some(event)),
            });
          }
          context.hooks.onEvent?.(event);
        };
      }

      const subflowInputs = {
        ...builtInInputs,
        ...readSubFlowInputsWithHooks(
          context,
          flowStore,
          {
            nodeId,
            node,
            nodeRunId: nodeRunId,
          },
          subflowKey,
          subflow.outerPorts.input
        ),
      };
      const flowFunction = createFlowFunction(subflowContext);
      return flowFunction(
        subflowInputs,
        (key, value) => {
          const outerPort = subflow.outerPorts.output.find(
            (port) => port.key === key
          );
          if (outerPort) {
            dispatch(context, flowStore, outerPort.id, value);
          } else {
            emitToNode(key, value);
          }
        },
        subscribeFromNode
      );
    };
    result[subflowKey] = fn;
  }
  return result;
};

const runNode = (
  context: Context,
  flowStore: FlowStore,
  nodeMeta: NodeMeta,
  nodeInputs: Record<string, Result>,
  injections: Record<string, Provider>,
  subflowFunctions: Record<string, NodeFunction>,
  emit: FlowEventHandler,
  subscribe: (listener: NodeInputEventHandler) => () => void
): ReturnResult => {
  const { node, nodeId, nodeRunId } = nodeMeta;
  let listener: NodeInputEventHandler | undefined = undefined;

  const unsubscribe = subscribe((key, val, subflowKey) => {
    listener?.(key, val, subflowKey);
  });

  const registerListener = (_listener: NodeInputEventHandler) => {
    listener = _listener;
    return unsubscribe;
  };

  const nodeInject = (
    serviceKey: string,
    methodKey: string
  ): NodeFunction | null => {
    const subflowKey = node.dependencies[serviceKey].subflowKeys[methodKey];
    if (subflowKey) {
      return subflowFunctions[subflowKey];
    }
    const injection = injections[serviceKey];
    if (injection) {
      return context.inject(injection, methodKey);
    }
    return null;
  };

  let getState: ((key: string) => Result) | undefined = undefined;
  if (
    'stateMachineNodes' in context.flow &&
    context.flow.stateMachineNodes[nodeId]
  ) {
    getState = (key: string): Result => {
      const portId = node.ports.outputs.find((x) => x.key === key)?.id;
      if (portId) {
        const state = flowStore.portStates.getState(portId);
        if (state) {
          return state;
        }
      }
      return Ok(Nothing());
    };
  }

  if (node.target.kind === NodeKind.Native) {
    const nodeFunction = context.getNodeFunction(
      node.target.packageId,
      node.target.methodKey
    );
    if (!nodeFunction) {
      throw new Error(
        `Service method ${node.target.packageId}.${node.target.methodKey} is not found`
      );
    }
    return nodeFunction(
      nodeInputs,
      emit,
      registerListener,
      nodeInject,
      {
        node,
        nodeId,
        nodeRunId,
      },
      getState
    );
  } else if (node.target.kind === NodeKind.Flow) {
    const flowId = node.target.flowId;
    const proxyFlow = context.getFlow(flowId);
    if (!proxyFlow) {
      throw new Error(`Flow ${flowId} is not found`);
    }
    const newFlowSession: FlowSession = {
      rootFlowId: flowId,
      rootFlowRunId: nodeRunId,
      inner: [],
      outer: [
        ...context.session.outer,
        {
          flowNodeId: nodeId,
          flowNodeRunId: nodeRunId,
          flowSessions: context.session.inner,
        },
      ],
    };

    const newContext: Context = {
      ...context,
      inject: (provider, methodKey) => {
        if (provider.parent) {
          throw new Error('Parent should be null!');
        }
        return nodeInject(provider.key, methodKey);
      },
      session: newFlowSession,
      flow: proxyFlow,
    };

    const flowFunction = createFlowFunction(newContext);
    const flowResult = flowFunction(nodeInputs, emit, (handler) => {
      return registerListener((key, value, _subflowKey) => handler(key, value));
    });
    return flowResult;
  } else {
    // injecttion node
    const nodeFunction = context.inject(
      {
        key: node.target.injectionKey,
        parent: node.target.source,
      },
      node.target.methodKey
    );
    if (!nodeFunction) {
      if (
        node.target.defaultSubflowKey &&
        subflowFunctions[node.target.defaultSubflowKey]
      ) {
        const defaultFn = subflowFunctions[node.target.defaultSubflowKey];
        const result = defaultFn(
          nodeInputs,
          emit,
          registerListener,
          nodeInject,
          {
            node,
            nodeId,
            nodeRunId,
          },
          getState
        );
        return result;
      } else {
        throw new Error(
          `Injection ${node.target.injectionKey}.${node.target.methodKey} is not found`
        );
      }
    }
    return nodeFunction(
      nodeInputs,
      emit,
      registerListener,
      nodeInject,
      {
        node,
        nodeId,
        nodeRunId,
      },
      getState
    );
  }
};

export const runNodeWithHooks = (
  context: Context,
  flowStore: FlowStore,
  nodeMeta: NodeMeta,
  nodeInputs: Record<string, Result>
): ReturnResult => {
  const { nodeId, node, nodeRunId } = nodeMeta;
  // read dependency keys
  // console.log('Running node', nodeMeta, nodeInputs, node.dependencies);
  const injections: Record<string, Provider> = {};
  for (const [key, dep] of Object.entries(node.dependencies ?? {})) {
    const pId = dep.portId;
    const value = readDestPortWithHooks(context, flowStore, pId);
    if (value.kind === ResultKind.Error) {
      return Immediate(Err(value.error));
    } else if (value.resultValue.kind === OptionKind.Some) {
      injections[key] = value.resultValue.optionValue as Provider;
    } else if (dep.defaultProvider) {
      injections[key] = dep.defaultProvider;
    }
  }

  const subscribe = (callback: NodeInputEventHandler) => {
    if (
      !Object.values(flowStore.runtimePorts).find(
        (x) =>
          !x.isSource && x.parent?.nodeId === nodeId && x.type !== PortType.Data
      )
    ) {
      return () => ({});
    }
    flowStore.nodeListeners[nodeId] = callback;
    return () => delete flowStore.nodeListeners[nodeId];
  };
  const emit: FlowEventHandler = (key, value) => {
    const result = Object.entries(flowStore.runtimePorts).find(
      ([_, port]) =>
        port.type !== PortType.Data &&
        port.isSource &&
        port.key === key &&
        port.parent?.nodeId === nodeId &&
        !port.parent.subflowKey
    );
    if (result) {
      dispatch(context, flowStore, result[0], value);
    }
  };

  const subflowFunctions = createSubFlowFunctions(
    context,
    flowStore,
    nodeId,
    node,
    nodeRunId
  );

  context.hooks.onEvent?.({
    kind: 'node',
    nodeMeta,
    name: 'onRunNodeBegin',
    flowSession: context.session,
    value: {
      nodeInputs,
    },
  });
  const res =
    context.hooks.overrideNodeRun?.(
      context,
      flowStore,
      nodeMeta,
      nodeInputs,
      injections,
      subflowFunctions,
      emit,
      subscribe
    ) ??
    runNode(
      context,
      flowStore,
      nodeMeta,
      nodeInputs,
      injections,
      subflowFunctions,
      emit,
      subscribe
    );

  return transformReturnResult(res, (result) => {
    if (
      result.kind === ResultKind.Error &&
      context.flow.kind !== FlowKind.Compute &&
      context.flow.ports.onErrorId
    ) {
      const errorData: ErrorData = {
        error: result.error,
        meta: {
          flowSession: context.session,
          nodeMeta,
          nodeInputs,
        },
      };
      dispatch(context, flowStore, context.flow.ports.onErrorId, {
        result: Ok(Some(errorData)),
      });
    }
    context.hooks.onEvent?.({
      kind: 'node',
      nodeMeta,
      name: 'onRunNodeEnd',
      flowSession: context.session,
      value: {
        nodeOutput: result,
      },
    });

    const transformedResult = context.hooks.transformNodeOutput?.(
      context,
      flowStore,
      nodeMeta,
      result
    );
    return transformedResult ?? result;
  });
};

const runSequenceStep = (
  context: Context,
  flowStore: FlowStore,
  sequenceStep: SequenceStep,
  nodeRunId: string
): SequenceStepResult => {
  const flow = context.flow as SequenceFlow;
  flowStore.tempPortStates.clear();
  if (sequenceStep.kind === SequenceStepKind.SequenceNode) {
    const nodeId = sequenceStep.id;
    const node = flow.sequenceNodes[nodeId];
    const nodeInputs = readNodeInputsWithHooks(context, flowStore, {
      nodeId,
      node,
      nodeRunId: nodeRunId,
    });
    const result = runNodeWithHooks(
      context,
      flowStore,
      { nodeId, node, nodeRunId },
      nodeInputs
    );
    return SeqNext(result);
  } else if (sequenceStep.kind === SequenceStepKind.GoBackIf) {
    const conditionPortId = sequenceStep.conditionPortId;
    const conditionResult = readDestPortWithHooks(
      context,
      flowStore,
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
          return SeqGoBack(sequenceStep.targetStepId);
        } else {
          return SeqNext(Immediate(Ok(Nothing())));
        }
      }
    }
  } else if (sequenceStep.kind === SequenceStepKind.ReturnIf) {
    // read and check if returns
    const conditionPortId = sequenceStep.conditionPortId;
    const conditionResult = readDestPortWithHooks(
      context,
      flowStore,
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
          const returnPortId = sequenceStep.returnValuePortId;
          return SeqReturn(
            readDestPortWithHooks(context, flowStore, returnPortId)
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

const runSequenceSteps = (
  context: Context,
  flowStore: FlowStore,
  startIndex: number
): ReturnResult => {
  const flow = context.flow as SequenceFlow;
  const sequenceSteps = flow.sequenceSteps;
  let index = startIndex;
  while (index < sequenceSteps.length) {
    const step = sequenceSteps[index];
    const runId = getRandomRunId();
    const seqResult = runSequenceStep(context, flowStore, step, runId);
    if (step.kind === SequenceStepKind.GoBackIf) {
      if (seqResult.kind === SequenceStepResultKind.GoBack) {
        const toIndex = sequenceSteps
          .map((x) => x.id)
          .indexOf(seqResult.target);
        context.hooks.onEvent?.({
          kind: 'flow',
          name: 'onGoBack',
          flowSession: context.session,
          value: {
            fromNodeId: step.id,
            toNodeId: seqResult.target,
          },
        });
        sequenceSteps.slice(toIndex, index).map((step) => {
          if (step.kind === SequenceStepKind.SequenceNode) {
            delete flowStore.nodeListeners[step.id];
            flowStore.portStates.deleteState(step.id);
          }
        });
        index = toIndex;
      } else {
        index += 1;
      }
    } else if (step.kind === SequenceStepKind.ReturnIf) {
      if (seqResult.kind === SequenceStepResultKind.Return) {
        return Immediate(seqResult.value);
      } else {
        index += 1;
      }
    } else {
      const nodeId = step.id;
      const node = flow.sequenceNodes[nodeId];
      const returnPortId = node.ports.return?.id;
      const result = (
        seqResult as {
          kind: SequenceStepResultKind.Next;
          value: ReturnResult;
        }
      ).value;

      if (result.kind === ReturnResultKind.Immediate) {
        if (returnPortId) {
          flowStore.portStates.setState(returnPortId, result.returnValue);
        }
        if (result.returnValue.kind === ResultKind.Error) {
          const error = result.returnValue.error;
          context.hooks.onEvent?.({
            kind: 'node',
            nodeMeta: { node, nodeId, nodeRunId: runId },
            name: 'onError',
            flowSession: context.session,
            value: {
              error,
            },
          });
          return Immediate(Err(error));
        }
      } else if (step.isAwaited) {
        // await
        context.hooks.onEvent?.({
          kind: 'node',
          nodeMeta: { node, nodeId, nodeRunId: runId },
          name: 'onAwaitNodeBegin',
          flowSession: context.session,
        });

        return Thenable((resolve) => {
          (result as ThenableReturnResult).then((awaitedResult) => {
            context.hooks.onEvent?.({
              kind: 'node',
              nodeMeta: { node, nodeId, nodeRunId: runId },
              name: 'onAwaitNodeEnd',
              flowSession: context.session,
            });
            if (returnPortId) {
              flowStore.portStates.setState(returnPortId, awaitedResult);
            }

            if (awaitedResult.kind === ResultKind.Error) {
              const error = awaitedResult.error;
              context.hooks.onEvent?.({
                kind: 'node',
                nodeMeta: { node, nodeId, nodeRunId: runId },
                name: 'onError',
                flowSession: context.session,
                value: {
                  error: error,
                },
              });
              resolve(awaitedResult);
            } else {
              const nextResult = runSequenceSteps(
                context,
                flowStore,
                index + 1
              );
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
        const portId = node.ports.return?.id;
        result.then((res) => {
          if (portId) {
            dispatch(context, flowStore, portId, { result: res });
          }
        });
      }
      index += 1;
    }
  }
  return Immediate(readFlowOutputWithHooks(context, flowStore));
};

const runStateNodes = (context: Context, flowStore: FlowStore) => {
  const flow = context.flow as SequenceFlow | StateMachineFlow | ComponentFlow;
  for (const [nodeId, node] of Object.entries(flow.stateMachineNodes)) {
    const nodeRunId = getRandomRunId();
    const nodeInputs = readNodeInputsWithHooks(context, flowStore, {
      nodeId,
      node,
      nodeRunId,
    });
    const result = runNodeWithHooks(
      context,
      flowStore,
      { nodeId, node, nodeRunId },
      nodeInputs
    );
    if (result.kind === ReturnResultKind.Thenable) {
      throw new Error('Setup nodes should not return thenable');
    } else {
      if (result.returnValue.kind === ResultKind.Error) {
        return result.returnValue;
      } else {
        if (result.returnValue.resultValue.kind === OptionKind.Some) {
          const finalResult = result.returnValue.resultValue.optionValue;
          const propertyValues = finalResult as Record<string, unknown>;
          if (propertyValues && Object.keys(propertyValues).length > 0) {
            Object.entries(flowStore.runtimePorts)
              .filter(
                ([id, x]) =>
                  x.parent?.nodeId === nodeId &&
                  x.type === PortType.Property &&
                  x.key &&
                  propertyValues[x.key] !== undefined
              )
              .map(([portId, port]) => {
                flowStore.portStates.setState(
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

const runComponentNodes = (context: Context, flowStore: FlowStore) => {
  const flow = context.flow as ComponentFlow;
  const nodeResults: Record<string, any> = {};
  // const runnables: (() => void)[] = [];
  for (const [nodeId, node] of Object.entries(flow.componentNodes)) {
    const nodeRunId = getRandomRunId();
    const nodeInputs = readNodeInputsWithHooks(context, flowStore, {
      nodeId,
      node,
      nodeRunId,
    });
    const result = runNodeWithHooks(
      context,
      flowStore,
      { nodeId, node, nodeRunId },
      nodeInputs
    );
    if (result.kind === ReturnResultKind.Thenable) {
      throw new Error('Component nodes should not return thenable');
    } else {
      if (result.returnValue.kind === ResultKind.Error) {
        return result.returnValue;
      } else if (result.returnValue.resultValue.kind === OptionKind.Some) {
        nodeResults[nodeId] = result.returnValue.resultValue.optionValue;
      }
    }
  }

  // component flow
  const result: Record<string, ComponentReturn> = {};
  Object.entries(flow.rootCompositions).map(([key, composition]) => {
    result[key] = (context) => (componentInputs) =>
      transformComponent(
        context,
        componentInputs,
        nodeResults,
        flow.nodeCompositions,
        composition
      );
  });
  if (Object.keys(result).length === 0) {
    return Ok(Nothing());
  }
  return Ok(Some(result));
};

export const createFlowFunction = <T extends Context>(
  context: T
): FlowFunction => {
  return (inputs, emit, subscribe) => {
    context.hooks.onEvent?.({
      kind: 'flow',
      name: 'onRunFlowBegin',
      flowSession: context.session,
      value: {
        flowInputs: inputs,
      },
    });

    // hooks transformFlowInputs
    const transformedInputs = context.hooks.transformFlowInputs?.(
      context,
      inputs
    );
    if (transformedInputs) {
      inputs = transformedInputs;
    }

    const overrideFlowRunResult = context.hooks.overrideFlowRun?.(
      context,
      inputs,
      emit,
      subscribe
    );
    let result: ReturnResult;
    if (overrideFlowRunResult) {
      result = overrideFlowRunResult;
      return result;
    } else {
      // run flow
      const runtimePorts = getRuntimePorts(context.flow);
      const flowStore: FlowStore = {
        emit: emit,
        nodeListeners: {},
        tempPortStates: new Map(),
        runtimePorts,
        portStates: context.getStateStore(getFlowSessionId(context.session)),
      };

      Object.entries(inputs).map(([key, value]) => {
        const port = context.flow.ports.inputs
          .filter(
            (x) => x.type === PortType.Data || x.type === PortType.Property
          )
          .find((x) => x.key === key);
        if (port) {
          flowStore.portStates.setState(port.id, value);
        }
      });

      // non-reactive
      if (context.flow.kind === FlowKind.Compute) {
        result = Immediate(readFlowOutputWithHooks(context, flowStore));
      } else {
        const stateErrorResult = runStateNodes(context, flowStore);
        if (stateErrorResult?.kind === ResultKind.Error) {
          result = Immediate(stateErrorResult);
        } else {
          if (context.flow.ports.onReadyId) {
            dispatch(context, flowStore, context.flow.ports.onReadyId, {
              result: Ok(Nothing()),
            });
          }
          if (context.flow.kind === FlowKind.Sequence) {
            result = runSequenceSteps(context, flowStore, 0);
          } else {
            // reactive, need subscribing
            subscribe((portKey, packet) => {
              const port = context.flow.ports.inputs.find(
                (x) => x.key === portKey
              );
              if (port) {
                dispatch(context, flowStore, port.id, packet);
              }
            });
            if (context.flow.kind === FlowKind.Component) {
              result = Immediate(runComponentNodes(context, flowStore));
            } else {
              result = Immediate(readFlowOutputWithHooks(context, flowStore));
            }
          }
        }
      }
      return transformReturnResult(result, (val) => {
        if (
          context.flow.kind !== FlowKind.Compute &&
          context.flow.ports.onExitId
        ) {
          dispatch(context, flowStore, context.flow.ports.onExitId, {
            result: val,
          });
        }
        context.hooks.onEvent?.({
          kind: 'flow',
          name: 'onRunFlowEnd',
          flowSession: context.session,
          value: {
            flowOutput: val,
          },
        });
        return val;
      });
    }
  };
};
