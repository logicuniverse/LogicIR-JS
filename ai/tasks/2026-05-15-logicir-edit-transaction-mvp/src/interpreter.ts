import type { ExtensionRecord, LogicUnit } from '@logic-universe/logic-ir-core';
import type {
  InvocationPlan,
  JsonRecord,
  JsonValue,
  ProviderRegistry,
} from './types';

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readBindingKey = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) {
    return undefined;
  }

  return typeof payload.bindingKey === 'string' ? payload.bindingKey : undefined;
};

const isProviderBindingExtension = (extension: ExtensionRecord): boolean =>
  extension.featureKey === 'invocation' && extension.key === 'provider-binding';

export const projectInvocationPlan = (
  logicUnit: LogicUnit,
): InvocationPlan => {
  const externalEntries = Object.entries(logicUnit.core.luis).filter(([, lui]) =>
    lui.extensions?.some(isProviderBindingExtension),
  );

  if (externalEntries.length !== 1) {
    throw new Error('MVP invocation smoke requires exactly one provider-backed LUI.');
  }

  const [luiId, lui] = externalEntries[0];
  const binding = lui.extensions?.find(isProviderBindingExtension);
  const providerKey = readBindingKey(binding?.payload);

  if (!providerKey) {
    throw new Error('Provider-backed LUI is missing payload.bindingKey.');
  }

  const inputMap: Record<string, string> = {};
  const outputMap: Record<string, string> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (
      connection.from.owner.kind === 'lu' &&
      connection.to.owner.kind === 'lui' &&
      connection.to.owner.luiId === luiId
    ) {
      inputMap[connection.to.portKey] = connection.from.portKey;
    }

    if (
      connection.from.owner.kind === 'lui' &&
      connection.from.owner.luiId === luiId &&
      connection.to.owner.kind === 'lu'
    ) {
      outputMap[connection.to.portKey] = connection.from.portKey;
    }
  }

  return {
    providerKey,
    inputMap,
    outputMap,
  };
};

export const executeInvocationPlan = (
  plan: InvocationPlan,
  inputs: Record<string, JsonValue>,
  providers: ProviderRegistry,
): Record<string, JsonValue> => {
  const provider = providers[plan.providerKey];

  if (!provider) {
    throw new Error(`Missing provider ${plan.providerKey}.`);
  }

  const providerInputs: Record<string, JsonValue> = {};
  for (const [providerInputKey, logicInputKey] of Object.entries(plan.inputMap)) {
    providerInputs[providerInputKey] = inputs[logicInputKey];
  }

  const providerOutputs = provider(providerInputs);
  const outputs: Record<string, JsonValue> = {};

  for (const [logicOutputKey, providerOutputKey] of Object.entries(plan.outputMap)) {
    outputs[logicOutputKey] = providerOutputs[providerOutputKey];
  }

  return outputs;
};
