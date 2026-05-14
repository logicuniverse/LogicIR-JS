import type {
  Connection,
  EndpointRef,
  LUI,
  LUIId,
  LogicUnit,
  PayloadPath,
  Port,
  PortKey,
  PortOwner,
  SequentialLUCore,
} from '@logic-universe/logic-ir-core';

export type RuntimeError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type Option<T = unknown> =
  | { kind: 'some'; value: T }
  | { kind: 'nothing' };

export type Result<T = unknown> =
  | { kind: 'ok'; value: Option<T> }
  | { kind: 'error'; error: RuntimeError };

export type Completion<T = unknown> =
  | { kind: 'immediate'; result: Result<T> }
  | { kind: 'continuation'; then: (resolve: (result: Result<T>) => void) => void };

export type Packet<T = unknown> = {
  result: Result<T>;
  path?: PayloadPath;
};

export type RuntimeEvent =
  | {
      kind: 'emit';
      endpoint: EndpointRef;
      packet: Packet;
    }
  | {
      kind: 'lui-start' | 'lui-end';
      luiId: LUIId;
    }
  | {
      kind: 'diagnostic';
      message: string;
      details?: unknown;
    };

export type RuntimeProvider = (input: {
  inputs: Record<PortKey, Result>;
  emit: (portKey: PortKey, packet: Packet) => void;
  readState: (portKey: PortKey) => Result;
  target: LUI['target'];
  lui: LUI;
  luiId: LUIId;
}) => Completion;

export type ProviderRegistry = {
  resolveExternal: (
    namespace: string,
    key: string,
    version?: string
  ) => RuntimeProvider | undefined;
};

export type RuntimeOptions = {
  providers: ProviderRegistry;
  onEvent?: (event: RuntimeEvent) => void;
};

type StoreKey = string;

type RuntimeStore = {
  current: Map<StoreKey, Result>;
  temp: Map<StoreKey, Result>;
};

export const Some = <T>(value: T): Option<T> => ({ kind: 'some', value });

export const Nothing = (): Option => ({ kind: 'nothing' });

export const Ok = <T>(value: Option<T>): Result<T> => ({
  kind: 'ok',
  value,
});

export const Err = (message: string, details?: unknown): Result => ({
  kind: 'error',
  error: { message, details },
});

export const Immediate = <T>(result: Result<T>): Completion<T> => ({
  kind: 'immediate',
  result,
});

export const Continuation = <T>(
  then: (resolve: (result: Result<T>) => void) => void
): Completion<T> => ({
  kind: 'continuation',
  then,
});

export const completionToPromise = <T>(
  completion: Completion<T>
): Promise<Result<T>> => {
  if (completion.kind === 'immediate') {
    return Promise.resolve(completion.result);
  }
  return new Promise((resolve) => completion.then(resolve));
};

export const createProviderRegistry = (
  providers: Record<string, RuntimeProvider>
): ProviderRegistry => ({
  resolveExternal: (namespace, key, version) =>
    providers[providerIdentity(namespace, key, version)],
});

export const createSoftwareRuntime = (options: RuntimeOptions) => ({
  run: (unit: LogicUnit, inputs: Record<PortKey, Result> = {}) =>
    runLogicUnit(unit, inputs, options),
});

export const runLogicUnit = (
  unit: LogicUnit,
  inputs: Record<PortKey, Result>,
  options: RuntimeOptions
): Completion => {
  const store: RuntimeStore = {
    current: new Map(),
    temp: new Map(),
  };
  seedInputs(unit, store, inputs);
  if (unit.core.kindOrganization.kind === 'sequential') {
    return runSequential(unit, store, options);
  }
  if (unit.core.kindOrganization.kind === 'combinational') {
    return Immediate(readPrimaryOutput(unit, store, options));
  }
  if (unit.core.kindOrganization.kind === 'stateful') {
    initializeStatefulChildren(unit, store, options);
    return Immediate(readRetainedOutputObject(unit, store, options));
  }
  options.onEvent?.({
    kind: 'diagnostic',
    message: 'Structural composition execution is outside this runtime draft.',
  });
  return Immediate(Ok(Nothing()));
};

