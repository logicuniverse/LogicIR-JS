import { TypeChecker } from './checker';
import { algebraicTypeSystemFeatureDefinition } from './feature';
import {
  buildTypeRegistryFromLogicUnit,
  checkLogicUnitConnectionTypes,
  readPayloadType,
} from './logicir';
import {
  eventRef,
  fixtureLogicUnit,
  intType,
  numberType,
  stringBoxRef,
  stringListRef,
  userIdRef,
  userRef,
  userType,
} from './fixtures';
import type { TypeIssue, TypeSystemReport } from './types';

type SmokeCase = {
  name: string;
  run: () => boolean;
};

const registryResult = buildTypeRegistryFromLogicUnit(fixtureLogicUnit);
const checker = new TypeChecker({ registry: registryResult.registry });

const cases: SmokeCase[] = [
  {
    name: 'feature definition exposes the active extension points',
    run: () =>
      algebraicTypeSystemFeatureDefinition.extensionPoints.length === 3 &&
      algebraicTypeSystemFeatureDefinition.extensionPoints.some(
        (item) => item.key === 'type-definitions',
      ) &&
      algebraicTypeSystemFeatureDefinition.extensionPoints.some(
        (item) => item.key === 'payload-type',
      ) &&
      algebraicTypeSystemFeatureDefinition.extensionPoints.some(
        (item) => item.key === 'connection-type-policy',
      ),
  },
  {
    name: 'builds a registry from LogicIR type-definitions',
    run: () =>
      registryResult.issues.length === 0 &&
      Boolean(registryResult.registry.getDefinition('User')) &&
      Boolean(registryResult.registry.getDefinition('Box')),
  },
  {
    name: 'validates object alias with refinement',
    run: () =>
      checker.validateValue(userRef, { id: 'u1', age: 42 }).ok &&
      !checker.validateValue(userRef, { id: 'u1', age: -1 }).ok,
  },
  {
    name: 'rejects exact object with extra field',
    run: () =>
      !checker.validateValue(userType, {
        id: 'u1',
        age: 42,
        extra: true,
      }).ok,
  },
  {
    name: 'supports generic alias substitution',
    run: () =>
      checker.validateValue(stringBoxRef, { value: 'ok' }).ok &&
      !checker.validateValue(stringBoxRef, { value: 1 }).ok,
  },
  {
    name: 'supports recursive algebraic value validation',
    run: () =>
      checker.validateValue(stringListRef, {
        value: 'a',
        next: { value: 'b', next: null },
      }).ok,
  },
  {
    name: 'supports tagged-union validation',
    run: () =>
      checker.validateValue(eventRef, { kind: 'click', x: 1, y: 2 }).ok &&
      !checker.validateValue(eventRef, { kind: 'scroll', delta: 1 }).ok,
  },
  {
    name: 'integer is assignable to number but not vice versa',
    run: () =>
      checker.compare(intType, numberType).ok &&
      !checker.compare(numberType, intType).ok,
  },
  {
    name: 'literal is assignable into compatible union',
    run: () =>
      checker.compare(
        { kind: 'literal', value: 'ready' },
        {
          kind: 'union',
          variants: [
            { kind: 'literal', value: 'ready' },
            { kind: 'literal', value: 'done' },
          ],
        },
      ).ok,
  },
  {
    name: 'opaque type reports unsupported structural validation',
    run: () => {
      const result = checker.validateValue(userIdRef, 'u1');
      return (
        !result.ok &&
        result.issues.some(
          (item) => item.code === 'unsupported-type-validation',
        )
      );
    },
  },
  {
    name: 'reads LogicIR port payload types',
    run: () => {
      const type = readPayloadType(
        fixtureLogicUnit,
        fixtureLogicUnit.core.ports.userOut,
      );
      return type?.kind === 'ref';
    },
  },
  {
    name: 'checks LogicIR connection compatibility',
    run: () => {
      const result = checkLogicUnitConnectionTypes(fixtureLogicUnit, checker);
      const reports = Object.fromEntries(
        result.reports.map((report) => [report.connectionId, report]),
      );
      return (
        reports.validUser?.result.ok === true &&
        reports.validIntegerToNumber?.result.ok === true &&
        reports.disjointStringBoolean?.result.ok === true &&
        reports.equivalentOverride?.result.ok === true &&
        reports.invalidNumberToInteger?.result.ok === false &&
        result.issues.some(
          (item) => item.subject === 'connection:invalidNumberToInteger',
        )
      );
    },
  },
];

const failures: string[] = [];
for (const item of cases) {
  if (!item.run()) {
    failures.push(item.name);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  throw new Error(`${failures.length} smoke checks failed.`);
}

const connectionResult = checkLogicUnitConnectionTypes(fixtureLogicUnit, checker);
const expectedIssues = connectionResult.issues.filter(
  (item) => item.subject !== 'connection:invalidNumberToInteger',
);
if (expectedIssues.length > 0) {
  throw new Error(
    `Unexpected connection issues: ${JSON.stringify(expectedIssues)}`,
  );
}

const report: TypeSystemReport = {
  task: 'algebraic-type-system-feature-tools',
  status: 'passed',
  checkedValues: 8,
  checkedConnections: connectionResult.reports.length,
  issues: compactExpectedIssues(connectionResult.issues),
};

console.log(JSON.stringify(report, null, 2));

function compactExpectedIssues(issues: TypeIssue[]): TypeIssue[] {
  return issues.filter(
    (item) => item.subject === 'connection:invalidNumberToInteger',
  );
}
