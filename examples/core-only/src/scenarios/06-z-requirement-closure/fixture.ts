import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const incrementInnerFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'combinational',
    },
    ports: {
      inputs: {
        value: { contact: 'pull' },
      },
      result: { contact: 'pull' },
    },
    connections: {
      valueToIncrement: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'value' },
        },
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
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
        },
      },
    },
    closures: {},
    luis: {
      increment: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.core-only',
          key: 'increment',
          version: '0.1.0',
        },
        fulfillments: {},
        ports: {
          inputs: {
            value: { contact: 'pull' },
          },
          result: { contact: 'pull' },
        },
      },
    },
  },
};

export const requirementClosureFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {
    math: {
      kind: 'inline',
      service: {
        fulfillmentScope: 'independent-units',
        units: {
          increment: {
            kind: 'combinational',
            ports: {
              inputs: {
                value: { contact: 'pull' },
              },
              result: { contact: 'pull' },
            },
            requirements: {},
          },
        },
      },
    },
  },
  core: {
    kindOrganization: {
      kind: 'combinational',
    },
    ports: {
      inputs: {
        value: { contact: 'pull' },
      },
      result: {
        contact: 'pull',
        pins: {
          kind: 'keyed',
          keys: ['closure', 'upstream'],
        },
      },
    },
    connections: {
      valueToClosureIncrement: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'value' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'closureIncrement' },
          port: { kind: 'input', key: 'value' },
        },
      },
      closureIncrementToResult: {
        from: {
          owner: { kind: 'lui', luiId: 'closureIncrement' },
          port: { kind: 'result' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['closure'],
        },
      },
      valueToUpstreamIncrement: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'value' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'upstreamIncrement' },
          port: { kind: 'input', key: 'value' },
        },
      },
      upstreamIncrementToResult: {
        from: {
          owner: { kind: 'lui', luiId: 'upstreamIncrement' },
          port: { kind: 'result' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
          payloadPath: ['upstream'],
        },
      },
    },
    closures: {
      localIncrementClosure: {
        forwardedPortKeys: {
          inputs: ['value'],
          pushOutputs: [],
        },
        core: incrementInnerFixture.core,
      },
    },
    luis: {
      closureIncrement: {
        kind: 'combinational',
        target: {
          kind: 'requirement',
          serviceKey: 'math',
          unitKey: 'increment',
        },
        fulfillments: {
          math: {
            kind: 'independent-units',
            units: {
              increment: {
                kind: 'closure',
                closureId: 'localIncrementClosure',
              },
            },
          },
        },
        ports: {
          inputs: {
            value: { contact: 'pull' },
          },
          result: { contact: 'pull' },
        },
      },
      upstreamIncrement: {
        kind: 'combinational',
        target: {
          kind: 'requirement',
          serviceKey: 'math',
          unitKey: 'increment',
        },
        fulfillments: {
          math: {
            kind: 'independent-units',
            units: {
              increment: {
                kind: 'upstream-unit',
                reachabilityPath: [],
                supplierServiceKey: 'math',
                supplierUnitKey: 'increment',
              },
            },
          },
        },
        ports: {
          inputs: {
            value: { contact: 'pull' },
          },
          result: { contact: 'pull' },
        },
      },
    },
  },
};

export const requirementClosureInput = 10;
