import type { LogicUnit, PullPort } from './types';

const bitInput = (): PullPort => ({
  contact: 'pull',
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: { width: 1, signed: false },
    },
  ],
});

const bitOutput = (): PullPort => ({
  contact: 'pull',
  pins: { kind: 'keyed', keys: ['y'] },
  extensions: [
    {
      featureKey: 'hdlSignal',
      key: 'signal',
      payload: { width: 1, signed: false },
    },
  ],
});

export const and2LogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  features: {
    hdlSignal: {
      namespace: 'logicir.hdl',
      key: 'signal',
      version: '0.0.0-h1',
    },
    hdlCombinational: {
      namespace: 'logicir.hdl',
      key: 'combinational',
      version: '0.0.0-h1',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      inputs: {
        a: bitInput(),
        b: bitInput(),
      },
      result: bitOutput(),
    },
    closures: {},
    luis: {
      andGate: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.hdl.primitive',
          key: 'and',
        },
        ports: {
          inputs: {
            a: bitInput(),
            b: bitInput(),
          },
          result: bitOutput(),
        },
        fulfillments: {},
        extensions: [
          {
            featureKey: 'hdlCombinational',
            key: 'operation',
            payload: { op: 'and' },
          },
        ],
      },
    },
    connections: {
      aToAnd: {
        from: { owner: { kind: 'lu' }, port: { kind: 'input', key: 'a' } },
        to: {
          owner: { kind: 'lui', luiId: 'andGate' },
          port: { kind: 'input', key: 'a' },
        },
      },
      bToAnd: {
        from: { owner: { kind: 'lu' }, port: { kind: 'input', key: 'b' } },
        to: {
          owner: { kind: 'lui', luiId: 'andGate' },
          port: { kind: 'input', key: 'b' },
        },
      },
      andToY: {
        from: {
          owner: { kind: 'lui', luiId: 'andGate' },
          port: { kind: 'result' },
          payloadPath: ['y'],
        },
        to: {
          owner: { kind: 'lu' },
          port: { kind: 'result' },
          payloadPath: ['y'],
        },
      },
    },
  },
};
