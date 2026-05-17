import type {
  EndpointRef,
  ExtensionRecord,
  InterpreterPlan,
  LogicUnit,
  LUITarget,
  PortMapping,
  PortKey,
  Port,
} from './types';
import { baselineInterpretation } from './types';

const identityKey = (target: Extract<LUITarget, { kind: 'external' }>): string =>
  `${target.namespace}/${target.key}${target.version ? `@${target.version}` : ''}`;

const payloadRecord = (
  extension: ExtensionRecord | undefined,
): Record<string, unknown> => {
  if (!extension) {
    return {};
  }
  if (
    extension.payload === null ||
    typeof extension.payload !== 'object' ||
    Array.isArray(extension.payload)
  ) {
    return {};
  }
  return extension.payload as Record<string, unknown>;
};

const extensionPayload = (
  extensions: ExtensionRecord[] | undefined,
  key: string,
): Record<string, unknown> =>
  payloadRecord(extensions?.find((extension) => extension.key === key));

const isLuEndpoint = (endpoint: EndpointRef): boolean =>
  endpoint.owner.kind === 'boundary';

const isLuiEndpoint = (endpoint: EndpointRef, luiId: string): boolean =>
  endpoint.owner.kind === 'lui' && endpoint.owner.luiId === luiId;

const portForEndpoint = (
  logicUnit: LogicUnit,
  endpoint: EndpointRef,
): Port | undefined => {
  const ports =
    endpoint.owner.kind === 'boundary'
      ? logicUnit.core.ports
      : endpoint.owner.kind === 'lui'
        ? logicUnit.core.luis[endpoint.owner.luiId]?.ports
        : logicUnit.core.closures[endpoint.owner.closureId]?.core.ports;

  if (!ports) {
    return undefined;
  }

  if (endpoint.port.kind === 'input') {
    return ports.inputs[endpoint.port.key];
  }

  if (endpoint.port.kind === 'output') {
    return 'outputs' in ports ? ports.outputs[endpoint.port.key] : undefined;
  }

  return 'result' in ports ? ports.result : undefined;
};

const hasResultPins = (logicUnit: LogicUnit, endpoint: EndpointRef): boolean =>
  endpoint.port.kind === 'result' &&
  portForEndpoint(logicUnit, endpoint)?.pins !== undefined;

const firstPayloadSegment = (
  logicUnit: LogicUnit,
  endpoint: EndpointRef,
): string | undefined => {
  if (!hasResultPins(logicUnit, endpoint)) {
    return undefined;
  }
  const segment = endpoint.payloadPath?.[0];
  return segment === undefined ? undefined : String(segment);
};

const remainingPayloadPath = (
  logicUnit: LogicUnit,
  endpoint: EndpointRef,
): (string | number)[] | undefined => {
  if (
    endpoint.port.kind !== 'result' ||
    !endpoint.payloadPath ||
    !hasResultPins(logicUnit, endpoint)
  ) {
    return endpoint.payloadPath;
  }
  return endpoint.payloadPath.length > 1 ? endpoint.payloadPath.slice(1) : undefined;
};

const endpointValueKey = (
  logicUnit: LogicUnit,
  endpoint: EndpointRef,
): PortKey => {
  if (endpoint.port.kind === 'input' || endpoint.port.kind === 'output') {
    return endpoint.port.key;
  }
  return firstPayloadSegment(logicUnit, endpoint) ?? 'result';
};

const collectInputMap = (
  logicUnit: LogicUnit,
  luiId: string,
): Record<PortKey, PortMapping> => {
  const result: Record<PortKey, PortMapping> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (
      isLuEndpoint(connection.from) &&
      isLuiEndpoint(connection.to, luiId) &&
      connection.to.port.kind === 'input'
    ) {
      result[connection.to.port.key] = {
        portKey: endpointValueKey(logicUnit, connection.from),
        payloadPath: remainingPayloadPath(logicUnit, connection.from),
        targetPayloadPath: remainingPayloadPath(logicUnit, connection.to),
      };
    }
  }

  return result;
};

const collectOutputMap = (
  logicUnit: LogicUnit,
  luiId: string,
): Record<PortKey, PortMapping> => {
  const result: Record<PortKey, PortMapping> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (isLuiEndpoint(connection.from, luiId) && isLuEndpoint(connection.to)) {
      result[endpointValueKey(logicUnit, connection.to)] = {
        portKey: endpointValueKey(logicUnit, connection.from),
        payloadPath: remainingPayloadPath(logicUnit, connection.from),
        targetPayloadPath: remainingPayloadPath(logicUnit, connection.to),
      };
    }
  }

  return result;
};

