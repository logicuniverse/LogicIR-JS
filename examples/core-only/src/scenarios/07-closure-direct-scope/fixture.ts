import type { LogicUnit } from '@logic-universe/logic-ir-core';
import { CORE_SCHEMA_VERSION } from '../../schema-version.js';
import { incrementInnerFixture } from '../06-z-requirement-closure/fixture.js';

export const closureDirectScopeFixture: LogicUnit = {
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
      valueToClosure: {
        from: {
          owner: { kind: 'boundary' },
          port: { kind: 'input', key: 'value' },
        },
        to: {
          owner: { kind: 'closure', closureId: 'localIncrementClosure' },
          port: { kind: 'input', key: 'value' },
        },
      },
      closureToResult: {
        from: {
          owner: { kind: 'closure', closureId: 'localIncrementClosure' },
          port: { kind: 'result' },
        },
        to: {
          owner: { kind: 'boundary' },
          port: { kind: 'result' },
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
    luis: {},
  },
};

export const closureDirectScopeInput = 10;
