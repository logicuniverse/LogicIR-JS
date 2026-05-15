import type {
  ExecutionResult,
  InterpreterPlan,
  InterpreterPlanNode,
  PortKey,
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

type ExecutionContext = {
  inputs: Record<string, unknown>;
  providers: ProviderRegistry;
};

const findProducerForOutput = (
  plan: InterpreterPlan,
  outputPort: PortKey,
): { node: InterpreterPlanNode; providerOutput: PortKey } => {
  const producers = plan.nodes.flatMap((node) =>
    Object.entries(node.outputMap)
      .filter(([luOutput]) => luOutput === outputPort)
      .map(([, providerOutput]) => ({ node, providerOutput })),
  );

  if (producers.length !== 1) {
    throw new Error(
      `Expected exactly one producer for output ${outputPort}, got ${producers.length}.`,
    );
  }

  return producers[0];
};

const invokeNode = (
  node: InterpreterPlanNode,
  context: ExecutionContext,
): Record<string, unknown> => {
  const provider = context.providers[node.providerKey];

  if (!provider) {
    throw new Error(`Missing provider: ${node.providerKey}`);
  }

  const providerInputs: Record<string, unknown> = {};

  for (const [providerInput, luInput] of Object.entries(node.inputMap)) {
    providerInputs[providerInput] = context.inputs[luInput];
  }

  return assertRecord(provider(providerInputs), `Provider ${node.providerKey} output`);
};

const executeCombinationalPlan = (
  plan: InterpreterPlan,
  context: ExecutionContext,
): ExecutionResult => {
  const { node, providerOutput } = findProducerForOutput(
    plan,
    plan.primaryOutputPort,
  );
  const providerOutputs = invokeNode(node, context);

  return {
    outputs: {
      [plan.primaryOutputPort]: providerOutputs[providerOutput],
    },
    diagnostics: [...plan.diagnostics],
  };
};

export const executeInterpreterPlan = (
  plan: InterpreterPlan,
  context: ExecutionContext,
): ExecutionResult => {
  if (plan.executionKind === 'combinational') {
    return executeCombinationalPlan(plan, context);
  }

  throw new Error(`Unsupported S1 execution kind: ${plan.executionKind}`);
};
