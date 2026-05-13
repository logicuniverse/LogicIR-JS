/**
 * Minimal target lowering artifacts from draft target plans.
 *
 * These lowerings are intentionally conservative. They prove that target plans
 * can become concrete target artifacts, but they are not full runtimes or HDL
 * generators yet.
 */

import type {
  HDLSliceInterfacePlan,
  HDLStructuralSlicePlan,
  HDLSignalPlan,
  JSRuntimePlan,
  PlannedConnection,
  PlannedCore,
  PlannedEndpoint,
  PlannedExtension,
  PythonRuntimePlan,
  VerilogHDLPlan,
} from './target-plans';

export type SourceArtifact = {
  kind: 'source';
  language: 'javascript' | 'python' | 'verilog';
  filename: string;
  content: string;
};

export function lowerJSRuntimeSkeleton(plan: JSRuntimePlan): SourceArtifact {
  return {
    kind: 'source',
    language: 'javascript',
    filename: 'logicir-runtime-plan.mjs',
    content: [
      'export const logicIRRuntimePlan = ',
      `${JSON.stringify(
        {
          target: plan.target,
          schemaVersion: plan.schemaVersion,
          core: summarizeCore(plan.core),
          policies: summarizePolicies(plan.policies),
        },
        null,
        2
      )};`,
      '',
      'export function createRuntimeSkeleton(host) {',
      '  return {',
      '    plan: logicIRRuntimePlan,',
      '    invoke(inputs = {}) {',
      '      if (!host || typeof host.invoke !== "function") {',
      '        throw new Error("LogicIR JS skeleton requires host.invoke(plan, inputs).");',
      '      }',
      '      return host.invoke(logicIRRuntimePlan, inputs);',
      '    }',
      '  };',
      '}',
      '',
    ].join('\n'),
  };
}

