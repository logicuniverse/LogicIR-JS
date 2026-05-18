import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const statefulCounterFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'stateful',
    },
    ports: {
      inputs: {
        initial: { contact: 'pull' },
        increment: { contact: 'push' },
        reset: { contact: 'push' },
      },
      outputs: {
        current: { contact: 'property' },
      },
    },
    connections: {
      initialToCounter: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'initial' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'counter' },
          port: { kind: 'input', key: 'initial' },
        },
      },
      incrementToCounter: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'increment' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'counter' },
          port: { kind: 'input', key: 'increment' },
        },
      },
      resetToCounter: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'reset' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'counter' },
          port: { kind: 'input', key: 'reset' },
        },
      },
      currentToBoundary: {
        from: {
          owner: { kind: 'lui', luiId: 'counter' },
          port: { kind: 'output', key: 'current' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'output', key: 'current' },
        },
      },
    },
    closures: {},
    luis: {
      counter: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.core-only',
          key: 'counter-register',
          version: '0.1.0',
        },
        fulfillments: {},
        ports: {
          inputs: {
            initial: { contact: 'pull' },
            increment: { contact: 'push' },
            reset: { contact: 'push' },
          },
          outputs: {
            current: { contact: 'property' },
          },
        },
      },
    },
  },
};

export const statefulCounterProgram = {
  initial: 10,
  increments: [1, 1],
  resetValue: 4,
  moreIncrements: [1, 1, 1],
};
