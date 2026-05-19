import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';

export const closureForwardedPushFixture: LogicUnit = {
  schemaVersion: CORE_SCHEMA_VERSION,
  featureUses: {},
  requirements: {},
  core: {
    kindOrganization: {
      kind: 'stateful',
    },
    ports: {
      inputs: {
        message: { contact: 'push' },
      },
      outputs: {
        ack: { contact: 'push' },
      },
    },
    connections: {
      messageToClosure: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'message' },
        },
        to: {
          owner: { kind: 'closure', closureId: 'ackClosure' },
          port: { kind: 'input', key: 'message' },
        },
      },
      closureAckToBoundary: {
        from: {
          owner: { kind: 'closure', closureId: 'ackClosure' },
          port: { kind: 'output', key: 'ack' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'output', key: 'ack' },
        },
      },
    },
    closures: {
      ackClosure: {
        forwardedPortKeys: {
          inputs: ['message'],
          pushOutputs: ['ack'],
        },
        core: {
          kindOrganization: {
            kind: 'stateful',
          },
          ports: {
            inputs: {
              message: { contact: 'push' },
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
                key: 'message-ack',
                version: '0.1.0',
              },
              fulfillments: {},
              ports: {
                inputs: {
                  message: { contact: 'push' },
                },
                outputs: {
                  ack: { contact: 'push' },
                },
              },
            },
          },
        },
      },
    },
    luis: {},
  },
};

export const closureForwardedPushMessage = 'hello';
