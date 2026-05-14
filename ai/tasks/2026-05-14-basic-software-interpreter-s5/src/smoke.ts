import { reportDiagnostics } from './diagnostics';
import { executeAndReport } from './engine';
import {
  invalidPlanFixture,
  missingProviderFixture,
  runtimeFailureFixture,
  unsupportedSemanticsFixture,
  validInvocationFixture,
} from './fixtures';
import { createInterpreterPlan } from './projector';
import type { Diagnostic } from './types';

const assertDeepEqual = (
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
): void => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, got ${actualJson}`);
  }
};

const assertFirstDiagnostic = (
  diagnostics: Diagnostic[],
  expected: Pick<Diagnostic, 'code' | 'phase' | 'severity'>,
): void => {
  assertDeepEqual(
    {
      code: diagnostics[0]?.code,
      phase: diagnostics[0]?.phase,
      severity: diagnostics[0]?.severity,
    },
    expected,
  );
};

const providers = {
  'logicir.examples.math/add': ({ left, right }: Record<string, unknown>) => ({
    sum: Number(left) + Number(right),
  }),
  'logicir.examples.math/throws': () => {
    throw new Error('provider exploded');
  },
};

const valid = executeAndReport(createInterpreterPlan(validInvocationFixture), {
  inputs: { left: 2, right: 5 },
  providers,
});
assertDeepEqual(valid.outputs, { sum: 7 });
assertDeepEqual(valid.report.summary, {});

const missingProvider = executeAndReport(
  createInterpreterPlan(missingProviderFixture),
  { inputs: { left: 2, right: 5 }, providers },
);
assertFirstDiagnostic(missingProvider.diagnostics, {
  code: 'PROVIDER_MISSING',
  phase: 'execute',
  severity: 'error',
});

const invalidPlan = executeAndReport(createInterpreterPlan(invalidPlanFixture), {
  inputs: { left: 2, right: 5 },
  providers,
});
assertFirstDiagnostic(invalidPlan.diagnostics, {
  code: 'PLAN_INVALID',
  phase: 'project',
  severity: 'error',
});

const unsupported = executeAndReport(
  createInterpreterPlan(unsupportedSemanticsFixture),
  { inputs: { left: 2, right: 5 }, providers },
);
assertFirstDiagnostic(unsupported.diagnostics, {
  code: 'UNSUPPORTED_SEMANTIC',
  phase: 'project',
  severity: 'error',
});

const runtimeFailure = executeAndReport(
  createInterpreterPlan(runtimeFailureFixture),
  { inputs: { left: 2, right: 5 }, providers },
);
assertFirstDiagnostic(runtimeFailure.diagnostics, {
  code: 'RUNTIME_FAILURE',
  phase: 'execute',
  severity: 'error',
});

const combinedReport = reportDiagnostics([
  ...missingProvider.diagnostics,
  ...invalidPlan.diagnostics,
  ...unsupported.diagnostics,
  ...runtimeFailure.diagnostics,
]);

assertDeepEqual(combinedReport.summary, {
  PROVIDER_MISSING: 1,
  PLAN_INVALID: 1,
  UNSUPPORTED_SEMANTIC: 1,
  RUNTIME_FAILURE: 1,
});

console.log(
  JSON.stringify(
    {
      valid,
      missingProvider,
      invalidPlan,
      unsupported,
      runtimeFailure,
      combinedReport,
    },
    null,
    2,
  ),
);
