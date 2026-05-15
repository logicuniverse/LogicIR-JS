import type {
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  Port,
} from '@logic-universe/logic-ir-core';
import { hashJson, stableStringify } from './hash';
import { replayTransaction } from './replay';
import type {
  Diagnostic,
  JsonPath,
  JsonRecord,
  JsonValue,
  LogicIREditTransaction,
  ValidationResult,
} from './types';

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const diagnostic = (
  code: string,
  message: string,
  path?: JsonPath,
  severity: Diagnostic['severity'] = 'error',
): Diagnostic => ({
  severity,
  code,
  message,
  path,
});

export const hasErrors = (diagnostics: Diagnostic[]): boolean =>
  diagnostics.some((item) => item.severity === 'error');

export const collectHoles = (
  value: JsonValue,
  path: JsonPath = [],
): Diagnostic[] => {
  if (isRecord(value) && isRecord(value.$hole)) {
    const id = isString(value.$hole.id) ? value.$hole.id : '<missing-id>';
    return [
      diagnostic(
        'UNRESOLVED_HOLE',
        `Unresolved typed hole ${id}.`,
        path,
      ),
    ];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectHoles(item, [...path, index]));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      collectHoles(item, [...path, key]),
    );
  }

  return [];
};

const validatePort = (port: unknown, path: JsonPath): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  if (!isRecord(port)) {
    return [diagnostic('INVALID_PORT', 'Port must be a record.', path)];
  }

  if (port.boundary !== 'input' && port.boundary !== 'output') {
    diagnostics.push(
      diagnostic('INVALID_PORT_BOUNDARY', 'Port boundary must be input or output.', [
        ...path,
        'boundary',
      ]),
    );
  }

  if (!isRecord(port.interaction)) {
    diagnostics.push(
      diagnostic('INVALID_PORT_INTERACTION', 'Port interaction must be a record.', [
        ...path,
        'interaction',
      ]),
    );
    return diagnostics;
  }

  for (const key of ['pullReadable', 'pushNotifiable', 'retainedCurrent']) {
    if (typeof port.interaction[key] !== 'boolean') {
      diagnostics.push(
        diagnostic(
          'INVALID_PORT_INTERACTION_FLAG',
          `Port interaction.${key} must be boolean.`,
          [...path, 'interaction', key],
        ),
      );
    }
  }

  return diagnostics;
};

const validatePortSurface = (
  surface: unknown,
  path: JsonPath,
): Diagnostic[] => {
  if (!isRecord(surface)) {
    return [diagnostic('INVALID_PORT_SURFACE', 'Port surface must be a record.', path)];
  }

  return Object.entries(surface).flatMap(([portKey, port]) =>
    validatePort(port, [...path, portKey]),
  );
};

const readPort = (
  logicUnit: LogicUnit,
  endpoint: EndpointRef,
): Port | undefined => {
  if (endpoint.owner.kind === 'lu') {
    return logicUnit.core.ports[endpoint.portKey];
  }

  if (endpoint.owner.kind === 'lui') {
    return logicUnit.core.luis[endpoint.owner.luiId]?.ports[endpoint.portKey];
  }

  return logicUnit.core.closures[endpoint.owner.closureId]?.core.ports[
    endpoint.portKey
  ];
};

const isSourceEndpoint = (endpoint: EndpointRef, port: Port): boolean => {
  if (endpoint.owner.kind === 'lu') {
    return port.boundary === 'input';
  }

  return port.boundary === 'output';
};

const isSinkEndpoint = (endpoint: EndpointRef, port: Port): boolean => {
  if (endpoint.owner.kind === 'lu') {
    return port.boundary === 'output';
  }

  return port.boundary === 'input';
};

const endpointKey = (endpoint: EndpointRef): string =>
  stableStringify(endpoint as unknown as JsonValue);

