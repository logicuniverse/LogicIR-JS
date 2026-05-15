import type { LogicUnit, Port } from './types';

const input: Port = {
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
};

const output: Port = {
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
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
      value: input,
      doubled: output,
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
          value: input,
          doubled: output,
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
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'asyncDouble' }, portKey: 'value' },
      },
      doubleToOutput: {
        from: {
          owner: { kind: 'lui', luiId: 'asyncDouble' },
          portKey: 'doubled',
        },
        to: { owner: { kind: 'lu' }, portKey: 'doubled' },
      },
    },
  },
};
