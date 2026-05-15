import type {
  Engine,
  EngineHooks,
  EngineOptions,
  ExecutionContext,
  ExecutionNode,
  ExecutionResult,
  InterpreterPlan,
  Option,
  Packet,
  PortMapping,
  Result,
  ReturnValue,
  RuntimeError,
  StateStore,
} from './types';

let nextRunId = 1;

export const some = <T>(value: T): Option<T> => ({ kind: 'some', value });
export const none = (): Option => ({ kind: 'none' });
export const ok = <T>(value: Option<T>): Result<T> => ({
  kind: 'ok',
  value,
});
export const err = (
  code: string,
  message: string,
  subject?: string,
): Result => ({ kind: 'error', error: { code, message, subject } });
export const immediate = <T>(result: Result<T>): ReturnValue<T> => ({
  kind: 'immediate',
  result,
});
export const thenable = <T>(
  work: (resolve: (result: Result<T>) => void) => void,
): ReturnValue<T> => ({
  kind: 'thenable',
  then: work,
});

const valueOf = (result: Result): unknown =>
  result.kind === 'ok' && result.value.kind === 'some'
    ? result.value.value
    : undefined;

const resultFromUnknown = (value: unknown): Result =>
  value === undefined ? ok(none()) : ok(some(value));

const isThenableReturnValue = (
  value: unknown,
): value is ReturnValue<Record<string, unknown>> =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  ((value as { kind?: unknown }).kind === 'immediate' ||
    (value as { kind?: unknown }).kind === 'thenable');

const returnValueToPromise = (
  value: ReturnValue<Record<string, unknown>>,
): Promise<Record<string, unknown> | Result> => {
  if (value.kind === 'immediate') {
    if (value.result.kind === 'error') {
      return Promise.resolve(value.result);
    }
    return Promise.resolve(
      value.result.value.kind === 'some' ? value.result.value.value : {},
    );
  }

  return new Promise((resolve) => {
    value.then((result) => {
      if (result.kind === 'error') {
        resolve(result);
        return;
      }
      resolve(result.value.kind === 'some' ? result.value.value : {});
    });
  });
};

const messageFromUnknown = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

const isRuntimeResult = (
  value: Record<string, unknown> | Result,
): value is Result =>
  value.kind === 'ok' || value.kind === 'error';

export const createMemoryStateStore = (
  initial: Record<string, unknown> = {},
): StateStore => {
  const values = new Map(Object.entries(initial));

  return {
    get: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, value);
    },
    delete: (key) => {
      values.delete(key);
    },
    snapshot: () => Object.fromEntries(values.entries()),
  };
};

const composeHooks = (options: EngineOptions): EngineHooks => ({
  onEvent: (event) => {
    for (const plugin of options.plugins ?? []) {
      plugin.hooks?.onEvent?.(event);
    }
  },
  overrideLUIExecution: (context, node, inputs) => {
    for (const plugin of options.plugins ?? []) {
      const output = plugin.hooks?.overrideLUIExecution?.(context, node, inputs);
      if (output) {
        plugin.hooks?.onEvent?.({
          name: 'onDidOverrideLUIManifestation',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { inputs, output },
        });
        return output;
      }
    }
    return undefined;
  },
  overrideClosureExecution: (context, node, inputs) => {
    for (const plugin of options.plugins ?? []) {
      const output = plugin.hooks?.overrideClosureExecution?.(
        context,
        node,
        inputs,
      );
      if (output) {
        plugin.hooks?.onEvent?.({
          name: 'onDidOverrideClosureProjection',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { inputs, output },
        });
        return output;
      }
    }
    return undefined;
  },
  transformDataAfterRead: (context, node, portKey, value) => {
    let current: Result | undefined;
    for (const plugin of options.plugins ?? []) {
      const next = plugin.hooks?.transformDataAfterRead?.(
        context,
        node,
        portKey,
        current ?? value,
      );
      if (next) {
        current = next;
        plugin.hooks?.onEvent?.({
          name: 'onDidTransformDataAfterRead',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { portKey, from: value, to: current },
        });
      }
    }
    return current;
  },
  transformDataBeforeEmit: (context, node, portKey, value) => {
    let current: Result | undefined;
    for (const plugin of options.plugins ?? []) {
      const next = plugin.hooks?.transformDataBeforeEmit?.(
        context,
        node,
        portKey,
        current ?? value,
      );
      if (next) {
        current = next;
        plugin.hooks?.onEvent?.({
          name: 'onDidTransformDataBeforeEmit',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { portKey, from: value, to: current },
        });
      }
    }
    return current;
  },
  transformLUIInputs: (context, node, inputs) => {
    let current: Record<string, Result> | undefined;
    for (const plugin of options.plugins ?? []) {
      const next = plugin.hooks?.transformLUIInputs?.(
        context,
        node,
        current ?? inputs,
      );
      if (next) {
        current = next;
        plugin.hooks?.onEvent?.({
          name: 'onDidTransformLUIInputs',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { from: inputs, to: current },
        });
      }
    }
    return current;
  },
  transformLUIOutput: (context, node, output) => {
    let current: Result | undefined;
    for (const plugin of options.plugins ?? []) {
      const next = plugin.hooks?.transformLUIOutput?.(
        context,
        node,
        current ?? output,
      );
      if (next) {
        current = next;
        plugin.hooks?.onEvent?.({
          name: 'onDidTransformLUIOutput',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { from: output, to: current },
        });
      }
    }
    return current;
  },
});