export function lowerJSExecutableRuntime(plan: JSRuntimePlan): SourceArtifact {
  return {
    kind: 'source',
    language: 'javascript',
    filename: 'logicir-runtime-executable.mjs',
    content: [
      'export const logicIRRuntimePlan = ',
      `${JSON.stringify(
        {
          target: plan.target,
          schemaVersion: plan.schemaVersion,
          core: plan.core,
          policies: plan.policies,
        },
        null,
        2
      )};`,
      '',
      'export function createRuntime(host) {',
      '  const implementations = host?.implementations ?? {};',
      '  const fulfillments = host?.fulfillments ?? {};',
      '  const hostRetainedCurrent = host?.retainedCurrent ?? {};',
      '  const lifecycle = host?.lifecycle ?? {};',
      '  const emitError = host?.emitError;',
      '  const retainedValues = new Map();',
      '  const retainedSubscriptions = [];',
      '  let lifecycleStarted = false;',
      '  let retainedSubscriptionsStarted = false;',
      '  return {',
      '    plan: logicIRRuntimePlan,',
      '    async invoke(inputs = {}) {',
      '      assertSupportedJSRuntimePolicies(logicIRRuntimePlan.policies, fulfillments, lifecycle, emitError);',
      '      if (!retainedSubscriptionsStarted) {',
      '        startRetainedCurrentSubscriptions(logicIRRuntimePlan.core, logicIRRuntimePlan.policies, retainedValues, hostRetainedCurrent, retainedSubscriptions);',
      '        retainedSubscriptionsStarted = true;',
      '      }',
      '      if (!lifecycleStarted) {',
      '        await runLifecycleHooks(logicIRRuntimePlan.policies, lifecycle, ["mount", "start"]);',
      '        lifecycleStarted = true;',
      '      }',
      '      return executeCore(logicIRRuntimePlan.core, inputs, implementations, fulfillments, logicIRRuntimePlan.policies, retainedValues, hostRetainedCurrent, emitError);',
      '    },',
      '    async dispose() {',
      '      assertSupportedJSRuntimePolicies(logicIRRuntimePlan.policies, fulfillments, lifecycle, emitError);',
      '      stopRetainedCurrentSubscriptions(retainedSubscriptions);',
      '      retainedSubscriptionsStarted = false;',
      '      if (!lifecycleStarted) return;',
      '      await runLifecycleHooks(logicIRRuntimePlan.policies, lifecycle, ["stop", "dispose"]);',
      '      lifecycleStarted = false;',
      '    },',
      '  };',
      '}',
      '',
      'async function executeCore(core, inputs, implementations, fulfillments, policies, retainedValues, hostRetainedCurrent, emitError) {',
      '  if (core.kind !== "combinational" && core.kind !== "sequential" && core.kind !== "stateful") {',
      '    throw new Error(`Executable JS lowering currently supports combinational, sequential, and stateful cores only, got ${core.kind}.`);',
      '  }',
      '  const values = new Map();',
      '  const fulfillmentSnapshot = new Map();',
      '  for (const [portKey, value] of Object.entries(inputs)) {',
      '    values.set(`lu:${portKey}:`, value);',
      '  }',
      '  seedRetainedValues(core, values, retainedValues, hostRetainedCurrent, policies);',
      '  propagate(core, values);',
      '  if (core.kind === "sequential") {',
      '    await executeSequentialCore(core, values, implementations, fulfillments, policies, emitError, fulfillmentSnapshot);',
      '  } else if (core.kind === "stateful") {',
      '    await executeStatefulCore(core, values, implementations, fulfillments, policies, emitError, fulfillmentSnapshot);',
      '  } else {',
      '    await executeCombinationalCore(core, values, implementations, fulfillments, policies, emitError, fulfillmentSnapshot);',
      '  }',
      '  propagate(core, values);',
      '  const result = {};',
      '  for (const [portKey, port] of Object.entries(core.ports)) {',
      '    if (port.boundary === "output") {',
      '      const key = `lu:${portKey}:`;',
      '      if (values.has(key)) result[portKey] = values.get(key);',
      '    }',
      '  }',
      '  storeRetainedValues(core, values, retainedValues, policies);',
      '  return result;',
      '}',
      '',
      'async function executeCombinationalCore(core, values, implementations, fulfillments, policies, emitError, fulfillmentSnapshot) {',
      '  const pending = Object.entries(core.luis);',
      '  const completed = new Set();',
      '  let progressed = true;',
      '  while (completed.size < pending.length && progressed) {',
      '    progressed = false;',
      '    for (const [luiId, lui] of pending) {',
      '      if (completed.has(luiId)) continue;',
      '      const executed = await executeReadyLUI(core, luiId, lui, values, implementations, fulfillments, policies, emitError, { fulfillmentSnapshot });',
      '      if (!executed) continue;',
      '      completed.add(luiId);',
      '      progressed = true;',
      '    }',
      '  }',
      '  if (completed.size < pending.length) {',
      '    throw new Error("Combinational execution stalled before all LUIs completed.");',
      '  }',
      '}',
      '',
      'async function executeSequentialCore(core, values, implementations, fulfillments, policies, emitError, fulfillmentSnapshot) {',
      '  const steps = core.organization.steps ?? [];',
      '  for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {',
      '    const luiId = steps[stepIndex];',
      '    const lui = core.luis[luiId];',
      '    if (!lui) throw new Error(`Sequential step references missing LUI ${luiId}.`);',
      '    const executed = await executeReadyLUI(core, luiId, lui, values, implementations, fulfillments, policies, emitError, { stepIndex, fulfillmentSnapshot });',
      '    if (!executed) throw new Error(`Sequential step ${luiId} is not ready.`);',
      '  }',
      '}',
      '',
      'async function executeStatefulCore(core, values, implementations, fulfillments, policies, emitError, fulfillmentSnapshot) {',
      '  for (const [luiId, lui] of Object.entries(core.luis)) {',
      '    const executed = await executeReadyLUI(core, luiId, lui, values, implementations, fulfillments, policies, emitError, { requireAllInputs: false, fulfillmentSnapshot });',
      '    if (!executed) throw new Error(`Stateful LUI ${luiId} is missing required pull-readable inputs.`);',
      '  }',
      '}',
      '',
      'async function executeReadyLUI(core, luiId, lui, values, implementations, fulfillments, policies, emitError, options = { requireAllInputs: true }) {',
      '  const inputPorts = Object.entries(lui.ports).filter(([, port]) => port.boundary === "input");',
      '  const luiInputs = {};',
      '  for (const [portKey, port] of inputPorts) {',
      '    const key = `lui:${luiId}:${portKey}:`;',
      '    if (!values.has(key)) {',
      '      if (options.requireAllInputs || port.interaction?.pullReadable) return false;',
      '      continue;',
      '    }',
      '    luiInputs[portKey] = values.get(key);',
      '  }',
      '  const impl = implementationFor(implementations, fulfillments, luiId, lui.target, options.fulfillmentSnapshot);',
      '  if (typeof impl !== "function") {',
      '    throw new Error(`Missing implementation for LUI ${luiId}.`);',
      '  }',
      '  const asyncPolicy = selectJSAsyncPolicy(policies, luiId, options.stepIndex);',
      '  const invocation = asyncPolicy?.payload?.invocation;',
      '  const errorPolicy = selectJSErrorPolicy(policies, luiId);',
      '  let outputs;',
      '  try {',
      '    const context = {',
      '      luiId,',
      '      lui,',
      '      target: lui.target,',
      '      retainedCurrent: retainedCurrentForLUI(luiId, lui, values, policies),',
      '    };',
      '    const produced = impl(luiInputs, context);',
      '    if (invocation === "sync" && isThenable(produced)) {',
      '      throw new Error(`LUI ${luiId} declared sync invocation but returned a Promise-like value.`);',
      '    }',
      '    outputs = invocation === "async-iterator"',
      '      ? await consumeAsyncIteratorOutput(produced, luiId)',
      '      : await produced;',
      '  } catch (error) {',
      '    const onThrow = errorPolicy?.payload?.onThrow;',
      '    if (!errorPolicy || onThrow === "reject") throw error;',
      '    if (onThrow === "use-error-port") {',
      '      outputs = errorOutputForPolicy(errorPolicy, lui, error, luiId);',
      '    } else if (onThrow === "emit-error") {',
      '      await emitError({ luiId, lui, target: lui.target, policy: errorPolicy, error: normalizeError(error) });',
      '      outputs = {};',
      '    } else {',
      '      throw new Error(`Executable JS lowering does not support error policy ${onThrow} for LUI ${luiId}.`);',
      '    }',
      '  }',
      '  for (const [portKey, value] of Object.entries(outputs ?? {})) {',
      '    values.set(`lui:${luiId}:${portKey}:`, value);',
      '  }',
      '  propagate(core, values);',
      '  return true;',
      '}',
      '',
      'function assertSupportedJSRuntimePolicies(policies, fulfillments, lifecycle, emitError) {',
      '  for (const policy of policies?.async ?? []) {',
      '    if (policy.requirement !== "required") continue;',
      '    const payload = policy.payload ?? {};',
      '    if (payload.awaitBeforeNext === false) {',
      '      throw new Error("Executable JS lowering requires awaitBeforeNext for ordered execution.");',
      '    }',
      '  }',
      '  for (const policy of policies?.dynamicFulfillment ?? []) {',
      '    if (policy.requirement !== "required") continue;',
      '    const payload = policy.payload ?? {};',
      '    const supported =',
      '      (payload.consistency === "no-live-switch" && ["static-at-startup", "late-bound"].includes(payload.mode)) ||',
      '      (payload.mode === "switchable" && ["quiescent-switch", "transactional-switch"].includes(payload.consistency));',
      '    if (!supported) {',
      '      throw new Error("Executable JS lowering currently supports only required static-at-startup/no-live-switch, late-bound/no-live-switch, or switchable quiescent/transactional dynamic fulfillment.");',
      '    }',
      '    if (!hasFulfillmentBinding(fulfillments, payload.selector)) {',
      '      throw new Error("Executable JS lowering requires host.fulfillments evidence for required static dynamic fulfillment.");',
      '    }',
      '  }',
      '  for (const policy of policies?.retainedCurrent ?? []) {',
      '    if (policy.requirement !== "required") continue;',
      '    const payload = policy.payload ?? {};',
      '    const supported = ["source-store", "sink-cache", "host-observable", "projector-adapter"];',
      '    if (payload.realization && !supported.includes(payload.realization)) {',
      '      throw new Error("Executable JS lowering currently supports required source-store, sink-cache, host-observable, or projector-adapter retained-current realization.");',
      '    }',
      '  }',
      '  for (const policy of policies?.error ?? []) {',
      '    if (policy.requirement !== "required") continue;',
      '    const payload = policy.payload ?? {};',
      '    if (payload.onThrow && !["reject", "use-error-port", "emit-error"].includes(payload.onThrow)) {',
      '      throw new Error("Executable JS lowering currently supports only required reject, use-error-port, or emit-error error policy.");',
      '    }',
      '    if (payload.onThrow === "use-error-port" && !payload.selector?.portKey) {',
      '      throw new Error("Executable JS lowering requires selector.portKey for required use-error-port policies.");',
      '    }',
      '    if (payload.onThrow === "emit-error" && typeof emitError !== "function") {',
      '      throw new Error("Executable JS lowering requires host.emitError for required emit-error policies.");',
      '    }',
      '  }',
      '  for (const policy of policies?.lifecycle ?? []) {',
      '    if (policy.requirement !== "required") continue;',
      '    const payload = policy.payload ?? {};',
      '    for (const hook of payload.hooks ?? []) {',
      '      if (typeof lifecycle?.[hook] !== "function") {',
      '        throw new Error(`Executable JS lowering requires host lifecycle hook ${hook}.`);',
      '      }',
      '    }',
      '  }',
      '}',
      '',
      'async function runLifecycleHooks(policies, lifecycle, phases) {',
      '  for (const phase of phases) {',
      '    for (const policy of policies?.lifecycle ?? []) {',
      '      if (policy.requirement !== "required") continue;',
      '      const hooks = policy.payload?.hooks ?? [];',
      '      if (!hooks.includes(phase)) continue;',
      '      await lifecycle[phase]({ policy, phase });',
      '    }',
      '  }',
      '}',
      '',
      'function hasFulfillmentBinding(fulfillments, selector) {',
      '  if (typeof fulfillments === "function") return true;',
      '  if (fulfillments && typeof fulfillments.resolve === "function") return true;',
      '  if (!selector) return Object.keys(fulfillments ?? {}).length > 0;',
      '  const serviceKey = selector.serviceKey ?? "*";',
      '  const unitKey = selector.unitKey ?? "*";',
      '  return Boolean(',
      '    fulfillments?.[`${serviceKey}:${unitKey}`] ??',
      '      fulfillments?.[serviceKey]?.[unitKey] ??',
      '      fulfillments?.[serviceKey] ??',
      '      fulfillments?.["*"]',
      '  );',
      '}',
      '',
      'function implementationFor(implementations, fulfillments, luiId, target, fulfillmentSnapshot) {',
      '  const direct = implementations?.[luiId];',
      '  if (typeof direct === "function") return direct;',
      '  const byTarget = implementations?.[targetKey(target)];',
      '  if (typeof byTarget === "function") return byTarget;',
      '  if (target?.kind !== "requirement") return undefined;',
      '  return callableFulfillmentBinding(fulfillments, target.serviceKey, target.unitKey, fulfillmentSnapshot);',
      '}',
      '',
      'function callableFulfillmentBinding(fulfillments, serviceKey, unitKey, fulfillmentSnapshot) {',
      '  const resolved = resolveFulfillmentBinding(fulfillments, serviceKey, unitKey, fulfillmentSnapshot);',
      '  return typeof resolved === "function" ? resolved : undefined;',
      '}',
      '',
      'function resolveFulfillmentBinding(fulfillments, serviceKey, unitKey, fulfillmentSnapshot) {',
      '  const snapshotKey = `${serviceKey}:${unitKey}`;',
      '  if (fulfillmentSnapshot?.has(snapshotKey)) return fulfillmentSnapshot.get(snapshotKey);',
      '  let resolved;',
      '  if (typeof fulfillments === "function") {',
      '    resolved = fulfillments({ serviceKey, unitKey });',
      '  } else if (fulfillments && typeof fulfillments.resolve === "function") {',
      '    resolved = fulfillments.resolve({ serviceKey, unitKey });',
      '  } else {',
      '    const candidates = [',
      '      fulfillments?.[`${serviceKey}:${unitKey}`],',
      '      fulfillments?.[serviceKey]?.[unitKey],',
      '      fulfillments?.[serviceKey],',
      '      fulfillments?.["*"],',
      '    ];',
      '    resolved = candidates.find((candidate) => candidate !== undefined);',
      '  }',
      '  if (fulfillmentSnapshot) fulfillmentSnapshot.set(snapshotKey, resolved);',
      '  return resolved;',
      '}',
      '',
      'function retainedCurrentForLUI(luiId, lui, values, policies) {',
      '  const current = {};',
      '  for (const [portKey, port] of Object.entries(lui.ports ?? {})) {',
      '    if (port.interaction?.retainedCurrent !== true) continue;',
      '    const key = `lui:${luiId}:${portKey}:`;',
      '    if (values.has(key)) {',
      '      current[portKey] = values.get(key);',
      '    }',
      '  }',
      '  for (const policy of policies?.retainedCurrent ?? []) {',
      '    const endpoint = retainedPolicySelectedEndpoint(policy);',
      '    if (!endpoint || endpoint.owner?.kind !== "lui" || endpoint.owner.luiId !== luiId || !endpoint.payloadPath?.length) continue;',
      '    const key = endpointKey(endpoint);',
      '    if (!values.has(key)) continue;',
      '    const existing = Object.prototype.hasOwnProperty.call(current, endpoint.portKey) ? current[endpoint.portKey] : undefined;',
      '    current[endpoint.portKey] = setPath(existing, endpoint.payloadPath, values.get(key));',
      '  }',
      '  return current;',
      '}',
      '',
      'function selectJSAsyncPolicy(policies, luiId, stepIndex) {',
      '  let selected;',
      '  for (const policy of policies?.async ?? []) {',
      '    const selector = policy.payload?.selector;',
      '    const matches = !selector || selector.luiId === luiId || selector.stepIndex === stepIndex;',
      '    if (!matches) continue;',
      '    if (policy.payload?.invocation === "async-iterator" && policy.requirement !== "required") continue;',
      '    selected = policy;',
      '  }',
      '  return selected;',
      '}',
      '',
      'function selectJSErrorPolicy(policies, luiId) {',
      '  let selected;',
      '  for (const policy of policies?.error ?? []) {',
      '    const selector = policy.payload?.selector;',
      '    const matches = !selector || selector.luiId === luiId;',
      '    if (!matches) continue;',
      '    selected = policy;',
      '  }',
      '  return selected;',
      '}',
      '',
      'function errorOutputForPolicy(policy, lui, error, luiId) {',
      '  const portKey = policy?.payload?.selector?.portKey;',
      '  if (!portKey) {',
      '    throw new Error(`Executable JS lowering requires selector.portKey for use-error-port on LUI ${luiId}.`);',
      '  }',
      '  const port = lui?.ports?.[portKey];',
      '  if (!port || port.boundary !== "output") {',
      '    throw new Error(`Executable JS lowering requires use-error-port target ${portKey} to be an output port on LUI ${luiId}.`);',
      '  }',
      '  return { [portKey]: normalizeError(error) };',
      '}',
      '',
      'function normalizeError(error) {',
      '  if (error instanceof Error) {',
      '    return { name: error.name, message: error.message };',
      '  }',
      '  return { name: "Error", message: String(error) };',
      '}',
      '',
      'function isThenable(value) {',
      '  return value != null && typeof value.then === "function";',
      '}',
      '',
      'async function consumeAsyncIteratorOutput(value, luiId) {',
      '  const iterator = value?.[Symbol.asyncIterator]?.();',
      '  if (!iterator) {',
      '    throw new Error(`LUI ${luiId} declared async-iterator invocation but did not return an async iterable.`);',
      '  }',
      '  let outputs = {};',
      '  for await (const item of iterator) {',
      '    outputs = item ?? {};',
      '  }',
      '  return outputs;',
      '}',
      '',
      'function seedRetainedValues(core, values, retainedValues, hostRetainedCurrent, policies) {',
      '  walkRetainedEndpoints(core, policies, (endpoint) => {',
      '    const key = endpointKey(endpoint);',
      '    const hostCurrent = getHostRetainedCurrent(hostRetainedCurrent, endpoint, key);',
      '    if (hostCurrent.found && !values.has(key)) {',
      '      values.set(key, hostCurrent.value);',
      '      return;',
      '    }',
      '    if (retainedValues.has(key) && !values.has(key)) {',
      '      values.set(key, retainedValues.get(key));',
      '    }',
      '  });',
      '}',
      '',
      'function getHostRetainedCurrent(source, endpoint, key) {',
      '  if (!source) return { found: false };',
      '  const lookup = lookupHostRetainedCurrentSource(source, endpoint, key);',
      '  return lookup.found ? readHostRetainedValue(lookup.value) : { found: false };',
      '}',
      '',
      'function lookupHostRetainedCurrentSource(source, endpoint, key) {',
      '  if (!source) return { found: false };',
      '  if (source instanceof Map) {',
      '    for (const candidate of retainedCurrentLookupKeys(endpoint, key)) {',
      '      if (source.has(candidate)) return { found: true, value: source.get(candidate) };',
      '    }',
      '    return { found: false };',
      '  }',
      '  if (typeof source === "function") {',
      '    const value = source(endpoint, key);',
      '    return value === undefined ? { found: false } : { found: true, value };',
      '  }',
      '  if (typeof source === "object") {',
      '    for (const candidate of retainedCurrentLookupKeys(endpoint, key)) {',
      '      if (Object.prototype.hasOwnProperty.call(source, candidate)) {',
      '        return { found: true, value: source[candidate] };',
      '      }',
      '    }',
      '  }',
      '  return { found: false };',
      '}',
      '',
      'function retainedCurrentLookupKeys(endpoint, key) {',
      '  const keys = [key];',
      '  const owner = endpoint.owner ?? {};',
      '  if (owner.kind === "lui") {',
      '    keys.push(`lui:${owner.luiId}:${endpoint.portKey}`, `${owner.luiId}.${endpoint.portKey}`);',
      '  } else if (owner.kind === "lu") {',
      '    keys.push(`lu:${endpoint.portKey}`, endpoint.portKey);',
      '  }',
      '  return keys;',
      '}',
      '',
      'function readHostRetainedValue(value) {',
      '  if (value === undefined) return { found: false };',
      '  if (value && typeof value.getSnapshot === "function") {',
      '    const snapshot = value.getSnapshot();',
      '    return snapshot === undefined ? { found: false } : { found: true, value: snapshot };',
      '  }',
      '  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "current")) {',
      '    return { found: true, value: value.current };',
      '  }',
      '  if (value && typeof value === "object" && typeof value.subscribe === "function" && Object.prototype.hasOwnProperty.call(value, "value")) {',
      '    return { found: true, value: value.value };',
      '  }',
      '  if (value && typeof value === "object" && typeof value.subscribe === "function") {',
      '    return { found: false };',
      '  }',
      '  return { found: true, value };',
      '}',
      '',
      'function startRetainedCurrentSubscriptions(core, policies, retainedValues, hostRetainedCurrent, subscriptions) {',
      '  walkRetainedEndpoints(core, policies, (endpoint) => {',
      '    const notificationMode = retainedEndpointNotificationMode(endpoint, policies);',
      '    if (!notificationMode) return;',
      '    const key = endpointKey(endpoint);',
      '    const lookup = lookupHostRetainedCurrentSource(hostRetainedCurrent, endpoint, key);',
      '    if (!lookup.found) return;',
      '    const unsubscribe = subscribeHostRetainedValue(lookup.value, (nextValue) => {',
      '      retainedValues.set(key, nextValue);',
      '    }, notificationMode);',
      '    if (unsubscribe) subscriptions.push(unsubscribe);',
      '  });',
      '}',
      '',
      'function subscribeHostRetainedValue(value, onValue, notificationMode = "subscribe") {',
      '  if (!value || typeof value !== "object" || typeof value.subscribe !== "function") return undefined;',
      '  const subscription = value.subscribe((next) => {',
      '    const current = next === undefined ? readHostRetainedValue(value) : readHostRetainedValue(next);',
      '    if (!current.found) return;',
      '    if (notificationMode === "microtask") {',
      '      const schedule = typeof queueMicrotask === "function" ? queueMicrotask : (callback) => Promise.resolve().then(callback);',
      '      schedule(() => onValue(current.value));',
      '      return;',
      '    }',
      '    onValue(current.value);',
      '  });',
      '  if (typeof subscription === "function") return subscription;',
      '  if (subscription && typeof subscription.unsubscribe === "function") return () => subscription.unsubscribe();',
      '  if (typeof value.unsubscribe === "function") return () => value.unsubscribe();',
      '  return undefined;',
      '}',
      '',
      'function retainedEndpointNotificationMode(endpoint, policies) {',
      '  for (const policy of policies?.retainedCurrent ?? []) {',
      '    const payload = policy.payload ?? {};',
      '    if (!retainedPolicyMatchesEndpoint(policy, endpoint)) continue;',
      '    if (payload.realization === "host-observable" && (payload.notification === undefined || ["subscribe", "push", "microtask"].includes(payload.notification))) {',
      '      return payload.notification ?? "subscribe";',
      '    }',
      '  }',
      '  return undefined;',
      '}',
      '',
      'function retainedPolicyMatchesEndpoint(policy, endpoint) {',
      '  const payload = policy.payload ?? {};',
      '  const selector = payload.selector;',
      '  if (selector) {',
      '    if (selector.luiId !== undefined && (endpoint.owner?.kind !== "lui" || selector.luiId !== endpoint.owner?.luiId)) return false;',
      '    if (selector.portKey !== undefined && selector.portKey !== endpoint.portKey) return false;',
      '    const endpointPath = endpoint.payloadPath ?? [];',
      '    if (selector.payloadPath !== undefined && JSON.stringify(selector.payloadPath) !== JSON.stringify(endpointPath)) return false;',
      '  }',
      '  const pathEndpoint = retainedPolicyEndpointFromPath(policy.path ?? []);',
      '  if (pathEndpoint && !sameRetainedEndpoint(pathEndpoint, endpoint)) return false;',
      '  return true;',
      '}',
      '',
      'function retainedPolicyEndpointFromPath(path) {',
      '  if (!Array.isArray(path)) return undefined;',
      '  const portIndex = path.indexOf("ports");',
      '  if (portIndex < 0 || portIndex + 1 >= path.length) return undefined;',
      '  let owner = { kind: "lu" };',
      '  for (let index = 0; index < portIndex; index += 1) {',
      '    if (path[index] === "luis" && index + 1 < portIndex) {',
      '      owner = { kind: "lui", luiId: path[index + 1] };',
      '    }',
      '  }',
      '  return { owner, portKey: path[portIndex + 1] };',
      '}',
      '',
      'function sameRetainedEndpoint(left, right) {',
      '  if (left.portKey !== right.portKey) return false;',
      '  if (left.owner?.kind !== right.owner?.kind) return false;',
      '  if (left.owner?.kind === "lui" && left.owner?.luiId !== right.owner?.luiId) return false;',
      '  return true;',
      '}',
      '',
      'function stopRetainedCurrentSubscriptions(subscriptions) {',
      '  while (subscriptions.length > 0) {',
      '    const unsubscribe = subscriptions.pop();',
      '    unsubscribe();',
      '  }',
      '}',
      '',
      'function storeRetainedValues(core, values, retainedValues, policies) {',
      '  walkRetainedEndpoints(core, policies, (endpoint) => {',
      '    const key = endpointKey(endpoint);',
      '    const latest = getRetainedEndpointValue(values, endpoint, resolveEndpointPort(core, endpoint));',
      '    if (latest.found) {',
      '      retainedValues.set(key, latest.value);',
      '    }',
      '  });',
      '}',
      '',
      'function getRetainedEndpointValue(values, endpoint, port) {',
      '  assertEndpointPinPath(endpoint, port);',
      '  const rootKey = endpointRootKey(endpoint);',
      '  const path = endpoint.payloadPath ?? [];',
      '  if (path.length > 0 && values.has(rootKey)) {',
      '    const nested = getPath(values.get(rootKey), path);',
      '    if (nested.found) return nested;',
      '  }',
      '  const key = endpointKey(endpoint);',
      '  if (values.has(key)) return { found: true, value: values.get(key) };',
      '  return { found: false };',
      '}',
      '',
      'function walkRetainedEndpoints(core, policies, visit) {',
      '  const seen = new Set();',
      '  const push = (endpoint) => {',
      '    const key = endpointKey(endpoint);',
      '    if (seen.has(key)) return;',
      '    seen.add(key);',
      '    visit(endpoint);',
      '  };',
      '  for (const [portKey, port] of Object.entries(core.ports ?? {})) {',
      '    if (port.interaction?.retainedCurrent === true) {',
      '      push({ owner: { kind: "lu" }, portKey });',
      '    }',
      '  }',
      '  for (const [luiId, lui] of Object.entries(core.luis ?? {})) {',
      '    for (const [portKey, port] of Object.entries(lui.ports ?? {})) {',
      '      if (port.interaction?.retainedCurrent === true) {',
      '        push({ owner: { kind: "lui", luiId }, portKey });',
      '      }',
      '    }',
      '  }',
      '  for (const policy of policies?.retainedCurrent ?? []) {',
      '    const endpoint = retainedPolicySelectedEndpoint(policy);',
      '    if (endpoint) push(endpoint);',
      '  }',
      '}',
      '',
      'function retainedPolicySelectedEndpoint(policy) {',
      '  const pathEndpoint = retainedPolicyEndpointFromPath(policy.path ?? []);',
      '  const selector = policy.payload?.selector;',
      '  if (!selector || selector.payloadPath === undefined) return undefined;',
      '  if (selector.luiId !== undefined && selector.portKey !== undefined) {',
      '    return { owner: { kind: "lui", luiId: selector.luiId }, portKey: selector.portKey, payloadPath: selector.payloadPath };',
      '  }',
      '  if (!pathEndpoint) return undefined;',
      '  return { ...pathEndpoint, payloadPath: selector.payloadPath };',
      '}',
      '',
      'function propagate(core, values) {',
      '  for (const connection of Object.values(core.connections)) {',
      '    const fromPort = resolveEndpointPort(core, connection.from);',
      '    const toPort = resolveEndpointPort(core, connection.to);',
      '    let found = false;',
      '    let value;',
      '    const explicit = getEndpointValue(values, connection.from, fromPort);',
      '    if (explicit.found) {',
      '      found = true;',
      '      value = explicit.value;',
      '    }',
      '    if (!found) continue;',
      '    setEndpointValue(values, connection.to, toPort, value);',
      '  }',
      '}',
      '',
      'function getEndpointValue(values, endpoint, port) {',
      '  assertEndpointPinPath(endpoint, port);',
      '  const key = endpointKey(endpoint);',
      '  if (values.has(key)) return { found: true, value: values.get(key) };',
      '  const rootKey = endpointRootKey(endpoint);',
      '  const path = endpoint.payloadPath ?? [];',
      '  if (path.length > 0 && values.has(rootKey)) {',
      '    return getPath(values.get(rootKey), path);',
      '  }',
      '  return { found: false };',
      '}',
      '',
      'function setEndpointValue(values, endpoint, port, value) {',
      '  assertEndpointPinPath(endpoint, port);',
      '  values.set(endpointKey(endpoint), value);',
      '  const rootKey = endpointRootKey(endpoint);',
      '  const path = endpoint.payloadPath ?? [];',
      '  if (path.length === 0) {',
      '    values.set(rootKey, value);',
      '    return;',
      '  }',
      '  const root = values.has(rootKey) ? values.get(rootKey) : createRootForPort(port, path);',
      '  values.set(rootKey, setPath(root, path, value));',
      '}',
      '',
      'function endpointKey(endpoint) {',
      '  const suffix = (endpoint.payloadPath ?? []).map(String).join("/");',
      '  const root = endpointRootKey(endpoint);',
      '  return suffix ? `${root}${suffix}` : root;',
      '}',
      '',
      'function endpointRootKey(endpoint) {',
      '  if (endpoint.owner.kind === "lu") return `lu:${endpoint.portKey}:`;',
      '  if (endpoint.owner.kind === "lui") return `lui:${endpoint.owner.luiId}:${endpoint.portKey}:`;',
      '  return `closure:${endpoint.owner.closureId}:${endpoint.portKey}:`;',
      '}',
      '',
      'function resolveEndpointPort(core, endpoint) {',
      '  if (endpoint.owner.kind === "lu") return core.ports?.[endpoint.portKey];',
      '  if (endpoint.owner.kind === "lui") return core.luis?.[endpoint.owner.luiId]?.ports?.[endpoint.portKey];',
      '  return core.closures?.[endpoint.owner.closureId]?.ports?.[endpoint.portKey];',
      '}',
      '',
      'function assertEndpointPinPath(endpoint, port) {',
      '  const path = endpoint.payloadPath ?? [];',
      '  const pins = port?.pins;',
      '  if (!pins || path.length === 0) return;',
      '  const first = path[0];',
      '  if (pins.kind === "indexed") {',
      '    if (!Number.isInteger(first) || first < 0 || first >= pins.count) {',
      '      throw new Error(`Payload path ${path.join("/")} is outside indexed pins for port ${endpoint.portKey}.`);',
      '    }',
      '    return;',
      '  }',
      '  if (typeof first !== "string" || !pins.keys.includes(first)) {',
      '    throw new Error(`Payload path ${path.join("/")} is outside keyed pins for port ${endpoint.portKey}.`);',
      '  }',
      '}',
      '',
      'function createRootForPort(port, path) {',
      '  const pins = port?.pins;',
      '  if (pins?.kind === "indexed") return new Array(pins.count);',
      '  if (pins?.kind === "keyed") return {};',
      '  return typeof path[0] === "number" ? [] : {};',
      '}',
      '',
      'function getPath(value, path) {',
      '  let current = value;',
      '  for (const segment of path) {',
      '    if (current == null || !(segment in Object(current))) return { found: false };',
      '    current = current[segment];',
      '  }',
      '  return { found: true, value: current };',
      '}',
      '',
      'function setPath(root, path, value) {',
      '  if (path.length === 0) return value;',
      '  const clone = Array.isArray(root) ? [...root] : { ...(root && typeof root === "object" ? root : {}) };',
      '  let current = clone;',
      '  for (let index = 0; index < path.length - 1; index += 1) {',
      '    const segment = path[index];',
      '    const nextSegment = path[index + 1];',
      '    const existing = current[segment];',
      '    const next = Array.isArray(existing)',
      '      ? [...existing]',
      '      : existing && typeof existing === "object"',
      '        ? { ...existing }',
      '        : typeof nextSegment === "number"',
      '          ? []',
      '          : {};',
      '    current[segment] = next;',
      '    current = next;',
      '  }',
      '  current[path[path.length - 1]] = value;',
      '  return clone;',
      '}',
      '',
      'function targetKey(target) {',
      '  if (target.kind === "external") return `external:${target.namespace}:${target.key}`;',
      '  if (target.kind === "lu") return `lu:${target.luId}`;',
      '  return `requirement:${target.serviceKey}:${target.unitKey}`;',
      '}',
      '',
    ].join('\n'),
  };
}

