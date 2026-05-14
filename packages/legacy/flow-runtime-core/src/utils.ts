import {
  ComponentContext,
  Data,
  Flow,
  FlowError,
  FlowKind,
  Option,
  OptionKind,
  PortParent,
  PortType,
  Result,
  ResultKind,
  ReturnResult,
  ReturnResultKind,
  RuntimePort,
  SequenceStepResult,
  SequenceStepResultKind,
  ComputeNode,
  SequenceNode,
  StateMachineNode,
  ComponentNode,
  SequenceStepKind,
  GenericPorts,
  PortSubPath,
  TriggerNode,
  NodeCompositions,
  ComponentChild,
  ComponentNodeChildrenKind,
  ComponentReturn,
} from './types';

export const Err = (error: FlowError): Result => ({
  kind: ResultKind.Error,
  error,
});

export const Ok = <T extends Data>(value: Option<T>): Result<T> => ({
  kind: ResultKind.Ok,
  resultValue: value,
});

export const Some = <T extends Data>(value: T): Option<T> => ({
  kind: OptionKind.Some,
  optionValue: value,
});

export const Nothing = (): Option => ({
  kind: OptionKind.Nothing,
});

export const Immediate = (value: Result): ReturnResult => ({
  kind: ReturnResultKind.Immediate,
  returnValue: value,
});

export const Thenable = (
  handler: (onResolve: (result: Result) => void) => void
): ReturnResult => {
  const p = new Promise<Result>((result) => handler(result));
  return {
    kind: ReturnResultKind.Thenable,
    then: (x) => p.then(x),
  };
};

export const SeqNext = (value: ReturnResult): SequenceStepResult => ({
  kind: SequenceStepResultKind.Next,
  value,
});

export const SeqGoBack = (target: string): SequenceStepResult => ({
  kind: SequenceStepResultKind.GoBack,
  target,
});

export const SeqReturn = (value: Result): SequenceStepResult => ({
  kind: SequenceStepResultKind.Return,
  value,
});

const portsCommon2RuntimePorts = (
  ports: GenericPorts<PortType, PortType.Stream | PortType.Property>,
  parent: PortParent
) => {
  const runtimePorts: Record<string, RuntimePort> = {};
  ports.inputs.map((p) => {
    runtimePorts[p.id] = {
      key: p.key,
      parent: parent,
      isSource: !parent,
      type: p.type,
      destructuringData: p.destructuringData,
    };
  });
  ports.outputs.map((p) => {
    runtimePorts[p.id] = {
      key: p.key,
      parent: parent,
      isSource: !!parent,
      type: p.type,
      destructuringData: p.destructuringData,
    };
  });
  return runtimePorts;
};

const getAllNodes = (flow: Flow) => {
  const allNodes: {
    compute: Record<string, ComputeNode>;
    sequence: Record<string, SequenceNode>;
    state: Record<string, StateMachineNode>;
    component: Record<string, ComponentNode>;
    trigger: Record<string, TriggerNode>;
  } = {
    compute: flow.computeNodes,
    sequence: {},
    state: {},
    component: {},
    trigger: {},
  };
  if (flow.kind !== FlowKind.Compute) {
    Object.entries(flow.stateMachineNodes).map(([nodeId, x]) => {
      allNodes.state[nodeId] = x;
    });
    allNodes.trigger = flow.triggerNodes;
  }
  if (flow.kind === FlowKind.Sequence) {
    allNodes.sequence = flow.sequenceNodes;
  }
  if (flow.kind === FlowKind.Component) {
    allNodes.component = flow.componentNodes;
  }
  return allNodes;
};

