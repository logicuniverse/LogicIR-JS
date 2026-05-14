import type {
  ExecutionResult,
  InterpreterPlan,
  StateStoreProvider,
} from './types';

export const createMemoryStateStore = (
  initial: Record<string, unknown>,
): StateStoreProvider => {
  const values = new Map(Object.entries(initial));

  return {
    get: (key) => values.get(key),
    set: (key, value) => {
      values.set(key, value);
    },
    snapshot: () => Object.fromEntries(values.entries()),
  };
};

export const executeInterpreterPlan = (
  plan: InterpreterPlan,
  context: {
    inputs: Record<string, unknown>;
    stateStore: StateStoreProvider;
  },
): ExecutionResult => {
  const outputs: Record<string, unknown> = {};

  for (const operation of plan.operations) {
    if (operation.kind === 'read-current') {
      outputs[operation.outputPort] = context.stateStore.get(operation.storeKey);
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(context.inputs, operation.inputPort)) {
      continue;
    }

    const nextValue = context.inputs[operation.inputPort];
    context.stateStore.set(operation.storeKey, nextValue);
    outputs[operation.outputPort] = context.stateStore.get(operation.storeKey);
  }

  return {
    outputs,
    state: context.stateStore.snapshot(),
    diagnostics: [...plan.diagnostics],
  };
};
