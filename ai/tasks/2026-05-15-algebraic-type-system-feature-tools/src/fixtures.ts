import type { LogicUnit, Port } from '@logic-universe/logic-ir-core';
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
  boundary: Port['boundary'],
  type: AlgebraicTypeExpression,
  role?: Port['role'],
): Port => ({
  boundary,
  role,
  interaction: {
    pullReadable: boundary === 'output',
    pushNotifiable: false,
    retainedCurrent: false,
  },
  extensions: [
    {
      featureKey: 'type',
      key: TYPE_SYSTEM_EXTENSION_KEYS.payloadType,
      payload: { type },
    },
  ],
});

export const fixtureLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {
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
      userOut: makePort('output', {
        kind: 'ref',
        ref: { kind: 'definition', name: 'User' },
      }),
      userIn: makePort('input', {
        kind: 'ref',
        ref: { kind: 'definition', name: 'User' },
      }),
      numberOut: makePort('output', numberType),
      intIn: makePort('input', intType),
      intOut: makePort('output', intType),
      numberIn: makePort('input', numberType),
      stringOut: makePort('output', stringType),
      boolIn: makePort('input', booleanType),
      result: makePort('output', {
        kind: 'ref',
        ref: { kind: 'definition', name: 'Event' },
      }, 'primary-result'),
    },
    luis: {},
    connections: {
      validUser: {
        from: { owner: { kind: 'lu' }, portKey: 'userOut' },
        to: { owner: { kind: 'lu' }, portKey: 'userIn' },
      },
      invalidNumberToInteger: {
        from: { owner: { kind: 'lu' }, portKey: 'numberOut' },
        to: { owner: { kind: 'lu' }, portKey: 'intIn' },
      },
      validIntegerToNumber: {
        from: { owner: { kind: 'lu' }, portKey: 'intOut' },
        to: { owner: { kind: 'lu' }, portKey: 'numberIn' },
      },
      disjointStringBoolean: {
        from: { owner: { kind: 'lu' }, portKey: 'stringOut' },
        to: { owner: { kind: 'lu' }, portKey: 'boolIn' },
        extensions: [
          {
            featureKey: 'type',
            key: TYPE_SYSTEM_EXTENSION_KEYS.connectionTypePolicy,
            payload: { mode: 'disjoint' },
          },
        ],
      },
      equivalentOverride: {
        from: { owner: { kind: 'lu' }, portKey: 'stringOut' },
        to: { owner: { kind: 'lu' }, portKey: 'boolIn' },
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
