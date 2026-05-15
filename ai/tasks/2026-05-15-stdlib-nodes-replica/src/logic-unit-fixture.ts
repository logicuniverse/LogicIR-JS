import type {
  CombinationalLUCore,
  LogicUnit,
  Port,
  StatefulLUCore,
} from '@logic-universe/logic-ir-core';
import { stdlibNodeSpecByKey, type LegacyStdlibNodeKey } from './catalog';

const input = (retainedCurrent = false): Port => ({
  boundary: 'input',
  interaction: {
    pullReadable: true,
    pushNotifiable: false,
    retainedCurrent,
  },
});

const output = (retainedCurrent = false): Port => ({
  boundary: 'output',
  role: 'primary-result',
  interaction: {
    pullReadable: true,
    pushNotifiable: retainedCurrent,
    retainedCurrent,
  },
});

export const featureManifest = {
  invocation: {
    namespace: 'logicir.software',
    key: 'invocation',
    version: '0.0.0-stdlib-replica',
  },
};

const luiIdFor = (key: LegacyStdlibNodeKey): string =>
  `node_${key.replace(/[^A-Za-z0-9]/g, '_')}`;

export const createStdlibLogicUnitFixture = (
  key: LegacyStdlibNodeKey,
): LogicUnit => {
  const spec = stdlibNodeSpecByKey.get(key);
  if (!spec) {
    throw new Error(`Missing stdlib node spec for ${key}`);
  }

  const luiId = luiIdFor(key);
  const inputPorts = Object.fromEntries(
    spec.inputPorts.map((portKey) => [portKey, input()]),
  );
  const outputPorts = Object.fromEntries(
    spec.outputPorts.map((portKey) => [
      portKey,
      output(key.startsWith('property')),
    ]),
  );

  const luInputPorts = { ...inputPorts };
  const luOutputPorts = Object.fromEntries(
    spec.outputPorts.map((portKey) => [
      portKey === 'result' ? 'result' : portKey,
      output(key.startsWith('property')),
    ]),
  );

  const connections = {
    ...Object.fromEntries(
      spec.inputPorts.map((portKey) => [
        `input_${portKey}`,
        {
          from: { owner: { kind: 'lu' as const }, portKey },
          to: { owner: { kind: 'lui' as const, luiId }, portKey },
        },
      ]),
    ),
    ...Object.fromEntries(
      spec.outputPorts.map((portKey) => [
        `output_${portKey}`,
        {
          from: { owner: { kind: 'lui' as const, luiId }, portKey },
          to: {
            owner: { kind: 'lu' as const },
            portKey: portKey === 'result' ? 'result' : portKey,
          },
        },
      ]),
    ),
  };

  const common = {
    ports: {
      ...luInputPorts,
      ...luOutputPorts,
    },
    closures: {},
    connections,
  };

  const core: StatefulLUCore | CombinationalLUCore =
    spec.kind === 'state-machine'
      ? {
          ...common,
          kindOrganization: { kind: 'stateful' },
          luis: {
            [luiId]: {
              kind: 'stateful',
              target: {
                kind: 'external',
                namespace: 'legacy.ff-core.stdlib',
                key,
              },
              ports: {
                ...inputPorts,
                ...outputPorts,
              },
              fulfillments: {},
            },
          },
        }
      : {
          ...common,
          kindOrganization: { kind: 'combinational' },
          luis: {
            [luiId]: {
              kind: 'combinational',
              target: {
                kind: 'external',
                namespace: 'legacy.ff-core.stdlib',
                key,
              },
              ports: {
                ...inputPorts,
                ...outputPorts,
              },
              fulfillments: {},
            },
          },
        };

  return {
    schemaVersion: '0.0.0-draft',
    features: featureManifest,
    requirements: {},
    core,
  };
};
