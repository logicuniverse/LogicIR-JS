import type { LogicUnit, Port } from './types';

const retainedInput: Port = {
  contact: 'pull',
};

const retainedOutput: Port = {
  contact: 'property',
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
      inputs: {
        next: retainedInput,
      },
      outputs: {
        current: retainedOutput,
        written: retainedOutput,
      },
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
          inputs: {},
          outputs: {
            current: retainedOutput,
          },
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
          inputs: {
            next: retainedInput,
          },
          outputs: {
            written: retainedOutput,
          },
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
          port: { kind: 'output', key: 'current' },
        },
        to: { owner: { kind: 'lu' }, port: { kind: 'output', key: 'current' } },
      },
      nextToWrite: {
        from: { owner: { kind: 'lu' }, port: { kind: 'input', key: 'next' } },
        to: {
          owner: { kind: 'lui', luiId: 'writeCounter' },
          port: { kind: 'input', key: 'next' },
        },
      },
      writeToWritten: {
        from: {
          owner: { kind: 'lui', luiId: 'writeCounter' },
          port: { kind: 'output', key: 'written' },
        },
        to: { owner: { kind: 'lu' }, port: { kind: 'output', key: 'written' } },
      },
    },
  },
};
