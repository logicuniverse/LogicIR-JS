import type {
  AsyncProviderRegistry,
  Diagnostic,
  ExecutionResult,
  InterpreterPlan,
} from './types';

const errorDiagnostic = (
  code: string,
  message: string,
  subject?: string,
  detail?: Record<string, unknown>,
): Diagnostic => ({
  code,
  message,
  severity: 'error',
  subject,
  detail,
});

const messageFromUnknown = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

export const executeInterpreterPlan = async (
  plan: InterpreterPlan,
  context: {
    inputs: Record<string, unknown>;
    providers: AsyncProviderRegistry;
  },
): Promise<ExecutionResult> => {
  const provider = context.providers[plan.node.providerKey];

  if (!provider) {
    return {
      status: 'error',
      outputs: {},
      diagnostics: [
        errorDiagnostic(
          'PROVIDER_MISSING',
          `Missing provider ${plan.node.providerKey}`,
          plan.node.providerKey,
        ),
      ],
    };
  }

  const providerInputs: Record<string, unknown> = {};

  for (const [providerInput, luInput] of Object.entries(plan.node.inputMap)) {
    providerInputs[providerInput] = context.inputs[luInput];
  }

  try {
    const providerOutputs = await provider(providerInputs);
    const outputs: Record<string, unknown> = {};

    for (const [luOutput, providerOutput] of Object.entries(plan.node.outputMap)) {
      outputs[luOutput] = providerOutputs[providerOutput];
    }

    return {
      status: 'ok',
      outputs,
      diagnostics: [...plan.diagnostics],
    };
  } catch (error) {
    return {
      status: 'error',
      outputs: {},
      diagnostics: [
        errorDiagnostic(
          'PROVIDER_REJECTED',
          messageFromUnknown(error),
          plan.node.providerKey,
        ),
      ],
    };
  }
};
