import type {
  Connection,
  EndpointRef,
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
  endpoint.owner.kind === 'lu';

const isLuiEndpoint = (endpoint: EndpointRef, luiId: string): boolean =>
  endpoint.owner.kind === 'lui' && endpoint.owner.luiId === luiId;

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
  LogicUnit['core']['luis'][string] & {
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
    lui as LogicUnit['core']['luis'][string] & {
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
      inputMap[connection.to.portKey] = connection.from.portKey;
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
      outputMap[connection.to.portKey] = connection.from.portKey;
    }
  }

  return outputMap;
};

const inputPorts = (logicUnit: LogicUnit): PortKey[] =>
  Object.entries(logicUnit.core.ports)
    .filter(([, port]) => port.boundary === 'input')
    .map(([key]) => key);

const outputPorts = (logicUnit: LogicUnit): PortKey[] =>
  Object.entries(logicUnit.core.ports)
    .filter(([, port]) => port.boundary === 'output')
    .map(([key]) => key);

const primaryOutputPort = (logicUnit: LogicUnit): PortKey => {
  const entries = Object.entries(logicUnit.core.ports).filter(
    ([, port]) => port.boundary === 'output' && port.role === 'primary-result',
  );

  if (entries.length !== 1) {
    throw new Error(
      `S1 requires exactly one primary-result output, got ${entries.length}`,
    );
  }

  return entries[0][0];
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
    interpretation: baselineInterpretation('s1-primary-result-lazy-pull', [
      'Combinational LU output is computed only when a demanded primary-result output is read.',
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
