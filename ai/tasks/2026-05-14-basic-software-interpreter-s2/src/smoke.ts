import { basicSoftwareInterpreterStack } from './architecture';
import { createMemoryStateStore, executeInterpreterPlan } from './engine';
import { counterCurrentLogicUnit } from './fixture';
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
const plan = createInterpreterPlan(counterCurrentLogicUnit, resolved);

if (!plan.interpretation?.baselineOnly) {
  throw new Error('Interpreter plan must declare baseline interpretation metadata.');
}

const stateStore = createMemoryStateStore({ counter: 1 });

const initialRead = executeInterpreterPlan(plan, {
  inputs: {},
  stateStore,
});

assertDeepEqual(initialRead.outputs, { current: 1, written: undefined });

const firstWrite = executeInterpreterPlan(plan, {
  inputs: { next: 7 },
  stateStore,
});

assertDeepEqual(firstWrite.outputs, { current: 1, written: 7 });
assertDeepEqual(firstWrite.state, { counter: 7 });

const secondWrite = executeInterpreterPlan(plan, {
  inputs: { next: 11 },
  stateStore,
});

assertDeepEqual(secondWrite.outputs, { current: 7, written: 11 });
assertDeepEqual(secondWrite.state, { counter: 11 });

console.log(
  JSON.stringify(
    {
      stack: resolved.stackKey,
      plan: plan.key,
      interpretation: plan.interpretation,
      readsAndWrites: [
        initialRead.outputs,
        firstWrite.outputs,
        secondWrite.outputs,
      ],
      finalState: secondWrite.state,
    },
    null,
    2,
  ),
);
