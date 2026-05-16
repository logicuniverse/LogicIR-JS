import type {
  EndpointRef,
  ExtensionRecord,
  InterpreterPlan,
  LogicUnit,
  ResolvedStack,
  RetainedCurrentOperation,
} from './types';
import { baselineInterpretation } from './types';

const payloadObject = (extension: ExtensionRecord): Record<string, unknown> => {
  if (
    extension.payload === null ||
    typeof extension.payload !== 'object' ||
    Array.isArray(extension.payload)
  ) {
    throw new Error(`Extension ${extension.key} payload must be an object.`);
  }

  return extension.payload as Record<string, unknown>;
};

const requiredFeatureDeclared = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): boolean => {
  const declared = Object.values(logicUnit.features);

  return resolved.requiredFeatures.every((contract) =>
    declared.some(
      (feature) =>
        feature.namespace === contract.feature.namespace &&
        feature.key === contract.feature.key &&
        feature.version === contract.feature.version,
    ),
  );
};

const inputKey = (endpoint: EndpointRef): string => {
  if (endpoint.port.kind !== 'input') {
    throw new Error('Expected an input endpoint.');
  }
  return endpoint.port.key;
};

const outputKey = (endpoint: EndpointRef): string => {
  if (endpoint.port.kind !== 'output') {
    throw new Error('Expected an output endpoint.');
  }
  return endpoint.port.key;
};

const inputFromLu = (
  logicUnit: LogicUnit,
  luiId: string,
  portKey: string,
): string => {
  const connection = Object.values(logicUnit.core.connections).find(
    (entry) =>
      entry.from.owner.kind === 'lu' &&
      entry.from.port.kind === 'input' &&
      entry.to.owner.kind === 'lui' &&
      entry.to.owner.luiId === luiId &&
      entry.to.port.kind === 'input' &&
      entry.to.port.key === portKey,
  );

  if (!connection) {
    throw new Error(`Missing LU input connection for ${luiId}.${portKey}`);
  }

  return inputKey(connection.from);
};

const outputToLu = (
  logicUnit: LogicUnit,
  luiId: string,
  portKey: string,
): string => {
  const connection = Object.values(logicUnit.core.connections).find(
    (entry) =>
      entry.from.owner.kind === 'lui' &&
      entry.from.owner.luiId === luiId &&
      entry.from.port.kind === 'output' &&
      entry.from.port.key === portKey &&
      entry.to.port.kind === 'output' &&
      entry.to.owner.kind === 'lu',
  );

  if (!connection) {
    throw new Error(`Missing LU output connection for ${luiId}.${portKey}`);
  }

  return outputKey(connection.to);
};

export const createInterpreterPlan = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): InterpreterPlan => {
  if (!requiredFeatureDeclared(logicUnit, resolved)) {
    throw new Error('LogicUnit is missing required retained-current feature.');
  }

  const operations: RetainedCurrentOperation[] = [];

  for (const [luiId, lui] of Object.entries(logicUnit.core.luis)) {
    const extension = lui.extensions?.find(
      (entry: ExtensionRecord) => entry.key === 'state-operation',
    );

    if (!extension) {
      continue;
    }

    const payload = payloadObject(extension);
    const kind = payload.kind;
    const storeKey = payload.storeKey;

    if (typeof storeKey !== 'string') {
      throw new Error(`LUI ${luiId} state-operation missing storeKey.`);
    }

    if (kind === 'read-current') {
      operations.push({
        kind,
        storeKey,
        outputPort: outputToLu(logicUnit, luiId, 'current'),
      });
      continue;
    }

    if (kind === 'write-current') {
      operations.push({
        kind,
        storeKey,
        inputPort: inputFromLu(logicUnit, luiId, 'next'),
        outputPort: outputToLu(logicUnit, luiId, 'written'),
      });
      continue;
    }

    throw new Error(`Unsupported retained-current operation: ${String(kind)}`);
  }

  return {
    key: 'counter-current.interpreter-plan.s2',
    stackKey: resolved.stackKey,
    interpretation: baselineInterpretation('s2-retained-current-runtime-state', [
      'Retained-current reads observe the current durable value before same-run writes.',
      'Write-current operations update a named durable store through task-local runtime state context.',
    ]),
    operations,
    diagnostics: [],
  };
};