const inputPorts = (logicUnit: LogicUnit): string[] =>
  Object.keys(logicUnit.core.ports.inputs);

const resultPortKeys = (logicUnit: LogicUnit): string[] => {
  const ports = logicUnit.core.ports;
  if (!('result' in ports) || !ports.result) {
    return [];
  }
  const pins = ports.result.pins;
  if (pins?.kind === 'keyed') {
    return pins.keys;
  }
  if (pins?.kind === 'indexed') {
    return Array.from({ length: pins.count }, (_, index) => String(index));
  }
  return ['result'];
};

const outputPorts = (logicUnit: LogicUnit): string[] => [
  ...('outputs' in logicUnit.core.ports
    ? Object.keys(logicUnit.core.ports.outputs)
    : []),
  ...resultPortKeys(logicUnit),
];

export const compileLogicUnit = (logicUnit: LogicUnit): InterpreterPlan => {
  const diagnostics: InterpreterPlan['diagnostics'] = [];
  const nodes: InterpreterPlan['nodes'] = [];
  const unitKind = logicUnit.core.kindOrganization.kind;

  if (unitKind === 'structural') {
    nodes.push({
      id: 'structural-root',
      kind: 'structural-render',
      inputMap: Object.fromEntries(
        inputPorts(logicUnit).map((key) => [key, { portKey: key }]),
      ),
      outputMap: Object.fromEntries(
        outputPorts(logicUnit).map((key) => [key, { portKey: key }]),
      ),
      extensions: extensionPayload(logicUnit.core.extensions, 'module-structure'),
    });
  } else {
    for (const [luiId, lui] of Object.entries(logicUnit.core.luis)) {
      const operation = extensionPayload(lui.extensions, 'runtime-operation');
      const operationKind = operation.kind;

      if (operationKind === 'state-read') {
        nodes.push({
          id: luiId,
          kind: 'state-read',
          storeKey: String(operation.storeKey),
          inputMap: collectInputMap(logicUnit, luiId),
          outputMap: collectOutputMap(logicUnit, luiId),
        });
        continue;
      }

      if (operationKind === 'state-write') {
        nodes.push({
          id: luiId,
          kind: 'state-write',
          storeKey: String(operation.storeKey),
          inputMap: collectInputMap(logicUnit, luiId),
          outputMap: collectOutputMap(logicUnit, luiId),
        });
        continue;
      }

      if (operationKind === 'closure') {
        nodes.push({
          id: luiId,
          kind: 'closure',
          closureId: String(operation.closureId),
          inputMap: collectInputMap(logicUnit, luiId),
          outputMap: collectOutputMap(logicUnit, luiId),
        });
        continue;
      }

      if (operationKind === 'upstream') {
        nodes.push({
          id: luiId,
          kind: 'upstream',
          targetKey: String(operation.providerKey),
          serviceKey: String(operation.serviceKey),
          unitKey: String(operation.unitKey),
          inputMap: collectInputMap(logicUnit, luiId),
          outputMap: collectOutputMap(logicUnit, luiId),
        });
        continue;
      }

      if (operationKind === 'nested-lu') {
        nodes.push({
          id: luiId,
          kind: 'nested-lu',
          luRef: String(operation.luRef),
          inputMap: collectInputMap(logicUnit, luiId),
          outputMap: collectOutputMap(logicUnit, luiId),
        });
        continue;
      }

      if (operationKind === 'sequential-control') {
        nodes.push({
          id: luiId,
          kind: 'sequential-control',
          inputMap: collectInputMap(logicUnit, luiId),
          outputMap: collectOutputMap(logicUnit, luiId),
          extensions: operation,
        });
        continue;
      }

      if (lui.target.kind === 'external') {
        nodes.push({
          id: luiId,
          kind: 'provider',
          targetKey: identityKey(lui.target),
          inputMap: collectInputMap(logicUnit, luiId),
          outputMap: collectOutputMap(logicUnit, luiId),
        });
        continue;
      }

      diagnostics.push({
        code: 'UNSUPPORTED_TARGET',
        severity: 'error',
        phase: 'compile',
        message: `Unsupported target kind ${lui.target.kind}`,
        subject: luiId,
      });
    }
  }

  return {
    key: `latest-schema.${unitKind}.execution-plan`,
    interpretation: baselineInterpretation(`latest-schema-${unitKind}-execution-plan`, [
      'The plan compiles current core LogicUnit fixtures into a runnable execution baseline.',
      'Legacy-inspired runtime behavior is explicit evidence for review, not mandatory future engine architecture.',
    ]),
    unitKind,
    inputPorts: inputPorts(logicUnit),
    outputPorts: outputPorts(logicUnit),
    nodes,
    diagnostics,
  };
};
