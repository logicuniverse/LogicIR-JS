import { basicSoftwareInterpreterStack } from './architecture';
import { executeInterpreterPlan } from './engine';
import {
  closureProviders,
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
if (!closurePlan.interpretation?.baselineOnly) {
  throw new Error('Closure plan must declare baseline interpretation metadata.');
}
const closureResult = executeInterpreterPlan(
  closurePlan,
  { inputs: { value: 4 }, closures: closureProviders },
);
assertDeepEqual(closureResult.outputs, { result: 5 });

const upstreamPlan = createInterpreterPlan(upstreamFulfillmentLogicUnit, resolved);
if (!upstreamPlan.interpretation?.baselineOnly) {
  throw new Error('Upstream plan must declare baseline interpretation metadata.');
}
const upstreamResult = executeInterpreterPlan(
  upstreamPlan,
  {
    inputs: { value: 4 },
    closures: closureProviders,
    upstreamProvider: (_serviceKey, _unitKey, inputs) => ({
      result: Number(inputs.value) + 10,
    }),
  },
);
assertDeepEqual(upstreamResult.outputs, { result: 14 });

const missingProviderResult = executeInterpreterPlan(
  upstreamPlan,
  { inputs: { value: 4 }, closures: closureProviders },
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
      interpretation: closurePlan.interpretation,
      closure: closureResult,
      upstream: upstreamResult,
      missingProvider: missingProviderResult,
    },
    null,
    2,
  ),
);
