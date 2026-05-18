import {
  AlgebraicTypeExpression,
  PayloadTypePayload,
  createTypeChecker,
  createTypeRegistry,
  readFirstPayloadType,
} from '../src';

type SmokeCase = {
  name: string;
  run: () => boolean;
};

const numberType: AlgebraicTypeExpression = {
  kind: 'primitive',
  name: 'number',
};

const intType: AlgebraicTypeExpression = {
  kind: 'primitive',
  name: 'integer',
};

const stringType: AlgebraicTypeExpression = {
  kind: 'primitive',
  name: 'string',
};

const userType: AlgebraicTypeExpression = {
  kind: 'object',
  fields: {
    id: { type: stringType },
    age: {
      type: {
        kind: 'refinement',
        base: intType,
        predicates: [{ kind: 'range', min: 0 }],
      },
    },
    nickname: { type: stringType, optional: true },
  },
  exact: true,
};

const registry = createTypeRegistry({
  definitions: {
    User: {
      kind: 'alias',
      type: userType,
    },
    Box: {
      kind: 'alias',
      parameters: [{ name: 'T' }],
      type: {
        kind: 'object',
        fields: {
          value: {
            type: { kind: 'ref', ref: { kind: 'parameter', name: 'T' } },
          },
        },
      },
    },
    StringList: {
      kind: 'alias',
      type: {
        kind: 'union',
        variants: [
          { kind: 'primitive', name: 'null' },
          {
            kind: 'object',
            fields: {
              value: { type: stringType },
              next: {
                type: {
                  kind: 'ref',
                  ref: { kind: 'definition', name: 'StringList' },
                },
              },
            },
            exact: true,
          },
        ],
      },
    },
    UserId: {
      kind: 'opaque',
    },
  },
});

const checker = createTypeChecker({ registry });

const cases: SmokeCase[] = [
  {
    name: 'validates object alias with refinement',
    run: () =>
      checker.validateType(userType).ok &&
      checker.validateValue(
        { kind: 'ref', ref: { kind: 'definition', name: 'User' } },
        { id: 'u1', age: 42 }
      ).ok,
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
      checker.validateValue(
        {
          kind: 'ref',
          ref: {
            kind: 'definition',
            name: 'Box',
            args: [stringType],
          },
        },
        { value: 'ok' }
      ).ok,
  },
  {
    name: 'supports recursive algebraic type validation',
    run: () =>
      checker.validateValue(
        { kind: 'ref', ref: { kind: 'definition', name: 'StringList' } },
        { value: 'a', next: { value: 'b', next: null } }
      ).ok,
  },
  {
    name: 'integer is assignable to number',
    run: () => checker.isAssignable(intType, numberType).ok,
  },
  {
    name: 'number is not assignable to integer',
    run: () => !checker.isAssignable(numberType, intType).ok,
  },
  {
    name: 'literal is assignable into union',
    run: () =>
      checker
        .isAssignable(
          { kind: 'literal', value: 'ready' },
          {
            kind: 'union',
            variants: [
              { kind: 'literal', value: 'ready' },
              { kind: 'literal', value: 'done' },
            ],
          }
        )
        .ok,
  },
  {
    name: 'reads payload type from LogicIR extension',
    run: () => {
      const payload: PayloadTypePayload = { type: stringType };
      const logicUnit = {
        featureUses: {
          type: {
            namespace: 'logicir.type-system',
            key: 'core',
          },
        },
      };
      const port = {
        extensions: [
          {
            featureKey: 'type',
            key: 'payload-type',
            payload,
          },
        ],
      };
      return readFirstPayloadType(logicUnit, port)?.kind === 'primitive';
    },
  },
  {
    name: 'rejects structural validation for opaque references',
    run: () => {
      const result = checker.validateValue(
        { kind: 'ref', ref: { kind: 'definition', name: 'UserId' } },
        'u1'
      );
      return (
        !result.ok &&
        result.issues[0]?.code === 'unsupported-type-validation'
      );
    },
  },
];

const failures = cases.filter((item) => !item.run());

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL ${failure.name}`);
  }
  throw new Error(`${failures.length} type-system smoke checks failed.`);
}

console.log(`type-system smoke: ${cases.length}/${cases.length} passed`);
