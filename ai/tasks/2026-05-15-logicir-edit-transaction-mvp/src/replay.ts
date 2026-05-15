import { cloneJson } from './hash';
import type {
  Diagnostic,
  JsonPath,
  JsonPathSegment,
  JsonRecord,
  JsonValue,
  LogicIREditOperation,
  LogicIREditTransaction,
  ReplayResult,
} from './types';

const isRecord = (value: JsonValue): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const pathText = (path: JsonPath): string =>
  path.map((segment) => String(segment)).join('.');

const makeDiagnostic = (
  code: string,
  message: string,
  path?: JsonPath,
): Diagnostic => ({
  severity: 'error',
  code,
  message,
  path,
});

const getParent = (
  root: JsonValue,
  path: JsonPath,
  diagnostics: Diagnostic[],
): { parent: JsonValue; key: JsonPathSegment } | undefined => {
  if (path.length === 0) {
    diagnostics.push(
      makeDiagnostic('EMPTY_PATH', 'Root-level replacement is not supported in this MVP.', path),
    );
    return undefined;
  }

  let cursor = root;

  for (const segment of path.slice(0, -1)) {
    if (Array.isArray(cursor) && typeof segment === 'number') {
      cursor = cursor[segment];
      continue;
    }

    if (isRecord(cursor) && typeof segment === 'string') {
      cursor = cursor[segment];
      continue;
    }

    diagnostics.push(
      makeDiagnostic(
        'INVALID_PATH',
        `Cannot traverse ${pathText(path)} at segment ${String(segment)}.`,
        path,
      ),
    );
    return undefined;
  }

  return {
    parent: cursor,
    key: path[path.length - 1],
  };
};

const applySet = (
  root: JsonValue,
  operation: Extract<LogicIREditOperation, { kind: 'set' }>,
  diagnostics: Diagnostic[],
): void => {
  const target = getParent(root, operation.path, diagnostics);
  if (!target) {
    return;
  }

  if (Array.isArray(target.parent) && typeof target.key === 'number') {
    target.parent[target.key] = cloneJson(operation.value);
    return;
  }

  if (isRecord(target.parent) && typeof target.key === 'string') {
    target.parent[target.key] = cloneJson(operation.value);
    return;
  }

  diagnostics.push(
    makeDiagnostic(
      'INVALID_SET_TARGET',
      `Cannot set ${pathText(operation.path)} on a non-container parent.`,
      operation.path,
    ),
  );
};

const applyInsert = (
  root: JsonValue,
  operation: Extract<LogicIREditOperation, { kind: 'insert' }>,
  diagnostics: Diagnostic[],
): void => {
  const target = getParent(root, [...operation.path, operation.key], diagnostics);
  if (!target || !isRecord(target.parent) || typeof target.key !== 'string') {
    diagnostics.push(
      makeDiagnostic(
        'INVALID_INSERT_TARGET',
        `Cannot insert ${operation.key} at ${pathText(operation.path)}.`,
        operation.path,
      ),
    );
    return;
  }

  if (Object.prototype.hasOwnProperty.call(target.parent, target.key)) {
    diagnostics.push(
      makeDiagnostic(
        'INSERT_KEY_EXISTS',
        `Cannot insert ${operation.key}; key already exists.`,
        operation.path,
      ),
    );
    return;
  }

  target.parent[target.key] = cloneJson(operation.value);
};

const applyDelete = (
  root: JsonValue,
  operation: Extract<LogicIREditOperation, { kind: 'delete' }>,
  diagnostics: Diagnostic[],
): void => {
  const target = getParent(root, operation.path, diagnostics);
  if (!target) {
    return;
  }

  if (Array.isArray(target.parent) && typeof target.key === 'number') {
    target.parent.splice(target.key, 1);
    return;
  }

  if (isRecord(target.parent) && typeof target.key === 'string') {
    delete target.parent[target.key];
    return;
  }

  diagnostics.push(
    makeDiagnostic(
      'INVALID_DELETE_TARGET',
      `Cannot delete ${pathText(operation.path)} from a non-container parent.`,
      operation.path,
    ),
  );
};

const applyConnect = (
  root: JsonValue,
  operation: Extract<LogicIREditOperation, { kind: 'connect' }>,
  diagnostics: Diagnostic[],
): void => {
  if (!isRecord(root) || !isRecord(root.core) || !isRecord(root.core.connections)) {
    diagnostics.push(
      makeDiagnostic(
        'MISSING_CONNECTIONS',
        'Connect operation requires root.core.connections to be a record.',
        ['core', 'connections'],
      ),
    );
    return;
  }

  if (Object.prototype.hasOwnProperty.call(root.core.connections, operation.connectionId)) {
    diagnostics.push(
      makeDiagnostic(
        'CONNECTION_EXISTS',
        `Connection ${operation.connectionId} already exists.`,
        ['core', 'connections', operation.connectionId],
      ),
    );
    return;
  }

  root.core.connections[operation.connectionId] = {
    from: operation.from as unknown as JsonValue,
    to: operation.to as unknown as JsonValue,
  };
};

export const applyOperation = (
  root: JsonValue,
  operation: LogicIREditOperation,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  if (operation.kind === 'set') {
    applySet(root, operation, diagnostics);
  } else if (operation.kind === 'insert') {
    applyInsert(root, operation, diagnostics);
  } else if (operation.kind === 'delete') {
    applyDelete(root, operation, diagnostics);
  } else {
    applyConnect(root, operation, diagnostics);
  }

  return diagnostics;
};

export const replayTransaction = (
  transaction: LogicIREditTransaction,
): ReplayResult => {
  const data = cloneJson(transaction.before.data);
  const diagnostics: Diagnostic[] = [];

  for (const operation of transaction.operations) {
    diagnostics.push(...applyOperation(data, operation));
  }

  return {
    data,
    diagnostics,
  };
};
