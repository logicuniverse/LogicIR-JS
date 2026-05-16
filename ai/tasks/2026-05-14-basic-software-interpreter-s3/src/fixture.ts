import type { LogicUnit, Port } from './types';

const input: Port = {
  contact: 'pull',
};

const output: Port = {
  contact: 'pull',
  pins: { kind: 'keyed', keys: ['doubled'] },
};

export const asyncDoubleLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {
    completion: {
      namespace: 'logicir.software',
      key: 'completion',
      version: '0.0.0-s3',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      inputs: {
        value: input,
      },
      result: output,
    },
    closures: {},
    luis: {
      asyncDouble: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.async',
          key: 'double',
        },
        ports: {
          inputs: {
            value: input,
          },
          result: output,
        },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'completion',
            key: 'completion-policy',
            payload: {
              kind: 'await-provider',
              rejectMode: 'diagnostic',
            },
          },
        ],
      },
    },
    connections: {
      valueToDouble: {
        from: { owner: { kind: 'lu' }, port: { kind: 'input', key: 'value' } },
        to: {
          owner: { kind: 'lui', luiId: 'asyncDouble' },
          port: { kind: 'input', key: 'value' },
        },
      },
      doubleToOutput: {
        from: {
          owner: { kind: 'lui', luiId: 'asyncDouble' },
          port: { kind: 'result' },
          payloadPath: ['doubled'],
        },
        to: {
          owner: { kind: 'lu' },
          port: { kind: 'result' },
          payloadPath: ['doubled'],
        },
      },
    },
  },
};
