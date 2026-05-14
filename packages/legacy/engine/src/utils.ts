import {
  ComposableContext,
  Data,
  LU,
  LUError,
  LUKind,
  Option,
  OptionKind,
  PortParent,
  PortKind,
  Result,
  ResultKind,
  ReturnResult,
  ReturnResultKind,
  RuntimePort,
  SequentialStepResult,
  SequentialStepResultKind,
  CombinationalLUI,
  SequentialLUI,
  StatefulLUI,
  ComposableLUI,
  SequentialStepKind,
  Address,
  HandlerLUI,
  LUICompositions,
  ComposableChild,
  ComposableLUIChildrenKind,
  ComposableReturn,
  Port,
  PushPort,
  PropertyPort,
} from './types';

export const Err = (error: LUError): Result => ({
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

export const SeqNext = (value: ReturnResult): SequentialStepResult => ({
  kind: SequentialStepResultKind.Next,
  value,
});

export const SeqGoBack = (target: string): SequentialStepResult => ({
  kind: SequentialStepResultKind.GoBack,
  target,
});

export const SeqReturn = (value: Result): SequentialStepResult => ({
  kind: SequentialStepResultKind.Return,
  value,
});

const portsCommon2RuntimePorts = (
  ports: {
    inputs: Port[];
    outputs: (PushPort | PropertyPort)[];
  },
  parent: PortParent
) => {
  const runtimePorts: Record<string, RuntimePort> = {};
  ports.inputs.map((p) => {
    runtimePorts[p.id] = {
      key: p.key,
      parent: parent,
      isSource: !parent,
      kind: p.kind,
      expansion: p.expansion,
    };
  });
  ports.outputs.map((p) => {
    runtimePorts[p.id] = {
      key: p.key,
      parent: parent,
      isSource: !!parent,
      kind: p.kind,
      expansion: p.expansion,
    };
  });
  return runtimePorts;
};

const getAllLUIs = (lu: LU) => {
  const allLUIs: {
    combinational: Record<string, CombinationalLUI>;
    sequential: Record<string, SequentialLUI>;
    stateful: Record<string, StatefulLUI>;
    composable: Record<string, ComposableLUI>;
    handler: Record<string, HandlerLUI>;
  } = {
    combinational: lu.combinationalLUIs,
    sequential: {},
    stateful: {},
    composable: {},
    handler: {},
  };
  if (lu.kind !== LUKind.Combinational) {
    Object.entries(lu.statefulLUIs).map(([luiId, x]) => {
      allLUIs.stateful[luiId] = x;
    });
    allLUIs.handler = lu.handlerLUIs;
  }
  if (lu.kind === LUKind.Sequential) {
    allLUIs.sequential = lu.sequentialLUIs;
  }
  if (lu.kind === LUKind.Composable) {
    allLUIs.composable = lu.composableLUIs;
  }
  return allLUIs;
};

export const getRuntimePorts = (lu: LU) => {
  const runtimePorts: Record<string, RuntimePort> = {};

  const luPortsCommon = portsCommon2RuntimePorts(lu.ports, null);
  Object.assign(runtimePorts, luPortsCommon);

  if (
    (lu.kind === LUKind.Combinational || lu.kind === LUKind.Sequential) &&
    lu.ports.return
  ) {
    runtimePorts[lu.ports.return.id] = {
      key: null,
      parent: null,
      isSource: false,
      kind: PortKind.Pull,
      expansion: lu.ports.return.expansion,
    };
  }

  const allLUIs = getAllLUIs(lu);
  Object.entries({
    ...allLUIs.composable,
    ...allLUIs.combinational,
    ...allLUIs.sequential,
    ...allLUIs.stateful,
    ...allLUIs.handler,
  }).map(([luiId, lui]) => {
    const luiPortsCommon = portsCommon2RuntimePorts(lui.ports, {
      luiId: luiId,
      closureKey: null,
    });
    Object.assign(runtimePorts, luiPortsCommon);

    // injection ports
    Object.entries(lui.dependencies).map(([key, x]) => {
      runtimePorts[x.portId] = {
        key: key,
        parent: { luiId: luiId, closureKey: null },
        isSource: false,
        kind: PortKind.Pull,
        expansion: null,
      };
    });

    if (lui.closures) {
      Object.entries(lui.closures).map(([closureKey, closure]) => {
        const closureOuterPorts: {
          inputs: Port[];
          outputs: (PushPort | PropertyPort)[];
        } = {
          inputs: [],
          outputs: [],
        };
        closure.outerPorts.inputs.map((p) => {
          const innerPort = closure.lu.ports.inputs.find(
            (x) => x.key === p.key
          )!;
          closureOuterPorts.inputs.push({
            id: p.id,
            key: p.key,
            kind: innerPort.kind,
            expansion: p.expansion,
          });
        });
        closure.outerPorts.outputs.map((p) => {
          const innerPort = closure.lu.ports.outputs.find(
            (x) => x.key === p.key
          )!;
          closureOuterPorts.outputs.push({
            id: p.id,
            key: p.key,
            kind: innerPort.kind,
            expansion: p.expansion,
          });
        });
        const closurePortsCommon = portsCommon2RuntimePorts(closureOuterPorts, {
          luiId: luiId,
          closureKey: closureKey,
        });
        Object.assign(runtimePorts, closurePortsCommon);
      });
    }
  });
  // LUI return
  Object.entries(allLUIs.combinational).map(([luiId, lui]) => {
    runtimePorts[lui.ports.return.id] = {
      key: null,
      parent: { luiId: luiId, closureKey: null },
      isSource: true,
      kind: PortKind.Pull,
      expansion: lui.ports.return.expansion,
    };
  });
  Object.entries(allLUIs.handler).map(([luiId, lui]) => {
    runtimePorts[lui.ports.return.id] = {
      key: null,
      parent: { luiId: luiId, closureKey: null },
      isSource: true,
      kind: PortKind.Push,
      expansion: lui.ports.return.expansion,
    };
  });
  if (lu.kind === LUKind.Sequential) {
    lu.sequentialSteps.map((step) => {
      if (step.kind === SequentialStepKind.SequentialLUI) {
        const lui = lu.sequentialLUIs[step.id];
        if (lui.ports.return) {
          const returnId = lui.ports.return.id;
          let portType: PortKind = PortKind.Pull;
          if (
            Object.values(lu.nets).some(
              (con) =>
                con.source.portId === returnId &&
                runtimePorts[con.target.portId].kind !== PortKind.Pull
            )
          ) {
            portType = PortKind.Push; // resolve
          }
          runtimePorts[returnId] = {
            key: null,
            parent: { luiId: step.id, closureKey: null },
            isSource: true,
            kind: portType,
            expansion: lui.ports.return.expansion,
          };
        }
      } else if (step.kind === SequentialStepKind.GoBackIf) {
        runtimePorts[step.conditionPortId] = {
          key: step.conditionPortId,
          parent: { luiId: step.id, closureKey: null },
          isSource: false,
          kind: PortKind.Pull,
          expansion: null,
        };
      } else if (step.kind === SequentialStepKind.ReturnIf) {
        runtimePorts[step.conditionPortId] = {
          key: step.conditionPortId,
          parent: { luiId: step.id, closureKey: null },
          isSource: false,
          kind: PortKind.Pull,
          expansion: null,
        };
        runtimePorts[step.returnValuePortId] = {
          key: step.returnValuePortId,
          parent: { luiId: step.id, closureKey: null },
          isSource: false,
          kind: PortKind.Pull,
          expansion: null,
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

export const getRandomManifestId = (prefix = 'm') => {
  const timestamp = new Date().valueOf();
  return `${prefix}-${timestamp}-${getRandomString(8)}`;
};

export const getInjectionKey = (
  serviceKey: string,
  from: { luiId: string; closureKey: string } | null
) => {
  return from
    ? `${from.luiId}_${from.closureKey}/` + `${serviceKey}`
    : serviceKey;
};

export const getMethodKeyFromInjectionKey = (injectionKey: string) => {
  const parts = injectionKey.split('/');
  return parts[parts.length - 1];
};

export const transformComposable = (
  context: ComposableContext,
  composableInputs: Record<string, any>,
  luiResults: Record<string, Record<string, ComposableReturn>>,
  compositions: LUICompositions,
  child: ComposableChild
) => {
  if (!child) {
    return null;
  }
  if (!child.luiId) {
    return composableInputs[child.key] ?? null;
  }
  const children: Record<string, any> = {};

  for (const [key, value] of Object.entries(compositions[child.luiId] || {})) {
    if (value.kind === ComposableLUIChildrenKind.Single) {
      children[key] = transformComposable(
        context,
        composableInputs,
        luiResults,
        compositions,
        value.child
      );
    } else if (value.kind === ComposableLUIChildrenKind.Collection) {
      const elements: any[] = [];
      for (const x of value.children) {
        const element = transformComposable(
          context,
          composableInputs,
          luiResults,
          compositions,
          x
        );
        elements.push(element);
      }
      children[key] = context.compose({ item: null, children: elements });
    } else {
      const elements: Record<string, any> = {};
      for (const [childKey, childValue] of Object.entries(value.children)) {
        elements[childKey] = transformComposable(
          context,
          composableInputs,
          luiResults,
          compositions,
          childValue
        );
      }
      children[key] = context.compose({ item: null, children: elements });
    }
  }
  const result = luiResults[child.luiId][child.key];
  return context.compose({ item: result(context), children });
};

export const getDataByPath = (obj: Data, path: Address) => {
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

export const getResultByPath = (result: Result, path: Address) => {
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