export function lowerPythonRuntimeSkeleton(
  plan: PythonRuntimePlan
): SourceArtifact {
  return {
    kind: 'source',
    language: 'python',
    filename: 'logicir_runtime_plan.py',
    content: [
      '# Generated draft LogicIR Python runtime skeleton.',
      'import json',
      '',
      `LOGICIR_RUNTIME_PLAN = ${pythonJsonLoadsExpression({
        target: plan.target,
        schemaVersion: plan.schemaVersion,
        core: summarizeCore(plan.core),
        policies: summarizePolicies(plan.policies),
      })}`,
      '',
      'class LogicIRRuntimeSkeleton:',
      '    def __init__(self, host):',
      '        self.host = host',
      '        self.plan = LOGICIR_RUNTIME_PLAN',
      '',
      '    def invoke(self, inputs=None):',
      '        if inputs is None:',
      '            inputs = {}',
      '        invoke = getattr(self.host, "invoke", None)',
      '        if invoke is None:',
      '            raise RuntimeError("LogicIR Python skeleton requires host.invoke(plan, inputs).")',
      '        return invoke(self.plan, inputs)',
      '',
    ].join('\n'),
  };
}

export function lowerPythonExecutableRuntime(
  plan: PythonRuntimePlan
): SourceArtifact {
  return {
    kind: 'source',
    language: 'python',
    filename: 'logicir_runtime_executable.py',
    content: [
      '# Generated draft LogicIR Python executable runtime.',
      'import asyncio',
      'import concurrent.futures',
      'import inspect',
      'import json',
      '',
      `LOGICIR_RUNTIME_PLAN = ${pythonJsonLoadsExpression({
        target: plan.target,
        schemaVersion: plan.schemaVersion,
        core: plan.core,
        policies: plan.policies,
      })}`,
      '',
      'def create_runtime(host=None):',
      '    return LogicIRRuntime(host or {})',
      '',
      'class LogicIRRuntime:',
      '    def __init__(self, host):',
      '        self.host = host',
      '        self.plan = LOGICIR_RUNTIME_PLAN',
      '        self.implementations = _host_get(host, "implementations", {})',
      '        self.fulfillments = _host_get(host, "fulfillments", {})',
      '        self.resources = _host_get(host, "resources", {})',
      '        self.host_retained_current = _host_get(host, "retained_current", _host_get(host, "retainedCurrent", {}))',
      '        self.emit_error = _host_get(host, "emit_error", _host_get(host, "emitError", None))',
      '        self.retained_values = {}',
      '        self.retained_subscriptions = []',
      '        self.retained_subscriptions_started = False',
      '        self.resource_values = {}',
      '        self.resource_stack = []',
      '        self.resource_lifecycle_started = False',
      '',
      '    def invoke(self, inputs=None):',
      '        policies = self.plan.get("policies", {})',
      '        assert_supported_python_runtime_policies(policies, self.fulfillments, self.emit_error)',
      '        if not self.retained_subscriptions_started:',
      '            start_retained_current_subscriptions(self.plan["core"], policies, self.retained_values, self.host_retained_current, self.retained_subscriptions)',
      '            self.retained_subscriptions_started = True',
      '        if not self.resource_lifecycle_started:',
      '            start_resource_lifecycle(policies, self.resources, self.resource_stack, self.resource_values)',
      '            self.resource_lifecycle_started = True',
      '        return execute_core(self.plan["core"], inputs or {}, self.implementations, self.fulfillments, self.retained_values, self.resource_values, self.emit_error, self.host_retained_current)',
      '',
      '    def dispose(self):',
      '        stop_retained_current_subscriptions(self.retained_subscriptions)',
      '        self.retained_subscriptions_started = False',
      '        if not self.resource_lifecycle_started:',
      '            return',
      '        try:',
      '            stop_resource_lifecycle(self.resource_stack)',
      '        finally:',
      '            self.resource_stack = []',
      '            self.resource_values = {}',
      '            self.resource_lifecycle_started = False',
      '',
      'def execute_core(core, inputs, implementations, fulfillments, retained_values, resource_values=None, emit_error=None, host_retained_current=None):',
      '    policies = LOGICIR_RUNTIME_PLAN.get("policies", {})',
      '    assert_supported_python_runtime_policies(policies, fulfillments, emit_error)',
      '    resource_values = resource_values or {}',
      '    if core.get("kind") not in ("combinational", "sequential", "stateful"):',
      '        raise RuntimeError(f"Executable Python lowering currently supports combinational, sequential, and stateful cores only, got {core.get(\'kind\')}.")',
      '    values = {}',
      '    fulfillment_snapshot = {}',
      '    for port_key, value in inputs.items():',
      '        values[f"lu:{port_key}:"] = value',
      '    seed_retained_values(core, values, retained_values, host_retained_current, policies)',
      '    propagate(core, values)',
      '    if core.get("kind") == "sequential":',
      '        execute_sequential_core(core, values, implementations, fulfillments, policies, resource_values, emit_error, fulfillment_snapshot)',
      '    elif core.get("kind") == "stateful":',
      '        execute_stateful_core(core, values, implementations, fulfillments, policies, resource_values, emit_error, fulfillment_snapshot)',
      '    else:',
      '        execute_combinational_core(core, values, implementations, fulfillments, policies, resource_values, emit_error, fulfillment_snapshot)',
      '    propagate(core, values)',
      '    result = {}',
      '    for port_key, port in core.get("ports", {}).items():',
      '        if port.get("boundary") == "output":',
      '            key = f"lu:{port_key}:"',
      '            if key in values:',
      '                result[port_key] = values[key]',
      '    store_retained_values(core, values, retained_values, policies)',
      '    return result',
      '',
      'def execute_combinational_core(core, values, implementations, fulfillments, policies, resource_values, emit_error, fulfillment_snapshot):',
      '    pending = list(core.get("luis", {}).items())',
      '    completed = set()',
      '    progressed = True',
      '    while len(completed) < len(pending) and progressed:',
      '        progressed = False',
      '        for lui_id, lui in pending:',
      '            if lui_id in completed:',
      '                continue',
      '            if not execute_ready_lui(core, lui_id, lui, values, implementations, fulfillments, policies, resource_values, emit_error, fulfillment_snapshot=fulfillment_snapshot):',
      '                continue',
      '            completed.add(lui_id)',
      '            progressed = True',
      '    if len(completed) < len(pending):',
      '        raise RuntimeError("Combinational execution stalled before all LUIs completed.")',
      '',
      'def execute_sequential_core(core, values, implementations, fulfillments, policies, resource_values, emit_error, fulfillment_snapshot):',
      '    for step_index, lui_id in enumerate(core.get("organization", {}).get("steps", [])):',
      '        lui = core.get("luis", {}).get(lui_id)',
      '        if lui is None:',
      '            raise RuntimeError(f"Sequential step references missing LUI {lui_id}.")',
      '        if not execute_ready_lui(core, lui_id, lui, values, implementations, fulfillments, policies, resource_values, emit_error, step_index=step_index, fulfillment_snapshot=fulfillment_snapshot):',
      '            raise RuntimeError(f"Sequential step {lui_id} is not ready.")',
      '',
      'def execute_stateful_core(core, values, implementations, fulfillments, policies, resource_values, emit_error, fulfillment_snapshot):',
      '    for lui_id, lui in core.get("luis", {}).items():',
      '        if not execute_ready_lui(core, lui_id, lui, values, implementations, fulfillments, policies, resource_values, emit_error, require_all_inputs=False, fulfillment_snapshot=fulfillment_snapshot):',
      '            raise RuntimeError(f"Stateful LUI {lui_id} is missing required pull-readable inputs.")',
      '',
      'def execute_ready_lui(core, lui_id, lui, values, implementations, fulfillments, policies, resource_values, emit_error, require_all_inputs=True, step_index=None, fulfillment_snapshot=None):',
      '    input_ports = [',
      '        (key, port)',
      '        for key, port in lui.get("ports", {}).items()',
      '        if port.get("boundary") == "input"',
      '    ]',
      '    lui_inputs = {}',
      '    for port_key, port in input_ports:',
      '        key = f"lui:{lui_id}:{port_key}:"',
      '        if key not in values:',
      '            if require_all_inputs or port.get("interaction", {}).get("pullReadable") is True:',
      '                return False',
      '            continue',
      '        lui_inputs[port_key] = values[key]',
      '    impl = _implementation_for(',
      '        implementations, fulfillments, lui_id, lui.get("target", {}), fulfillment_snapshot',
      '    )',
      '    if not callable(impl):',
      '        raise RuntimeError(f"Missing implementation for LUI {lui_id}.")',
      '    async_policy = select_python_async_policy(policies, lui_id, step_index)',
      '    invocation = (async_policy or {}).get("payload", {}).get("invocation")',
      '    concurrency_policy = select_python_concurrency_policy(policies, lui_id)',
      '    execution = (concurrency_policy or {}).get("payload", {}).get("execution")',
      '    error_policy = select_python_error_policy(policies, lui_id)',
      '    try:',
      '        context = {"luiId": lui_id, "lui": lui, "target": lui.get("target"), "resources": resource_values, "resource": resource_for_lui(resource_values, lui_id), "retainedCurrent": retained_current_for_lui(lui_id, lui, values, policies)}',
      '        if execution == "thread" and invocation not in ("coroutine", "async-generator", "generator"):',
      '            outputs = run_threadpool_call(impl, lui_inputs, context)',
      '        elif invocation == "threadpool-call":',
      '            outputs = run_threadpool_call(impl, lui_inputs, context)',
      '        else:',
      '            outputs = impl(lui_inputs, context)',
      '        if invocation == "coroutine":',
      '            outputs = run_coroutine_output(outputs, lui_id)',
      '        elif invocation == "async-generator":',
      '            outputs = run_async_generator_output(outputs, lui_id)',
      '        elif invocation == "generator":',
      '            outputs = consume_generator_output(outputs, lui_id)',
      '        elif invocation not in (None, "sync-call", "threadpool-call"):',
      '            raise RuntimeError(f"Executable Python lowering does not support invocation {invocation} for LUI {lui_id}.")',
      '    except Exception as error:',
      '        on_exception = (error_policy or {}).get("payload", {}).get("onException")',
      '        if on_exception is None or on_exception == "raise":',
      '            raise',
      '        if on_exception == "use-error-port":',
      '            outputs = error_output_for_policy(error_policy, lui, error, lui_id)',
      '        elif on_exception == "emit-error":',
      '            emit_error({"luiId": lui_id, "lui": lui, "target": lui.get("target"), "policy": error_policy, "error": normalize_exception(error)})',
      '            outputs = {}',
      '        else:',
      '            raise RuntimeError(f"Executable Python lowering does not support error policy {on_exception} for LUI {lui_id}.") from error',
      '    if outputs is None:',
      '        outputs = {}',
      '    for port_key, value in outputs.items():',
      '        values[f"lui:{lui_id}:{port_key}:"] = value',
      '    propagate(core, values)',
      '    return True',
      '',
      'def assert_supported_python_runtime_policies(policies, fulfillments, emit_error=None):',
      '    for policy in policies.get("async", []):',
      '        if policy.get("requirement") != "required":',
      '            continue',
      '        payload = policy.get("payload", {})',
      '        if payload.get("invocation") not in ("sync-call", "coroutine", "async-generator", "generator", "threadpool-call"):',
      '            raise RuntimeError("Executable Python lowering does not support the required invocation policy.")',
      '        if payload.get("awaitBeforeNext") is False:',
      '            raise RuntimeError("Executable Python lowering requires awaitBeforeNext for ordered execution.")',
      '    for policy in policies.get("dynamicFulfillment", []):',
      '        if policy.get("requirement") != "required":',
      '            continue',
      '        payload = policy.get("payload", {})',
      '        supported = (',
      '            (payload.get("binding") == "constructor-injected" and payload.get("consistency") == "startup-only")',
      '            or (payload.get("binding") == "late-bound" and payload.get("consistency") == "task-local")',
      '            or (payload.get("binding") == "switchable" and payload.get("consistency") in ("quiescent-switch", "transactional-switch"))',
      '        )',
      '        if not supported:',
      '            raise RuntimeError("Executable Python lowering currently supports only required constructor-injected/startup-only, late-bound/task-local, or switchable quiescent/transactional dynamic fulfillment.")',
      '        if not has_fulfillment_binding(fulfillments, payload.get("selector")):',
      '            raise RuntimeError("Executable Python lowering requires host fulfillments evidence for required constructor-injected dynamic fulfillment.")',
      '    for policy in policies.get("retainedCurrent", []):',
      '        if policy.get("requirement") != "required":',
      '            continue',
      '        payload = policy.get("payload", {})',
      '        supported = {"source-property", "sink-cache", "observable", "asyncio-queue-latest", "projector-adapter"}',
      '        if payload.get("realization") and payload.get("realization") not in supported:',
      '            raise RuntimeError("Executable Python lowering currently supports required source-property, sink-cache, observable, asyncio-queue-latest, or projector-adapter retained-current realization.")',
      '    for policy in policies.get("error", []):',
      '        if policy.get("requirement") != "required":',
      '            continue',
      '        payload = policy.get("payload", {})',
      '        if payload.get("onException") and payload.get("onException") not in ("raise", "use-error-port", "emit-error"):',
      '            raise RuntimeError("Executable Python lowering currently supports only required raise, use-error-port, or emit-error policy.")',
      '        if payload.get("onException") == "use-error-port" and not payload.get("selector", {}).get("portKey"):',
      '            raise RuntimeError("Executable Python lowering requires selector.portKey for required use-error-port policies.")',
      '        if payload.get("onException") == "emit-error" and not callable(emit_error):',
      '            raise RuntimeError("Executable Python lowering requires host emit_error for required emit-error policies.")',
      '    for policy in policies.get("resourceLifecycle", []):',
      '        if policy.get("requirement") != "required":',
      '            continue',
      '        payload = policy.get("payload", {})',
      '        if payload.get("protocol") and payload.get("protocol") not in ("none", "context-manager", "async-context-manager", "start-stop"):',
      '            raise RuntimeError("Executable Python lowering currently supports only required none, context-manager, async-context-manager, or start-stop resource lifecycle policy.")',
      '    for policy in policies.get("concurrency", []):',
      '        if policy.get("requirement") != "required":',
      '            continue',
      '        payload = policy.get("payload", {})',
      '        if payload.get("execution") and payload.get("execution") not in ("same-thread", "thread"):',
      '            raise RuntimeError("Executable Python lowering currently supports only required same-thread or thread concurrency policy.")',
      '        if payload.get("execution") == "thread" and payload.get("backpressure") not in (None, "block"):',
      '            raise RuntimeError("Executable Python lowering currently supports only blocking thread concurrency backpressure.")',
      '        if payload.get("execution") == "thread" and payload.get("ordering") not in (None, "preserve"):',
      '            raise RuntimeError("Executable Python lowering currently supports only preserve ordering for thread concurrency.")',
      '',
      'def start_resource_lifecycle(policies, resources, resource_stack, resource_values):',
      '    context_manager_policies = []',
      '    for policy in policies.get("resourceLifecycle", []):',
      '        if policy.get("requirement") != "required":',
      '            continue',
      '        payload = policy.get("payload", {})',
      '        if payload.get("protocol") in ("context-manager", "async-context-manager", "start-stop"):',
      '            context_manager_policies.append(policy)',
      '    if any((policy.get("payload", {}) or {}).get("ordering") == "child-before-parent" for policy in context_manager_policies):',
      '        context_manager_policies = list(reversed(context_manager_policies))',
      '    bindings = []',
      '    for policy in context_manager_policies:',
      '        selector = policy.get("payload", {}).get("selector")',
      '        binding = resource_binding(resources, selector)',
      '        if binding is None:',
      '            raise RuntimeError("Executable Python lowering requires host resource binding for required context-manager lifecycle.")',
      '        bindings.append((policy, selector, binding))',
      '    try:',
      '        for policy, selector, binding in bindings:',
      '            protocol = policy.get("payload", {}).get("protocol")',
      '            manager = binding(policy) if callable(binding) and not is_context_manager(binding) and not is_async_context_manager(binding) and not is_start_stop_resource(binding) else binding',
      '            aliases = resource_aliases(selector)',
      '            if protocol == "context-manager":',
      '                if not is_context_manager(manager):',
      '                    raise RuntimeError("Executable Python lowering requires a synchronous context manager resource.")',
      '                value = manager.__enter__()',
      '                stack_entry = ("sync", manager, aliases)',
      '            elif protocol == "async-context-manager":',
      '                if not is_async_context_manager(manager):',
      '                    raise RuntimeError("Executable Python lowering requires an async context manager resource.")',
      '                value = run_async_context_manager_enter(manager)',
      '                stack_entry = ("async", manager, aliases)',
      '            elif protocol == "start-stop":',
      '                if not is_start_stop_resource(manager):',
      '                    raise RuntimeError("Executable Python lowering requires a start-stop resource.")',
      '                value = manager.start()',
      '                if inspect.isawaitable(value):',
      '                    value = run_start_stop_awaitable(value, "start")',
      '                if value is None:',
      '                    value = manager',
      '                stack_entry = ("start-stop", manager, aliases)',
      '            else:',
      '                continue',
      '            for alias in aliases:',
      '                resource_values[alias] = value',
      '            resource_stack.append(stack_entry)',
      '    except Exception:',
      '        stop_resource_lifecycle(resource_stack)',
      '        resource_values.clear()',
      '        raise',
      '',
      'def stop_resource_lifecycle(resource_stack):',
      '    first_error = None',
      '    while resource_stack:',
      '        entry = resource_stack.pop()',
      '        if len(entry) == 3:',
      '            mode, manager, _aliases = entry',
      '        else:',
      '            mode = "sync"',
      '            manager, _aliases = entry',
      '        try:',
      '            if mode == "async":',
      '                run_async_context_manager_exit(manager)',
      '            elif mode == "start-stop":',
      '                result = manager.stop()',
      '                if inspect.isawaitable(result):',
      '                    run_start_stop_awaitable(result, "stop")',
      '            else:',
      '                manager.__exit__(None, None, None)',
      '        except Exception as error:',
      '            if first_error is None:',
      '                first_error = error',
      '    if first_error is not None:',
      '        raise first_error',
      '',
      'def resource_binding(resources, selector):',
      '    if selector is None:',
      '        if is_context_manager(resources) or callable(resources):',
      '            return resources',
      '        if isinstance(resources, dict):',
      '            return resources.get("*") or resources.get("unit")',
      '        return None',
      '    keys = []',
      '    if selector.get("luiId") is not None:',
      '        keys.extend([f"lui:{selector.get(\'luiId\')}", selector.get("luiId")])',
      '    if selector.get("closureId") is not None:',
      '        keys.extend([f"closure:{selector.get(\'closureId\')}", selector.get("closureId")])',
      '    if isinstance(resources, dict):',
      '        for key in keys:',
      '            if key in resources:',
      '                return resources[key]',
      '    for key in keys:',
      '        candidate = _host_get(resources, key, None)',
      '        if candidate is not None:',
      '            return candidate',
      '    return None',
      '',
      'def resource_aliases(selector):',
      '    if selector is None:',
      '        return ["unit"]',
      '    if selector.get("luiId") is not None:',
      '        lui_id = selector.get("luiId")',
      '        return [f"lui:{lui_id}", lui_id]',
      '    if selector.get("closureId") is not None:',
      '        closure_id = selector.get("closureId")',
      '        return [f"closure:{closure_id}", closure_id]',
      '    return ["unit"]',
      '',
      'def resource_for_lui(resource_values, lui_id):',
      '    return resource_values.get(f"lui:{lui_id}", resource_values.get(lui_id))',
      '',
      'def is_context_manager(value):',
      '    return hasattr(value, "__enter__") and hasattr(value, "__exit__")',
      '',
      'def is_async_context_manager(value):',
      '    return hasattr(value, "__aenter__") and hasattr(value, "__aexit__")',
      '',
      'def is_start_stop_resource(value):',
      '    return hasattr(value, "start") and hasattr(value, "stop") and callable(value.start) and callable(value.stop)',
      '',
      'def run_async_context_manager_enter(manager):',
      '    value = manager.__aenter__()',
      '    if not inspect.isawaitable(value):',
      '        raise RuntimeError("Executable Python lowering requires async context manager __aenter__ to return an awaitable.")',
      '    try:',
      '        asyncio.get_running_loop()',
      '    except RuntimeError:',
      '        return asyncio.run(value)',
      '    raise RuntimeError("Executable Python lowering cannot enter async context manager inside an already-running event loop.")',
      '',
      'def run_async_context_manager_exit(manager):',
      '    value = manager.__aexit__(None, None, None)',
      '    if not inspect.isawaitable(value):',
      '        raise RuntimeError("Executable Python lowering requires async context manager __aexit__ to return an awaitable.")',
      '    try:',
      '        asyncio.get_running_loop()',
      '    except RuntimeError:',
      '        return asyncio.run(value)',
      '    raise RuntimeError("Executable Python lowering cannot exit async context manager inside an already-running event loop.")',
      '',
      'def run_start_stop_awaitable(awaitable, phase):',
      '    try:',
      '        asyncio.get_running_loop()',
      '    except RuntimeError:',
      '        return asyncio.run(awaitable)',
      '    raise RuntimeError(f"Executable Python lowering cannot run async start-stop resource {phase} inside an already-running event loop.")',
      '',
      'def has_fulfillment_binding(fulfillments, selector):',
      '    if callable(fulfillments):',
      '        return True',
      '    resolver = _host_get(fulfillments, "resolve")',
      '    if callable(resolver):',
      '        return True',
      '    if selector is None:',
      '        return bool(fulfillments)',
      '    service_key = selector.get("serviceKey", "*")',
      '    unit_key = selector.get("unitKey", "*")',
      '    if isinstance(fulfillments, dict):',
      '        if f"{service_key}:{unit_key}" in fulfillments:',
      '            return True',
      '        service_bindings = fulfillments.get(service_key)',
      '        if isinstance(service_bindings, dict) and unit_key in service_bindings:',
      '            return True',
      '        if service_bindings is not None:',
      '            return True',
      '        return "*" in fulfillments',
      '    return False',
      '',
      'def run_coroutine_output(value, lui_id):',
      '    if not inspect.isawaitable(value):',
      '        raise RuntimeError(f"LUI {lui_id} declared coroutine invocation but did not return an awaitable.")',
      '    try:',
      '        asyncio.get_running_loop()',
      '    except RuntimeError:',
      '        return asyncio.run(value)',
      '    raise RuntimeError("Executable Python lowering cannot run coroutine invocation inside an already-running event loop.")',
      '',
      'def run_async_generator_output(value, lui_id):',
      '    if not inspect.isasyncgen(value):',
      '        raise RuntimeError(f"LUI {lui_id} declared async-generator invocation but did not return an async generator.")',
      '    async def consume():',
      '        outputs = {}',
      '        async for item in value:',
      '            outputs = item or {}',
      '        return outputs',
      '    try:',
      '        asyncio.get_running_loop()',
      '    except RuntimeError:',
      '        return asyncio.run(consume())',
      '    raise RuntimeError("Executable Python lowering cannot run async-generator invocation inside an already-running event loop.")',
      '',
      'def consume_generator_output(value, lui_id):',
      '    if not inspect.isgenerator(value):',
      '        raise RuntimeError(f"LUI {lui_id} declared generator invocation but did not return a generator.")',
      '    outputs = {}',
      '    for item in value:',
      '        outputs = item or {}',
      '    return outputs',
      '',
      'def run_threadpool_call(impl, inputs, context):',
      '    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:',
      '        return executor.submit(impl, inputs, context).result()',
      '',
      'def select_python_async_policy(policies, lui_id, step_index):',
      '    selected = None',
      '    for policy in policies.get("async", []):',
      '        selector = policy.get("payload", {}).get("selector")',
      '        matches = selector is None or selector.get("luiId") == lui_id or selector.get("stepIndex") == step_index',
      '        if not matches:',
      '            continue',
      '        if policy.get("payload", {}).get("invocation") not in ("sync-call", "coroutine", "async-generator", "generator", "threadpool-call") and policy.get("requirement") != "required":',
      '            continue',
      '        selected = policy',
      '    return selected',
      '',
      'def select_python_error_policy(policies, lui_id):',
      '    selected = None',
      '    for policy in policies.get("error", []):',
      '        selector = policy.get("payload", {}).get("selector")',
      '        matches = selector is None or selector.get("luiId") == lui_id',
      '        if not matches:',
      '            continue',
      '        selected = policy',
      '    return selected',
      '',
      'def select_python_concurrency_policy(policies, lui_id):',
      '    selected = None',
      '    for policy in policies.get("concurrency", []):',
      '        selector = policy.get("payload", {}).get("selector")',
      '        matches = selector is None or selector.get("luiId") == lui_id',
      '        if not matches:',
      '            continue',
      '        selected = policy',
      '    return selected',
      '',
      'def error_output_for_policy(policy, lui, error, lui_id):',
      '    port_key = (policy or {}).get("payload", {}).get("selector", {}).get("portKey")',
      '    if not port_key:',
      '        raise RuntimeError(f"Executable Python lowering requires selector.portKey for use-error-port on LUI {lui_id}.")',
      '    port = lui.get("ports", {}).get(port_key)',
      '    if not port or port.get("boundary") != "output":',
      '        raise RuntimeError(f"Executable Python lowering requires use-error-port target {port_key} to be an output port on LUI {lui_id}.")',
      '    return {port_key: normalize_exception(error)}',
      '',
      'def normalize_exception(error):',
      '    return {"name": type(error).__name__, "message": str(error)}',
      '',
      'def seed_retained_values(core, values, retained_values, host_retained_current=None, policies=None):',
      '    for endpoint in retained_endpoints(core, policies):',
      '        key = endpoint_key(endpoint)',
      '        host_current = host_retained_latest(host_retained_current, endpoint, key)',
      '        if host_current[0] and key not in values:',
      '            values[key] = host_current[1]',
      '            continue',
      '        if key in retained_values and key not in values:',
      '            values[key] = retained_values[key]',
      '',
      'def host_retained_latest(source, endpoint, key):',
      '    found, value = lookup_host_retained_source(source, endpoint, key)',
      '    if not found:',
      '        return False, None',
      '    return latest_from_queue_like(value)',
      '',
      'def lookup_host_retained_source(source, endpoint, key):',
      '    if source is None:',
      '        return False, None',
      '    if callable(source):',
      '        value = source(endpoint, key)',
      '        if value is None:',
      '            return False, None',
      '        return True, value',
      '    candidates = retained_lookup_keys(endpoint, key)',
      '    if isinstance(source, dict):',
      '        for candidate in candidates:',
      '            if candidate in source:',
      '                return True, source[candidate]',
      '    for candidate in candidates:',
      '        value = _host_get(source, candidate, None)',
      '        if value is not None:',
      '            return True, value',
      '    return False, None',
      '',
      'def retained_lookup_keys(endpoint, key):',
      '    candidates = [key]',
      '    owner = endpoint.get("owner", {})',
      '    if owner.get("kind") == "lui":',
      '        candidates.extend([f"lui:{owner.get(\'luiId\')}:{endpoint.get(\'portKey\')}", f"{owner.get(\'luiId\')}.{endpoint.get(\'portKey\')}"])',
      '    elif owner.get("kind") == "lu":',
      '        candidates.extend([f"lu:{endpoint.get(\'portKey\')}", endpoint.get("portKey")])',
      '    return candidates',
      '',
      'def latest_from_queue_like(value):',
      '    snapshot = _host_get(value, "get_snapshot", _host_get(value, "getSnapshot", None))',
      '    if callable(snapshot):',
      '        current = snapshot()',
      '        return (False, None) if current is None else (True, current)',
      '    if hasattr(value, "current"):',
      '        return True, getattr(value, "current")',
      '    if hasattr(value, "value") and hasattr(value, "subscribe"):',
      '        return True, getattr(value, "value")',
      '    if callable(_host_get(value, "subscribe", None)):',
      '        return False, None',
      '    if hasattr(value, "get_nowait"):',
      '        latest = None',
      '        found = False',
      '        while True:',
      '            try:',
      '                latest = value.get_nowait()',
      '                found = True',
      '            except Exception:',
      '                break',
      '        return (found, latest)',
      '    if isinstance(value, (list, tuple)):',
      '        return (True, value[-1]) if value else (False, None)',
      '    try:',
      '        if hasattr(value, "__len__") and hasattr(value, "__getitem__") and len(value) > 0:',
      '            return True, value[-1]',
      '    except Exception:',
      '        pass',
      '    return True, value',
      '',
      'def start_retained_current_subscriptions(core, policies, retained_values, host_retained_current, subscriptions):',
      '    for endpoint in retained_endpoints(core, policies):',
      '        if not should_subscribe_retained_endpoint(endpoint, policies):',
      '            continue',
      '        key = endpoint_key(endpoint)',
      '        found, source = lookup_host_retained_source(host_retained_current, endpoint, key)',
      '        if not found:',
      '            continue',
      '        unsubscribe = subscribe_host_retained_source(source, lambda next_value, endpoint_key=key: retained_values.__setitem__(endpoint_key, next_value))',
      '        if unsubscribe is not None:',
      '            subscriptions.append(unsubscribe)',
      '',
      'def subscribe_host_retained_source(value, on_value):',
      '    subscribe = _host_get(value, "subscribe", None)',
      '    if not callable(subscribe):',
      '        return None',
      '    def listener(next_value=None):',
      '        found, latest = latest_from_queue_like(value if next_value is None else next_value)',
      '        if found:',
      '            on_value(latest)',
      '    subscription = subscribe(listener)',
      '    if callable(subscription):',
      '        return subscription',
      '    unsubscribe = _host_get(subscription, "unsubscribe", None)',
      '    if callable(unsubscribe):',
      '        return unsubscribe',
      '    source_unsubscribe = _host_get(value, "unsubscribe", None)',
      '    if callable(source_unsubscribe):',
      '        return source_unsubscribe',
      '    return None',
      '',
      'def should_subscribe_retained_endpoint(endpoint, policies):',
      '    for policy in policies.get("retainedCurrent", []):',
      '        payload = policy.get("payload", {})',
      '        if not retained_policy_matches_endpoint(policy, endpoint):',
      '            continue',
      '        if payload.get("realization") == "observable" and payload.get("notification") in (None, "callback"):',
      '            return True',
      '    return False',
      '',
      'def retained_policy_matches_endpoint(policy, endpoint):',
      '    payload = policy.get("payload", {})',
      '    selector = payload.get("selector")',
      '    if isinstance(selector, dict):',
      '        if selector.get("luiId") is not None and (endpoint.get("owner", {}).get("kind") != "lui" or selector.get("luiId") != endpoint.get("owner", {}).get("luiId")):',
      '            return False',
      '        if selector.get("portKey") is not None and selector.get("portKey") != endpoint.get("portKey"):',
      '            return False',
      '        endpoint_path = endpoint.get("payloadPath") or []',
      '        selector_path = selector.get("payloadPath")',
      '        if selector_path is not None and selector_path != endpoint_path:',
      '            return False',
      '    path_endpoint = retained_policy_endpoint_from_path(policy.get("path", []))',
      '    if path_endpoint is not None and not same_retained_endpoint(path_endpoint, endpoint):',
      '        return False',
      '    return True',
      '',
      'def retained_policy_endpoint_from_path(path):',
      '    if not isinstance(path, list):',
      '        return None',
      '    for index, segment in enumerate(path):',
      '        if segment != "ports" or index + 1 >= len(path):',
      '            continue',
      '        owner = {"kind": "lu"}',
      '        for owner_index in range(0, index):',
      '            if path[owner_index] == "luis" and owner_index + 1 < index:',
      '                owner = {"kind": "lui", "luiId": path[owner_index + 1]}',
      '        return {"owner": owner, "portKey": path[index + 1]}',
      '    return None',
      '',
      'def same_retained_endpoint(left, right):',
      '    if left.get("portKey") != right.get("portKey"):',
      '        return False',
      '    left_owner = left.get("owner", {})',
      '    right_owner = right.get("owner", {})',
      '    if left_owner.get("kind") != right_owner.get("kind"):',
      '        return False',
      '    if left_owner.get("kind") == "lui" and left_owner.get("luiId") != right_owner.get("luiId"):',
      '        return False',
      '    return True',
      '',
      'def stop_retained_current_subscriptions(subscriptions):',
      '    while subscriptions:',
      '        unsubscribe = subscriptions.pop()',
      '        unsubscribe()',
      '',
      'def store_retained_values(core, values, retained_values, policies=None):',
      '    for endpoint in retained_endpoints(core, policies):',
      '        key = endpoint_key(endpoint)',
      '        found, value = get_retained_endpoint_value(values, endpoint, resolve_endpoint_port(core, endpoint))',
      '        if found:',
      '            retained_values[key] = value',
      '',
      'def get_retained_endpoint_value(values, endpoint, port):',
      '    assert_endpoint_pin_path(endpoint, port)',
      '    root_key = endpoint_root_key(endpoint)',
      '    path = _payload_path(endpoint)',
      '    if path and root_key in values:',
      '        found, value = get_path(values[root_key], path)',
      '        if found:',
      '            return True, value',
      '    key = endpoint_key(endpoint)',
      '    if key in values:',
      '        return True, values[key]',
      '    return False, None',
      '',
      'def retained_endpoints(core, policies=None):',
      '    endpoints = []',
      '    seen = set()',
      '    def push(endpoint):',
      '        key = endpoint_key(endpoint)',
      '        if key in seen:',
      '            return',
      '        seen.add(key)',
      '        endpoints.append(endpoint)',
      '    for port_key, port in core.get("ports", {}).items():',
      '        if port.get("interaction", {}).get("retainedCurrent") is True:',
      '            push({"owner": {"kind": "lu"}, "portKey": port_key})',
      '    for lui_id, lui in core.get("luis", {}).items():',
      '        for port_key, port in lui.get("ports", {}).items():',
      '            if port.get("interaction", {}).get("retainedCurrent") is True:',
      '                push({"owner": {"kind": "lui", "luiId": lui_id}, "portKey": port_key})',
      '    for policy in (policies or {}).get("retainedCurrent", []):',
      '        endpoint = retained_policy_selected_endpoint(policy)',
      '        if endpoint is not None:',
      '            push(endpoint)',
      '    return endpoints',
      '',
      'def retained_policy_selected_endpoint(policy):',
      '    path_endpoint = retained_policy_endpoint_from_path(policy.get("path", []))',
      '    selector = policy.get("payload", {}).get("selector")',
      '    if not isinstance(selector, dict) or selector.get("payloadPath") is None:',
      '        return None',
      '    if selector.get("luiId") is not None and selector.get("portKey") is not None:',
      '        return {"owner": {"kind": "lui", "luiId": selector.get("luiId")}, "portKey": selector.get("portKey"), "payloadPath": selector.get("payloadPath")}',
      '    if path_endpoint is None:',
      '        return None',
      '    endpoint = dict(path_endpoint)',
      '    endpoint["payloadPath"] = selector.get("payloadPath")',
      '    return endpoint',
      '',
      'def retained_current_for_lui(lui_id, lui, values, policies):',
      '    current = {}',
      '    for port_key, port in lui.get("ports", {}).items():',
      '        if port.get("interaction", {}).get("retainedCurrent") is not True:',
      '            continue',
      '        key = f"lui:{lui_id}:{port_key}:"',
      '        if key in values:',
      '            current[port_key] = values[key]',
      '    for policy in policies.get("retainedCurrent", []):',
      '        endpoint = retained_policy_selected_endpoint(policy)',
      '        if endpoint is None:',
      '            continue',
      '        owner = endpoint.get("owner", {})',
      '        path = endpoint.get("payloadPath") or []',
      '        if owner.get("kind") != "lui" or owner.get("luiId") != lui_id or not path:',
      '            continue',
      '        key = endpoint_key(endpoint)',
      '        if key not in values:',
      '            continue',
      '        current[endpoint.get("portKey")] = set_path(current.get(endpoint.get("portKey")), path, values[key])',
      '    return current',
      '',
      'def propagate(core, values):',
      '    for connection in core.get("connections", {}).values():',
      '        from_port = resolve_endpoint_port(core, connection["from"])',
      '        to_port = resolve_endpoint_port(core, connection["to"])',
      '        found = False',
      '        value = None',
      '        explicit_found, explicit_value = get_endpoint_value(values, connection["from"], from_port)',
      '        if explicit_found:',
      '            found = True',
      '            value = explicit_value',
      '        if not found:',
      '            continue',
      '        set_endpoint_value(values, connection["to"], to_port, value)',
      '',
      'def endpoint_key(endpoint):',
      '    suffix = "/".join(str(segment) for segment in _payload_path(endpoint))',
      '    root = endpoint_root_key(endpoint)',
      '    return f"{root}{suffix}" if suffix else root',
      '',
      'def endpoint_root_key(endpoint):',
      '    owner = endpoint["owner"]',
      '    if owner["kind"] == "lu":',
      '        return f"lu:{endpoint[\'portKey\']}:"',
      '    if owner["kind"] == "lui":',
      '        return f"lui:{owner[\'luiId\']}:{endpoint[\'portKey\']}:"',
      '    return f"closure:{owner[\'closureId\']}:{endpoint[\'portKey\']}:"',
      '',
      'def get_endpoint_value(values, endpoint, port):',
      '    assert_endpoint_pin_path(endpoint, port)',
      '    key = endpoint_key(endpoint)',
      '    if key in values:',
      '        return True, values[key]',
      '    root_key = endpoint_root_key(endpoint)',
      '    path = _payload_path(endpoint)',
      '    if path and root_key in values:',
      '        return get_path(values[root_key], path)',
      '    return False, None',
      '',
      'def set_endpoint_value(values, endpoint, port, value):',
      '    assert_endpoint_pin_path(endpoint, port)',
      '    values[endpoint_key(endpoint)] = value',
      '    root_key = endpoint_root_key(endpoint)',
      '    path = _payload_path(endpoint)',
      '    if not path:',
      '        values[root_key] = value',
      '        return',
      '    root = values[root_key] if root_key in values else create_root_for_port(port, path)',
      '    values[root_key] = set_path(root, path, value)',
      '',
      'def resolve_endpoint_port(core, endpoint):',
      '    owner = endpoint["owner"]',
      '    port_key = endpoint["portKey"]',
      '    if owner["kind"] == "lu":',
      '        return core.get("ports", {}).get(port_key)',
      '    if owner["kind"] == "lui":',
      '        lui = core.get("luis", {}).get(owner["luiId"], {})',
      '        return lui.get("ports", {}).get(port_key)',
      '    closure_core = core.get("closures", {}).get(owner["closureId"], {})',
      '    return closure_core.get("ports", {}).get(port_key)',
      '',
      'def assert_endpoint_pin_path(endpoint, port):',
      '    path = _payload_path(endpoint)',
      '    pins = (port or {}).get("pins")',
      '    if not pins or not path:',
      '        return',
      '    first = path[0]',
      '    if pins.get("kind") == "indexed":',
      '        if not isinstance(first, int) or first < 0 or first >= pins.get("count", 0):',
      '            raise RuntimeError(f"Payload path {\'/\'.join(str(part) for part in path)} is outside indexed pins for port {endpoint[\'portKey\']}.")',
      '        return',
      '    if not isinstance(first, str) or first not in pins.get("keys", []):',
      '        raise RuntimeError(f"Payload path {\'/\'.join(str(part) for part in path)} is outside keyed pins for port {endpoint[\'portKey\']}.")',
      '',
      'def create_root_for_port(port, path):',
      '    pins = (port or {}).get("pins")',
      '    if pins and pins.get("kind") == "indexed":',
      '        return [None] * pins.get("count", 0)',
      '    if pins and pins.get("kind") == "keyed":',
      '        return {}',
      '    return [] if isinstance(path[0], int) else {}',
      '',
      'def target_key(target):',
      '    if target.get("kind") == "external":',
      '        return f"external:{target.get(\'namespace\')}:{target.get(\'key\')}"',
      '    if target.get("kind") == "lu":',
      '        return f"lu:{target.get(\'luId\')}"',
      '    return f"requirement:{target.get(\'serviceKey\')}:{target.get(\'unitKey\')}"',
      '',
      'def _payload_path(endpoint):',
      '    return endpoint.get("payloadPath") or []',
      '',
      'def get_path(value, path):',
      '    current = value',
      '    for segment in path:',
      '        if isinstance(current, dict):',
      '            if segment not in current:',
      '                return False, None',
      '            current = current[segment]',
      '            continue',
      '        if isinstance(current, list) and isinstance(segment, int):',
      '            if segment < 0 or segment >= len(current):',
      '                return False, None',
      '            current = current[segment]',
      '            continue',
      '        return False, None',
      '    return True, current',
      '',
      'def set_path(root, path, value):',
      '    if not path:',
      '        return value',
      '    clone = list(root) if isinstance(root, list) else dict(root) if isinstance(root, dict) else [] if isinstance(path[0], int) else {}',
      '    current = clone',
      '    for index, segment in enumerate(path[:-1]):',
      '        next_segment = path[index + 1]',
      '        existing = None',
      '        if isinstance(current, dict):',
      '            existing = current.get(segment)',
      '        elif isinstance(current, list) and isinstance(segment, int):',
      '            while len(current) <= segment:',
      '                current.append(None)',
      '            existing = current[segment]',
      '        next_value = list(existing) if isinstance(existing, list) else dict(existing) if isinstance(existing, dict) else [] if isinstance(next_segment, int) else {}',
      '        if isinstance(current, dict):',
      '            current[segment] = next_value',
      '        else:',
      '            current[segment] = next_value',
      '        current = next_value',
      '    leaf = path[-1]',
      '    if isinstance(current, dict):',
      '        current[leaf] = value',
      '    elif isinstance(current, list) and isinstance(leaf, int):',
      '        while len(current) <= leaf:',
      '            current.append(None)',
      '        current[leaf] = value',
      '    return clone',
      '',
      'def _host_get(host, key, default=None):',
      '    if isinstance(host, dict):',
      '        return host.get(key, default)',
      '    return getattr(host, key, default)',
      '',
      'def _implementation_for(implementations, fulfillments, lui_id, target, fulfillment_snapshot=None):',
      '    direct = _host_get(implementations, lui_id)',
      '    if callable(direct):',
      '        return direct',
      '    by_target = _host_get(implementations, target_key(target))',
      '    if callable(by_target):',
      '        return by_target',
      '    if target.get("kind") != "requirement":',
      '        return None',
      '    return _callable_fulfillment_binding(',
      '        fulfillments, target.get("serviceKey"), target.get("unitKey"), fulfillment_snapshot',
      '    )',
      '',
      'def _callable_fulfillment_binding(fulfillments, service_key, unit_key, fulfillment_snapshot=None):',
      '    resolved = _resolve_fulfillment_binding(fulfillments, service_key, unit_key, fulfillment_snapshot)',
      '    return resolved if callable(resolved) else None',
      '',
      'def _resolve_fulfillment_binding(fulfillments, service_key, unit_key, fulfillment_snapshot=None):',
      '    snapshot_key = f"{service_key}:{unit_key}"',
      '    if fulfillment_snapshot is not None and snapshot_key in fulfillment_snapshot:',
      '        return fulfillment_snapshot[snapshot_key]',
      '    resolved = None',
      '    if callable(fulfillments):',
      '        resolved = fulfillments({"serviceKey": service_key, "unitKey": unit_key})',
      '    else:',
      '        resolver = _host_get(fulfillments, "resolve")',
      '        if callable(resolver):',
      '            resolved = resolver({"serviceKey": service_key, "unitKey": unit_key})',
      '        elif isinstance(fulfillments, dict):',
      '            candidates = [',
      '                fulfillments.get(f"{service_key}:{unit_key}"),',
      '                fulfillments.get(service_key, {}).get(unit_key) if isinstance(fulfillments.get(service_key), dict) else None,',
      '                fulfillments.get(service_key),',
      '                fulfillments.get("*"),',
      '            ]',
      '            for candidate in candidates:',
      '                if candidate is not None:',
      '                    resolved = candidate',
      '                    break',
      '    if fulfillment_snapshot is not None:',
      '        fulfillment_snapshot[snapshot_key] = resolved',
      '    return resolved',
      '',
    ].join('\n'),
  };
}

