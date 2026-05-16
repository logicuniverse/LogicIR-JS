import type { LogicUnit, Port } from './types';
import type { ClosureProviderRegistry } from './types';

const input: Port = {
  contact: 'pull',
};

const output: Port = {
  contact: 'pull',
};

const makeFixture = (mode: 'closure' | 'upstream'): LogicUnit => ({
  schemaVersion: '0.0.0-draft',
  featureUses: {
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
            ports: {
              inputs: { value: input },
              result: output,
            },
            requirements: {},
          },
        },
      },
    },
  },
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      inputs: { value: input },
      result: output,
    },
    closures: {
      localIncrement: {
        forwardedPortKeys: { inputs: ['value'], pushOutputs: [] },
        core: {
          kindOrganization: { kind: 'combinational' },
          ports: {
            inputs: { value: input },
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
          inputs: { value: input },
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
        from: { owner: { kind: 'boundary' }, port: { kind: 'input', key: 'value' } },
        to: {
          owner: { kind: 'lui', luiId: 'increment' },
          port: { kind: 'input', key: 'value' },
        },
      },
      incrementToResult: {
        from: {
          owner: { kind: 'lui', luiId: 'increment' },
          port: { kind: 'result' },
        },
        to: { owner: { kind: 'boundary' }, port: { kind: 'result' } },
      },
    },
  },
});

export const closureFulfillmentLogicUnit = makeFixture('closure');
export const upstreamFulfillmentLogicUnit = makeFixture('upstream');

export const closureProviders: ClosureProviderRegistry = {
  localIncrement: ({ value }) => ({ result: Number(value) + 1 }),
};
