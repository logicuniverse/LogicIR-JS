import type {
  CompletionPolicy,
  EndpointRef,
  ExtensionRecord,
  InterpreterPlan,
  LogicUnit,
  ResolvedStack,
} from './types';
import { baselineInterpretation, identityKey } from './types';

const requiredFeaturesPresent = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): boolean => {
  const declared = Object.values(logicUnit.features);

  return resolved.requiredFeatures.every((required) =>
    declared.some(
      (feature) =>
        feature.namespace === required.namespace &&
        feature.key === required.key &&
        feature.version === required.version,
    ),
  );
};

const inputKey = (endpoint: EndpointRef): string => {
  if (endpoint.port.kind !== 'input') {
    throw new Error('Expected an input endpoint.');
  }
  return endpoint.port.key;
};

const outputLikeKey = (endpoint: EndpointRef): string => {
  if (endpoint.port.kind === 'output') {
    return endpoint.port.key;
  }

  if (endpoint.port.kind === 'result') {
    const [first] = endpoint.payloadPath ?? [];
    return typeof first === 'string' ? first : 'result';
  }

  throw new Error('Expected an output or result endpoint.');
};

export const createInterpreterPlan = (
  logicUnit: LogicUnit,
  resolved: ResolvedStack,
): InterpreterPlan => {
  if (!requiredFeaturesPresent(logicUnit, resolved)) {
    throw new Error('LogicUnit is missing required completion feature.');
  }

  const entries = Object.entries(logicUnit.core.luis);

  if (entries.length !== 1) {
    throw new Error('S3 supports exactly one async provider LUI.');
  }

  const [luiId, lui] = entries[0];
  const completionExtension = lui.extensions?.find(
    (extension: ExtensionRecord) => extension.key === 'completion-policy',
  );

  if (!completionExtension) {
    throw new Error(`LUI ${luiId} is missing completion-policy extension.`);
  }

  const completion = completionExtension.payload as CompletionPolicy;

  const inputMap: Record<string, string> = {};
  const outputMap: Record<string, string> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (
      connection.from.owner.kind === 'boundary' &&
      connection.to.owner.kind === 'lui' &&
      connection.to.owner.luiId === luiId
    ) {
      inputMap[inputKey(connection.to)] = inputKey(connection.from);
    }

    if (
      connection.from.owner.kind === 'lui' &&
      connection.from.owner.luiId === luiId &&
      connection.to.owner.kind === 'boundary'
    ) {
      outputMap[outputLikeKey(connection.to)] = outputLikeKey(connection.from);
    }
  }

  return {
    key: 'async-double.interpreter-plan.s3',
    stackKey: resolved.stackKey,
    interpretation: baselineInterpretation('s3-awaited-provider-completion', [
      'Provider completion is represented as an explicit await-provider policy.',
      'Provider rejection is converted into a diagnostic result instead of being hidden as ordinary data flow.',
    ]),
    completion,
    node: {
      luiId,
      providerKey: identityKey(lui.target),
      inputMap,
      outputMap,
    },
    diagnostics: [],
  };
};