const runSequential = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions
): Completion => {
  const core = unit.core as SequentialLUCore;
  const runFromIndex = (index: number): Completion => {
    if (index >= core.kindOrganization.steps.length) {
      return Immediate(readPrimaryOutput(unit, store, options));
    }
    const luiId = core.kindOrganization.steps[index];
    const lui = core.luis[luiId];
    if (!lui) {
      return Immediate(Err(`Unknown sequential LUI '${luiId}'.`));
    }
    const completion = invokeLUI(unit, store, options, luiId, lui);
    if (completion.kind === 'immediate') {
      const result = completion.result;
      if (result.kind === 'error') {
        return Immediate(result);
      }
      writePrimaryLUIResult(unit, store, options, luiId, lui, result);
      return runFromIndex(index + 1);
    }
    return Continuation((resolve) => {
      completion.then((result) => {
        if (result.kind === 'error') {
          resolve(result);
          return;
        }
        writePrimaryLUIResult(unit, store, options, luiId, lui, result);
        completionToPromise(runFromIndex(index + 1)).then(resolve);
      });
    });
  };
  return runFromIndex(0);
};

const initializeStatefulChildren = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions
): void => {
  for (const [luiId, lui] of Object.entries(unit.core.luis)) {
    if (lui.kind !== 'stateful') {
      continue;
    }
    const completion = invokeLUI(unit, store, options, luiId, lui);
    if (completion.kind === 'immediate' && completion.result.kind === 'ok') {
      writeObjectToRetainedPorts(store, luiId, lui, completion.result);
    }
  }
};

const invokeLUI = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions,
  luiId: LUIId,
  lui: LUI
): Completion => {
  options.onEvent?.({ kind: 'lui-start', luiId });
  const inputs = readLUIInputs(unit, store, options, luiId, lui);
  const provider = resolveProvider(options.providers, lui);
  if (!provider) {
    return Immediate(
      Err('No provider for LUI target.', {
        luiId,
        target: lui.target,
      })
    );
  }
  const completion = provider({
    inputs,
    target: lui.target,
    lui,
    luiId,
    readState: (portKey) =>
      store.current.get(storeKey({ kind: 'lui', luiId }, portKey)) ??
      Ok(Nothing()),
    emit: (portKey, packet) => {
      dispatch(unit, store, options, { owner: { kind: 'lui', luiId }, portKey }, packet);
    },
  });
  if (completion.kind === 'immediate') {
    options.onEvent?.({ kind: 'lui-end', luiId });
    return completion;
  }
  return Continuation((resolve) => {
    completion.then((result) => {
      options.onEvent?.({ kind: 'lui-end', luiId });
      resolve(result);
    });
  });
};

const resolveProvider = (
  providers: ProviderRegistry,
  lui: LUI
): RuntimeProvider | undefined => {
  if (lui.target.kind !== 'external') {
    return undefined;
  }
  return providers.resolveExternal(
    lui.target.namespace,
    lui.target.key,
    lui.target.version
  );
};

const readLUIInputs = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions,
  luiId: LUIId,
  lui: LUI
): Record<PortKey, Result> => {
  const inputs: Record<PortKey, Result> = {};
  for (const [portKey, port] of Object.entries(lui.ports)) {
    if (port.boundary !== 'input') {
      continue;
    }
    if (!port.interaction.pullReadable && !port.interaction.retainedCurrent) {
      continue;
    }
    inputs[portKey] = readEndpoint(
      unit,
      store,
      options,
      {
        owner: { kind: 'lui', luiId },
        portKey,
      },
      port
    );
  }
  return inputs;
};

