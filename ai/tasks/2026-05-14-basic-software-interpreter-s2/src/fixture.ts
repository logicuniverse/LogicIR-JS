import type { LogicUnit, Port } from './types';

const retainedInput: Port = {
  contact: 'pull',
};

const retainedOutput: Port = {
  contact: 'property',
};

export const counterCurrentLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: {},
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
          key: 'counter.read-current',
        },
        ports: {
          inputs: {},
          outputs: {
            current: retainedOutput,
          },
        },
        fulfillments: {},
      },
      writeCounter: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.software.state-store',
          key: 'counter.write-current',
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
      },
    },
    connections: {
      readToCurrent: {
        from: {
          owner: { kind: 'lui', luiId: 'readCounter' },
          port: { kind: 'output', key: 'current' },
        },
        to: { owner: { kind: 'boundary' }, port: { kind: 'output', key: 'current' } },
      },
      nextToWrite: {
        from: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'next' } },
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
        to: { owner: { kind: 'boundary' }, port: { kind: 'output', key: 'written' } },
      },
    },
  },
};