export function lowerVerilogModuleSkeleton(
  plan: VerilogHDLPlan,
  moduleName = 'logicir_top'
): SourceArtifact {
  const rootSignals = plan.signals.filter(
    (signal) =>
      signal.ownerPath.length >= 3 &&
      signal.ownerPath[0] === 'core' &&
      signal.ownerPath[1] === 'ports'
  );
  const portNames = rootSignals.map((signal) =>
    signalVerilogName(signal)
  );
  const lines: string[] = [];
  const signalMap = new Map(
    plan.signals.map((signal) => [
      endpointSignalKey(signalToEndpoint(signal)),
      signal,
    ])
  );

  lines.push('// Generated draft LogicIR Verilog HDL skeleton.');
  const clockResetNotes = formatClockResetNotes(plan.clockReset);
  if (clockResetNotes.length > 0) {
    lines.push(...clockResetNotes);
  }
  lines.push(`module ${sanitizeVerilogName(moduleName)}(`);
  lines.push(
    portNames.map((portName) => `  ${portName}`).join(',\n')
  );
  lines.push(');');
  lines.push('');

  for (const signal of rootSignals) {
    lines.push(formatVerilogPort(signal));
  }

  const internalSignals = plan.signals.filter(
    (signal) =>
      !(
        signal.ownerPath.length >= 3 &&
        signal.ownerPath[0] === 'core' &&
        signal.ownerPath[1] === 'ports'
      )
  );
  const stateRegisterTargets = new Set(
    collectStateRegisterTargetKeys(plan.stateRegisters)
  );
  if (internalSignals.length > 0) {
    lines.push('');
    lines.push('  // Planned internal LUI/closure boundary wires.');
    for (const signal of internalSignals) {
      lines.push(
        stateRegisterTargets.has(endpointSignalKey(signalToEndpoint(signal)))
          ? formatVerilogReg(signal)
          : formatVerilogWire(signal)
      );
    }
  }

  const instances = formatVerilogInstances(
    plan.core,
    plan.moduleBindings,
    plan.clockReset,
    signalMap
  );
  if (instances.length > 0) {
    lines.push('');
    lines.push('  // Planned external/LU module instances.');
    lines.push(...instances);
  }

  const structuralSliceWires = formatVerilogStructuralSliceInterfaceWires(
    plan.structuralSlicePlans
  );
  const structuralSliceInstances = formatVerilogStructuralSliceInstances(
    plan.structuralSlicePlans
  );
  if (structuralSliceWires.length > 0) {
    lines.push('');
    lines.push('  // Planned structural slice interface wires.');
    lines.push(...structuralSliceWires);
  }
  if (structuralSliceInstances.length > 0) {
    lines.push('');
    lines.push('  // Planned structural slice module instances.');
    lines.push(...structuralSliceInstances);
  }
  const structuralSliceLinks = formatVerilogStructuralSliceLinks(
    plan.structuralSliceLinks,
    plan.structuralSlicePlans
  );
  if (structuralSliceLinks.length > 0) {
    lines.push('');
    lines.push('  // Planned structural slice cross-links.');
    lines.push(...structuralSliceLinks);
  }

  const structuralSlices = formatVerilogStructuralSlices(
    plan.structuralSlicePlans
  );
  if (structuralSlices.length > 0) {
    lines.push('');
    lines.push('  // Planned structural slice partitions.');
    lines.push(...structuralSlices);
  }

  lines.push('');
  lines.push('  // Planned connection wiring.');
  for (const connection of Object.values(plan.core.connections)) {
    const assigns = formatVerilogAssign(connection, signalMap);
    lines.push(...(assigns ?? [`  // ${formatConnection(connection)}`]));
  }

  const behaviorAssigns = formatVerilogCombinationalAssigns(
    plan.combinationalAssigns,
    signalMap
  );
  if (behaviorAssigns.length > 0) {
    lines.push('');
    lines.push('  // Planned combinational behavior.');
    lines.push(...behaviorAssigns);
  }
  const stateRegisterBlocks = formatVerilogStateRegisters(
    plan.stateRegisters,
    plan.clockReset,
    signalMap
  );
  if (stateRegisterBlocks.length > 0) {
    lines.push('');
    lines.push('  // Planned state register behavior.');
    lines.push(...stateRegisterBlocks);
  }
  lines.push('endmodule');
  lines.push('');
  const sliceModules = formatVerilogStructuralSliceModules(
    plan.structuralSlicePlans
  );
  if (sliceModules.length > 0) {
    lines.push(...sliceModules);
  }

  return {
    kind: 'source',
    language: 'verilog',
    filename: `${sanitizeVerilogName(moduleName)}.v`,
    content: lines.join('\n'),
  };
}

