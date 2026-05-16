import { basicSoftwareInterpreterStack } from './architecture';
import { addPairLogicUnit } from './fixture';
import { executeInterpreterPlan } from './engine';
import { createInterpreterPlan } from './projector';
import { resolveStack } from './resolver';
import type { InterpreterPlan } from './types';

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

if (Object.keys(addPairLogicUnit.featureUses).includes('invocation')) {
  throw new Error('Plain external-target add fixture must not declare a software invocation feature.');
}

const addLuiExtensions = addPairLogicUnit.core.luis.add.extensions ?? [];
if (
  addLuiExtensions.some(
    (extension) =>
      extension.featureKey === 'invocation' &&
      extension.key === 'provider-binding',
  )
) {
  throw new Error('Provider binding must stay in architecture execution bindings, not LUI extensions.');
}

if (!plan.interpretation?.baselineOnly) {
  throw new Error('Interpreter plan must declare baseline interpretation metadata.');
}

const planWithUnusedNode: InterpreterPlan = {
  ...plan,
  nodes: [
    ...plan.nodes,
    {
      luiId: 'unused',
      target: {
        namespace: 'logicir.examples.math',
        key: 'unused',
      },
      providerKey: 'logicir.examples.providers/unused-function@0.0.0-s1',
      inputMap: {},
      outputMap: {
        unused: 'unused',
      },
    },
  ],
};

const result = executeInterpreterPlan(planWithUnusedNode, {
  inputs: { left: 2, right: 3 },
  providers: {
    'logicir.examples.providers/add-pair-function@0.0.0-s1': ({
      left,
      right,
    }) => ({
      sum: Number(left) + Number(right),
    }),
    'logicir.examples.providers/unused-function@0.0.0-s1': () => {
      throw new Error('Combinational execution should not eagerly run unused nodes.');
    },
  },
});

assertDeepEqual(result.outputs, { sum: 5 });

console.log(
  JSON.stringify(
    {
      stack: resolved.stackKey,
      plan: plan.key,
      interpretation: plan.interpretation,
      inputs: { left: 2, right: 3 },
      outputs: result.outputs,
    },
    null,
    2,
  ),
);