export const getRuntimePorts = (flow: Flow) => {
  const runtimePorts: Record<string, RuntimePort> = {};

  // flow ports common
  const flowPortsCommon = portsCommon2RuntimePorts(flow.ports, null);
  Object.assign(runtimePorts, flowPortsCommon);

  // flow return
  if (
    (flow.kind === FlowKind.Compute || flow.kind === FlowKind.Sequence) &&
    flow.ports.return
  ) {
    runtimePorts[flow.ports.return.id] = {
      key: null,
      parent: null,
      isSource: false,
      type: PortType.Data,
      destructuringData: flow.ports.return.destructuringData,
    };
  }

  // node ports common
  const allNodes = getAllNodes(flow);
  Object.entries({
    ...allNodes.component,
    ...allNodes.compute,
    ...allNodes.sequence,
    ...allNodes.state,
    ...allNodes.trigger,
  }).map(([nodeId, node]) => {
    const nodePortsCommon = portsCommon2RuntimePorts(node.ports, {
      nodeId,
      subflowKey: null,
    });
    Object.assign(runtimePorts, nodePortsCommon);

    // injection ports
    Object.entries(node.dependencies).map(([key, x]) => {
      runtimePorts[x.portId] = {
        key: key,
        parent: { nodeId, subflowKey: null },
        isSource: false,
        type: PortType.Data,
        destructuringData: null,
      };
    });

    if (node.subflows) {
      Object.entries(node.subflows).map(([subflowKey, subflow]) => {
        const subflowOuterPorts: GenericPorts<
          PortType,
          PortType.Stream | PortType.Property
        > = {
          inputs: [],
          outputs: [],
        };
        subflow.outerPorts.input.map((p) => {
          const innerPort = subflow.flow.ports.inputs.find(
            (x) => x.key === p.key
          )!;
          subflowOuterPorts.inputs.push({
            id: p.id,
            key: p.key,
            type: innerPort.type,
            destructuringData: p.destructuringData,
          });
        });
        subflow.outerPorts.output.map((p) => {
          const innerPort = subflow.flow.ports.outputs.find(
            (x) => x.key === p.key
          )!;
          subflowOuterPorts.outputs.push({
            id: p.id,
            key: p.key,
            type: innerPort.type,
            destructuringData: p.destructuringData,
          });
        });
        const subflowPortsCommon = portsCommon2RuntimePorts(subflowOuterPorts, {
          nodeId,
          subflowKey,
        });
        Object.assign(runtimePorts, subflowPortsCommon);
      });
    }
  });
  // node return
  Object.entries(allNodes.compute).map(([nodeId, node]) => {
    runtimePorts[node.ports.return.id] = {
      key: null,
      parent: { nodeId, subflowKey: null },
      isSource: true,
      type: PortType.Data,
      destructuringData: node.ports.return.destructuringData,
    };
  });
  Object.entries(allNodes.trigger).map(([nodeId, node]) => {
    runtimePorts[node.ports.return.id] = {
      key: null,
      parent: { nodeId, subflowKey: null },
      isSource: true,
      type: PortType.Stream,
      destructuringData: node.ports.return.destructuringData,
    };
  });
  if (flow.kind === FlowKind.Sequence) {
    flow.sequenceSteps.map((step) => {
      if (step.kind === SequenceStepKind.SequenceNode) {
        const node = flow.sequenceNodes[step.id];
        if (node.ports.return) {
          const returnId = node.ports.return.id;
          let portType = PortType.Data;
          if (
            Object.values(flow.connections).some(
              (con) =>
                con.from.portId === returnId &&
                runtimePorts[con.to.portId].type !== PortType.Data
            )
          ) {
            portType = PortType.Stream; // resolve
          }
          runtimePorts[returnId] = {
            key: null,
            parent: { nodeId: step.id, subflowKey: null },
            isSource: true,
            type: portType,
            destructuringData: node.ports.return.destructuringData,
          };
        }
      } else if (step.kind === SequenceStepKind.GoBackIf) {
        runtimePorts[step.conditionPortId] = {
          key: step.conditionPortId,
          parent: { nodeId: step.id, subflowKey: null },
          isSource: false,
          type: PortType.Data,
          destructuringData: null,
        };
      } else if (step.kind === SequenceStepKind.ReturnIf) {
        runtimePorts[step.conditionPortId] = {
          key: step.conditionPortId,
          parent: { nodeId: step.id, subflowKey: null },
          isSource: false,
          type: PortType.Data,
          destructuringData: null,
        };
        runtimePorts[step.returnValuePortId] = {
          key: step.returnValuePortId,
          parent: { nodeId: step.id, subflowKey: null },
          isSource: false,
          type: PortType.Data,
          destructuringData: null,
        };
      }
    });
  }
  return runtimePorts;
};