const validateConnections = (logicUnit: LogicUnit): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const seenTargets = new Set<string>();

  for (const [connectionId, connection] of Object.entries(
    logicUnit.core.connections,
  )) {
    const sourcePort = readPort(logicUnit, connection.from);
    const targetPort = readPort(logicUnit, connection.to);

    if (!sourcePort) {
      diagnostics.push(
        diagnostic(
          'UNKNOWN_SOURCE_ENDPOINT',
          `Connection ${connectionId} source endpoint does not resolve.`,
          ['core', 'connections', connectionId, 'from'],
        ),
      );
    } else if (!isSourceEndpoint(connection.from, sourcePort)) {
      diagnostics.push(
        diagnostic(
          'INVALID_SOURCE_DIRECTION',
          `Connection ${connectionId} source endpoint is not graph-readable from this LU core.`,
          ['core', 'connections', connectionId, 'from'],
        ),
      );
    }

    if (!targetPort) {
      diagnostics.push(
        diagnostic(
          'UNKNOWN_TARGET_ENDPOINT',
          `Connection ${connectionId} target endpoint does not resolve.`,
          ['core', 'connections', connectionId, 'to'],
        ),
      );
    } else if (!isSinkEndpoint(connection.to, targetPort)) {
      diagnostics.push(
        diagnostic(
          'INVALID_TARGET_DIRECTION',
          `Connection ${connectionId} target endpoint is not graph-writable in this LU core.`,
          ['core', 'connections', connectionId, 'to'],
        ),
      );
    }

    const targetKey = endpointKey(connection.to);
    if (seenTargets.has(targetKey)) {
      diagnostics.push(
        diagnostic(
          'DUPLICATE_TARGET_ENDPOINT',
          `Connection ${connectionId} writes an endpoint that already has a driver.`,
          ['core', 'connections', connectionId, 'to'],
        ),
      );
    }
    seenTargets.add(targetKey);
  }

  return diagnostics;
};

const validateExtensionFeatures = (logicUnit: LogicUnit): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const featureKeys = new Set(Object.keys(logicUnit.features));

  const checkExtensions = (value: unknown, path: JsonPath): void => {
    if (!isRecord(value) || !Array.isArray(value.extensions)) {
      return;
    }

    const extensions = value.extensions as unknown as ExtensionRecord[];

    for (const [index, extension] of extensions.entries()) {
      if (!featureKeys.has(extension.featureKey)) {
        diagnostics.push(
          diagnostic(
            'UNKNOWN_EXTENSION_FEATURE',
            `Extension ${extension.key} references unknown featureKey ${extension.featureKey}.`,
            [...path, 'extensions', index, 'featureKey'],
          ),
        );
      }
    }
  };

  checkExtensions(logicUnit, []);
  checkExtensions(logicUnit.core, ['core']);

  for (const [portKey, port] of Object.entries(logicUnit.core.ports)) {
    checkExtensions(port, ['core', 'ports', portKey]);
  }

  for (const [luiId, lui] of Object.entries(logicUnit.core.luis)) {
    checkExtensions(lui, ['core', 'luis', luiId]);
    for (const [portKey, port] of Object.entries(lui.ports)) {
      checkExtensions(port, ['core', 'luis', luiId, 'ports', portKey]);
    }
  }

  for (const [connectionId, connection] of Object.entries(
    logicUnit.core.connections,
  )) {
    checkExtensions(connection, ['core', 'connections', connectionId]);
  }

  return diagnostics;
};

