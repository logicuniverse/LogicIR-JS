import type {
  CompositionLeaf,
  CompositionValue,
  Connection,
  EndpointRef,
  InputPortKey,
  LogicUnit,
  LUI,
  OutputPortKey,
  ResultPort,
  UnitFulfillment,
  SequentialLUCore,
  StatefulLUI,
  StructuralLUCore,
  StructuralLUI,
} from '@logic-universe/logic-ir-core';
import type {
  CoreExternalTargetRuntime,
  CoreInterpreterCatalog,
  CoreRuntimeInstance,
  CoreSoftwareInterpreter,
  RuntimeListener,
  RuntimeValue,
  StatefulTargetInstance,
  StatefulTargetRuntime,
  StructuralTargetRuntime,
} from './types.js';
import {
  getBoundaryInputContact,
  getBoundaryOutputContact,
  getEndpointKey,
  getExternalTargetCatalogKey,
  readCompositionValueShape,
  readPayloadPath,
} from './utils.js';

type StatefulChildRuntime = {
  lui: StatefulLUI;
  instance: StatefulTargetInstance;
  outputs: Map<OutputPortKey, RuntimeValue>;
  initialized: boolean;
};

type LUBackedLUI = LUI & {
  target: { kind: 'lu'; luId: string };
};

type RequirementBackedLUI = LUI & {
  target: {
    kind: 'requirement';
    serviceKey: string;
    unitKey: string;
  };
};

type InterpreterState = {
  logicUnit: LogicUnit;
  kind: LogicUnit['core']['kindOrganization']['kind'];
  catalog: CoreInterpreterCatalog;
  connectionsBySource: Map<string, Connection[]>;
  connectionByTarget: Map<string, Connection>;
  inputValues: Map<InputPortKey, RuntimeValue>;
  outletValues: Map<string, RuntimeValue>;
  outputValues: Map<OutputPortKey, RuntimeValue>;
  outputListeners: Map<OutputPortKey, Set<RuntimeListener>>;
  statefulChildren: Map<string, StatefulChildRuntime>;
};

