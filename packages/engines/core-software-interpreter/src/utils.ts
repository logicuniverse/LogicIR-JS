import type {
  CompositionValue,
  Connection,
  EndpointRef,
  LogicUnit,
  PayloadPath,
} from '@logic-universe/logic-ir-core';
import type { CoreExternalTargetRef, RuntimeValue } from './types.js';

export const getExternalTargetCatalogKey = (
  ref: CoreExternalTargetRef,
): string =>
  ref.version
    ? `${ref.namespace}/${ref.key}@${ref.version}`
    : `${ref.namespace}/${ref.key}`;

export const getConnectionKey = (connection: Connection): string =>
  `${getEndpointKey(connection.from)}->${getEndpointKey(connection.to)}`;

export const getEndpointKey = (endpoint: EndpointRef): string => {
  const ownerKey =
    endpoint.owner.kind === 'boundary'
      ? 'boundary'
      : endpoint.owner.kind === 'lui'
        ? `lui:${endpoint.owner.luiId}`
        : `closure:${endpoint.owner.closureId}`;

  const portKey =
    endpoint.port.kind === 'result'
      ? 'result'
      : `${endpoint.port.kind}:${endpoint.port.key}`;

  const payloadKey =
    endpoint.payloadPath && endpoint.payloadPath.length > 0
      ? `:${endpoint.payloadPath.join('.')}`
      : '';

  return `${ownerKey}/${portKey}${payloadKey}`;
};

export const readPayloadPath = (
  value: RuntimeValue,
  payloadPath?: PayloadPath,
): RuntimeValue | undefined => {
  if (!payloadPath || payloadPath.length === 0) {
    return value;
  }

  let current: RuntimeValue = value;

  for (const segment of payloadPath) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof segment === 'number') {
      if (!Array.isArray(current)) {
        return undefined;
      }
      current = current[segment];
      continue;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, RuntimeValue>)[segment];
  }

  return current;
};

export const readCompositionValueShape = (
  value: CompositionValue,
): 'single' | 'collection' | 'map' => {
  if (value.kind === 'collection') {
    return 'collection';
  }
  if (value.kind === 'map') {
    return 'map';
  }
  return 'single';
};

export const getBoundaryInputContact = (
  logicUnit: LogicUnit,
  key: string,
): string | undefined => logicUnit.core.ports.inputs[key]?.contact;

export const getBoundaryOutputContact = (
  logicUnit: LogicUnit,
  key: string,
): string | undefined =>
  'outputs' in logicUnit.core.ports ? logicUnit.core.ports.outputs[key]?.contact : undefined;
