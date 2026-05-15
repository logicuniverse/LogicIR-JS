import { diagnostic } from './diagnostics';
import type { InterpreterPlan, LogicUnitFixture } from './types';
import { baselineInterpretation, providerIdentity } from './types';

export const createInterpreterPlan = (
  fixture: LogicUnitFixture,
): InterpreterPlan => {
  const diagnostics = [];

  if (fixture.unsupportedSemantics && fixture.unsupportedSemantics.length > 0) {
    diagnostics.push(
      diagnostic(
        'UNSUPPORTED_SEMANTIC',
        'project',
        `Unsupported semantics: ${fixture.unsupportedSemantics.join(', ')}`,
        fixture.key,
        { unsupportedSemantics: fixture.unsupportedSemantics },
      ),
    );
  }

  if (Object.keys(fixture.outputMap).length === 0) {
    diagnostics.push(
      diagnostic(
        'PLAN_INVALID',
        'project',
        'Interpreter plan must map at least one provider output to an LU output.',
        fixture.key,
      ),
    );
  }

  return {
    key: `${fixture.key}.interpreter-plan.s5`,
    interpretation: baselineInterpretation('s5-diagnostic-aware-invocation', [
      'Provider invocation remains explicit and diagnostic-producing.',
      'Invalid plans, missing providers, unsupported semantics, and runtime failures stay distinguishable.',
    ]),
    providerKey: providerIdentity(fixture.target),
    inputMap: fixture.inputMap,
    outputMap: fixture.outputMap,
    diagnostics,
  };
};
