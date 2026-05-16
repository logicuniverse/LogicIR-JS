import type { HdlSignalPayload, LogicUnit, PullPort } from './types';

const signal = (width: number, signed = false): HdlSignalPayload => ({
  width,
  signed,
});

const input = (width: number): PullPort => ({
  contact: 'pull',
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: signal(width),
    },
  ],
});

const output = (width: number): PullPort => ({
  contact: 'pull',
  pins: { kind: 'keyed', keys: ['y'] },
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: signal(width),
    },
  ],
});

export const add4LogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {
    hdlSignal: {
      namespace: 'logicir.hdl',
      key: 'signal',
      version: '0.0.0-h2',
    },
    hdlCombinational: {
      namespace: 'logicir.hdl',
      key: 'combinational',
      version: '0.0.0-h2',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      inputs: { a: input(4), b: input(4) },
      result: output(4),
    },
    closures: {},
    connections: {},
    luis: {
      add: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.hdl.primitive',
          key: 'add',
        },
        ports: {
          inputs: { a: input(4), b: input(4) },
          result: output(4),
        },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'hdlCombinational',
            key: 'operation',
            payload: { op: 'add' },
          },
        ],
      },
    },
  },
};
