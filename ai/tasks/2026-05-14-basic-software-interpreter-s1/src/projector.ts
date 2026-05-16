import type {
  Connection,
  EndpointRef,
  LUI,
  LogicUnit,
  PortKey,
  ExecutionBinding,
} from './types';
import type {
  ExternalTargetIdentity,
  InterpreterPlan,
  ResolvedStack,
} from './types';
import {
  baselineInterpretation,
  formatExternalTarget,
  providerKey,
} from './types';

const isLuEndpoint = (endpoint: EndpointRef): boolean =>
  endpoint.owner.kind === 'boundary';

const isLuiEndpoint = (endpoint: EndpointRef, luiId: string): boolean =>
  endpoint.owner.kind === 'lui' && endpoint.owner.luiId === luiId;

const inputKey = (endpoint: EndpointRef): PortKey => {
  if (endpoint.port.kind !== 'input') {
    throw new Error('Expected an input endpoint.');
  }
  return endpoint.port.key;
};

const outputLikeKey = (endpoint: EndpointRef): PortKey => {
  if (endpoint.port.kind === 'output') {
    return endpoint.port.key;
  }

  if (endpoint.port.kind === 'result') {
    const [first] = endpoint.payloadPath ?? [];
    return typeof first === 'string' ? first : 'result';
  }

  throw new Error('Expected an output or result endpoint.');
};

const targetMatchesBinding = (
  target: ExternalTargetIdentity,
  binding: ExecutionBinding,
): boolean =>
  binding.subject.kind === 'external-target' &&
  binding.subject.namespace === target.namespace &&
  binding.subject.key === target.key &&
  (!binding.subject.version || binding.subject.version === target.version);

const findBinding = (
  target: ExternalTargetIdentity,
  resolved: ResolvedStack,
): ExecutionBinding => {
  const binding = resolved.executionBindings.find((entry) =>
    targetMatchesBinding(target, entry),
  );

  if (!binding) {
    throw new Error(`Missing execution binding for ${formatExternalTarget(target)}`);
  }

  return binding;
};

const getSingleExternalLui = (
  luis: LogicUnit['core']['luis'],
): [
  string,
  LUI & {
    target: ExternalTargetIdentity & { kind: 'external' };
  },
] => {
  const entries = Object.entries(luis);

  if (entries.length !== 1) {
    throw new Error(`S1 supports exactly one child LUI, got ${entries.length}`);
  }

  const [luiId, lui] = entries[0];

  if (lui.target.kind !== 'external') {
    throw new Error('S1 supports only an external provider target.');
  }

  return [
    luiId,
    lui as LUI & {
      target: ExternalTargetIdentity & { kind: 'external' };
    },
  ];
};

const collectInputMap = (
  connections: Record<string, Connection>,
  luiId: string,
): Record<PortKey, PortKey> => {
  const inputMap: Record<PortKey, PortKey> = {};

  for (const connection of Object.values(connections)) {
    if (isLuEndpoint(connection.from) && isLuiEndpoint(connection.to, luiId)) {
      inputMap[inputKey(connection.to)] = inputKey(connection.from);
    }
  }

  return inputMap;
};

const collectOutputMap = (
  connections: Record<string, Connection>,
  luiId: string,
): Record<PortKey, PortKey> => {
  const outputMap: Record<PortKey, PortKey> = {};

  for (const connection of Object.values(connections)) {
    if (isLuiEndpoint(connection.from, luiId) && isLuEndpoint(connection.to)) {
      outputMap[outputLikeKey(connection.to)] = outputLikeKey(connection.from);
    }
  }

  return outputMap;
};

const inputPorts = (logicUnit: LogicUnit): PortKey[] =>
  Object.keys(logicUnit.core.ports.inputs);

const outputPorts = (logicUnit: LogicUnit): PortKey[] => {
  if (!('result' in logicUnit.core.ports)) {
    throw new Error('S1 requires a result slot.');
  }

  const result = logicUnit.core.ports.result;
  if (!result) {
    throw new Error('S1 requires a result slot.');
  }

  return result.pins?.kind === 'keyed' ? result.pins.keys : ['result'];
};

const primaryOutputPort = (logicUnit: LogicUnit): PortKey => {
  const outputs = outputPorts(logicUnit);
  if (outputs.length !== 1) {
    throw new Error(`S1 requires exactly one result output, got ${outputs.length}`);
  }
  return outputs[0];
};

export const createInterpreterPlan = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): InterpreterPlan => {
  if (logicUnit.core.kindOrganization.kind !== 'combinational') {
    throw new Error('S1 supports only combinational LogicUnits.');
  }

  const [luiId, lui] = getSingleExternalLui(logicUnit.core.luis);
  const target = {
    namespace: lui.target.namespace,
    key: lui.target.key,
    version: lui.target.version,
  };
  const binding = findBinding(target, resolved);
  const inputMap = collectInputMap(logicUnit.core.connections, luiId);
  const outputMap = collectOutputMap(logicUnit.core.connections, luiId);

  return {
    key: 'add-pair.interpreter-plan.s1',
    stackKey: resolved.stackKey,
    interpretation: baselineInterpretation('s1-result-lazy-pull', [
      'Combinational LU output is computed only when a demanded ports.result value is read.',
      'Unused child LUI providers are not executed by this baseline interpreter plan.',
    ]),
    executionKind: 'combinational',
    primaryOutputPort: primaryOutputPort(logicUnit),
    inputPorts: inputPorts(logicUnit),
    outputPorts: outputPorts(logicUnit),
    nodes: [
      {
        luiId,
        target,
        providerKey: providerKey(binding.provider),
        inputMap,
        outputMap,
      },
    ],
    diagnostics: [],
  };
};
