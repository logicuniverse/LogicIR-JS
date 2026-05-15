import type { LogicUnit, Port } from './types';

const retainedInput: Port = {
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
};

const retainedOutput: Port = {
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: true,
    pushNotifiable: true,
    retainedCurrent: true,
  },
  extensions: [
    {
      featureKey: 'retained',
      key: 'state-key',
      payload: { storeKey: 'counter' },
    },
  ],
};

export const counterCurrentLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {
    retained: {
      namespace: 'logicir.software',
      key: 'retained-current',
      version: '0.0.0-s2',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'stateful' },
    ports: {
      next: retainedInput,
      current: retainedOutput,
      written: retainedOutput,
    },
    closures: {},
    luis: {
      readCounter: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.software.state-store',
          key: 'counter',
        },
        ports: {
          current: retainedOutput,
        },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'retained',
            key: 'state-operation',
            payload: { kind: 'read-current', storeKey: 'counter' },
          },
        ],
      },
      writeCounter: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.software.state-store',
          key: 'counter',
        },
        ports: {
          next: retainedInput,
          written: retainedOutput,
        },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'retained',
            key: 'state-operation',
            payload: { kind: 'write-current', storeKey: 'counter' },
          },
        ],
      },
    },
    connections: {
      readToCurrent: {
        from: {
          owner: { kind: 'lui', luiId: 'readCounter' },
          portKey: 'current',
        },
        to: { owner: { kind: 'lu' }, portKey: 'current' },
      },
      nextToWrite: {
        from: { owner: { kind: 'lu' }, portKey: 'next' },
        to: {
          owner: { kind: 'lui', luiId: 'writeCounter' },
          portKey: 'next',
        },
      },
      writeToWritten: {
        from: {
          owner: { kind: 'lui', luiId: 'writeCounter' },
          portKey: 'written',
        },
        to: { owner: { kind: 'lu' }, portKey: 'written' },
      },
    },
  },
};
