import { basicSoftwareInterpreterStack } from './architecture';
import { addPairLogicUnit } from './fixture';
import { executeInterpreterPlan } from './engine';
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

const resolved = resolveStack(basicSoftwareInterpreterStack);
const plan = createInterpreterPlan(addPairLogicUnit, resolved);

const result = executeInterpreterPlan(plan, {
  inputs: { left: 2, right: 3 },
  providers: {
    'logicir.examples.providers/add-pair-function@0.0.0-s1': ({
      left,
      right,
    }) => ({
      sum: Number(left) + Number(right),
    }),
  },
});

assertDeepEqual(result.outputs, { sum: 5 });

console.log(
  JSON.stringify(
    {
      stack: resolved.stackKey,
      plan: plan.key,
      inputs: { left: 2, right: 3 },
      outputs: result.outputs,
    },
    null,
    2,
  ),
);