function summarizeCore(core: PlannedCore): unknown {
  return {
    kind: core.kind,
    ports: Object.keys(core.ports),
    luis: Object.fromEntries(
      Object.entries(core.luis).map(([luiId, lui]) => [
        luiId,
        {
          kind: lui.kind,
          target: lui.target,
          ports: Object.keys(lui.ports),
          fulfillments: lui.fulfillments,
        },
      ])
    ),
    connections: Object.keys(core.connections),
    closures: Object.keys(core.closures),
    organization: core.organization,
  };
}

function summarizePolicies(
  policies: Record<string, { requirement: string }[]>
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(policies).map(([key, values]) => [key, values.length])
  );
}

function pythonJsonLoadsExpression(value: unknown): string {
  return `json.loads(${JSON.stringify(JSON.stringify(value, null, 2))})`;
}

function formatVerilogPort(signal: HDLSignalPlan): string {
  const direction = signal.boundary === 'input' ? 'input' : 'output';
  const signed = signal.signed ? ' signed' : '';
  const range = signal.width === 1 ? '' : ` [${signal.width - 1}:0]`;
  return `  ${direction}${signed}${range} ${signalVerilogName(signal)};`;
}

function formatVerilogWire(signal: HDLSignalPlan): string {
  const signed = signal.signed ? ' signed' : '';
  const range = signal.width === 1 ? '' : ` [${signal.width - 1}:0]`;
  return `  wire${signed}${range} ${signalVerilogName(signal)};`;
}

