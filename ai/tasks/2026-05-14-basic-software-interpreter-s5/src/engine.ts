import { diagnostic, reportDiagnostics } from './diagnostics';
import type {
  ExecutionResult,
  InterpreterPlan,
  ProviderRegistry,
} from './types';

const messageFromUnknown = (value: unknown): string =>
  value instanceof Error ? value.message : String(value);

export const executeInterpreterPlan = (
  plan: InterpreterPlan,
  context: {
    inputs: Record<string, unknown>;
    providers: ProviderRegistry;
  },
): ExecutionResult => {
  if (plan.diagnostics.length > 0) {
    return {
      status: 'error',
      outputs: {},
      diagnostics: [...plan.diagnostics],
    };
  }

  if (!plan.providerKey || Object.keys(plan.outputMap).length === 0) {
    return {
      status: 'error',
      outputs: {},
      diagnostics: [
        diagnostic(
          'PLAN_INVALID',
          'execute',
          'Interpreter plan is missing provider or output mapping.',
          plan.key,
        ),
      ],
    };
  }

  const provider = context.providers[plan.providerKey];

  if (!provider) {
    return {
      status: 'error',
      outputs: {},
      diagnostics: [
        diagnostic(
          'PROVIDER_MISSING',
          'execute',
          `Missing provider ${plan.providerKey}`,
          plan.providerKey,
        ),
      ],
    };
  }

  const providerInputs: Record<string, unknown> = {};

  for (const [providerInput, luInput] of Object.entries(plan.inputMap)) {
    providerInputs[providerInput] = context.inputs[luInput];
  }

  try {
    const providerOutputs = provider(providerInputs);
    const outputs: Record<string, unknown> = {};

    for (const [luOutput, providerOutput] of Object.entries(plan.outputMap)) {
      outputs[luOutput] = providerOutputs[providerOutput];
    }

    return {
      status: 'ok',
      outputs,
      diagnostics: [],
    };
  } catch (error) {
    return {
      status: 'error',
      outputs: {},
      diagnostics: [
        diagnostic(
          'RUNTIME_FAILURE',
          'execute',
          messageFromUnknown(error),
          plan.providerKey,
        ),
      ],
    };
  }
};

export const executeAndReport = (
  plan: InterpreterPlan,
  context: {
    inputs: Record<string, unknown>;
    providers: ProviderRegistry;
  },
) => {
  const result = executeInterpreterPlan(plan, context);
  return {
    ...result,
    report: reportDiagnostics(result.diagnostics),
  };
};