export const validateLogicUnit = (value: JsonValue): ValidationResult => {
  const diagnostics: Diagnostic[] = [];

  diagnostics.push(...collectHoles(value));

  if (!isRecord(value)) {
    return {
      name: 'logic-unit-core-shape',
      diagnostics: [
        diagnostic('INVALID_LOGIC_UNIT', 'LogicUnit must be a record.'),
      ],
    };
  }

  if (value.schemaVersion !== '0.0.0-draft') {
    diagnostics.push(
      diagnostic('INVALID_SCHEMA_VERSION', 'Unsupported core schema version.', [
        'schemaVersion',
      ]),
    );
  }

  if (!isRecord(value.features)) {
    diagnostics.push(
      diagnostic('INVALID_FEATURE_MANIFEST', 'features must be a record.', [
        'features',
      ]),
    );
  }

  if (!isRecord(value.requirements)) {
    diagnostics.push(
      diagnostic('INVALID_REQUIREMENTS', 'requirements must be a record.', [
        'requirements',
      ]),
    );
  }

  if (!isRecord(value.core)) {
    diagnostics.push(diagnostic('INVALID_CORE', 'core must be a record.', ['core']));
    return {
      name: 'logic-unit-core-shape',
      diagnostics,
    };
  }

  diagnostics.push(...validatePortSurface(value.core.ports, ['core', 'ports']));

  if (!isRecord(value.core.kindOrganization)) {
    diagnostics.push(
      diagnostic(
        'INVALID_KIND_ORGANIZATION',
        'core.kindOrganization must be a record.',
        ['core', 'kindOrganization'],
      ),
    );
  } else if (value.core.kindOrganization.kind !== 'combinational') {
    diagnostics.push(
      diagnostic(
        'UNSUPPORTED_KIND',
        'This MVP validator only accepts combinational LogicUnit fixtures.',
        ['core', 'kindOrganization', 'kind'],
      ),
    );
  }

  if (!isRecord(value.core.luis)) {
    diagnostics.push(diagnostic('INVALID_LUIS', 'core.luis must be a record.', ['core', 'luis']));
  }

  if (!isRecord(value.core.connections)) {
    diagnostics.push(
      diagnostic('INVALID_CONNECTIONS', 'core.connections must be a record.', [
        'core',
        'connections',
      ]),
    );
  }

  if (hasErrors(diagnostics)) {
    return {
      name: 'logic-unit-core-shape',
      diagnostics,
    };
  }

  const logicUnit = value as unknown as LogicUnit;

  for (const [luiId, lui] of Object.entries(logicUnit.core.luis)) {
    if (logicUnit.core.kindOrganization.kind === 'combinational' && lui.kind !== 'combinational') {
      diagnostics.push(
        diagnostic(
          'INVALID_COMBINATIONAL_LUI',
          `Combinational LU cannot contain ${lui.kind} LUI ${luiId}.`,
          ['core', 'luis', luiId, 'kind'],
        ),
      );
    }

    diagnostics.push(...validatePortSurface(lui.ports, ['core', 'luis', luiId, 'ports']));

    if (!isRecord(lui.fulfillments as unknown)) {
      diagnostics.push(
        diagnostic('INVALID_FULFILLMENTS', 'LUI fulfillments must be a record.', [
          'core',
          'luis',
          luiId,
          'fulfillments',
        ]),
      );
    }
  }

  diagnostics.push(...validateConnections(logicUnit));
  diagnostics.push(...validateExtensionFeatures(logicUnit));

  return {
    name: 'logic-unit-core-shape',
    diagnostics,
  };
};

export const validateTransaction = (
  transaction: LogicIREditTransaction,
): ValidationResult[] => {
  const replay = replayTransaction(transaction);
  const diagnostics: Diagnostic[] = [...replay.diagnostics];

  const actualBeforeHash = hashJson(transaction.before.data);
  if (transaction.before.hash !== actualBeforeHash) {
    diagnostics.push(
      diagnostic(
        'BEFORE_HASH_MISMATCH',
        `before.hash is ${transaction.before.hash}, expected ${actualBeforeHash}.`,
        ['before', 'hash'],
      ),
    );
  }

  const actualAfterHash = hashJson(replay.data);
  if (transaction.after.hash !== actualAfterHash) {
    diagnostics.push(
      diagnostic(
        'AFTER_HASH_MISMATCH',
        `after.hash is ${transaction.after.hash}, replay produced ${actualAfterHash}.`,
        ['after', 'hash'],
      ),
    );
  }

  if (stableStringify(transaction.after.data) !== stableStringify(replay.data)) {
    diagnostics.push(
      diagnostic(
        'AFTER_SNAPSHOT_MISMATCH',
        'Replayed data does not match transaction.after.data.',
        ['after', 'data'],
      ),
    );
  }

  const beforeHoles = collectHoles(transaction.before.data);
  if (beforeHoles.length === 0) {
    diagnostics.push(
      diagnostic(
        'NO_TYPED_HOLES',
        'The before snapshot contains no typed holes; this MVP should demonstrate hole completion.',
        ['before', 'data'],
        'warning',
      ),
    );
  }

  const afterValidation = validateLogicUnit(replay.data);

  return [
    {
      name: 'transaction-replay',
      diagnostics,
    },
    afterValidation,
  ];
};
