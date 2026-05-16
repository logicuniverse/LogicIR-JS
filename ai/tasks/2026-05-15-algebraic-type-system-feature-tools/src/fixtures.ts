import type { LogicUnit, PullPort } from '@logic-universe/logic-ir-core';
import {
  TYPE_SYSTEM_EXTENSION_KEYS,
  TYPE_SYSTEM_FEATURE,
  TYPE_SYSTEM_SCHEMA_VERSION,
} from './types';
import type {
  AlgebraicTypeExpression,
  TypeDefinitionsPayload,
} from './types';

export const numberType: AlgebraicTypeExpression = {
  kind: 'primitive',
  name: 'number',
};

export const intType: AlgebraicTypeExpression = {
  kind: 'primitive',
  name: 'integer',
};

export const stringType: AlgebraicTypeExpression = {
  kind: 'primitive',
  name: 'string',
};

export const booleanType: AlgebraicTypeExpression = {
  kind: 'primitive',
  name: 'boolean',
};

export const nonNegativeIntType: AlgebraicTypeExpression = {
  kind: 'refinement',
  base: intType,
  predicates: [{ kind: 'range', min: 0 }],
};

export const userType: AlgebraicTypeExpression = {
  kind: 'object',
  fields: {
    id: { type: stringType },
    age: { type: nonNegativeIntType },
    nickname: { type: stringType, optional: true },
  },
  exact: true,
};

export const eventType: AlgebraicTypeExpression = {
  kind: 'tagged-union',
  tag: 'kind',
  variants: {
    click: {
      kind: 'object',
      fields: {
        kind: { type: { kind: 'literal', value: 'click' } },
        x: { type: intType },
        y: { type: intType },
      },
      exact: true,
    },
    input: {
      kind: 'object',
      fields: {
        kind: { type: { kind: 'literal', value: 'input' } },
        value: { type: stringType },
      },
      exact: true,
    },
  },
};

export const typeDefinitionsPayload: TypeDefinitionsPayload = {
  schemaVersion: TYPE_SYSTEM_SCHEMA_VERSION,
  definitions: {
    User: {
      kind: 'alias',
      type: userType,
      description: 'Closed JSON-like user payload.',
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
        exact: true,
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
    Event: {
      kind: 'alias',
      type: eventType,
    },
    UserId: {
      kind: 'opaque',
      description:
        'Opaque ids cannot be structurally validated without a host bridge.',
    },
  },
};

const makePort = (
  type: AlgebraicTypeExpression,
  pathTypes: { payloadPath: (string | number)[]; type: AlgebraicTypeExpression }[] = [],
): PullPort => ({
  contact: 'pull',
  extensions: [
    {
      featureKey: 'type',
      key: TYPE_SYSTEM_EXTENSION_KEYS.payloadType,
      payload: { type, pathTypes },
    },
  ],
});

export const fixtureLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: {
    type: TYPE_SYSTEM_FEATURE,
  },
  extensions: [
    {
      featureKey: 'type',
      key: TYPE_SYSTEM_EXTENSION_KEYS.typeDefinitions,
      payload: typeDefinitionsPayload,
    },
  ],
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    closures: {},
    ports: {
      inputs: {
        userIn: makePort({
          kind: 'ref',
          ref: { kind: 'definition', name: 'User' },
        }),
        intIn: makePort(intType),
        numberIn: makePort(numberType),
        boolIn: makePort(booleanType),
      },
      result: makePort(
        { kind: 'ref', ref: { kind: 'definition', name: 'Event' } },
        [
          {
            payloadPath: ['userOut'],
            type: { kind: 'ref', ref: { kind: 'definition', name: 'User' } },
          },
          { payloadPath: ['numberOut'], type: numberType },
          { payloadPath: ['intOut'], type: intType },
          { payloadPath: ['stringOut'], type: stringType },
        ],
      ),
    },
    luis: {},
    connections: {
      validUser: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['userOut'],
        },
        to: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'userIn' } },
      },
      invalidNumberToInteger: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['numberOut'],
        },
        to: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'intIn' } },
      },
      validIntegerToNumber: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['intOut'],
        },
        to: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'numberIn' } },
      },
      disjointStringBoolean: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['stringOut'],
        },
        to: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'boolIn' } },
        extensions: [
          {
            featureKey: 'type',
            key: TYPE_SYSTEM_EXTENSION_KEYS.connectionTypePolicy,
            payload: { mode: 'disjoint' },
          },
        ],
      },
      equivalentOverride: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['stringOut'],
        },
        to: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'boolIn' } },
        extensions: [
          {
            featureKey: 'type',
            key: TYPE_SYSTEM_EXTENSION_KEYS.connectionTypePolicy,
            payload: {
              mode: 'equivalent',
              sourceType: {
                kind: 'enum',
                values: ['ready', 'done'],
              },
              targetType: {
                kind: 'union',
                variants: [
                  { kind: 'literal', value: 'ready' },
                  { kind: 'literal', value: 'done' },
                ],
              },
            },
          },
        ],
      },
    },
  },
};

export const userRef: AlgebraicTypeExpression = {
  kind: 'ref',
  ref: { kind: 'definition', name: 'User' },
};

export const stringBoxRef: AlgebraicTypeExpression = {
  kind: 'ref',
  ref: {
    kind: 'definition',
    name: 'Box',
    args: [stringType],
  },
};

export const stringListRef: AlgebraicTypeExpression = {
  kind: 'ref',
  ref: { kind: 'definition', name: 'StringList' },
};

export const eventRef: AlgebraicTypeExpression = {
  kind: 'ref',
  ref: { kind: 'definition', name: 'Event' },
};

export const userIdRef: AlgebraicTypeExpression = {
  kind: 'ref',
  ref: { kind: 'definition', name: 'UserId' },
};
