import {
  AlgebraicTypeExpression,
  PayloadTypePayload,
  TYPE_SYSTEM_EXTENSION_KEYS,
  TYPE_SYSTEM_FEATURE,
  TypeDefinitionsPayload,
} from './types';

export type LogicIRFeatureUse = {
  namespace: string;
  key: string;
  version?: string;
};

export type LogicIRExtensionRecord = {
  featureKey: string;
  key: string;
  payload: unknown;
};

export type WithLogicIRExtensions = {
  extensions?: LogicIRExtensionRecord[];
};

export type LogicUnitLike = WithLogicIRExtensions & {
  features: Record<string, LogicIRFeatureUse>;
};

export const findTypeSystemFeatureKeys = (
  logicUnit: LogicUnitLike
): string[] =>
  Object.entries(logicUnit.features)
    .filter(
      ([, feature]) =>
        feature.namespace === TYPE_SYSTEM_FEATURE.namespace &&
        feature.key === TYPE_SYSTEM_FEATURE.key
    )
    .map(([key]) => key);

export const findTypeSystemExtensions = (
  logicUnit: LogicUnitLike,
  owner: WithLogicIRExtensions,
  extensionKey?: string
): LogicIRExtensionRecord[] => {
  const featureKeys = new Set(findTypeSystemFeatureKeys(logicUnit));
  return (owner.extensions ?? []).filter(
    (extension) =>
      featureKeys.has(extension.featureKey) &&
      (!extensionKey || extension.key === extensionKey)
  );
};

export const readTypeDefinitionsPayloads = (
  logicUnit: LogicUnitLike
): TypeDefinitionsPayload[] =>
  findTypeSystemExtensions(
    logicUnit,
    logicUnit,
    TYPE_SYSTEM_EXTENSION_KEYS.typeDefinitions
  )
    .map((extension) => extension.payload)
    .filter(isTypeDefinitionsPayload);

export const readPayloadTypePayloads = (
  logicUnit: LogicUnitLike,
  owner: WithLogicIRExtensions
): PayloadTypePayload[] =>
  findTypeSystemExtensions(
    logicUnit,
    owner,
    TYPE_SYSTEM_EXTENSION_KEYS.payloadType
  )
    .map((extension) => extension.payload)
    .filter(isPayloadTypePayload);

export const readFirstPayloadType = (
  logicUnit: LogicUnitLike,
  owner: WithLogicIRExtensions
): AlgebraicTypeExpression | undefined =>
  readPayloadTypePayloads(logicUnit, owner)[0]?.type;

const isTypeDefinitionsPayload = (
  value: unknown
): value is TypeDefinitionsPayload =>
  typeof value === 'object' &&
  value !== null &&
  'definitions' in value &&
  typeof (value as { definitions?: unknown }).definitions === 'object' &&
  (value as { definitions?: unknown }).definitions !== null;

const isPayloadTypePayload = (value: unknown): value is PayloadTypePayload =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  typeof (value as { type?: unknown }).type === 'object' &&
  (value as { type?: unknown }).type !== null;