const createContext = (
  options: EngineOptions,
  plan: InterpreterPlan,
  parentRunId?: string,
): ExecutionContext => ({
  plan,
  providers: options.providers,
  plans: options.plans ?? {},
  stateStore: options.stateStore ?? createMemoryStateStore({ counter: 1 }),
  hooks: composeHooks(options),
  emitted: {},
  sessions: [
    {
      runId: `run-${nextRunId++}`,
      planKey: plan.key,
      parentRunId,
    },
  ],
});

const readPayloadPath = (
  value: unknown,
  path: (string | number)[] | undefined,
): unknown => {
  let current = value;
  for (const segment of path ?? []) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = Array.isArray(current)
      ? current[Number(segment)]
      : (current as Record<string, unknown>)[String(segment)];
  }
  return current;
};

const writePayloadPath = (
  target: Record<string, unknown>,
  path: (string | number)[] | undefined,
  value: unknown,
): void => {
  if (!path || path.length === 0) {
    return;
  }

  let current: Record<string, unknown> = target;
  for (const segment of path.slice(0, -1)) {
    const key = String(segment);
    if (current[key] === null || typeof current[key] !== 'object') {
      current[key] = typeof segment === 'number' ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[String(path[path.length - 1])] = value;
};

const mapValueFromSource = (
  mapping: PortMapping,
  sourceValue: unknown,
): unknown => {
  const selected = readPayloadPath(sourceValue, mapping.payloadPath);
  if (!mapping.targetPayloadPath || mapping.targetPayloadPath.length === 0) {
    return selected;
  }
  const assembled: Record<string, unknown> = {};
  writePayloadPath(assembled, mapping.targetPayloadPath, selected);
  return assembled;
};

const inputObjectForNode = (
  context: ExecutionContext,
  node: ExecutionNode,
  luInputs: Record<string, unknown>,
  outputs: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [nodeInput, source] of Object.entries(node.inputMap)) {
    const sourceValue =
      outputs[source.portKey] !== undefined
        ? outputs[source.portKey]
        : luInputs[source.portKey];
    const selected = mapValueFromSource(source, sourceValue);
    const readResult = resultFromUnknown(selected);
    const transformed =
      context.hooks.transformDataAfterRead?.(
        context,
        node,
        nodeInput,
        readResult,
      ) ?? readResult;
    result[nodeInput] = valueOf(transformed);
  }

  return result;
};

const resultInputsForHook = (
  inputs: Record<string, unknown>,
): Record<string, Result> =>
  Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => [key, resultFromUnknown(value)]),
  );

const plainInputsFromResults = (
  inputs: Record<string, Result>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => [key, valueOf(value)]),
  );

const mapOutputs = (
  node: ExecutionNode,
  nodeOutputs: Record<string, unknown>,
  luOutputs: Record<string, unknown>,
): void => {
  for (const [luOutput, nodeOutput] of Object.entries(node.outputMap)) {
    const value = readPayloadPath(nodeOutputs[nodeOutput.portKey], nodeOutput.payloadPath);
    if (nodeOutput.targetPayloadPath && nodeOutput.targetPayloadPath.length > 0) {
      const existing =
        luOutputs[luOutput] !== null && typeof luOutputs[luOutput] === 'object'
          ? (luOutputs[luOutput] as Record<string, unknown>)
          : {};
      writePayloadPath(existing, nodeOutput.targetPayloadPath, value);
      luOutputs[luOutput] = existing;
    } else {
      luOutputs[luOutput] = value;
    }
  }
};