function formatVerilogReg(signal: HDLSignalPlan): string {
  const signed = signal.signed ? ' signed' : '';
  const range = signal.width === 1 ? '' : ` [${signal.width - 1}:0]`;
  return `  reg${signed}${range} ${signalVerilogName(signal)};`;
}

function formatClockResetNotes(clockReset: PlannedExtension[]): string[] {
  const notes: string[] = [];
  for (const extension of clockReset) {
    const payload = extension.payload;
    if (!isRecord(payload) || !isRecord(payload.clock)) {
      continue;
    }
    const domain =
      typeof payload.domain === 'string' ? payload.domain : 'default';
    const clockPort =
      typeof payload.clock.portKey === 'string'
        ? payload.clock.portKey
        : 'clock';
    const edge =
      payload.clock.edge === 'negedge' ? 'negedge' : 'posedge';
    const reset = isRecord(payload.reset)
      ? ` reset=${String(payload.reset.portKey)} ${String(
          payload.reset.kind
        )} active-${String(payload.reset.active)}`
      : '';
    notes.push(
      `// HDL clock-reset domain ${sanitizeVerilogComment(domain)}: ${edge} ${sanitizeVerilogComment(clockPort)}${sanitizeVerilogComment(reset)}`
    );
  }
  return notes;
}

function formatVerilogStructuralSlices(
  slices: HDLStructuralSlicePlan[]
): string[] {
  const lines: string[] = [];
  for (const slice of slices) {
    const required = slice.required ? 'required' : 'optional';
    const placement = slice.placement
      ? ` placement=${sanitizeVerilogComment(slice.placement)}`
      : '';
    lines.push(
      `  // slice ${sanitizeVerilogComment(slice.anchorKey)} -> module ${sanitizeVerilogName(slice.moduleName)} (${required})${placement}`
    );
    if (slice.rxPort || slice.txPort) {
      lines.push(
        `  //   bus rx=${sanitizeVerilogComment(slice.rxPort ?? '-')}, tx=${sanitizeVerilogComment(slice.txPort ?? '-')}`
      );
    }
    if (slice.rx || slice.tx) {
      lines.push(
        `  //   interface rx=${sanitizeVerilogComment(formatSliceInterfaceSummary(slice.rx))}, tx=${sanitizeVerilogComment(formatSliceInterfaceSummary(slice.tx))}`
      );
    }
    if (slice.bus) {
      const channelPath =
        slice.bus.channelPath && slice.bus.channelPath.length > 0
          ? ` channelPath=${slice.bus.channelPath.map(String).join('.')}`
          : '';
      lines.push(
        `  //   routing=${sanitizeVerilogComment(slice.bus.routing)}${sanitizeVerilogComment(channelPath)}`
      );
    }
    lines.push(
      `  //   root=${sanitizeVerilogComment(formatCompositionLeaf(slice.root))}`
    );
    if (slice.footprint.luis.length > 0) {
      lines.push(
        `  //   footprint.luis=${sanitizeVerilogComment(slice.footprint.luis.join(','))}`
      );
    }
    if (slice.footprint.luiOutlets.length > 0) {
      lines.push(
        `  //   footprint.luiOutlets=${sanitizeVerilogComment(
          slice.footprint.luiOutlets
            .map((ref) => `${ref.luiId}.${ref.outletKey}`)
            .join(',')
        )}`
      );
    }
    if (slice.footprint.externalOutlets.length > 0) {
      lines.push(
        `  //   footprint.externalOutlets=${sanitizeVerilogComment(
          slice.footprint.externalOutlets.join(',')
        )}`
      );
    }
    if (slice.footprint.anchors.length > 0) {
      lines.push(
        `  //   footprint.anchors=${sanitizeVerilogComment(
          slice.footprint.anchors
            .map((ref) => `${ref.luiId}.${ref.anchorKey}`)
            .join(',')
        )}`
      );
    }
    const childFills = Object.entries(slice.childAnchorFills);
    if (childFills.length > 0) {
      lines.push(
        `  //   childAnchorFills=${sanitizeVerilogComment(
          childFills
            .map(([luiId, fills]) => `${luiId}[${Object.keys(fills).join(',')}]`)
            .join('; ')
        )}`
      );
    }
  }
  return lines;
}

