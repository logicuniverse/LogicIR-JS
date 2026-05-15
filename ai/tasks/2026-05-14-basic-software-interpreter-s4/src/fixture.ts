import type { LogicUnit, Port } from './types';
import type { ClosureProviderRegistry } from './types';

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

const makeFixture = (mode: 'closure' | 'upstream'): LogicUnit => ({
  schemaVersion: '0.0.0-draft',
  features: {
    fulfillment: {
      namespace: 'logicir.software',
      key: 'fulfillment',
      version: '0.0.0-s4',
    },
  },
  requirements: {
    math: {
      kind: 'inline',
      service: {
        fulfillmentScope: 'independent-units',
        units: {
          increment: {
            kind: 'combinational',
            ports: { value: input, result: output },
            requirements: {},
          },
        },
      },
    },
  },
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      value: input,
      result: output,
    },
    closures: {
      localIncrement: {
        forwardedPortKeys: { inputs: ['value'], outputs: ['result'] },
        core: {
          kindOrganization: { kind: 'combinational' },
          ports: {
            value: input,
            result: output,
          },
          connections: {},
          closures: {},
          luis: {},
        },
      },
    },
    luis: {
      increment: {
        kind: 'combinational',
        target: {
          kind: 'requirement',
          serviceKey: 'math',
          unitKey: 'increment',
        },
        ports: {
          value: input,
          result: output,
        },
        fulfillments: {
          math: {
            kind: 'independent-units',
            units: {
              increment:
                mode === 'closure'
                  ? { kind: 'closure', closureId: 'localIncrement' }
                  : {
                      kind: 'upstream-unit',
                      reachabilityPath: [],
                      supplierServiceKey: 'math',
                      supplierUnitKey: 'increment',
                    },
            },
          },
        },
      },
    },
    connections: {
      valueToIncrement: {
        from: { owner: { kind: 'lu' }, portKey: 'value' },
        to: { owner: { kind: 'lui', luiId: 'increment' }, portKey: 'value' },
      },
      incrementToResult: {
        from: {
          owner: { kind: 'lui', luiId: 'increment' },
          portKey: 'result',
        },
        to: { owner: { kind: 'lu' }, portKey: 'result' },
      },
    },
  },
});

export const closureFulfillmentLogicUnit = makeFixture('closure');
export const upstreamFulfillmentLogicUnit = makeFixture('upstream');

export const closureProviders: ClosureProviderRegistry = {
  localIncrement: ({ value }) => ({ result: Number(value) + 1 }),
};
