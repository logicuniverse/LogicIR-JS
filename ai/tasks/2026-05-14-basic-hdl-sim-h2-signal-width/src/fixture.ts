import type { HdlSignalPayload, LogicUnit, Port } from './types';

const signal = (width: number, signed = false): HdlSignalPayload => ({
  width,
  signed,
});

const input = (width: number): Port => ({
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent: false,
  },
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: signal(width),
    },
  ],
});

const output = (width: number): Port => ({
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: false,
    pushNotifiable: true,
    retainedCurrent: false,
  },
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
      a: input(4),
      b: input(4),
      y: output(4),
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
          a: input(4),
          b: input(4),
          y: output(4),
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