function formatVerilogStructuralSliceModules(
  slices: HDLStructuralSlicePlan[]
): string[] {
  const lines: string[] = [];
  for (const slice of slices) {
    const ports = collectSliceInterfacePorts(slice);
    const moduleName = sanitizeVerilogName(slice.moduleName);
    lines.push(
      `// Structural slice stub for export anchor ${sanitizeVerilogComment(slice.anchorKey)}.`
    );
    lines.push(
      `module ${moduleName}${formatVerilogPortList(
        ports.map((port) => port.name)
      )};`
    );
    for (const port of ports) {
      lines.push(formatVerilogSliceInterfacePort(port));
    }
    lines.push('endmodule');
    lines.push('');
  }
  return lines;
}

function formatVerilogStructuralSliceInterfaceWires(
  slices: HDLStructuralSlicePlan[]
): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();
  for (const slice of slices) {
    for (const port of collectSliceInterfacePorts(slice)) {
      const wireName = sliceInterfaceWireName(slice, port.name);
      if (seen.has(wireName)) {
        continue;
      }
      seen.add(wireName);
      lines.push(formatVerilogSliceInterfaceWire(wireName, port.signal));
    }
  }
  return lines;
}

function formatVerilogStructuralSliceInstances(
  slices: HDLStructuralSlicePlan[]
): string[] {
  const lines: string[] = [];
  for (const slice of slices) {
    const ports = collectSliceInterfacePorts(slice);
    if (ports.length === 0) {
      continue;
    }
    const moduleName = sanitizeVerilogName(slice.moduleName);
    const instanceName = sanitizeVerilogName(`u_slice_${slice.anchorKey}`);
    lines.push(`  ${moduleName} ${instanceName} (`);
    lines.push(
      ports
        .map(
          (port) =>
            `    .${sanitizeVerilogName(port.name)}(${sliceInterfaceWireName(slice, port.name)})`
        )
        .join(',\n')
    );
    lines.push('  );');
  }
  return lines;
}

function formatVerilogStructuralSliceLinks(
  links: VerilogHDLPlan['structuralSliceLinks'],
  slices: HDLStructuralSlicePlan[]
): string[] {
  const byAnchor = new Map(
    slices.map((slice) => [structuralSliceKey(slice.corePath, slice.anchorKey), slice])
  );
  const lines: string[] = [];
  const linksByConsumer = new Map<string, typeof links>();
  for (const link of links) {
    const key = structuralSliceKey(link.corePath, link.toAnchorKey);
    linksByConsumer.set(key, [
      ...(linksByConsumer.get(key) ?? []),
      link,
    ]);
  }
  for (const [consumerKey, consumerLinks] of linksByConsumer) {
    const consumer = byAnchor.get(consumerKey);
    if (!consumer) {
      continue;
    }
    const rxPortName = consumer.rx?.portName ?? consumer.rxPort;
    if (!rxPortName) {
      continue;
    }
    const providers = consumerLinks
      .map((link) => {
        const provider = byAnchor.get(
          structuralSliceKey(link.corePath, link.fromAnchorKey)
        );
        const txPortName = provider?.tx?.portName ?? provider?.txPort;
        return provider && txPortName
          ? { link, provider, txPortName }
          : undefined;
      })
      .filter(
        (
          item
        ): item is {
          link: (typeof links)[number];
          provider: HDLStructuralSlicePlan;
          txPortName: string;
        } => item !== undefined
      );
    if (providers.length === 0) {
      continue;
    }
    if (providers.length > 1 && consumer.fanIn) {
      const op =
        consumer.fanIn.policy === 'and'
          ? '&'
          : consumer.fanIn.policy === 'xor'
            ? '^'
            : '|';
      lines.push(
        `  // fan-in ${sanitizeVerilogComment(consumer.fanIn.policy)} -> ${sanitizeVerilogComment(consumer.anchorKey)}`
      );
      lines.push(
        `  assign ${sliceInterfaceWireName(consumer, rxPortName)} = ${providers
          .map((provider) =>
            sliceInterfaceWireName(provider.provider, provider.txPortName)
          )
          .join(` ${op} `)};`
      );
      continue;
    }
    const [single] = providers;
    lines.push(
      `  // ${sanitizeVerilogComment(single.link.fromAnchorKey)}.${sanitizeVerilogComment(single.link.luiId)}.${sanitizeVerilogComment(single.link.outletKey)} -> ${sanitizeVerilogComment(single.link.toAnchorKey)}`
    );
    lines.push(
      `  assign ${sliceInterfaceWireName(consumer, rxPortName)} = ${sliceInterfaceWireName(single.provider, single.txPortName)};`
    );
  }
  return lines;
}

function structuralSliceKey(
  corePath: (string | number)[],
  anchorKey: string
): string {
  return `${JSON.stringify(corePath)}:${anchorKey}`;
}

function formatVerilogSliceInterfaceWire(
  wireName: string,
  signal: HDLSliceInterfacePlan | undefined
): string {
  const signed = signal?.signed ? ' signed' : '';
  const width = signal?.width ?? 1;
  const range = width > 1 ? ` [${width - 1}:0]` : '';
  return `  wire${signed}${range} ${wireName};`;
}

function sliceInterfaceWireName(
  slice: HDLStructuralSlicePlan,
  portName: string
): string {
  return sanitizeVerilogName(
    `slice_${slice.anchorKey}_${slice.moduleName}_${portName}`
  );
}

function collectSliceInterfacePorts(
  slice: HDLStructuralSlicePlan
): { name: string; direction: 'input' | 'output'; signal?: HDLSliceInterfacePlan }[] {
  const ports: {
    name: string;
    direction: 'input' | 'output';
    signal?: HDLSliceInterfacePlan;
  }[] = [];
  const names = new Set<string>();
  const push = (
    name: string | undefined,
    direction: 'input' | 'output',
    signal?: HDLSliceInterfacePlan
  ): void => {
    if (!isNonEmptyString(name) || names.has(name)) {
      return;
    }
    names.add(name);
    ports.push({ name, direction, signal });
  };
  push(slice.rx?.portName ?? slice.rxPort, 'input', slice.rx);
  push(slice.tx?.portName ?? slice.txPort, 'output', slice.tx);
  return ports;
}

function formatVerilogSliceInterfacePort(port: {
  name: string;
  direction: 'input' | 'output';
  signal?: HDLSliceInterfacePlan;
}): string {
  const signal = port.signal;
  const signed = signal?.signed ? ' signed' : '';
  const range =
    signal && signal.width > 1 ? ` [${signal.width - 1}:0]` : '';
  return `  ${port.direction}${signed}${range} ${sanitizeVerilogName(port.name)};`;
}

function formatSliceInterfaceSummary(
  signal: HDLSliceInterfacePlan | undefined
): string {
  if (!signal) {
    return '-';
  }
  const signed = signal.signed ? ' signed' : '';
  const packed = signal.packed ? ' packed' : '';
  return `${signal.portName}[${signal.width}]${signed}${packed} ${signal.encoding}`;
}

function formatVerilogPortList(ports: string[]): string {
  if (ports.length === 0) {
    return '';
  }
  return `(\n${ports
    .map((port) => `  ${sanitizeVerilogName(port)}`)
    .join(',\n')}\n)`;
}

function formatCompositionLeaf(
  leaf: HDLStructuralSlicePlan['root']
): string {
  if (!leaf) {
    return 'missing';
  }
  if (leaf.kind === 'empty') {
    return 'empty';
  }
  if (leaf.kind === 'lui-outlet') {
    return `lui:${leaf.luiId}.${leaf.outletKey}`;
  }
  return `external-outlet:${leaf.outletKey}`;
}

function formatVerilogAssign(
  connection: PlannedConnection,
  signalMap: Map<string, HDLSignalPlan>
): string[] | undefined {
  const from = signalMap.get(endpointSignalKey(connection.from));
  const to = signalMap.get(endpointSignalKey(connection.to));
  if (!from || !to || from.width !== to.width) {
    return undefined;
  }
  const fromExpression =
    formatPackedAggregateSource(connection.from, from, signalMap) ??
    signalVerilogName(from);

  const assigns = [
    `  assign ${signalVerilogName(to)} = ${fromExpression};`,
  ];
  const packedAggregateTarget = formatPackedAggregateTarget(
    connection.to,
    to,
    signalMap
  );
  if (packedAggregateTarget) {
    assigns.push(
      `  assign ${packedAggregateTarget} = ${fromExpression};`
    );
  }
  return assigns;
}

function formatPackedAggregateSource(
  endpoint: PlannedEndpoint,
  pathSignal: HDLSignalPlan,
  signalMap: Map<string, HDLSignalPlan>
): string | undefined {
  const partSelect = formatPackedAggregateEndpoint(endpoint, pathSignal, signalMap);
  return partSelect;
}

function formatPackedAggregateTarget(
  endpoint: PlannedEndpoint,
  pathSignal: HDLSignalPlan,
  signalMap: Map<string, HDLSignalPlan>
): string | undefined {
  return formatPackedAggregateEndpoint(endpoint, pathSignal, signalMap);
}

function formatPackedAggregateEndpoint(
  endpoint: PlannedEndpoint,
  pathSignal: HDLSignalPlan,
  signalMap: Map<string, HDLSignalPlan>
): string | undefined {
  const rootSignal = signalMap.get(
    endpointSignalKey({ ...endpoint, payloadPath: undefined })
  );
  if (
    !rootSignal ||
    !rootSignal.packed ||
    !pathSignal.packed ||
    !endpoint.payloadPath ||
    endpoint.payloadPath.length === 0
  ) {
    return undefined;
  }

  const lastSegment = endpoint.payloadPath[endpoint.payloadPath.length - 1];
  if (
    typeof lastSegment !== 'number' ||
    !Number.isInteger(lastSegment) ||
    lastSegment < 0
  ) {
    return undefined;
  }

  const lsb = lastSegment * pathSignal.width;
  const msb = lsb + pathSignal.width - 1;
  if (msb >= rootSignal.width) {
    return undefined;
  }
  return `${signalVerilogName(rootSignal)}[${msb}:${lsb}]`;
}

function formatVerilogCombinationalAssigns(
  extensions: PlannedExtension[],
  signalMap: Map<string, HDLSignalPlan>
): string[] {
  const lines: string[] = [];
  for (const extension of extensions) {
    const payload = extension.payload;
    if (!isRecord(payload) || !Array.isArray(payload.assigns)) {
      continue;
    }
    for (const assign of payload.assigns) {
      if (!isRecord(assign)) {
        continue;
      }
      const to = isPlannedEndpoint(assign.to) ? assign.to : undefined;
      const targetSignal = to
        ? signalMap.get(endpointSignalKey(to))
        : undefined;
      const expr = formatVerilogExpression(assign.expr, signalMap);
      if (!targetSignal || !expr) {
        lines.push('  // unsupported combinational assign');
        continue;
      }
      lines.push(`  assign ${signalVerilogName(targetSignal)} = ${expr};`);
    }
  }
  return lines;
}

function collectStateRegisterTargetKeys(
  extensions: PlannedExtension[]
): string[] {
  const keys: string[] = [];
  for (const extension of extensions) {
    const payload = extension.payload;
    if (!isRecord(payload) || !Array.isArray(payload.registers)) {
      continue;
    }
    for (const register of payload.registers) {
      if (isRecord(register) && isPlannedEndpoint(register.target)) {
        keys.push(endpointSignalKey(register.target));
      }
    }
  }
  return keys;
}

function formatVerilogStateRegisters(
  extensions: PlannedExtension[],
  clockReset: PlannedExtension[],
  signalMap: Map<string, HDLSignalPlan>
): string[] {
  const lines: string[] = [];
  for (const extension of extensions) {
    const payload = extension.payload;
    if (!isRecord(payload) || !Array.isArray(payload.registers)) {
      continue;
    }
    for (const register of payload.registers) {
      if (!isRecord(register) || !isPlannedEndpoint(register.target)) {
        continue;
      }
      const targetSignal = signalMap.get(endpointSignalKey(register.target));
      const next = formatVerilogExpression(register.next, signalMap);
      if (!targetSignal || !next) {
        lines.push('  // unsupported state register');
        continue;
      }
      const domain = selectClockResetForRegister(
        typeof register.clockResetDomain === 'string'
          ? register.clockResetDomain
          : undefined,
        clockReset
      );
      if (!domain || !isRecord(domain.payload) || !isRecord(domain.payload.clock)) {
        lines.push('  // state register missing clock-reset domain');
        continue;
      }
      const clockPortKey =
        typeof domain.payload.clock.portKey === 'string'
          ? domain.payload.clock.portKey
          : undefined;
      const clockSignal = clockPortKey
        ? signalMap.get(
            endpointSignalKey({ owner: { kind: 'lu' }, portKey: clockPortKey })
          )
        : undefined;
      if (!clockSignal) {
        lines.push('  // state register clock signal not found');
        continue;
      }
      const edge = domain.payload.clock.edge === 'negedge' ? 'negedge' : 'posedge';
      const reset = isRecord(domain.payload.reset) ? domain.payload.reset : undefined;
      const resetPortKey =
        reset && typeof reset.portKey === 'string' ? reset.portKey : undefined;
      const resetSignal = resetPortKey
        ? signalMap.get(
            endpointSignalKey({ owner: { kind: 'lu' }, portKey: resetPortKey })
          )
        : undefined;
      const asyncReset = reset?.kind === 'async' && resetSignal;
      const sensitivity = asyncReset
        ? `${edge} ${signalVerilogName(clockSignal)} or ${reset.active === 'low' ? 'negedge' : 'posedge'} ${signalVerilogName(resetSignal)}`
        : `${edge} ${signalVerilogName(clockSignal)}`;
      const enable = formatVerilogExpression(register.enable, signalMap);
      lines.push(`  always @(${sensitivity}) begin`);
      const resetValue = formatVerilogExpression(register.resetValue, signalMap);
      if (reset && resetSignal && resetValue) {
        const condition =
          reset.active === 'low'
            ? `!${signalVerilogName(resetSignal)}`
            : signalVerilogName(resetSignal);
        lines.push(`    if (${condition}) begin`);
        lines.push(`      ${signalVerilogName(targetSignal)} <= ${resetValue};`);
        if (enable) {
          lines.push(`    end else if (${enable}) begin`);
          lines.push(`      ${signalVerilogName(targetSignal)} <= ${next};`);
          lines.push('    end');
        } else {
          lines.push('    end else begin');
          lines.push(`      ${signalVerilogName(targetSignal)} <= ${next};`);
          lines.push('    end');
        }
      } else if (enable) {
        lines.push(`    if (${enable}) begin`);
        lines.push(`      ${signalVerilogName(targetSignal)} <= ${next};`);
        lines.push('    end');
      } else {
        lines.push(`    ${signalVerilogName(targetSignal)} <= ${next};`);
      }
      lines.push('  end');
    }
  }
  return lines;
}