export const transformReturnResult = (
  input: ReturnResult,
  transform: (val: Result) => Result
): ReturnResult => {
  if (input.kind === ReturnResultKind.Thenable) {
    return Thenable((resolve) => {
      input.then((awaitedResult) => {
        const transformed = transform(awaitedResult);
        resolve(transformed);
      });
    });
  } else {
    return Immediate(transform(input.returnValue));
  }
};

export const getRandomString = (length: number) => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getRandomRunId = (prefix = 'run') => {
  const timestamp = new Date().valueOf();
  return `${prefix}-${timestamp}-${getRandomString(8)}`;
};

export const getInjectionKey = (
  serviceKey: string,
  from: { nodeId: string; subflowKey: string } | null
) => {
  return from
    ? `${from.nodeId}_${from.subflowKey}/` + `${serviceKey}`
    : serviceKey;
};

export const getMethodKeyFromInjectionKey = (injectionKey: string) => {
  const parts = injectionKey.split('/');
  return parts[parts.length - 1];
};

export const transformComponent = (
  context: ComponentContext,
  componentInputs: Record<string, any>,
  nodeResults: Record<string, Record<string, ComponentReturn>>,
  compositions: NodeCompositions,
  child: ComponentChild
) => {
  if (!child) {
    return null;
  }
  if (!child.nodeId) {
    return componentInputs[child.key] ?? null;
  }
  const children: Record<string, any> = {};

  for (const [key, value] of Object.entries(compositions[child.nodeId] || {})) {
    if (value.kind === ComponentNodeChildrenKind.Single) {
      children[key] = transformComponent(
        context,
        componentInputs,
        nodeResults,
        compositions,
        value.child
      );
    } else if (value.kind === ComponentNodeChildrenKind.Array) {
      const elements: any[] = [];
      for (const x of value.children) {
        const element = transformComponent(
          context,
          componentInputs,
          nodeResults,
          compositions,
          x
        );
        elements.push(element);
      }
      children[key] = context.compose({ item: null, children: elements });
    } else {
      const elements: Record<string, any> = {};
      for (const [childKey, childValue] of Object.entries(value.children)) {
        elements[childKey] = transformComponent(
          context,
          componentInputs,
          nodeResults,
          compositions,
          childValue
        );
      }
      children[key] = context.compose({ item: null, children: elements });
    }
  }
  const result = nodeResults[child.nodeId][child.key];
  return context.compose({ item: result(context), children });
};

export const getDataByPath = (obj: Data, path: PortSubPath) => {
  let current = obj;
  for (const p of path) {
    if (current && typeof current === 'object') {
      if (typeof p === 'number') {
        current = (current as Data[])[p];
      } else {
        current = (current as Record<string, Data>)[p];
      }
    } else {
      return undefined;
    }
  }
  return current;
};

export const getResultByPath = (result: Result, path: PortSubPath) => {
  if (
    path.length > 0 &&
    result.kind === ResultKind.Ok &&
    result.resultValue.kind === OptionKind.Some
  ) {
    const data = getDataByPath(result.resultValue.optionValue, path);
    if (data === undefined) {
      return Ok(Nothing());
    } else {
      return Ok(Some(data));
    }
  } else {
    return result;
  }
};