export const createCoreRuntimeInstance = (
  logicUnit: LogicUnit,
  catalog: CoreInterpreterCatalog = {},
): CoreRuntimeInstance => {
  const state: InterpreterState = {
    logicUnit,
    kind: logicUnit.core.kindOrganization.kind,
    catalog,
    connectionsBySource: buildConnectionsBySource(logicUnit),
    connectionByTarget: buildConnectionByTarget(logicUnit),
    inputValues: new Map<InputPortKey, RuntimeValue>(),
    outletValues: new Map<string, RuntimeValue>(),
    outputValues: new Map<OutputPortKey, RuntimeValue>(),
    outputListeners: new Map<OutputPortKey, Set<RuntimeListener>>(),
    statefulChildren: new Map<string, StatefulChildRuntime>(),
  };

  const runtime: CoreRuntimeInstance = {
    logicUnit,
    kind: state.kind,
    setInputValue,
    pushInput,
    setOutletValue,
    readResult,
    readOutput,
    readAnchor,
    subscribeOutput,
  };

  createStatefulChildren();
  return runtime;

  function setInputValue(key: InputPortKey, value: RuntimeValue): void {
    const contact = getBoundaryInputContact(state.logicUnit, key);
    if (!contact) {
      throw new Error(`Unknown boundary input '${key}'.`);
    }
    if (contact === 'push') {
      throw new Error(
        `Boundary input '${key}' is push-only; use pushInput instead of setInputValue.`,
      );
    }

    state.inputValues.set(key, value);

    for (const [luiId, child] of state.statefulChildren.entries()) {
      if (!isBoundaryInputConnectedToLui(key, luiId)) {
        continue;
      }
      if (!child.initialized) {
        ensureStatefulChildInitialized(luiId);
      } else {
        child.instance.refreshInput?.(key);
      }
    }
  }

  function pushInput(key: InputPortKey, value: RuntimeValue): void {
    const contact = getBoundaryInputContact(state.logicUnit, key);
    if (!contact) {
      throw new Error(`Unknown boundary input '${key}'.`);
    }
    if (contact !== 'push') {
      throw new Error(
        `Boundary input '${key}' is not a push input; use setInputValue instead.`,
      );
    }

    dispatchFromSource(
      {
        owner: { kind: 'boundary' },
        port: { kind: 'input', key },
      },
      value,
    );
  }

  function setOutletValue(key: string, value: RuntimeValue): void {
    if (state.kind !== 'structural') {
      throw new Error('setOutletValue is only available for structural logic units.');
    }
    state.outletValues.set(key, value);
  }

  function readResult(): RuntimeValue | undefined {
    if (state.kind !== 'combinational' && state.kind !== 'sequential') {
      throw new Error(
        'readResult is only available for combinational or sequential logic units.',
      );
    }

    if (state.kind === 'sequential') {
      const sequentialCore = state.logicUnit.core as SequentialLUCore;
      const memo = new Map<string, RuntimeValue | undefined>();
      for (const step of sequentialCore.kindOrganization.steps) {
        const lui = sequentialCore.luis[step.luiId];
        if (!lui) {
          throw new Error(
            `Sequential step references missing LUI '${step.luiId}'.`,
          );
        }
        evaluateLui(step.luiId, lui, memo);
      }
      return readBoundaryResult(memo);
    }

    return readBoundaryResult(new Map<string, RuntimeValue | undefined>());
  }

  function readOutput(key: OutputPortKey): RuntimeValue | undefined {
    const contact = getBoundaryOutputContact(state.logicUnit, key);
    if (!contact) {
      throw new Error(`Unknown boundary output '${key}'.`);
    }

    ensureAllStatefulChildrenInitialized();

    if (state.outputValues.has(key)) {
      return state.outputValues.get(key);
    }

    const value = readEndpoint(
      {
        owner: { kind: 'boundary' },
        port: { kind: 'output', key },
      },
      new Map<string, RuntimeValue | undefined>(),
    );

    if (value !== undefined) {
      state.outputValues.set(key, value);
    }
    return value;
  }

  function readAnchor(key: string): RuntimeValue | undefined {
    if (state.kind !== 'structural') {
      throw new Error('readAnchor is only available for structural logic units.');
    }

    const structuralCore = state.logicUnit.core as StructuralLUCore;
    const fill = structuralCore.kindOrganization.anchorFills[key];
    if (!fill) {
      return undefined;
    }

    return resolveCompositionValue(
      fill,
      new Map<string, RuntimeValue | undefined>(),
    );
  }

  function subscribeOutput(
    key: OutputPortKey,
    listener: RuntimeListener,
  ): () => void {
    const contact = getBoundaryOutputContact(state.logicUnit, key);
    if (!contact) {
      throw new Error(`Unknown boundary output '${key}'.`);
    }

    const listeners =
      state.outputListeners.get(key) ?? new Set<RuntimeListener>();
    listeners.add(listener);
    state.outputListeners.set(key, listeners);

    if (contact === 'property' && state.outputValues.has(key)) {
      listener(state.outputValues.get(key));
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        state.outputListeners.delete(key);
      }
    };
  }

  function createStatefulChildren(): void {
    const luis = Object.entries(state.logicUnit.core.luis).filter(
      ([, lui]) => lui.kind === 'stateful',
    ) as Array<[string, StatefulLUI]>;

    for (const [luiId, lui] of luis) {
      const targetRuntime = resolveExternalTarget(lui) as StatefulTargetRuntime;
      if (targetRuntime.kind !== 'stateful') {
        throw new Error(
          `Stateful LUI '${luiId}' requires a stateful target runtime.`,
        );
      }

      const childOutputs = new Map<OutputPortKey, RuntimeValue>();
      const instance = targetRuntime.create({
        getInputValue: (key) => readLuiInputValue(luiId, key, new Map()),
        emitOutput: (key, value) => {
          childOutputs.set(key, value);
          dispatchFromSource(
            {
              owner: { kind: 'lui', luiId },
              port: { kind: 'output', key },
            },
            value,
          );
        },
        readOutput: (key) => childOutputs.get(key),
      });

      state.statefulChildren.set(luiId, {
        lui,
        instance,
        outputs: childOutputs,
        initialized: false,
      });
    }
  }

  function ensureStatefulChildInitialized(luiId: string): void {
    const child = state.statefulChildren.get(luiId);
    if (!child || child.initialized) {
      return;
    }
    child.instance.initialize();
    child.initialized = true;
  }

  function ensureAllStatefulChildrenInitialized(): void {
    for (const luiId of state.statefulChildren.keys()) {
      ensureStatefulChildInitialized(luiId);
    }
  }

  function readBoundaryResult(
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    return readEndpoint(
      {
        owner: { kind: 'boundary' },
        port: { kind: 'result' },
      },
      memo,
    );
  }

  function readEndpoint(
    endpoint: EndpointRef,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const endpointKey = getEndpointKey(endpoint);
    if (memo.has(endpointKey)) {
      return memo.get(endpointKey);
    }

    let value: RuntimeValue | undefined;

    if (endpoint.owner.kind === 'boundary') {
      value = readBoundaryEndpoint(endpoint, memo);
    } else if (endpoint.owner.kind === 'lui') {
      value = readLuiEndpoint(endpoint.owner.luiId, endpoint, memo);
    } else {
      throw new Error('Closure endpoint runtime is not implemented in this seed.');
    }

    memo.set(endpointKey, value);
    return value;
  }

  function readBoundaryEndpoint(
    endpoint: EndpointRef,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    if (endpoint.port.kind === 'input') {
      return readPayloadPath(
        state.inputValues.get(endpoint.port.key),
        endpoint.payloadPath,
      );
    }

    const connection = state.connectionByTarget.get(getEndpointKey(endpoint));
    if (!connection) {
      if (endpoint.port.kind === 'result') {
        return readPinnedBoundaryResult(endpoint, memo);
      }
      if (endpoint.port.kind === 'output') {
        return state.outputValues.get(endpoint.port.key);
      }
      return undefined;
    }

    return readEndpoint(connection.from, memo);
  }

  function readLuiEndpoint(
    luiId: string,
    endpoint: EndpointRef,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const lui = state.logicUnit.core.luis[luiId];
    if (!lui) {
      throw new Error(`Missing LUI '${luiId}'.`);
    }

    if (endpoint.port.kind === 'input') {
      return readLuiInputValue(
        luiId,
        endpoint.port.key,
        memo,
        endpoint.payloadPath,
      );
    }

    if (endpoint.port.kind === 'result') {
      const result = evaluateLui(luiId, lui, memo);
      return readPayloadPath(result, endpoint.payloadPath);
    }

    if (lui.kind === 'stateful') {
      ensureStatefulChildInitialized(luiId);
      const child = state.statefulChildren.get(luiId);
      return readPayloadPath(
        child?.outputs.get(endpoint.port.key),
        endpoint.payloadPath,
      );
    }

    throw new Error(
      `Output endpoint read is unsupported for ${lui.kind} LUI '${luiId}'.`,
    );
  }

  function readLuiInputValue(
    luiId: string,
    key: InputPortKey,
    memo: Map<string, RuntimeValue | undefined>,
    payloadPath?: EndpointRef['payloadPath'],
  ): RuntimeValue | undefined {
    const connection = state.connectionByTarget.get(
      getEndpointKey({
        owner: { kind: 'lui', luiId },
        port: { kind: 'input', key },
        payloadPath,
      }),
    );
    if (!connection) {
      return undefined;
    }
    return readEndpoint(connection.from, memo);
  }

  function evaluateLui(
    luiId: string,
    lui: LUI,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    if (lui.target.kind === 'requirement') {
      return evaluateRequirementLui(luiId, lui as RequirementBackedLUI, memo);
    }

    if (lui.target.kind === 'lu') {
      return evaluateNestedLogicUnitLui(luiId, lui as LUBackedLUI, memo);
    }

    const targetRuntime = resolveExternalTarget(lui);

    if (lui.kind === 'combinational') {
      if (targetRuntime.kind !== 'combinational') {
        throw new Error(
          `Combinational LUI '${luiId}' requires a combinational target runtime.`,
        );
      }
      return targetRuntime.evaluate(collectInputValues(luiId, lui, memo));
    }

    if (lui.kind === 'sequential') {
      if (targetRuntime.kind !== 'sequential') {
        throw new Error(
          `Sequential LUI '${luiId}' requires a sequential target runtime.`,
        );
      }
      return targetRuntime.execute(collectInputValues(luiId, lui, memo));
    }

    if (lui.kind === 'structural') {
      const outlets = evaluateStructuralLui(luiId, lui, memo);
      return outlets.root;
    }

    return undefined;
  }

  function evaluateNestedLogicUnitLui(
    luiId: string,
    lui: LUBackedLUI,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const nestedLogicUnit = state.catalog.logicUnits?.[lui.target.luId];
    if (!nestedLogicUnit) {
      throw new Error(
        `Missing nested LogicUnit '${lui.target.luId}' for LUI '${luiId}'.`,
      );
    }

    const nestedRuntime = createCoreRuntimeInstance(
      nestedLogicUnit,
      state.catalog,
    );
    const inputs = collectInputValues(luiId, lui, memo);

    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined) {
        nestedRuntime.setInputValue(key, value);
      }
    }

    return nestedRuntime.readResult();
  }

  function evaluateRequirementLui(
    luiId: string,
    lui: RequirementBackedLUI,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const fulfillment = lui.fulfillments[lui.target.serviceKey];
    if (!fulfillment) {
      throw new Error(
        `Requirement LUI '${luiId}' is missing fulfillment for service '${lui.target.serviceKey}'.`,
      );
    }

    if (fulfillment.kind !== 'independent-units') {
      throw new Error(
        `Requirement LUI '${luiId}' only supports independent-units in this seed.`,
      );
    }

    const unitFulfillment = fulfillment.units[lui.target.unitKey];
    if (!unitFulfillment) {
      throw new Error(
        `Requirement LUI '${luiId}' is missing unit fulfillment for '${lui.target.unitKey}'.`,
      );
    }

    if (unitFulfillment.kind === 'closure') {
      return evaluateRequirementClosureFulfillment(
        luiId,
        unitFulfillment.closureId,
        memo,
      );
    }

    return evaluateRequirementUpstreamFulfillment(
      luiId,
      unitFulfillment,
      memo,
    );
  }

  function evaluateRequirementClosureFulfillment(
    luiId: string,
    closureId: string,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const closure = state.logicUnit.core.closures[closureId];
    if (!closure) {
      throw new Error(
        `Missing closure '${closureId}' for requirement fulfillment on LUI '${luiId}'.`,
      );
    }

    const nestedLogicUnit: LogicUnit = {
      schemaVersion: state.logicUnit.schemaVersion,
      featureUses: {},
      requirements: {},
      core: closure.core,
    };

    const nestedRuntime = createCoreRuntimeInstance(
      nestedLogicUnit,
      state.catalog,
    );

    for (const inputKey of closure.forwardedPortKeys.inputs) {
      const value = readLuiInputValue(luiId, inputKey, memo);
      if (value !== undefined) {
        nestedRuntime.setInputValue(inputKey, value);
      }
    }

    return nestedRuntime.readResult();
  }

  function evaluateRequirementUpstreamFulfillment(
    luiId: string,
    fulfillment: UnitFulfillment,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    if (fulfillment.kind !== 'upstream-unit') {
      throw new Error(
        `Unsupported requirement unit fulfillment on LUI '${luiId}'.`,
      );
    }

    const targetLuiEntry = Object.entries(state.logicUnit.core.luis).find(
      ([candidateLuiId, candidateLui]) =>
        candidateLuiId !== luiId &&
        candidateLui.target.kind === 'requirement' &&
        candidateLui.target.serviceKey === fulfillment.supplierServiceKey &&
        candidateLui.target.unitKey === fulfillment.supplierUnitKey &&
        candidateLui.fulfillments[fulfillment.supplierServiceKey]?.kind ===
          'independent-units' &&
        candidateLui.fulfillments[fulfillment.supplierServiceKey]?.units[
          fulfillment.supplierUnitKey
        ]?.kind === 'closure',
    );

    if (!targetLuiEntry) {
      throw new Error(
        `Upstream requirement fulfillment for LUI '${luiId}' could not resolve supplier '${fulfillment.supplierServiceKey}.${fulfillment.supplierUnitKey}'.`,
      );
    }

    return evaluateLui(targetLuiEntry[0], targetLuiEntry[1], memo);
  }

  function readPinnedBoundaryResult(
    endpoint: EndpointRef,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    if (endpoint.payloadPath && endpoint.payloadPath.length > 0) {
      return undefined;
    }

    if (!('result' in state.logicUnit.core.ports)) {
      return undefined;
    }

    const resultPort = state.logicUnit.core.ports.result;
    if (!resultPort) {
      return undefined;
    }

    return materializePinnedResult(resultPort, endpoint, memo);
  }

  function materializePinnedResult(
    resultPort: ResultPort,
    endpoint: EndpointRef,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    if (!resultPort.pins) {
      return undefined;
    }

    if (resultPort.pins.kind === 'keyed') {
      const entries = resultPort.pins.keys.map(
        (key) =>
          [
            key,
            readEndpoint(
              {
                ...endpoint,
                payloadPath: [key],
              },
              memo,
            ),
          ] as const,
      );

      if (entries.every(([, value]) => value === undefined)) {
        return undefined;
      }

      return Object.fromEntries(entries);
    }

    const items = Array.from({ length: resultPort.pins.count }, (_, index) =>
      readEndpoint(
        {
          ...endpoint,
          payloadPath: [index],
        },
        memo,
      ),
    );

    if (items.every((value) => value === undefined)) {
      return undefined;
    }

    return items;
  }

  function evaluateStructuralLui(
    luiId: string,
    lui: StructuralLUI,
    memo: Map<string, RuntimeValue | undefined>,
  ): Record<string, RuntimeValue | undefined> {
    const targetRuntime = resolveExternalTarget(lui) as StructuralTargetRuntime;
    if (targetRuntime.kind !== 'structural') {
      throw new Error(
        `Structural LUI '${luiId}' requires a structural target runtime.`,
      );
    }

    const structuralCore = state.logicUnit.core as StructuralLUCore;
    const fills = structuralCore.kindOrganization.luiFills[luiId] ?? {};
    const anchors = Object.fromEntries(
      Object.keys(lui.compositionSurface.anchors).map((anchorKey) => [
        anchorKey,
        fills[anchorKey]
          ? resolveCompositionValue(fills[anchorKey], memo)
          : undefined,
      ]),
    );

    return targetRuntime.compose({
      inputs: collectInputValues(luiId, lui, memo),
      anchors,
    });
  }

  function collectInputValues(
    luiId: string,
    lui: Pick<LUI, 'ports'>,
    memo: Map<string, RuntimeValue | undefined>,
  ): Record<InputPortKey, RuntimeValue | undefined> {
    return Object.fromEntries(
      Object.keys(lui.ports.inputs).map((key) => [
        key,
        readLuiInputValue(luiId, key, memo),
      ]),
    );
  }

  function resolveExternalTarget(lui: LUI): CoreExternalTargetRuntime {
    if (lui.target.kind !== 'external') {
      throw new Error(
        'Only external targets can be resolved as external runtimes.',
      );
    }

    const runtime =
      state.catalog.targets?.[getExternalTargetCatalogKey(lui.target)];
    if (!runtime) {
      throw new Error(
        `Missing target runtime for ${getExternalTargetCatalogKey(lui.target)}.`,
      );
    }
    return runtime;
  }

  function dispatchFromSource(
    source: EndpointRef,
    value: RuntimeValue,
  ): void {
    const sourceKey = getEndpointKey(source);
    const connections = state.connectionsBySource.get(sourceKey) ?? [];

    for (const connection of connections) {
      deliverToEndpoint(connection.to, value);
    }
  }

  function deliverToEndpoint(
    target: EndpointRef,
    value: RuntimeValue,
  ): void {
    if (target.owner.kind === 'boundary') {
      if (target.port.kind !== 'output') {
        throw new Error(
          `Push delivery to boundary ${target.port.kind} is not supported.`,
        );
      }
      recordBoundaryOutput(target.port.key, value);
      return;
    }

    if (target.owner.kind !== 'lui' || target.port.kind !== 'input') {
      throw new Error(
        'Push delivery only supports LUI input or boundary output endpoints.',
      );
    }

    const lui = state.logicUnit.core.luis[target.owner.luiId];
    if (!lui) {
      throw new Error(`Missing LUI '${target.owner.luiId}'.`);
    }

    if (lui.kind === 'stateful') {
      const child = state.statefulChildren.get(target.owner.luiId);
      if (!child) {
        throw new Error(
          `Missing stateful child runtime for '${target.owner.luiId}'.`,
        );
      }
      ensureStatefulChildInitialized(target.owner.luiId);
      child.instance.pushInput(target.port.key, value);
      return;
    }

    throw new Error(
      `Push delivery to ${lui.kind} LUI '${target.owner.luiId}' is not implemented in this seed.`,
    );
  }

  function recordBoundaryOutput(
    key: OutputPortKey,
    value: RuntimeValue,
  ): void {
    state.outputValues.set(key, value);
    const listeners = state.outputListeners.get(key);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      listener(value);
    }
  }

  function isBoundaryInputConnectedToLui(
    key: InputPortKey,
    luiId: string,
  ): boolean {
    const sourceKey = getEndpointKey({
      owner: { kind: 'boundary' },
      port: { kind: 'input', key },
    });

    return (state.connectionsBySource.get(sourceKey) ?? []).some(
      (connection) =>
        connection.to.owner.kind === 'lui' &&
        connection.to.owner.luiId === luiId &&
        connection.to.port.kind === 'input',
    );
  }

  function resolveCompositionValue(
    value: CompositionValue,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const shape = readCompositionValueShape(value);

    if (shape === 'single') {
      return resolveCompositionLeaf(value as CompositionLeaf, memo);
    }

    if (shape === 'collection') {
      return value.kind === 'collection'
        ? value.items.map((item) => resolveCompositionLeaf(item, memo))
        : undefined;
    }

    if (value.kind !== 'map') {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(value.entries).map(([fieldKey, leaf]) => [
        fieldKey,
        resolveCompositionLeaf(leaf, memo),
      ]),
    );
  }

  function resolveCompositionLeaf(
    leaf: CompositionLeaf,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    if (leaf.kind === 'empty') {
      return undefined;
    }

    if (leaf.kind === 'outlet') {
      return state.outletValues.get(leaf.outletKey);
    }

    const lui = state.logicUnit.core.luis[leaf.luiId];
    if (!lui || lui.kind !== 'structural') {
      throw new Error(
        `Composition leaf references missing or non-structural LUI '${leaf.luiId}'.`,
      );
    }

    const outlets = evaluateStructuralLui(leaf.luiId, lui, memo);
    return outlets[leaf.outletKey];
  }
};

const buildConnectionsBySource = (
  logicUnit: LogicUnit,
): Map<string, Connection[]> => {
  const result = new Map<string, Connection[]>();

  for (const connection of Object.values(logicUnit.core.connections)) {
    const sourceKey = getEndpointKey(connection.from);
    const existing = result.get(sourceKey) ?? [];
    existing.push(connection);
    result.set(sourceKey, existing);
  }

  return result;
};

const buildConnectionByTarget = (
  logicUnit: LogicUnit,
): Map<string, Connection> => {
  const result = new Map<string, Connection>();

  for (const connection of Object.values(logicUnit.core.connections)) {
    result.set(getEndpointKey(connection.to), connection);
  }

  return result;
};

export const createCoreSoftwareInterpreter = (
  catalog: CoreInterpreterCatalog = {},
): CoreSoftwareInterpreter => ({
  instantiate: (logicUnit) => createCoreRuntimeInstance(logicUnit, catalog),
});