function selectClockResetForRegister(
  domain: string | undefined,
  clockReset: PlannedExtension[]
): PlannedExtension | undefined {
  if (!domain) {
    return clockReset[0];
  }
  return clockReset.find((extension) => {
    const payload = extension.payload;
    return isRecord(payload) && payload.domain === domain;
  });
}

function formatVerilogExpression(
  expr: unknown,
  signalMap: Map<string, HDLSignalPlan>
): string | undefined {
  if (!isRecord(expr)) {
    return undefined;
  }
  if (expr.kind === 'endpoint') {
    const endpoint = isPlannedEndpoint(expr.endpoint)
      ? expr.endpoint
      : undefined;
    const signal = endpoint
      ? signalMap.get(endpointSignalKey(endpoint))
      : undefined;
    return signal ? signalVerilogName(signal) : undefined;
  }
  if (expr.kind === 'constant') {
    return formatVerilogConstant(expr.value, expr.width);
  }
  if (expr.kind === 'unary' && isVerilogUnaryOp(expr.op)) {
    const inner = formatVerilogExpression(expr.expr, signalMap);
    return inner ? `(${expr.op}${inner})` : undefined;
  }
  if (expr.kind === 'reduction' && isVerilogReductionOp(expr.op)) {
    const inner = formatVerilogExpression(expr.expr, signalMap);
    return inner ? `(${expr.op}${inner})` : undefined;
  }
  if (expr.kind === 'binary' && isVerilogBinaryOp(expr.op)) {
    const left = formatVerilogExpression(expr.left, signalMap);
    const right = formatVerilogExpression(expr.right, signalMap);
    return left && right ? `(${left} ${expr.op} ${right})` : undefined;
  }
  if (expr.kind === 'mux') {
    const cond = formatVerilogExpression(expr.cond, signalMap);
    const thenExpr = formatVerilogExpression(expr.then, signalMap);
    const elseExpr = formatVerilogExpression(expr.else, signalMap);
    return cond && thenExpr && elseExpr
      ? `(${cond} ? ${thenExpr} : ${elseExpr})`
      : undefined;
  }
  if (expr.kind === 'concat' && Array.isArray(expr.items)) {
    const items = expr.items
      .map((item) => formatVerilogExpression(item, signalMap))
      .filter((item): item is string => item !== undefined);
    return items.length === expr.items.length ? `{${items.join(', ')}}` : undefined;
  }
  if (expr.kind === 'cast') {
    const inner = formatVerilogExpression(expr.expr, signalMap);
    if (!inner) {
      return undefined;
    }
    const signed =
      expr.signed === true ? '$signed' : expr.signed === false ? '$unsigned' : undefined;
    const signedExpr = signed ? `${signed}(${inner})` : inner;
    if (typeof expr.width === 'number' && Number.isInteger(expr.width) && expr.width > 0) {
      return `${expr.width}'(${signedExpr})`;
    }
    return signed ? signedExpr : `(${inner})`;
  }
  return undefined;
}

function formatVerilogConstant(
  value: unknown,
  width: unknown
): string | undefined {
  if (typeof value === 'boolean') {
    return formatSizedConstant(value ? 1 : 0, width);
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    return formatSizedConstant(value, width);
  }
  if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
    return formatSizedConstant(Number(value), width);
  }
  return undefined;
}

function formatSizedConstant(value: number, width: unknown): string {
  return typeof width === 'number' && Number.isInteger(width) && width > 0
    ? `${width}'d${value}`
    : String(value);
}

function isPlannedEndpoint(value: unknown): value is PlannedEndpoint {
  return (
    isRecord(value) &&
    isRecord(value.owner) &&
    typeof value.portKey === 'string' &&
    (value.payloadPath === undefined ||
      (Array.isArray(value.payloadPath) &&
        value.payloadPath.every(
          (segment) =>
            typeof segment === 'string' ||
            (typeof segment === 'number' && Number.isInteger(segment))
        )))
  );
}

function isVerilogUnaryOp(value: unknown): value is '~' | '!' | '-' {
  return value === '~' || value === '!' || value === '-';
}

function isVerilogReductionOp(
  value: unknown
): value is '&' | '|' | '^' | '~&' | '~|' | '~^' {
  return (
    value === '&' ||
    value === '|' ||
    value === '^' ||
    value === '~&' ||
    value === '~|' ||
    value === '~^'
  );
}

function isVerilogBinaryOp(
  value: unknown
): value is '+' | '-' | '*' | '&' | '|' | '^' | '==' | '!=' | '<' | '<=' | '>' | '>=' {
  return (
    value === '+' ||
    value === '-' ||
    value === '*' ||
    value === '&' ||
    value === '|' ||
    value === '^' ||
    value === '==' ||
    value === '!=' ||
    value === '<' ||
    value === '<=' ||
    value === '>' ||
    value === '>='
  );
}

function formatVerilogInstances(
  core: PlannedCore,
  moduleBindings: PlannedExtension[],
  clockReset: PlannedExtension[],
  signalMap: Map<string, HDLSignalPlan>
): string[] {
  const lines: string[] = [];
  for (const [luiId, lui] of Object.entries(core.luis)) {
    const binding = findLuiModuleBinding(moduleBindings, luiId);
    if (!binding) {
      continue;
    }
    const payload = binding.payload;
    if (!isRecord(payload) || typeof payload.moduleName !== 'string') {
      continue;
    }

    const instanceName =
      typeof payload.instanceName === 'string'
        ? payload.instanceName
        : `u_${luiId}`;
    const parameters = isRecord(payload.parameters)
      ? formatVerilogParameters(payload.parameters)
      : '';
    const explicitPortMap = isRecord(payload.portMap) ? payload.portMap : {};
    const ports = Object.keys(lui.ports).map((portKey) => {
      const externalName =
        typeof explicitPortMap[portKey] === 'string'
          ? explicitPortMap[portKey]
          : portKey;
      const endpoint: PlannedEndpoint = {
        owner: { kind: 'lui', luiId },
        portKey,
      };
      const signal =
        signalMap.get(endpointSignalKey(endpoint)) ??
        findFirstPortSignal(signalMap, endpoint);
      const wireName = signal
        ? signalVerilogName(signal)
        : sanitizeVerilogName(`lui_${luiId}_${portKey}`);
      return `    .${sanitizeVerilogName(externalName)}(${wireName})`;
    });
    ports.push(
      ...formatVerilogClockResetInstancePorts(
        luiId,
        lui.kind,
        explicitPortMap,
        clockReset,
        signalMap,
        new Set(Object.keys(lui.ports))
      )
    );

    lines.push(
      `  ${sanitizeVerilogName(payload.moduleName)}${parameters} ${sanitizeVerilogName(instanceName)} (`
    );
    lines.push(ports.join(',\n'));
    lines.push('  );');
  }
  return lines;
}

function formatVerilogClockResetInstancePorts(
  luiId: string,
  luiKind: PlannedCore['kind'],
  explicitPortMap: Record<string, unknown>,
  clockReset: PlannedExtension[],
  signalMap: Map<string, HDLSignalPlan>,
  existingPortKeys: Set<string>
): string[] {
  const domain = selectClockResetForLUI(luiId, luiKind, clockReset);
  if (!domain || !isRecord(domain.payload) || !isRecord(domain.payload.clock)) {
    return [];
  }

  const ports: string[] = [];
  const addRootPort = (portKey: unknown) => {
    if (typeof portKey !== 'string' || existingPortKeys.has(portKey)) {
      return;
    }
    const rootSignal = signalMap.get(
      endpointSignalKey({ owner: { kind: 'lu' }, portKey })
    );
    if (!rootSignal) {
      return;
    }
    const externalName =
      typeof explicitPortMap[portKey] === 'string'
        ? explicitPortMap[portKey]
        : portKey;
    existingPortKeys.add(portKey);
    ports.push(
      `    .${sanitizeVerilogName(externalName)}(${signalVerilogName(rootSignal)})`
    );
  };

  addRootPort(domain.payload.clock.portKey);
  if (isRecord(domain.payload.reset)) {
    addRootPort(domain.payload.reset.portKey);
  }
  return ports;
}

function selectClockResetForLUI(
  luiId: string,
  luiKind: PlannedCore['kind'],
  clockReset: PlannedExtension[]
): PlannedExtension | undefined {
  const directlyAttached = clockReset.find((extension) =>
    pathSelectsLUI(extension.path, luiId)
  );
  if (directlyAttached) {
    return directlyAttached;
  }

  const explicitlySelected = clockReset.find((extension) => {
    const payload = extension.payload;
    if (!isRecord(payload) || !isRecord(payload.selectors)) {
      return false;
    }
    const luiIds = payload.selectors.luiIds;
    return Array.isArray(luiIds) && luiIds.includes(luiId);
  });
  if (explicitlySelected) {
    return explicitlySelected;
  }

  if (luiKind !== 'sequential' && luiKind !== 'stateful') {
    return undefined;
  }

  return clockReset.find((extension) => {
    const payload = extension.payload;
    return !isRecord(payload) || !isRecord(payload.selectors);
  });
}

function pathSelectsLUI(path: (string | number)[], luiId: string): boolean {
  return path.some(
    (segment, index) =>
      segment === 'luis' &&
      path[index + 1] === luiId
  );
}

function findFirstPortSignal(
  signalMap: Map<string, HDLSignalPlan>,
  endpoint: PlannedEndpoint
): HDLSignalPlan | undefined {
  const prefix = `${endpointOwnerSignalPrefix(endpoint.owner)}:${endpoint.portKey}:`;
  for (const [key, signal] of signalMap) {
    if (key.startsWith(prefix)) {
      return signal;
    }
  }
  return undefined;
}

function findLuiModuleBinding(
  moduleBindings: PlannedExtension[],
  luiId: string
): PlannedExtension | undefined {
  return moduleBindings.find((binding) => {
    const payload = binding.payload;
    if (!isRecord(payload)) {
      return false;
    }
    const selector = payload.selector;
    if (!isRecord(selector)) {
      return binding.path.includes(luiId);
    }
    return selector.luiId === luiId;
  });
}

function formatVerilogParameters(parameters: Record<string, unknown>): string {
  const entries = Object.entries(parameters);
  if (entries.length === 0) {
    return '';
  }
  return ` #(\n${entries
    .map(
      ([key, value]) =>
        `    .${sanitizeVerilogName(key)}(${formatVerilogParameterValue(value)})`
    )
    .join(',\n')}\n  )`;
}

function formatVerilogParameterValue(value: unknown): string {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  return '0';
}

function formatConnection(connection: PlannedConnection): string {
  return `${formatEndpoint(connection.from)} -> ${formatEndpoint(connection.to)} (${connection.mode})`;
}

function formatEndpoint(endpoint: PlannedConnection['from']): string {
  const owner =
    endpoint.owner.kind === 'lu'
      ? 'lu'
      : endpoint.owner.kind === 'lui'
        ? `lui:${endpoint.owner.luiId}`
        : `closure:${endpoint.owner.closureId}`;
  const path =
    endpoint.payloadPath && endpoint.payloadPath.length > 0
      ? `/${endpoint.payloadPath.map(String).join('/')}`
      : '';
  return `${owner}.${endpoint.portKey}${path}`;
}

function signalToEndpoint(signal: HDLSignalPlan): PlannedEndpoint {
  const ownerPath = signal.ownerPath;
  if (ownerPath[1] === 'ports') {
    return {
      owner: { kind: 'lu' },
      portKey: signal.portKey,
      payloadPath: signal.payloadPath,
    };
  }
  if (ownerPath[1] === 'luis' && typeof ownerPath[2] === 'string') {
    return {
      owner: { kind: 'lui', luiId: ownerPath[2] },
      portKey: signal.portKey,
      payloadPath: signal.payloadPath,
    };
  }
  if (ownerPath[1] === 'closures' && typeof ownerPath[2] === 'string') {
    return {
      owner: { kind: 'closure', closureId: ownerPath[2] },
      portKey: signal.portKey,
      payloadPath: signal.payloadPath,
    };
  }
  return {
    owner: { kind: 'lu' },
    portKey: signal.portKey,
    payloadPath: signal.payloadPath,
  };
}

function endpointSignalKey(endpoint: PlannedEndpoint): string {
  const owner = endpointOwnerSignalPrefix(endpoint.owner);
  const path = endpoint.payloadPath?.map(String).join('/') ?? '';
  return `${owner}:${endpoint.portKey}:${path}`;
}

function endpointOwnerSignalPrefix(endpoint: PlannedEndpoint['owner']): string {
  return endpoint.kind === 'lu'
    ? 'lu'
    : endpoint.kind === 'lui'
      ? `lui:${endpoint.luiId}`
      : `closure:${endpoint.closureId}`;
}

function signalVerilogName(signal: HDLSignalPlan): string {
  const pathSuffix = signalPathSuffix(signal);
  if (signal.ownerPath[1] === 'ports') {
    return sanitizeVerilogName(`${signal.portKey}${pathSuffix}`);
  }
  if (signal.ownerPath[1] === 'luis' && typeof signal.ownerPath[2] === 'string') {
    return sanitizeVerilogName(
      `lui_${signal.ownerPath[2]}_${signal.portKey}${pathSuffix}`
    );
  }
  if (
    signal.ownerPath[1] === 'closures' &&
    typeof signal.ownerPath[2] === 'string'
  ) {
    return sanitizeVerilogName(
      `closure_${signal.ownerPath[2]}_${signal.portKey}${pathSuffix}`
    );
  }
  return sanitizeVerilogName(`${signal.portKey}${pathSuffix}`);
}

function signalPathSuffix(signal: HDLSignalPlan): string {
  if (!signal.payloadPath || signal.payloadPath.length === 0) {
    return '';
  }
  return `_${signal.payloadPath.map(String).join('_')}`;
}

function sanitizeVerilogName(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_$]/g, '_');
  if (/^[a-zA-Z_$]/.test(sanitized)) {
    return sanitized;
  }
  return `_${sanitized}`;
}

function sanitizeVerilogComment(value: string): string {
  return value.replace(/[\r\n]/g, ' ').replace(/\*\//g, '* /');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
