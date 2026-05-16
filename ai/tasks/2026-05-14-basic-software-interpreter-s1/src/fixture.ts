import type { LogicUnit, Port } from './types';

const inputPort: Port = {
  contact: 'pull',
};

const resultPort: Port = {
  contact: 'pull',
  pins: { kind: 'keyed', keys: ['sum'] },
};

export const addPairLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {},
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      inputs: {
        left: inputPort,
        right: inputPort,
      },
      result: resultPort,
    },
    closures: {},
    luis: {
      add: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.math',
          key: 'add-pair',
        },
        ports: {
          inputs: {
            left: inputPort,
            right: inputPort,
          },
          result: resultPort,
        },
        fulfillments: {},
        extensions: [],
      },
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
      addToSum: {
        from: {
          owner: { kind: 'lui', luiId: 'add' },
          port: { kind: 'result' },
          payloadPath: ['sum'],
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['sum'],
        },
      },
    },
  },
};
