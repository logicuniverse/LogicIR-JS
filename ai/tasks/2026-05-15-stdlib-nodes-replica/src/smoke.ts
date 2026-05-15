import { compileLogicUnit, runPlan } from './execution';
import { createStdlibLogicUnitFixture } from './logic-unit-fixture';
import { smokeCases } from './smoke-cases';

const deepEqual = (actual: unknown, expected: unknown): boolean => {
  if (Object.is(actual, expected)) {
    return true;
  }

  if (Array.isArray(actual) || Array.isArray(expected)) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      return false;
    }
    return (
      actual.length === expected.length &&
      actual.every((value, index) => deepEqual(value, expected[index]))
    );
  }

  if (
    actual === null ||
    expected === null ||
    typeof actual !== 'object' ||
    typeof expected !== 'object'
  ) {
    return false;
  }

  const actualRecord = actual as Record<string, unknown>;
  const expectedRecord = expected as Record<string, unknown>;
  const actualKeys = Object.keys(actualRecord).sort();
  const expectedKeys = Object.keys(expectedRecord).sort();

  return (
    deepEqual(actualKeys, expectedKeys) &&
    actualKeys.every((key) => deepEqual(actualRecord[key], expectedRecord[key]))
  );
};

const assertDeepEqual = (actual: unknown, expected: unknown): void => {
  if (!deepEqual(actual, expected)) {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    throw new Error(`Expected ${expectedJson}, got ${actualJson}`);
  }
};

const main = async (): Promise<void> => {
  for (const smokeCase of smokeCases) {
    const fixture = createStdlibLogicUnitFixture(smokeCase.key);
    const plan = compileLogicUnit(fixture);
    const actual = await runPlan(plan, smokeCase.inputs);

    assertDeepEqual(actual.outputs, smokeCase.expected);
    assertDeepEqual(actual.emitted, smokeCase.expectedEmitted ?? {});
    if (smokeCase.expectedState) {
      assertDeepEqual(actual.state, smokeCase.expectedState);
    }
  }

  console.log(JSON.stringify({ smokeCases: smokeCases.length }, null, 2));
};

void main();
