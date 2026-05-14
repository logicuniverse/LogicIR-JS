import type { LogicUnit, Port } from './types';

const signalPayload = (width: number) => ({ width, signed: false });

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
      payload: signalPayload(width),
    },
  ],
});

const output = (width: number): Port => ({
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: false,
    pushNotifiable: true,
    retainedCurrent: true,
  },
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: signalPayload(width),
    },
  ],
});

export const register4LogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {
    hdlSignal: {
      namespace: 'logicir.hdl',
      key: 'signal',
      version: '0.0.0-h3',
    },
    hdlClocking: {
      namespace: 'logicir.hdl',
      key: 'clocking',
      version: '0.0.0-h3',
    },
    hdlState: {
      namespace: 'logicir.hdl',
      key: 'state',
      version: '0.0.0-h3',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'sequential', steps: ['reg'] },
    ports: {
      clk: input(1),
      rst: input(1),
      d: input(4),
      q: output(4),
    },
    closures: {},
    connections: {},
    luis: {
      reg: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.hdl.primitive',
          key: 'register',
        },
        ports: {
          clk: input(1),
          rst: input(1),
          d: input(4),
          q: output(4),
        },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'hdlState',
            key: 'register',
            payload: { register: 'q_reg', width: 4, resetValue: 0 },
          },
          {
            featureKey: 'hdlClocking',
            key: 'clock-reset',
            payload: { clock: 'clk', reset: 'rst', resetActive: 'high' },
          },
        ],
      },
    },
    extensions: [
      {
        featureKey: 'hdlClocking',
        key: 'clock-reset',
        payload: { clock: 'clk', reset: 'rst', resetActive: 'high' },
      },
    ],
  },
};
