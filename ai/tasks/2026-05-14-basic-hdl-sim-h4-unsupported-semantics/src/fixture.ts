import type { LogicUnit } from './types';

export const softwareInvocationLogicUnit: LogicUnit = {
  schemaVersion: '0.0.0-draft',
  featureUses: {
    invocation: {
      namespace: 'logicir.software',
      key: 'invocation',
      version: '0.0.0-h4-negative',
    },
  },
  requirements: {},
  core: {
    kindOrganization: { kind: 'combinational' },
    ports: {
      inputs: {},
      result: { contact: 'pull' },
    },
    connections: {},
    closures: {},
    luis: {
      callService: {
        kind: 'combinational',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.software',
          key: 'call-service',
        },
        ports: {
          inputs: {},
          result: { contact: 'pull' },
        },
        fulfillments: {},
      },
    },
  },
};
