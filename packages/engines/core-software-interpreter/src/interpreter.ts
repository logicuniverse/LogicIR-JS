import type {
  Closure,
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
  CoreRunResult,
  NestedCoreRuntimeRunner,
  CoreRuntimeRunner,
  CoreSoftwareInterpreter,
  RuntimeListener,
  RuntimeValue,
  StatefulResponseHandle,
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

type ClosureChildRuntime = {
  closureId: string;
  closure: Closure;
  runtime: CoreRuntimeRunner;
  forwardedPushOutputUnsubscribes: Array<() => void>;
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
  closureChildren: Map<string, ClosureChildRuntime>;
};

export const createCoreRuntimeRunner = (
  logicUnit: LogicUnit,
  catalog: CoreInterpreterCatalog = {},
): CoreRuntimeRunner => {
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
    closureChildren: new Map<string, ClosureChildRuntime>(),
  };

  const runtime: CoreRuntimeRunner = {
    logicUnit,
    kind: state.kind,
    setInputCurrent,
    pushInput,
    applyOutlets,
    readResult,
    readOutput,
    readAnchor,
    subscribeOutput,
    run,
  };

  createStatefulChildren();
  return runtime;

  function setInputCurrent(key: InputPortKey, value: RuntimeValue): void {
    const contact = getBoundaryInputContact(state.logicUnit, key);
    if (!contact) {
      throw new Error(`Unknown boundary input '${key}'.`);
    }
    if (contact === 'push') {
      throw new Error(
        `Boundary input '${key}' is push-only; use pushInput instead of setInputCurrent.`,
      );
    }

    state.inputValues.set(key, value);

    for (const [luiId, child] of state.statefulChildren.entries()) {
      if (!isBoundaryInputConnectedToLui(key, luiId)) {
        continue;
      }
      if (child.initialized) {
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
        `Boundary input '${key}' is not a push input; use setInputCurrent instead.`,
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

  function applyOutlets(outlets: Record<string, RuntimeValue>): void {
    if (state.kind !== 'structural') {
      throw new Error('applyOutlets is only available for structural logic units.');
    }
    state.outletValues.clear();
    for (const [key, value] of Object.entries(outlets)) {
      state.outletValues.set(key, value);
    }
  }

  function run(): CoreRunResult {
    runPhaseA();

    const memo = new Map<string, RuntimeValue | undefined>();
    runPhaseB(memo);

    const initialObservation = runPhaseC(memo);
    if (state.kind !== 'stateful') {
      return { initialObservation };
    }

    return {
      initialObservation,
      handle: createStatefulResponseHandle(),
    };
  }

  function readResult(): RuntimeValue | undefined {
    if (state.kind !== 'combinational' && state.kind !== 'sequential') {
      throw new Error(
        'readResult is only available for combinational or sequential logic units.',
      );
    }

    runPhaseA();

    if (state.kind === 'sequential') {
      const memo = new Map<string, RuntimeValue | undefined>();
      runPhaseB(memo);
      return readBoundaryResult(memo);
    }

    return readBoundaryResult(new Map<string, RuntimeValue | undefined>());
  }

  function readOutput(key: OutputPortKey): RuntimeValue | undefined {
    const contact = getBoundaryOutputContact(state.logicUnit, key);
    if (!contact) {
      throw new Error(`Unknown boundary output '${key}'.`);
    }

    runPhaseA();
    return readBoundaryOutputValue(
      key,
      new Map<string, RuntimeValue | undefined>(),
    );
  }

  function readAnchor(key: string): RuntimeValue | undefined {
    if (state.kind !== 'structural') {
      throw new Error('readAnchor is only available for structural logic units.');
    }

    runPhaseA();
    return readAnchorValue(key, new Map<string, RuntimeValue | undefined>());
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
          const outputContact = lui.ports.outputs[key]?.contact;
          if (outputContact === 'property') {
            childOutputs.set(key, value);
          } else {
            childOutputs.delete(key);
          }
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

  function runPhaseA(): void {
    if (state.kind === 'combinational') {
      return;
    }

    ensureAllStatefulChildrenInitialized();
  }

  function runPhaseB(
    memo: Map<string, RuntimeValue | undefined>,
  ): void {
    if (state.kind !== 'sequential') {
      return;
    }

    const sequentialCore = state.logicUnit.core as SequentialLUCore;
    for (const step of sequentialCore.kindOrganization.steps) {
      const lui = sequentialCore.luis[step.luiId];
      if (!lui) {
        throw new Error(
          `Sequential step references missing LUI '${step.luiId}'.`,
        );
      }
      evaluateLui(step.luiId, lui, memo);
    }
  }

  function runPhaseC(
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    if (state.kind === 'combinational' || state.kind === 'sequential') {
      return readBoundaryResult(memo);
    }

    if (state.kind === 'structural') {
      const preferredAnchorKey = getPreferredStructuralAnchorKey();
      return preferredAnchorKey ? readAnchorValue(preferredAnchorKey, memo) : undefined;
    }

    return materializeStatefulObservation();
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
      value = readClosureEndpoint(
        {
          ...endpoint,
          owner: {
            kind: 'closure',
            closureId: endpoint.owner.closureId,
          },
        },
        memo,
      );
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
        const contact = getBoundaryOutputContact(
          state.logicUnit,
          endpoint.port.key,
        );
        if (contact === 'push') {
          throw new Error(
            `Boundary output '${endpoint.port.key}' is push-only and cannot be read as current.`,
          );
        }
        return state.outputValues.get(endpoint.port.key);
      }
      return undefined;
    }

    return readEndpoint(connection.from, memo);
  }

  function readBoundaryOutputValue(
    key: OutputPortKey,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const contact = getBoundaryOutputContact(state.logicUnit, key);
    if (contact !== 'property') {
      throw new Error(
        `Boundary output '${key}' is ${contact ?? 'unknown'} and cannot be read as current; use subscribeOutput for push outputs.`,
      );
    }

    if (state.outputValues.has(key)) {
      return state.outputValues.get(key);
    }

    const value = readEndpoint(
      {
        owner: { kind: 'boundary' },
        port: { kind: 'output', key },
      },
      memo,
    );

    if (value !== undefined) {
      state.outputValues.set(key, value);
    }

    return value;
  }

  function readClosureEndpoint(
    endpoint: EndpointRef & { owner: { kind: 'closure'; closureId: string } },
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const { closureId } = endpoint.owner;
    const child = getClosureChildRuntime(closureId);

    if (endpoint.port.kind === 'input') {
      return readClosureInputValue(
        closureId,
        endpoint.port.key,
        memo,
        endpoint.payloadPath,
      );
    }

    if (endpoint.port.kind === 'result') {
      if (!('result' in child.runtime.logicUnit.core.ports)) {
        return undefined;
      }

      prepareClosureBoundaryInputs(child, memo);
      return readPayloadPath(
        readNestedScopeInitialObservation(child.runtime),
        endpoint.payloadPath,
      );
    }

    return readClosureOutputValue(
      child,
      endpoint.port.key,
      memo,
      endpoint.payloadPath,
    );
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
      const outputContact = lui.ports.outputs[endpoint.port.key]?.contact;
      if (outputContact === 'push') {
        throw new Error(
          `Push output endpoint read is unsupported for stateful LUI '${luiId}'.`,
        );
      }
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

  function readClosureInputValue(
    closureId: string,
    key: InputPortKey,
    memo: Map<string, RuntimeValue | undefined>,
    payloadPath?: EndpointRef['payloadPath'],
  ): RuntimeValue | undefined {
    const connection = state.connectionByTarget.get(
      getEndpointKey({
        owner: { kind: 'closure', closureId },
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

    const nestedRuntime = createCoreRuntimeRunner(
      nestedLogicUnit,
      state.catalog,
    );
    const inputs = collectInputValues(luiId, lui, memo);

    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined) {
        nestedRuntime.setInputCurrent(key, value);
      }
    }

    return readNestedScopeInitialObservation(nestedRuntime);
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

    const nestedRuntime = createCoreRuntimeRunner(
      nestedLogicUnit,
      state.catalog,
    );

    for (const inputKey of closure.forwardedPortKeys.inputs) {
      const value = readLuiInputValue(luiId, inputKey, memo);
      if (value !== undefined) {
        nestedRuntime.setInputCurrent(inputKey, value);
      }
    }

    return readNestedScopeInitialObservation(nestedRuntime);
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

    if (target.owner.kind === 'closure') {
      if (target.port.kind !== 'input') {
        throw new Error(
          'Push delivery to closure only supports forwarded closure inputs.',
        );
      }

      const child = getClosureChildRuntime(target.owner.closureId);
      if (!child.closure.forwardedPortKeys.inputs.includes(target.port.key)) {
        throw new Error(
          `Closure '${target.owner.closureId}' does not forward input '${target.port.key}'.`,
        );
      }

      const contact = getBoundaryInputContact(
        child.runtime.logicUnit,
        target.port.key,
      );
      if (contact !== 'push') {
        throw new Error(
          `Closure input '${target.owner.closureId}.${target.port.key}' is not push and cannot receive push delivery.`,
        );
      }

      child.runtime.pushInput(target.port.key, value);
      return;
    }

    if (target.owner.kind !== 'lui' || target.port.kind !== 'input') {
      throw new Error(
        'Push delivery only supports LUI input, closure input, or boundary output endpoints.',
      );
    }

    const lui = state.logicUnit.core.luis[target.owner.luiId];
    if (!lui) {
      throw new Error(`Missing LUI '${target.owner.luiId}'.`);
    }

    const inputContact = lui.ports.inputs[target.port.key]?.contact;
    if (inputContact !== 'push') {
      throw new Error(
        `LUI input '${target.owner.luiId}.${target.port.key}' is not push and cannot receive push delivery.`,
      );
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
    const contact = getBoundaryOutputContact(state.logicUnit, key);
    if (!contact) {
      throw new Error(`Unknown boundary output '${key}'.`);
    }

    if (contact === 'property') {
      state.outputValues.set(key, value);
    } else {
      state.outputValues.delete(key);
    }

    const listeners = state.outputListeners.get(key);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      listener(value);
    }
  }

  function getClosureChildRuntime(closureId: string): ClosureChildRuntime {
    const existing = state.closureChildren.get(closureId);
    if (existing) {
      return existing;
    }

    const closure = state.logicUnit.core.closures[closureId];
    if (!closure) {
      throw new Error(`Missing closure '${closureId}'.`);
    }

    const runtime = createCoreRuntimeRunner(
      createClosureLogicUnit(closure),
      state.catalog,
    );

    const forwardedPushOutputUnsubscribes = closure.forwardedPortKeys.pushOutputs.map(
      (key) => {
        const contact = getBoundaryOutputContact(runtime.logicUnit, key);
        if (contact !== 'push') {
          throw new Error(
            `Closure '${closureId}' can only forward push outputs, but '${key}' is ${contact ?? 'missing'}.`,
          );
        }

        return runtime.subscribeOutput(key, (emittedValue) => {
          dispatchFromSource(
            {
              owner: { kind: 'closure', closureId },
              port: { kind: 'output', key },
            },
            emittedValue,
          );
        });
      },
    );

    const child: ClosureChildRuntime = {
      closureId,
      closure,
      runtime,
      forwardedPushOutputUnsubscribes,
    };
    state.closureChildren.set(closureId, child);
    return child;
  }

  function createClosureLogicUnit(closure: Closure): LogicUnit {
    return {
      schemaVersion: state.logicUnit.schemaVersion,
      featureUses: state.logicUnit.featureUses,
      requirements: state.logicUnit.requirements,
      core: closure.core,
    };
  }

  function prepareClosureBoundaryInputs(
    child: ClosureChildRuntime,
    memo: Map<string, RuntimeValue | undefined>,
  ): void {
    for (const inputKey of child.closure.forwardedPortKeys.inputs) {
      const contact = getBoundaryInputContact(child.runtime.logicUnit, inputKey);
      if (!contact) {
        throw new Error(
          `Closure '${child.closureId}' forwards missing input '${inputKey}'.`,
        );
      }
      if (contact === 'push') {
        continue;
      }

      child.runtime.setInputCurrent(
        inputKey,
        readClosureInputValue(child.closureId, inputKey, memo),
      );
    }
  }

  function readClosureOutputValue(
    child: ClosureChildRuntime,
    key: OutputPortKey,
    memo: Map<string, RuntimeValue | undefined>,
    payloadPath?: EndpointRef['payloadPath'],
  ): RuntimeValue | undefined {
    if (!child.closure.forwardedPortKeys.pushOutputs.includes(key)) {
      throw new Error(
        `Closure '${child.closureId}' does not forward output '${key}'.`,
      );
    }

    const contact = getBoundaryOutputContact(child.runtime.logicUnit, key);
    if (contact === 'push') {
      throw new Error(
        `Closure output '${child.closureId}.${key}' is push-only and cannot be read as current.`,
      );
    }

    prepareClosureBoundaryInputs(child, memo);
    return readPayloadPath(child.runtime.readOutput(key), payloadPath);
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

  function getPreferredStructuralAnchorKey(): string | undefined {
    const structuralCore = state.logicUnit.core as StructuralLUCore;
    return 'root' in structuralCore.kindOrganization.anchors
      ? 'root'
      : Object.keys(structuralCore.kindOrganization.anchors)[0];
  }

  function readAnchorValue(
    key: string,
    memo: Map<string, RuntimeValue | undefined>,
  ): RuntimeValue | undefined {
    const structuralCore = state.logicUnit.core as StructuralLUCore;
    const fill = structuralCore.kindOrganization.anchorFills[key];
    if (!fill) {
      return undefined;
    }

    return resolveCompositionValue(fill, memo);
  }

  function readNestedScopeInitialObservation(
    nestedRuntime: NestedCoreRuntimeRunner,
  ): RuntimeValue | undefined {
    return nestedRuntime.run().initialObservation;
  }

  function materializeStatefulObservation(): RuntimeValue | undefined {
    if (!('outputs' in state.logicUnit.core.ports)) {
      return undefined;
    }

    const propertyOutputKeys = Object.entries(state.logicUnit.core.ports.outputs)
      .filter(([, port]) => port.contact === 'property')
      .map(([key]) => key);
    if (propertyOutputKeys.length === 0) {
      return undefined;
    }

    if (propertyOutputKeys.length === 1) {
      return readBoundaryOutputValue(
        propertyOutputKeys[0],
        new Map<string, RuntimeValue | undefined>(),
      );
    }

    return Object.fromEntries(
      propertyOutputKeys.map((key) => [
        key,
        readBoundaryOutputValue(
          key,
          new Map<string, RuntimeValue | undefined>(),
        ),
      ]),
    );
  }

  function createStatefulResponseHandle(): StatefulResponseHandle {
    return {
      logicUnit,
      pushInput,
      readOutput,
      subscribeOutput,
    };
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
  manifest: (logicUnit) => createCoreRuntimeRunner(logicUnit, catalog),
});
