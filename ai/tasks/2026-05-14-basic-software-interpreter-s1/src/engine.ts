import type {
  ExecutionResult,
  InterpreterPlan,
  ProviderRegistry,
} from './types';

const assertRecord = (
  value: Record<string, unknown>,
  subject: string,
): Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${subject} must be an object.`);
  }

  return value;
};

export const executeInterpreterPlan = (
  plan: InterpreterPlan,
  context: {
    inputs: Record<string, unknown>;
    providers: ProviderRegistry;
  },
): ExecutionResult => {
  const outputs: Record<string, unknown> = {};

  for (const node of plan.nodes) {
    const provider = context.providers[node.providerKey];

    if (!provider) {
      throw new Error(`Missing provider: ${node.providerKey}`);
    }

    const providerInputs: Record<string, unknown> = {};

    for (const [providerInput, luInput] of Object.entries(node.inputMap)) {
      providerInputs[providerInput] = context.inputs[luInput];
    }

    const providerOutputs = assertRecord(
      provider(providerInputs),
      `Provider ${node.providerKey} output`,
    );

    for (const [luOutput, providerOutput] of Object.entries(node.outputMap)) {
      outputs[luOutput] = providerOutputs[providerOutput];
    }
  }

  return {
    outputs,
    diagnostics: [...plan.diagnostics],
  };
};
