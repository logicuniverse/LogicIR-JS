import type {
  Diagnostic,
  ExecutionResult,
  InterpreterPlan,
  LogicUnit,
  RequirementProvider,
} from './types';

const errorDiagnostic = (
  code: string,
  message: string,
  subject?: string,
): Diagnostic => ({
  code,
  message,
  severity: 'error',
  subject,
});

export const executeInterpreterPlan = (
  plan: InterpreterPlan,
  logicUnit: LogicUnit,
  context: {
    inputs: Record<string, unknown>;
    upstreamProvider?: RequirementProvider;
  },
): ExecutionResult => {
  const outputs: Record<string, unknown> = {};
  const diagnostics: Diagnostic[] = [...plan.diagnostics];

  for (const node of plan.nodes) {
    const nodeInputs: Record<string, unknown> = {};

    for (const [unitInput, luInput] of Object.entries(node.inputMap)) {
      nodeInputs[unitInput] = context.inputs[luInput];
    }

    let nodeOutputs: Record<string, unknown> | undefined;

    if (node.fulfillment.kind === 'closure') {
      const closure = logicUnit.core.closures[node.fulfillment.closureId];

      if (!closure) {
        diagnostics.push(
          errorDiagnostic(
            'CLOSURE_MISSING',
            `Missing closure ${node.fulfillment.closureId}`,
            node.fulfillment.closureId,
          ),
        );
        continue;
      }

      nodeOutputs = closure.run(nodeInputs);
    } else {
      nodeOutputs = context.upstreamProvider?.(
        node.fulfillment.supplierServiceKey,
        node.fulfillment.supplierUnitKey,
        nodeInputs,
      );

      if (!nodeOutputs) {
        diagnostics.push(
          errorDiagnostic(
            'UPSTREAM_PROVIDER_MISSING',
            `Missing upstream provider for ${node.fulfillment.supplierServiceKey}.${node.fulfillment.supplierUnitKey}`,
            `${node.fulfillment.supplierServiceKey}.${node.fulfillment.supplierUnitKey}`,
          ),
        );
        continue;
      }
    }

    for (const [luOutput, unitOutput] of Object.entries(node.outputMap)) {
      outputs[luOutput] = nodeOutputs[unitOutput];
    }
  }

  return {
    status: diagnostics.some((diagnostic) => diagnostic.severity === 'error')
      ? 'error'
      : 'ok',
    outputs,
    diagnostics,
  };
};