const readEndpoint = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions,
  endpoint: EndpointRef,
  port?: Port
): Result => {
  const current = store.current.get(storeKey(endpoint.owner, endpoint.portKey));
  if (current) {
    return readResultPath(current, endpoint.payloadPath ?? []);
  }
  const incoming = findIncomingConnections(unit, endpoint);
  if (incoming.length === 0) {
    return Ok(Nothing());
  }
  if (incoming.length > 1) {
    return Err('Multiple incoming connections for endpoint.', endpoint);
  }
  const connection = incoming[0];
  const sourcePort = getPort(unit, connection.from);
  const result = readSource(
    unit,
    store,
    options,
    connection.from,
    sourcePort
  );
  if (result.kind === 'error') {
    return result;
  }
  const sourceSelected = readResultPath(result, connection.from.payloadPath ?? []);
  if (sourceSelected.kind === 'error') {
    return sourceSelected;
  }
  const targetPath = endpoint.payloadPath ?? connection.to.payloadPath ?? [];
  if (targetPath.length === 0 || port?.pins === undefined) {
    return sourceSelected;
  }
  return sourceSelected;
};

const readSource = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions,
  endpoint: EndpointRef,
  port?: Port
): Result => {
  const key = storeKey(endpoint.owner, endpoint.portKey);
  const temp = store.temp.get(key);
  if (temp) {
    return readResultPath(temp, endpoint.payloadPath ?? []);
  }
  const retained = store.current.get(key);
  if (retained) {
    return readResultPath(retained, endpoint.payloadPath ?? []);
  }
  if (endpoint.owner.kind === 'lui') {
    const lui = unit.core.luis[endpoint.owner.luiId];
    if (!lui) {
      return Err(`Unknown source LUI '${endpoint.owner.luiId}'.`);
    }
    const completion = invokeLUI(unit, store, options, endpoint.owner.luiId, lui);
    if (completion.kind === 'continuation') {
      return Err('Cannot synchronously read continuation result.');
    }
    if (completion.result.kind === 'error') {
      return completion.result;
    }
    writePrimaryLUIResult(
      unit,
      store,
      options,
      endpoint.owner.luiId,
      lui,
      completion.result
    );
    const computed = store.temp.get(key) ?? completion.result;
    if (port?.interaction.retainedCurrent) {
      store.current.set(key, computed);
    }
    return readResultPath(computed, endpoint.payloadPath ?? []);
  }
  return Ok(Nothing());
};

const dispatch = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions,
  source: Omit<EndpointRef, 'payloadPath'>,
  packet: Packet
): void => {
  const sourcePort = getPort(unit, source);
  const sourceKey = storeKey(source.owner, source.portKey);
  if (sourcePort?.interaction.retainedCurrent) {
    store.current.set(sourceKey, packet.result);
  }
  options.onEvent?.({
    kind: 'emit',
    endpoint: source,
    packet,
  });
  for (const connection of Object.values(unit.core.connections)) {
    if (!sameEndpointBase(connection.from, source)) {
      continue;
    }
    const targetPort = getPort(unit, connection.to);
    if (targetPort?.interaction.pullReadable && !targetPort.interaction.pushNotifiable) {
      continue;
    }
    const remapped: Packet = {
      result: packet.result,
      path: [...(connection.to.payloadPath ?? []), ...(packet.path ?? [])],
    };
    store.current.set(storeKey(connection.to.owner, connection.to.portKey), remapped.result);
  }
};

const readPrimaryOutput = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions
): Result => {
  const primary = Object.entries(unit.core.ports).find(
    ([, port]) => port.role === 'primary-result'
  );
  if (primary) {
    const [portKey, port] = primary;
    return readEndpoint(
      unit,
      store,
      options,
      { owner: { kind: 'lu' }, portKey },
      port
    );
  }
  return readRetainedOutputObject(unit, store, options);
};

const readRetainedOutputObject = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions
): Result => {
  const result: Record<string, unknown> = {};
  for (const [portKey, port] of Object.entries(unit.core.ports)) {
    if (port.boundary !== 'output') {
      continue;
    }
    const value = readEndpoint(
      unit,
      store,
      options,
      { owner: { kind: 'lu' }, portKey },
      port
    );
    if (value.kind === 'error') {
      return value;
    }
    if (value.value.kind === 'some') {
      result[portKey] = value.value.value;
    }
  }
  if (Object.keys(result).length === 0) {
    return Ok(Nothing());
  }
  return Ok(Some(result));
};

