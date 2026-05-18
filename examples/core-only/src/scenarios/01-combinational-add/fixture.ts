import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const combinationalAddFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'combinational',
    },
    ports: {
      inputs: {
        left: { contact: 'pull' },
        right: { contact: 'pull' },
      },
      result: { contact: 'pull' },
    },
    connections: {
      leftToAdd: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'left' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'add' },
          port: { kind: 'input', key: 'left' },
        },
      },
      rightToAdd: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'right' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'add' },
          port: { kind: 'input', key: 'right' },
        },
      },
      addToResult: {
        from: {
          owner: { kind: 'lui', luiId: 'add' },
          port: { kind: 'result' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
        },
      },
    },
    closures: {},
    luis: {
      add: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.core-only',
          key: 'add-pair',
          version: '0.1.0',
        },
        fulfillments: {},
        ports: {
          inputs: {
            left: { contact: 'pull' },
            right: { contact: 'pull' },
          },
          result: { contact: 'pull' },
        },
      },
    },
  },
};

export const combinationalAddInputs = {
  left: 2,
  right: 3,
};
