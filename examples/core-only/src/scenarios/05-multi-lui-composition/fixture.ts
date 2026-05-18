import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const multiLuiCompositionFixture: LogicUnit = {
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
      addToDouble: {
        from: {
          owner: { kind: 'lui', luiId: 'add' },
          port: { kind: 'result' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'double' },
          port: { kind: 'input', key: 'value' },
        },
      },
      doubleToResult: {
        from: {
          owner: { kind: 'lui', luiId: 'double' },
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
      double: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.core-only',
          key: 'double',
          version: '0.1.0',
        },
        fulfillments: {},
        ports: {
          inputs: {
            value: { contact: 'pull' },
          },
          result: { contact: 'pull' },
        },
      },
    },
  },
};

export const multiLuiCompositionInputs = {
  left: 4,
  right: 5,
};