const writePrimaryLUIResult = (
  unit: LogicUnit,
  store: RuntimeStore,
  options: RuntimeOptions,
  luiId: LUIId,
  lui: LUI,
  result: Result
): void => {
  const primary = Object.entries(lui.ports).find(
    ([, port]) => port.boundary === 'output' && port.role === 'primary-result'
  );
  if (!primary) {
    return;
  }
  const [portKey, port] = primary;
  const key = storeKey({ kind: 'lui', luiId }, portKey);
  store.temp.set(key, result);
  if (port.interaction.retainedCurrent) {
    store.current.set(key, result);
  }
  dispatch(
    unit,
    store,
    options,
    { owner: { kind: 'lui', luiId }, portKey },
    { result }
  );
};

const writeObjectToRetainedPorts = (
  store: RuntimeStore,
  luiId: LUIId,
  lui: LUI,
  result: Result
): void => {
  if (result.kind === 'error' || result.value.kind !== 'some') {
    return;
  }
  const value = result.value.value;
  if (!value || typeof value !== 'object') {
    return;
  }
  const objectValue = value as Record<string, unknown>;
  for (const [portKey, port] of Object.entries(lui.ports)) {
    if (port.boundary === 'output' && port.interaction.retainedCurrent) {
      if (Object.prototype.hasOwnProperty.call(objectValue, portKey)) {
        store.current.set(
          storeKey({ kind: 'lui', luiId }, portKey),
          Ok(Some(objectValue[portKey]))
        );
      }
    }
  }
};

const seedInputs = (
  unit: LogicUnit,
  store: RuntimeStore,
  inputs: Record<PortKey, Result>
): void => {
  for (const [portKey, result] of Object.entries(inputs)) {
    if (!unit.core.ports[portKey]) {
      continue;
    }
    store.current.set(storeKey({ kind: 'lu' }, portKey), result);
  }
};

const findIncomingConnections = (
  unit: LogicUnit,
  endpoint: EndpointRef
): Connection[] =>
  Object.values(unit.core.connections).filter((connection) =>
    sameEndpointBase(connection.to, endpoint)
  );

const getPort = (
  unit: LogicUnit,
  endpoint: Omit<EndpointRef, 'payloadPath'>
): Port | undefined => {
  if (endpoint.owner.kind === 'lu') {
    return unit.core.ports[endpoint.portKey];
  }
  if (endpoint.owner.kind === 'lui') {
    return unit.core.luis[endpoint.owner.luiId]?.ports[endpoint.portKey];
  }
  return unit.core.closures[endpoint.owner.closureId]?.core.ports[endpoint.portKey];
};

const sameEndpointBase = (
  a: Omit<EndpointRef, 'payloadPath'>,
  b: Omit<EndpointRef, 'payloadPath'>
): boolean =>
  a.portKey === b.portKey &&
  a.owner.kind === b.owner.kind &&
  ownerId(a.owner) === ownerId(b.owner);

const ownerId = (owner: PortOwner): string => {
  if (owner.kind === 'lu') {
    return 'lu';
  }
  if (owner.kind === 'lui') {
    return owner.luiId;
  }
  return owner.closureId;
};

const storeKey = (owner: PortOwner, portKey: PortKey): StoreKey =>
  `${owner.kind}:${ownerId(owner)}:${portKey}`;

const providerIdentity = (
  namespace: string,
  key: string,
  version?: string
): string => `${namespace}/${key}${version ? `@${version}` : ''}`;

const readResultPath = (result: Result, path: PayloadPath): Result => {
  if (path.length === 0 || result.kind === 'error') {
    return result;
  }
  if (result.value.kind === 'nothing') {
    return result;
  }
  let current: unknown = result.value.value;
  for (const segment of path) {
    if (current === null || current === undefined) {
      return Ok(Nothing());
    }
    if (typeof segment === 'number' && Array.isArray(current)) {
      current = current[segment];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[String(segment)];
    } else {
      return Ok(Nothing());
    }
  }
  if (current === undefined) {
    return Ok(Nothing());
  }
  return Ok(Some(current));
};