const dispatchEmit = (
  context: ExecutionContext,
  node: ExecutionNode,
  key: string,
  value: Packet,
): void => {
  context.hooks.onEvent?.({
    name: 'onWillEmitData',
    nodeId: node.id,
    planKey: context.plan.key,
    value: { key, packet: value },
  });

  const transformed =
    context.hooks.transformDataBeforeEmit?.(
      context,
      node,
      key,
      value.result,
    ) ?? value.result;

  context.emitted[key] = [
    ...(context.emitted[key] ?? []),
    { ...value, result: transformed },
  ];
};

const diagnosticFromError = (
  phase: 'compile' | 'execute',
  error: RuntimeError,
) => ({
  code: error.code,
  severity: 'error' as const,
  phase,
  message: error.message,
  subject: error.subject,
});

const executeProvider = async (
  context: ExecutionContext,
  node: ExecutionNode,
  inputs: Record<string, unknown>,
): Promise<Record<string, unknown> | Result> => {
  if (!node.targetKey) {
    return err('PLAN_INVALID', `Node ${node.id} is missing targetKey.`, node.id);
  }

  const provider = context.providers[node.targetKey];
  if (!provider) {
    return err('PROVIDER_MISSING', `Missing provider ${node.targetKey}`, node.id);
  }

  const hookInputs =
    context.hooks.transformLUIInputs?.(
      context,
      node,
      resultInputsForHook(inputs),
    ) ?? resultInputsForHook(inputs);

  try {
    const rawProviderResult = provider(plainInputsFromResults(hookInputs), {
      getState: context.stateStore.get,
      setState: context.stateStore.set,
      emit: (key: string, value: Packet) => dispatchEmit(context, node, key, value),
    });

    const providerResult = isThenableReturnValue(rawProviderResult)
      ? await returnValueToPromise(rawProviderResult)
      : await rawProviderResult;

    if (isRuntimeResult(providerResult)) {
      return providerResult;
    }

    const result = ok(some(providerResult));
    const transformed =
      context.hooks.transformLUIOutput?.(context, node, result) ?? result;

    if (transformed.kind === 'error') {
      return transformed;
    }

    return (transformed.value.kind === 'some'
      ? transformed.value.value
      : providerResult) as Record<string, unknown>;
  } catch (error) {
    return err('RUNTIME_FAILURE', messageFromUnknown(error), node.id);
  }
};

const executeProviderSync = (
  context: ExecutionContext,
  node: ExecutionNode,
  inputs: Record<string, unknown>,
): Record<string, unknown> | Result => {
  if (!node.targetKey) {
    return err('PLAN_INVALID', `Node ${node.id} is missing targetKey.`, node.id);
  }

  const provider = context.providers[node.targetKey];
  if (!provider) {
    return err('PROVIDER_MISSING', `Missing provider ${node.targetKey}`, node.id);
  }

  const hookInputs =
    context.hooks.transformLUIInputs?.(
      context,
      node,
      resultInputsForHook(inputs),
    ) ?? resultInputsForHook(inputs);

  try {
    const providerResult = provider(plainInputsFromResults(hookInputs), {
      getState: context.stateStore.get,
      setState: context.stateStore.set,
      emit: (key: string, value: Packet) => dispatchEmit(context, node, key, value),
    });

    if (providerResult instanceof Promise) {
      return err(
        'ASYNC_PROVIDER_IN_SYNC_RUN',
        `Provider ${node.targetKey} returned a Promise during sync run.`,
        node.id,
      );
    }

    if (isThenableReturnValue(providerResult)) {
      if (providerResult.kind === 'thenable') {
        return err(
          'ASYNC_PROVIDER_IN_SYNC_RUN',
          `Provider ${node.targetKey} returned a Thenable during sync run.`,
          node.id,
        );
      }
      if (providerResult.result.kind === 'error') {
        return providerResult.result;
      }
      return providerResult.result.value.kind === 'some'
        ? providerResult.result.value.value
        : {};
    }

    const result = ok(some(providerResult));
    const transformed =
      context.hooks.transformLUIOutput?.(context, node, result) ?? result;

    if (transformed.kind === 'error') {
      return transformed;
    }

    return (transformed.value.kind === 'some'
      ? transformed.value.value
      : providerResult) as Record<string, unknown>;
  } catch (error) {
    return err('RUNTIME_FAILURE', messageFromUnknown(error), node.id);
  }
};

