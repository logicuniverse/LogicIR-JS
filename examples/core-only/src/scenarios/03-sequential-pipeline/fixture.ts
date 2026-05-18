import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const sequentialPipelineFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'sequential',
      steps: [{ luiId: 'increment' }, { luiId: 'double' }],
    },
    ports: {
      inputs: {
        value: { contact: 'pull' },
      },
      outputs: {},
      result: { contact: 'pull' },
    },
    connections: {
      valueToIncrement: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'value' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'increment' },
          port: { kind: 'input', key: 'value' },
        },
      },
      incrementToDouble: {
        from: {
          owner: { kind: 'lui', luiId: 'increment' },
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
      increment: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.core-only',
          key: 'increment',
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

export const sequentialPipelineInput = 3;
