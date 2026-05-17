import type {
  EndpointRef,
  InterpreterPlan,
  LogicUnit,
  ResolvedStack,
  RetainedCurrentOperation,
} from './types';
import { baselineInterpretation } from './types';

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
      entry.from.owner.kind === 'boundary' &&
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
      entry.to.owner.kind === 'boundary',
  );

  if (!connection) {
    throw new Error(`Missing LU output connection for ${luiId}.${portKey}`);
  }

  return outputKey(connection.to);
};

const stateStoreOperationFromTarget = (
  targetKey: string,
): { storeKey: string; kind: 'read-current' | 'write-current' } => {
  if (targetKey.endsWith('.read-current')) {
    return {
      storeKey: targetKey.slice(0, -'.read-current'.length),
      kind: 'read-current',
    };
  }

  if (targetKey.endsWith('.write-current')) {
    return {
      storeKey: targetKey.slice(0, -'.write-current'.length),
      kind: 'write-current',
    };
  }

  throw new Error(`Unsupported state-store target key: ${targetKey}`);
};

export const createInterpreterPlan = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): InterpreterPlan => {
  const operations: RetainedCurrentOperation[] = [];

  for (const [luiId, lui] of Object.entries(logicUnit.core.luis)) {
    if (
      lui.target.kind !== 'external' ||
      lui.target.namespace !== 'logicir.software.state-store'
    ) {
      continue;
    }

    const { storeKey, kind } = stateStoreOperationFromTarget(lui.target.key);

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

    throw new Error(`Unsupported state-store operation: ${String(kind)}`);
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