const executeNode = async (
  context: ExecutionContext,
  node: ExecutionNode,
  inputs: Record<string, unknown>,
  outputs: Record<string, unknown>,
): Promise<Result | undefined> => {
  const nodeInputs = inputObjectForNode(context, node, inputs, outputs);
  const overridden = context.hooks.overrideLUIExecution?.(
    context,
    node,
    nodeInputs,
  );
  if (overridden) {
    if (isRuntimeResult(overridden)) {
      return overridden;
    }
    mapOutputs(node, overridden, outputs);
    return undefined;
  }

  if (node.kind === 'state-read') {
    mapOutputs(node, { current: context.stateStore.get(node.storeKey ?? '') }, outputs);
    return undefined;
  }

  if (node.kind === 'state-write') {
    const value = nodeInputs.next;
    if (value !== undefined) {
      context.stateStore.set(node.storeKey ?? '', value);
      mapOutputs(node, { written: context.stateStore.get(node.storeKey ?? '') }, outputs);
    }
    return undefined;
  }

  if (node.kind === 'closure') {
    const closureOverride = context.hooks.overrideClosureExecution?.(
      context,
      node,
      nodeInputs,
    );
    if (closureOverride) {
      if (isRuntimeResult(closureOverride)) {
        return closureOverride;
      }
      mapOutputs(node, closureOverride, outputs);
      return undefined;
    }
    const result = { result: Number(nodeInputs.value) + 1 };
    mapOutputs(node, result, outputs);
    return undefined;
  }

  if (node.kind === 'provider' || node.kind === 'upstream') {
    const result = await executeProvider(context, node, nodeInputs);
    if (isRuntimeResult(result)) {
      return result;
    }
    mapOutputs(node, result, outputs);
    return undefined;
  }

  if (node.kind === 'nested-lu') {
    const nestedPlan = node.luRef ? context.plans[node.luRef] : undefined;
    if (!nestedPlan) {
      return err('PLAN_INVALID', `Missing nested plan ${node.luRef}`, node.id);
    }
    const nestedContext = {
      ...context,
      plan: nestedPlan,
      emitted: context.emitted,
      sessions: [
        {
          runId: `run-${nextRunId++}`,
          planKey: nestedPlan.key,
          parentRunId: context.sessions[context.sessions.length - 1]?.runId,
        },
      ],
    };
    const nestedResult = await executePlan(nestedContext, nodeInputs);
    context.sessions.push(...nestedContext.sessions);
    if (nestedResult.status === 'error') {
      return err('NESTED_PLAN_FAILED', 'Nested LU execution failed.', node.id);
    }
    mapOutputs(node, nestedResult.outputs, outputs);
    return undefined;
  }

  if (node.kind === 'sequential-control') {
    const limit = Number(node.extensions?.limit ?? 3);
    let current = Number(nodeInputs.start ?? 0);
    let guard = true;
    while (guard) {
      current += 1;
      guard = current < limit;
      if (guard && node.extensions?.emitGoBack === true) {
        context.hooks.onEvent?.({
          name: 'onGoBack',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { fromId: node.id, toId: node.id },
        });
      }
      if (!guard && node.extensions?.returnIfReached === true) {
        context.hooks.onEvent?.({
          name: 'onReturnIf',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { result: current },
        });
      }
    }
    mapOutputs(node, { result: current }, outputs);
    return undefined;
  }

  if (node.kind === 'structural-render') {
    const textProvider = await executeProvider(
      context,
      {
        id: `${node.id}:text`,
        kind: 'provider',
        targetKey: 'logicir.examples.ui/text',
        inputMap: { text: { portKey: 'text' } },
        outputMap: { render: { portKey: 'render' } },
      },
      { text: nodeInputs.text },
    );
    if (isRuntimeResult(textProvider)) {
      return textProvider;
    }

    const buttonProvider = await executeProvider(
      context,
      {
        id: `${node.id}:button`,
        kind: 'provider',
        targetKey: 'logicir.examples.ui/button',
        inputMap: { label: { portKey: 'label' } },
        outputMap: { render: { portKey: 'render' } },
      },
      { label: nodeInputs.label },
    );
    if (isRuntimeResult(buttonProvider)) {
      return buttonProvider;
    }

    const textRender = textProvider.render as (children?: unknown) => unknown;
    const buttonRender = buttonProvider.render as (children?: unknown) => unknown;
    mapOutputs(node, { root: buttonRender(textRender()) }, outputs);
  }

  return undefined;
};

