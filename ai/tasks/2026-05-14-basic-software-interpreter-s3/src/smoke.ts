import { basicSoftwareInterpreterStack } from './architecture';
import { executeInterpreterPlan } from './engine';
import { asyncDoubleLogicUnit } from './fixture';
import { createInterpreterPlan } from './projector';
import { resolveStack } from './resolver';

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

const run = async (): Promise<void> => {
  const resolved = resolveStack(basicSoftwareInterpreterStack);
  const plan = createInterpreterPlan(asyncDoubleLogicUnit, resolved);

  if (!plan.interpretation?.baselineOnly) {
    throw new Error('Interpreter plan must declare baseline interpretation metadata.');
  }

  const resolvedResult = await executeInterpreterPlan(plan, {
    inputs: { value: 6 },
    providers: {
      'logicir.examples.async/double': async ({ value }) => ({
        doubled: Number(value) * 2,
      }),
    },
  });

  assertDeepEqual(resolvedResult.outputs, { doubled: 12 });

  const rejectedResult = await executeInterpreterPlan(plan, {
    inputs: { value: 6 },
    providers: {
      'logicir.examples.async/double': async () => {
        throw new Error('async provider failed');
      },
    },
  });

  if (rejectedResult.status !== 'error') {
    throw new Error('Expected rejected provider to return error status.');
  }

  assertDeepEqual(
    {
      code: rejectedResult.diagnostics[0]?.code,
      message: rejectedResult.diagnostics[0]?.message,
      severity: rejectedResult.diagnostics[0]?.severity,
    },
    {
      code: 'PROVIDER_REJECTED',
      message: 'async provider failed',
      severity: 'error',
    },
  );

  console.log(
    JSON.stringify(
      {
        stack: resolved.stackKey,
        plan: plan.key,
        interpretation: plan.interpretation,
        resolve: resolvedResult,
        reject: rejectedResult,
      },
      null,
      2,
    ),
  );
};

run().catch((error: unknown) => {
  console.error(error);
  throw error;
});
