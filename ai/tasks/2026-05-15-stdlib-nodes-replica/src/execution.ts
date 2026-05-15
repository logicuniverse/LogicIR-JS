import type {
  EndpointRef,
  LogicUnit,
  LUITarget,
  PortKey,
} from '@logic-universe/logic-ir-core';
import type { LegacyStdlibNodeKey } from './catalog';
import {
  stdlibProviders,
  type ProviderContext,
} from './providers';
import {
  stdlibReplicaInterpretation,
  type InterpretationMetadata,
} from './catalog';

export type PortMapping = {
  portKey: string;
  payloadPath?: (string | number)[];
  targetPayloadPath?: (string | number)[];
};

export type ExecutionNode = {
  id: string;
  targetKey: LegacyStdlibNodeKey;
  inputMap: Record<string, PortMapping>;
  outputMap: Record<string, PortMapping>;
};

export type InterpreterPlan = {
  key: string;
  interpretation: InterpretationMetadata;
  inputPorts: string[];
  outputPorts: string[];
  nodes: ExecutionNode[];
};

export type ExecutionResult = {
  outputs: Record<string, unknown>;
  emitted: Record<string, unknown[]>;
  state: Record<string, unknown>;
};

const identityKey = (target: Extract<LUITarget, { kind: 'external' }>): string =>
  target.key;

const isLuEndpoint = (endpoint: EndpointRef): boolean =>
  endpoint.owner.kind === 'lu';

const isLuiEndpoint = (endpoint: EndpointRef, luiId: string): boolean =>
  endpoint.owner.kind === 'lui' && endpoint.owner.luiId === luiId;

const collectInputMap = (
  logicUnit: LogicUnit,
  luiId: string,
): Record<PortKey, PortMapping> => {
  const result: Record<PortKey, PortMapping> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (isLuEndpoint(connection.from) && isLuiEndpoint(connection.to, luiId)) {
      result[connection.to.portKey] = {
        portKey: connection.from.portKey,
        payloadPath: connection.from.payloadPath,
        targetPayloadPath: connection.to.payloadPath,
      };
    }
  }

  return result;
};

const collectOutputMap = (
  logicUnit: LogicUnit,
  luiId: string,
): Record<PortKey, PortMapping> => {
  const result: Record<PortKey, PortMapping> = {};

  for (const connection of Object.values(logicUnit.core.connections)) {
    if (isLuiEndpoint(connection.from, luiId) && isLuEndpoint(connection.to)) {
      result[connection.to.portKey] = {
        portKey: connection.from.portKey,
        payloadPath: connection.from.payloadPath,
        targetPayloadPath: connection.to.payloadPath,
      };
    }
  }

  return result;
};

const inputPorts = (logicUnit: LogicUnit): string[] =>
  Object.entries(logicUnit.core.ports)
    .filter(([, port]) => port.boundary === 'input')
    .map(([key]) => key);

const outputPorts = (logicUnit: LogicUnit): string[] =>
  Object.entries(logicUnit.core.ports)
    .filter(([, port]) => port.boundary === 'output')
    .map(([key]) => key);

export const compileLogicUnit = (logicUnit: LogicUnit): InterpreterPlan => ({
  key: 'stdlib-replica.execution-plan',
  interpretation: stdlibReplicaInterpretation,
  inputPorts: inputPorts(logicUnit),
  outputPorts: outputPorts(logicUnit),
  nodes: Object.entries(logicUnit.core.luis).map(([luiId, lui]) => {
    if (lui.target.kind !== 'external') {
      throw new Error(`Unsupported LUI target in stdlib replica: ${luiId}`);
    }

    return {
      id: luiId,
      targetKey: identityKey(lui.target) as LegacyStdlibNodeKey,
      inputMap: collectInputMap(logicUnit, luiId),
      outputMap: collectOutputMap(logicUnit, luiId),
    };
  }),
});

const readPayloadPath = (
  value: unknown,
  path: (string | number)[] | undefined,
): unknown => {
  let current = value;
  for (const segment of path ?? []) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = Array.isArray(current)
      ? current[Number(segment)]
      : (current as Record<string, unknown>)[String(segment)];
  }
  return current;
};

const mapInputs = (
  node: ExecutionNode,
  luInputs: Record<string, unknown>,
  outputs: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [nodeInput, source] of Object.entries(node.inputMap)) {
    const sourceValue =
      outputs[source.portKey] !== undefined
        ? outputs[source.portKey]
        : luInputs[source.portKey];
    result[nodeInput] = readPayloadPath(sourceValue, source.payloadPath);
  }
  return result;
};

const mapOutputs = (
  node: ExecutionNode,
  nodeOutputs: Record<string, unknown>,
  luOutputs: Record<string, unknown>,
): void => {
  for (const [luOutput, source] of Object.entries(node.outputMap)) {
    luOutputs[luOutput] = readPayloadPath(
      nodeOutputs[source.portKey],
      source.payloadPath,
    );
  }
};

export const createExecutionContext = (
  state: Map<string, unknown>,
  emitted: Record<string, unknown[]>,
  injected: Record<string, (inputs: Record<string, unknown>) => unknown> = {},
): ProviderContext => ({
  getState: (key) => state.get(key),
  setState: (key, value) => {
    state.set(key, value);
  },
  emit: (key, value) => {
    emitted[key] = [...(emitted[key] ?? []), value];
  },
  invoke: (key, inputs) => {
    const fn = injected[key];
    if (!fn) {
      throw new Error(`Missing injected callback ${key}`);
    }
    return fn(inputs);
  },
});

export const runPlan = async (
  plan: InterpreterPlan,
  inputs: Record<string, unknown>,
  state = new Map<string, unknown>(),
  injected: Record<string, (inputs: Record<string, unknown>) => unknown> = {},
): Promise<ExecutionResult> => {
  const outputs: Record<string, unknown> = {};
  const emitted: Record<string, unknown[]> = {};
  const context = createExecutionContext(state, emitted, injected);

  for (const node of plan.nodes) {
    const provider = stdlibProviders[node.targetKey];
    if (!provider) {
      throw new Error(`Missing provider ${node.targetKey}`);
    }

    const nodeOutputs = await provider(mapInputs(node, inputs, outputs), context);
    mapOutputs(node, nodeOutputs, outputs);
  }

  return {
    outputs,
    emitted,
    state: Object.fromEntries(state.entries()),
  };
};