const executeNodeSync = (
  context: ExecutionContext,
  node: ExecutionNode,
  inputs: Record<string, unknown>,
  outputs: Record<string, unknown>,
): Result | undefined => {
  const nodeInputs = inputObjectForNode(context, node, inputs, outputs);
  const overridden = context.hooks.overrideLUIExecution?.(
    context,
    node,
    nodeInputs,
  );
  if (overridden) {
    if (isRuntimeResult(overridden)) {
      return overridden;
    }
    mapOutputs(node, overridden, outputs);
    return undefined;
  }

  if (node.kind === 'state-read') {
    mapOutputs(node, { current: context.stateStore.get(node.storeKey ?? '') }, outputs);
    return undefined;
  }

  if (node.kind === 'state-write') {
    const value = nodeInputs.next;
    if (value !== undefined) {
      context.stateStore.set(node.storeKey ?? '', value);
      mapOutputs(node, { written: context.stateStore.get(node.storeKey ?? '') }, outputs);
    }
    return undefined;
  }

  if (node.kind === 'closure') {
    const closureOverride = context.hooks.overrideClosureExecution?.(
      context,
      node,
      nodeInputs,
    );
    if (closureOverride) {
      if (isRuntimeResult(closureOverride)) {
        return closureOverride;
      }
      mapOutputs(node, closureOverride, outputs);
      return undefined;
    }
    mapOutputs(node, { result: Number(nodeInputs.value) + 1 }, outputs);
    return undefined;
  }

  if (node.kind === 'provider' || node.kind === 'upstream') {
    const result = executeProviderSync(context, node, nodeInputs);
    if (isRuntimeResult(result)) {
      return result;
    }
    mapOutputs(node, result, outputs);
    return undefined;
  }

  if (node.kind === 'nested-lu') {
    const nestedPlan = node.luRef ? context.plans[node.luRef] : undefined;
    if (!nestedPlan) {
      return err('PLAN_INVALID', `Missing nested plan ${node.luRef}`, node.id);
    }
    const nestedContext = {
      ...context,
      plan: nestedPlan,
      emitted: context.emitted,
      sessions: [
        {
          runId: `run-${nextRunId++}`,
          planKey: nestedPlan.key,
          parentRunId: context.sessions[context.sessions.length - 1]?.runId,
        },
      ],
    };
    const nestedResult = executePlanSync(nestedContext, nodeInputs);
    context.sessions.push(...nestedContext.sessions);
    if (nestedResult.status === 'error') {
      return err('NESTED_PLAN_FAILED', 'Nested LU execution failed.', node.id);
    }
    mapOutputs(node, nestedResult.outputs, outputs);
    return undefined;
  }

  if (node.kind === 'sequential-control') {
    const limit = Number(node.extensions?.limit ?? 3);
    let current = Number(nodeInputs.start ?? 0);
    let guard = true;
    while (guard) {
      current += 1;
      guard = current < limit;
      if (guard && node.extensions?.emitGoBack === true) {
        context.hooks.onEvent?.({
          name: 'onGoBack',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { fromId: node.id, toId: node.id },
        });
      }
      if (!guard && node.extensions?.returnIfReached === true) {
        context.hooks.onEvent?.({
          name: 'onReturnIf',
          nodeId: node.id,
          planKey: context.plan.key,
          value: { result: current },
        });
      }
    }
    mapOutputs(node, { result: current }, outputs);
    return undefined;
  }

  if (node.kind === 'structural-render') {
    const textProvider = executeProviderSync(
      context,
      {
        id: `${node.id}:text`,
        kind: 'provider',
        targetKey: 'logicir.examples.ui/text',
        inputMap: { text: { portKey: 'text' } },
        outputMap: { render: { portKey: 'render' } },
      },
      { text: nodeInputs.text },
    );
    if (isRuntimeResult(textProvider)) {
      return textProvider;
    }

    const buttonProvider = executeProviderSync(
      context,
      {
        id: `${node.id}:button`,
        kind: 'provider',
        targetKey: 'logicir.examples.ui/button',
        inputMap: { label: { portKey: 'label' } },
        outputMap: { render: { portKey: 'render' } },
      },
      { label: nodeInputs.label },
    );
    if (isRuntimeResult(buttonProvider)) {
      return buttonProvider;
    }

    const textRender = textProvider.render as (children?: unknown) => unknown;
    const buttonRender = buttonProvider.render as (children?: unknown) => unknown;
    mapOutputs(node, { root: buttonRender(textRender()) }, outputs);
  }

  return undefined;
};

