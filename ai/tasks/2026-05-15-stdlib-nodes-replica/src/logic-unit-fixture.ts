import type {
  CombinationalLUCore,
  EndpointRef,
  LogicUnit,
  StatefulLUCore,
} from '@logic-universe/logic-ir-core';
import { stdlibNodeSpecByKey, type LegacyStdlibNodeKey } from './catalog';

const input = () => ({ contact: 'pull' as const });
const pushInput = () => ({ contact: 'push' as const });
const pushOutput = () => ({ contact: 'push' as const });
const propertyOutput = () => ({ contact: 'property' as const });

const result = (...pins: string[]) =>
  pins.length > 0
    ? { contact: 'pull' as const, pins: { kind: 'keyed' as const, keys: pins } }
    : { contact: 'pull' as const };

const luiIdFor = (key: LegacyStdlibNodeKey): string =>
  `node_${key.replace(/[^A-Za-z0-9]/g, '_')}`;

const inputPorts = (keys: string[]) =>
  Object.fromEntries(keys.map((portKey) => [portKey, input()]));

const statefulInputPorts = (keys: string[]) =>
  Object.fromEntries(
    keys.map((portKey) => [
      portKey,
      portKey === 'initial' ? input() : pushInput(),
    ]),
  );

const luInput = (key: string): EndpointRef => ({
  owner: { kind: 'boundary' },
  port: { kind: 'input', key },
});

const luOutput = (key: string): EndpointRef => ({
  owner: { kind: 'boundary' },
  port: { kind: 'output', key },
});

const luResult = (payloadPath?: (string | number)[]): EndpointRef => ({
  owner: { kind: 'boundary' },
  port: { kind: 'result' },
  ...(payloadPath ? { payloadPath } : {}),
});

const luiInput = (luiId: string, key: string): EndpointRef => ({
  owner: { kind: 'lui', luiId },
  port: { kind: 'input', key },
});

const luiOutput = (luiId: string, key: string): EndpointRef => ({
  owner: { kind: 'lui', luiId },
  port: { kind: 'output', key },
});

const luiResult = (
  luiId: string,
  payloadPath?: (string | number)[],
): EndpointRef => ({
  owner: { kind: 'lui', luiId },
  port: { kind: 'result' },
  ...(payloadPath ? { payloadPath } : {}),
});

export const createStdlibLogicUnitFixture = (
  key: LegacyStdlibNodeKey,
): LogicUnit => {
  const spec = stdlibNodeSpecByKey.get(key);
  if (!spec) {
    throw new Error(`Missing stdlib node spec for ${key}`);
  }

  const luiId = luiIdFor(key);
  const isStateful = spec.kind === 'state-machine';
  const isStructural = spec.kind === 'component';
  const usePropertyOutputs = key.startsWith('property');
  const usePushOutputs = isStateful || isStructural;
  const hasResult = !isStateful && !isStructural && spec.outputPorts.length > 0;

  const connections = {
    ...Object.fromEntries(
      spec.inputPorts.map((portKey) => [
        `input_${portKey}`,
        {
          from: luInput(portKey),
          to: luiInput(luiId, portKey),
        },
      ]),
    ),
    ...Object.fromEntries(
      spec.outputPorts.map((portKey) => [
        `output_${portKey}`,
        usePushOutputs
          ? {
              from: luiOutput(luiId, portKey),
              to: luOutput(portKey),
            }
          : {
              from: luiResult(
                luiId,
                spec.outputPorts.length === 1 ? undefined : [portKey],
              ),
              to: luResult(
                spec.outputPorts.length === 1 ? undefined : [portKey],
              ),
            },
      ]),
    ),
  };

  if (isStateful) {
    const outputs = Object.fromEntries(
      spec.outputPorts.map((portKey) => [
        portKey,
        usePropertyOutputs ? propertyOutput() : pushOutput(),
      ]),
    );
    const common = {
      ports: {
        inputs: statefulInputPorts(spec.inputPorts),
        outputs,
      },
      closures: {},
      connections,
    };
    const core: StatefulLUCore = {
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
            inputs: statefulInputPorts(spec.inputPorts),
            outputs,
          },
          fulfillments: {},
        },
      },
    };

    return {
      schemaVersion: '0.0.0-draft',
      featureUses: {},
      requirements: {},
      core,
    };
  }

  if (isStructural) {
    const common = {
      ports: {
        inputs: inputPorts(spec.inputPorts),
        outputs: Object.fromEntries(
          spec.outputPorts.map((portKey) => [portKey, pushOutput()]),
        ),
      },
      closures: {},
      connections,
    };
    const core: LogicUnit['core'] = {
      ...common,
      kindOrganization: {
        kind: 'structural',
        anchors: { root: { shape: 'single', required: true } },
        outlets: {},
        anchorFills: { root: { kind: 'empty' } },
        luiFills: {},
      },
      luis: {
        [luiId]: {
          kind: 'structural',
          target: {
            kind: 'external',
            namespace: 'legacy.ff-core.stdlib',
            key,
          },
          ports: common.ports,
          compositionSurface: {
            outlets: { root: { required: true } },
            anchors: {},
          },
          fulfillments: {},
        },
      },
    };

    return {
      schemaVersion: '0.0.0-draft',
      featureUses: {},
      requirements: {},
      core,
    };
  }

  const core: CombinationalLUCore = {
    ports: {
      inputs: inputPorts(spec.inputPorts),
      result: result(
        ...(hasResult && spec.outputPorts.length > 1 ? spec.outputPorts : []),
      ),
    },
    closures: {},
    connections,
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
          inputs: inputPorts(spec.inputPorts),
          result: result(
            ...(hasResult && spec.outputPorts.length > 1
              ? spec.outputPorts
              : []),
          ),
        },
        fulfillments: {},
      },
    },
  };

  return {
    schemaVersion: '0.0.0-draft',
    featureUses: {},
    requirements: {},
    core,
  };
};
