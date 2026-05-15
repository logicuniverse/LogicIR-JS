import type {
  Connection,
  ConnectionId,
  EndpointRef,
  ExtensionRecord,
  LogicUnit,
  PayloadPath,
  Port,
} from '@logic-universe/logic-ir-core';
import { TypeChecker } from './checker';
import { TypeRegistry } from './registry';
import {
  TYPE_SYSTEM_EXTENSION_KEYS,
  TYPE_SYSTEM_FEATURE,
  TYPE_SYSTEM_SCHEMA_VERSION,
} from './types';
import type {
  AlgebraicTypeExpression,
  ConnectionTypePolicyPayload,
  ConnectionTypeReport,
  PayloadTypePayload,
  TypeCompatibilityMode,
  TypeDefinitionsPayload,
  TypeIssue,
} from './types';

export type LogicIRTypeRegistryBuildResult = {
  registry: TypeRegistry;
  issues: TypeIssue[];
};

export const findTypeSystemFeatureKeys = (logicUnit: LogicUnit): string[] =>
  Object.entries(logicUnit.features)
    .filter(
      ([, feature]) =>
        feature.namespace === TYPE_SYSTEM_FEATURE.namespace &&
        feature.key === TYPE_SYSTEM_FEATURE.key,
    )
    .map(([featureKey]) => featureKey);

export const findTypeSystemExtensions = (
  logicUnit: LogicUnit,
  owner: { extensions?: ExtensionRecord[] },
  extensionKey?: string,
): ExtensionRecord[] => {
  const featureKeys = new Set(findTypeSystemFeatureKeys(logicUnit));
  return (owner.extensions ?? []).filter(
    (extension) =>
      featureKeys.has(extension.featureKey) &&
      (!extensionKey || extension.key === extensionKey),
  );
};

export const buildTypeRegistryFromLogicUnit = (
  logicUnit: LogicUnit,
): LogicIRTypeRegistryBuildResult => {
  const registry = new TypeRegistry();
  const issues: TypeIssue[] = [];

  for (const extension of findTypeSystemExtensions(
    logicUnit,
    logicUnit,
    TYPE_SYSTEM_EXTENSION_KEYS.typeDefinitions,
  )) {
    if (!isTypeDefinitionsPayload(extension.payload)) {
      issues.push(
        issue(
          'invalid-extension-payload',
          'Invalid type-definitions extension payload.',
          `extension:${extension.key}`,
        ),
      );
      continue;
    }
    registry.addDefinitions(extension.payload.definitions);
  }

  const checker = new TypeChecker({ registry });
  for (const [name, definition] of Object.entries(registry.allDefinitions())) {
    if (definition.type) {
      issues.push(
        ...checker.validateType(definition.type).issues.map((item) => ({
          ...item,
          subject: `type:${name}`,
        })),
      );
    }
  }

  return { registry, issues };
};

export const readPayloadType = (
  logicUnit: LogicUnit,
  port: Port,
  payloadPath?: PayloadPath,
): AlgebraicTypeExpression | undefined => {
  for (const extension of findTypeSystemExtensions(
    logicUnit,
    port,
    TYPE_SYSTEM_EXTENSION_KEYS.payloadType,
  )) {
    if (!isPayloadTypePayload(extension.payload)) {
      continue;
    }
    if (payloadPath) {
      const pathType = extension.payload.pathTypes?.find((binding) =>
        samePayloadPath(binding.payloadPath, payloadPath),
      );
      if (pathType) {
        return pathType.type;
      }
    }
    return extension.payload.type;
  }
  return undefined;
};

export const readConnectionTypePolicy = (
  logicUnit: LogicUnit,
  connection: Connection,
): ConnectionTypePolicyPayload | undefined => {
  for (const extension of findTypeSystemExtensions(
    logicUnit,
    connection,
    TYPE_SYSTEM_EXTENSION_KEYS.connectionTypePolicy,
  )) {
    if (isConnectionTypePolicyPayload(extension.payload)) {
      return extension.payload;
    }
  }
  return undefined;
};

export const getEndpointPort = (
  logicUnit: LogicUnit,
  endpoint: EndpointRef,
): Port | undefined => {
  switch (endpoint.owner.kind) {
    case 'lu':
      return logicUnit.core.ports[endpoint.portKey];
    case 'lui':
      return logicUnit.core.luis[endpoint.owner.luiId]?.ports[endpoint.portKey];
    case 'closure':
      return logicUnit.core.closures[endpoint.owner.closureId]?.core.ports[
        endpoint.portKey
      ];
  }
};

export const checkLogicUnitConnectionTypes = (
  logicUnit: LogicUnit,
  checker?: TypeChecker,
): { reports: ConnectionTypeReport[]; issues: TypeIssue[] } => {
  const registryResult = buildTypeRegistryFromLogicUnit(logicUnit);
  const activeChecker =
    checker ?? new TypeChecker({ registry: registryResult.registry });
  const issues = [...registryResult.issues];
  const reports: ConnectionTypeReport[] = [];

  for (const [connectionId, connection] of Object.entries(
    logicUnit.core.connections,
  )) {
    const sourcePort = getEndpointPort(logicUnit, connection.from);
    const targetPort = getEndpointPort(logicUnit, connection.to);
    const policy = readConnectionTypePolicy(logicUnit, connection);
    const mode: TypeCompatibilityMode = policy?.mode ?? 'assignable';
    const source =
      policy?.sourceType ??
      (sourcePort
        ? readPayloadType(logicUnit, sourcePort, connection.from.payloadPath)
        : undefined);
    const target =
      policy?.targetType ??
      (targetPort
        ? readPayloadType(logicUnit, targetPort, connection.to.payloadPath)
        : undefined);

    if (!sourcePort) {
      issues.push(
        issue(
          'missing-type',
          'Connection source endpoint port was not found.',
          `connection:${connectionId}:from`,
        ),
      );
      continue;
    }
    if (!targetPort) {
      issues.push(
        issue(
          'missing-type',
          'Connection target endpoint port was not found.',
          `connection:${connectionId}:to`,
        ),
      );
      continue;
    }
    if (!source || !target) {
      issues.push(
        issue(
          'missing-type',
          'Connection endpoint is missing payload type information.',
          `connection:${connectionId}`,
        ),
      );
      continue;
    }

    const result = activeChecker.compare(source, target, mode);
    reports.push({
      connectionId: connectionId as ConnectionId,
      mode,
      source,
      target,
      result,
    });
    issues.push(
      ...result.issues.map((item) => ({
        ...item,
        subject: `connection:${connectionId}`,
      })),
    );
  }

  return { reports, issues };
};

export const isTypeDefinitionsPayload = (
  value: unknown,
): value is TypeDefinitionsPayload =>
  isRecord(value) &&
  value.schemaVersion === TYPE_SYSTEM_SCHEMA_VERSION &&
  isRecord(value.definitions);

export const isPayloadTypePayload = (
  value: unknown,
): value is PayloadTypePayload =>
  isRecord(value) && isRecord(value.type);

export const isConnectionTypePolicyPayload = (
  value: unknown,
): value is ConnectionTypePolicyPayload =>
  isRecord(value) &&
  (value.mode === undefined ||
    value.mode === 'assignable' ||
    value.mode === 'equivalent' ||
    value.mode === 'overlap' ||
    value.mode === 'disjoint');

const issue = (
  code: TypeIssue['code'],
  message: string,
  subject?: string,
): TypeIssue => ({ code, message, subject });

const samePayloadPath = (left: PayloadPath, right: PayloadPath): boolean =>
  left.length === right.length &&
  left.every((segment, index) => segment === right[index]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
