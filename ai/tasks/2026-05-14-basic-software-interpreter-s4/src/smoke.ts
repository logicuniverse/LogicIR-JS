import { basicSoftwareInterpreterStack } from './architecture';
import { executeInterpreterPlan } from './engine';
import {
  closureFulfillmentLogicUnit,
  upstreamFulfillmentLogicUnit,
} from './fixture';
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

const closurePlan = createInterpreterPlan(closureFulfillmentLogicUnit, resolved);
const closureResult = executeInterpreterPlan(
  closurePlan,
  closureFulfillmentLogicUnit,
  { inputs: { value: 4 } },
);
assertDeepEqual(closureResult.outputs, { result: 5 });

const upstreamPlan = createInterpreterPlan(upstreamFulfillmentLogicUnit, resolved);
const upstreamResult = executeInterpreterPlan(
  upstreamPlan,
  upstreamFulfillmentLogicUnit,
  {
    inputs: { value: 4 },
    upstreamProvider: (_serviceKey, _unitKey, inputs) => ({
      result: Number(inputs.value) + 10,
    }),
  },
);
assertDeepEqual(upstreamResult.outputs, { result: 14 });

const missingProviderResult = executeInterpreterPlan(
  upstreamPlan,
  upstreamFulfillmentLogicUnit,
  { inputs: { value: 4 } },
);

if (missingProviderResult.status !== 'error') {
  throw new Error('Expected missing upstream provider to return error status.');
}

assertDeepEqual(
  {
    code: missingProviderResult.diagnostics[0]?.code,
    severity: missingProviderResult.diagnostics[0]?.severity,
  },
  {
    code: 'UPSTREAM_PROVIDER_MISSING',
    severity: 'error',
  },
);

console.log(
  JSON.stringify(
    {
      stack: resolved.stackKey,
      closure: closureResult,
      upstream: upstreamResult,
      missingProvider: missingProviderResult,
    },
    null,
    2,
  ),
);
