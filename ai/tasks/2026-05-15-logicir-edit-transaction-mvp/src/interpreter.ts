import type { LogicUnit, LUITarget } from '@logic-universe/logic-ir-core';
import type { EndpointRef } from '@logic-universe/logic-ir-core';
import type {
  ExecutionBinding,
  InvocationPlan,
  JsonValue,
  ProviderRegistry,
} from './types';

const targetMatchesBinding = (
  target: Extract<LUITarget, { kind: 'external' }>,
  binding: ExecutionBinding,
): boolean =>
  binding.subject.kind === 'external-target' &&
  binding.subject.namespace === target.namespace &&
  binding.subject.key === target.key &&
  (!binding.subject.version || binding.subject.version === target.version);

export const projectInvocationPlan = (
  logicUnit: LogicUnit,
  executionBindings: readonly ExecutionBinding[],
): InvocationPlan => {
  const externalEntries = Object.entries(logicUnit.core.luis).filter(([, lui]) =>
    lui.target.kind === 'external',
  );

  if (externalEntries.length !== 1) {
    throw new Error('MVP invocation smoke requires exactly one external-target LUI.');
  }

  const [luiId, lui] = externalEntries[0];
  if (lui.target.kind !== 'external') {
    throw new Error('MVP invocation smoke supports only external-target LUI.');
  }
  const binding = executionBindings.find((entry) =>
    targetMatchesBinding(lui.target, entry),
  );

  if (!binding) {
    throw new Error('External-target LUI is missing an execution binding.');
  }

  const inputMap: Record<string, string> = {};
  const outputMap: Record<string, string> = {};

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
    providerKey: binding.providerKey,
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