const executePlan = async (
  context: ExecutionContext,
  inputs: Record<string, unknown>,
): Promise<ExecutionResult> => {
  const diagnostics = [...context.plan.diagnostics];
  const outputs: Record<string, unknown> = {};

  if (diagnostics.some((entry) => entry.severity === 'error')) {
    return {
      status: 'error',
      outputs,
      state: context.stateStore.snapshot(),
      emitted: context.emitted,
      sessions: context.sessions,
      diagnostics,
    };
  }

  for (const node of context.plan.nodes) {
    context.hooks.onEvent?.({
      name: 'onManifestLUIBegin',
      nodeId: node.id,
      planKey: context.plan.key,
    });
    const result = await executeNode(context, node, inputs, outputs);
    if (result?.kind === 'error') {
      diagnostics.push(diagnosticFromError('execute', result.error));
    }
    context.hooks.onEvent?.({
      name: 'onManifestLUIEnd',
      nodeId: node.id,
      planKey: context.plan.key,
    });
  }

  return {
    status: diagnostics.some((entry) => entry.severity === 'error')
      ? 'error'
      : 'ok',
    outputs,
    state: context.stateStore.snapshot(),
    emitted: context.emitted,
    sessions: context.sessions,
    diagnostics,
  };
};

const executePlanSync = (
  context: ExecutionContext,
  inputs: Record<string, unknown>,
): ExecutionResult => {
  const diagnostics = [...context.plan.diagnostics];
  const outputs: Record<string, unknown> = {};

  if (diagnostics.some((entry) => entry.severity === 'error')) {
    return {
      status: 'error',
      outputs,
      state: context.stateStore.snapshot(),
      emitted: context.emitted,
      sessions: context.sessions,
      diagnostics,
    };
  }

  for (const node of context.plan.nodes) {
    context.hooks.onEvent?.({
      name: 'onManifestLUIBegin',
      nodeId: node.id,
      planKey: context.plan.key,
    });
    const result = executeNodeSync(context, node, inputs, outputs);
    if (result?.kind === 'error') {
      diagnostics.push(diagnosticFromError('execute', result.error));
    }
    context.hooks.onEvent?.({
      name: 'onManifestLUIEnd',
      nodeId: node.id,
      planKey: context.plan.key,
    });
  }

  return {
    status: diagnostics.some((entry) => entry.severity === 'error')
      ? 'error'
      : 'ok',
    outputs,
    state: context.stateStore.snapshot(),
    emitted: context.emitted,
    sessions: context.sessions,
    diagnostics,
  };
};

export const createEngine = (options: EngineOptions): Engine => {
  const stateStore = options.stateStore ?? createMemoryStateStore({ counter: 1 });
  const normalizedOptions = { ...options, stateStore };

  return {
    run: (plan, inputs) =>
      executePlanSync(createContext(normalizedOptions, plan), inputs),
    runAsync: (plan, inputs) =>
      executePlan(createContext(normalizedOptions, plan), inputs),
    runReactive: async (plan, inputs, events) => {
      const context = createContext(normalizedOptions, plan);
      const result = await executePlan(context, inputs);
      if (result.status === 'error') {
        return result;
      }

      for (const [key, packets] of Object.entries(events)) {
        for (const packet of packets) {
          const eventInputs = {
            ...inputs,
            [key]: valueOf(packet.result),
          };
          const eventResult = await executePlan(context, eventInputs);
          Object.assign(result.outputs, eventResult.outputs);
        }
      }

      return {
        ...result,
        state: context.stateStore.snapshot(),
        emitted: context.emitted,
        sessions: context.sessions,
      };
    },
  };
};
