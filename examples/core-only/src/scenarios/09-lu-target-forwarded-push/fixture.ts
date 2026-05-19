import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const nestedInitAckFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'stateful',
    },
    ports: {
      inputs: {
        message: { contact: 'pull' },
      },
      outputs: {
        ack: { contact: 'push' },
      },
    },
    connections: {
      messageToNotifier: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'message' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'notifier' },
          port: { kind: 'input', key: 'message' },
        },
      },
      notifierAckToBoundary: {
        from: {
          owner: { kind: 'lui', luiId: 'notifier' },
          port: { kind: 'output', key: 'ack' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'output', key: 'ack' },
        },
      },
    },
    closures: {},
    luis: {
      notifier: {
        kind: 'stateful',
        target: {
          kind: 'external',
          namespace: 'logicir.examples.core-only',
          key: 'init-ack',
          version: '0.1.0',
        },
        fulfillments: {},
        ports: {
          inputs: {
            message: { contact: 'pull' },
          },
          outputs: {
            ack: { contact: 'push' },
          },
        },
      },
    },
  },
};

export const luTargetForwardedPushFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'sequential',
      steps: [{ luiId: 'nestedNotifier' }],
    },
    ports: {
      inputs: {
        message: { contact: 'pull' },
      },
      outputs: {
        ack: { contact: 'push' },
      },
    },
    connections: {
      messageToNestedNotifier: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'message' },
        },
        to: {
          owner: { kind: 'lui', luiId: 'nestedNotifier' },
          port: { kind: 'input', key: 'message' },
        },
      },
      nestedNotifierAckToBoundary: {
        from: {
          owner: { kind: 'lui', luiId: 'nestedNotifier' },
          port: { kind: 'output', key: 'ack' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'output', key: 'ack' },
        },
      },
    },
    closures: {},
    luis: {
      nestedNotifier: {
        kind: 'sequential',
        target: {
          kind: 'lu',
          luId: 'nested-init-ack',
        },
        fulfillments: {},
        ports: {
          inputs: {
            message: { contact: 'pull' },
          },
          outputs: {
            ack: { contact: 'push' },
          },
        },
      },
    },
  },
};

export const luTargetForwardedPushCatalog = {
  'nested-init-ack': nestedInitAckFixture,
};

export const luTargetForwardedPushMessage = 'nested';
