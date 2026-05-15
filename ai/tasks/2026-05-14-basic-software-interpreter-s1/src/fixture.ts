import type { LogicUnit, Port } from './types';

const inputPort: Port = {
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
};

const outputPort: Port = {
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
};

export const addPairLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {},
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      left: inputPort,
      right: inputPort,
      sum: outputPort,
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
          left: inputPort,
          right: inputPort,
          sum: outputPort,
        },
        fulfillments: {},
        extensions: [],
      },
    },
    connections: {
      leftToAdd: {
        from: {
          owner: { kind: 'lu' },
          portKey: 'left',
        },
        to: {
          owner: { kind: 'lui', luiId: 'add' },
          portKey: 'left',
        },
      },
      rightToAdd: {
        from: {
          owner: { kind: 'lu' },
          portKey: 'right',
        },
        to: {
          owner: { kind: 'lui', luiId: 'add' },
          portKey: 'right',
        },
      },
      addToSum: {
        from: {
          owner: { kind: 'lui', luiId: 'add' },
          portKey: 'sum',
        },
        to: {
          owner: { kind: 'lu' },
          portKey: 'sum',
        },
      },
    },
  },
};
