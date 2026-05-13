# Python Runtime Feature Extension Drafts

These drafts describe Python runtime realization concerns that must stay out of
LogicIR core. They are useful for Python projectors, interpreters, and runtime
adapters.

## Feature Identity

Recommended feature ref: `logicir.python-runtime / core`.

Extension keys under this feature:

- `async-policy`
- `retained-current-realization`
- `dynamic-fulfillment`
- `resource-lifecycle`
- `concurrency`
- `error-policy`

Application bundles may group this feature, but projectors must declare
support for concrete feature refs and extension keys.

## `async-policy`

Purpose: describe Python async realization for sequential cores, external
targets, and requirement-backed invocations.

Suggested attachment:

- `LUCore.extensions` for sequential ordering policy.
- `LUI.extensions` for per-target invocation style.
- `Port.extensions` only when awaitability is a boundary contract.

Example payload shape:

```ts
type PythonAsyncPolicyPayload = {
  selector?: { stepIndex?: number; luiId?: string; portKey?: string };
  invocation:
    | 'sync-call'
    | 'coroutine'
    | 'async-generator'
    | 'generator'
    | 'threadpool-call';
  awaitBeforeNext?: boolean;
};
```

Requirement guidance:

- `required` when async ordering affects correctness.
- `optional` for optimization preferences.

Core boundary:

- Core sequential `steps` do not encode `asyncio`, coroutine, generator, or
  threadpool mechanics.
- The current executable Python draft supports `sync-call`, a minimal
  `coroutine` subset through `asyncio.run` when no event loop is already
  running, `generator` / `async-generator` by consuming the final yielded output
  object, and `threadpool-call` by running one implementation call in a
  one-worker executor. Required `awaitBeforeNext: false` is rejected during
  Python planning with `PY-004`, before lowering can generate runtime code that
  cannot preserve ordered execution. Streaming outputs, cancellation,
  backpressure, executor reuse, and already-running-loop integration remain
  future runtime behavior.

## `retained-current-realization`

Purpose: declare how retained-current ports are realized in a Python runtime.

Suggested attachment:

- `Port.extensions` for specific retained-current contacts.
- `LUI.extensions` when a target realizes many retained contacts through one
  object/store.

Example payload shape:

```ts
type PythonRetainedCurrentPayload = {
  selector?: {
    luiId?: string;
    portKey: string;
    payloadPath?: (string | number)[];
  };
  realization:
    | 'source-property'
    | 'sink-cache'
    | 'asyncio-queue-latest'
    | 'observable'
    | 'projector-adapter';
  notification?: 'callback' | 'asyncio-event' | 'queue' | 'poll';
};
```

Requirement guidance:

- `required` when losing retained-current changes visible behavior.
- `optional` for preferred implementation.

Core boundary:

- Core states retained-current semantics only; Python property/cache/event
  machinery is feature data.
- The current executable Python draft realizes `source-property`, `sink-cache`,
  `observable`, a minimal `asyncio-queue-latest` snapshot subset, and a minimal
  `projector-adapter` subset with an instance-local latest-value cache. For `observable`, a host can provide a
  source exposing `get_snapshot()` / `getSnapshot()` and
  `subscribe(listener)`; the runtime seeds the retained endpoint before first
  invocation, updates the cache when callbacks deliver new values, and calls
  the returned unsubscribe function from `runtime.dispose()`. For
  `asyncio-queue-latest`, a host can provide a queue-like source under
  `retainedCurrent` / `retained_current`; the runtime drains currently
  available items before invocation and seeds the retained endpoint with the
  latest item, falling back to the runtime cache when the queue is empty.
  A concrete port attachment can use `selector.payloadPath` to select a
  retained payload subpath. The extension path supplies the endpoint owner and
  port, while `selector.payloadPath` selects the nested retained value.
  Core/LUI-level policies can instead use explicit
  `{ luiId, portKey, payloadPath }` selectors to identify a LUI endpoint owner
  without attaching the extension to the port. The runtime caches the selected
  value under the path-qualified endpoint key and assembles it into
  `context["retainedCurrent"][portKey]` before invoking the LUI. Owner-less
  core/LUI-level policies that use `selector.payloadPath` without a concrete
  port attachment or explicit LUI selector are rejected during Python planning
  with `PY-008`. After propagation, path-qualified retained cache entries are
  refreshed from the latest
  whole-port output when available, so a stale prior notification does not
  override a newer LUI result on the next invocation.
  `notification: "poll"` is supported as conservative invoke-boundary polling:
  the runtime reads the latest host snapshot before each invocation and does
  not establish a subscription. `notification: "callback"` establishes the
  observable subscription described above.
  The `projector-adapter` subset means the projector inserts the same local
  latest-value adapter used for cache/property realization; it does not imply a
  host observable, asyncio event delivery, live queue delivery, backpressure,
  scheduled or background polling, or richer observable contracts.

## `dynamic-fulfillment`

Purpose: support late binding or runtime switching of requirement suppliers in
Python dependency environments.

Suggested attachment:

- `RequirementServiceFulfillment.extensions` for service-level binding.
- `UnitFulfillment.extensions` for unit-level binding.

Example payload shape:

```ts
type PythonDynamicFulfillmentPayload = {
  selector?: { serviceKey?: string; unitKey?: string };
  binding:
    | 'constructor-injected'
    | 'contextvar'
    | 'service-container'
    | 'late-bound'
    | 'switchable';
  consistency:
    | 'startup-only'
    | 'task-local'
    | 'quiescent-switch'
    | 'transactional-switch';
};
```

Requirement guidance:

- Usually `required`, because unsupported dynamic binding changes semantics.

Core boundary:

- Core records fulfillment relation and upstream reachability.
- Python DI/container/context mechanisms are runtime features.
- The current executable Python lowering supports constructor-injected /
  startup-only binding, a minimal late-bound / task-local subset, and minimal
  switchable / quiescent-switch plus switchable / transactional-switch subsets.
  Non-callable host
  `fulfillments` entries count as startup evidence; callable entries can
  realize requirement-target LUIs. For late-bound or switchable fulfillment,
  host `fulfillments` may be a resolver callable or expose
  `resolve({"serviceKey": ..., "unitKey": ...})`; it is consulted at the
  requirement LUI invocation boundary. The transactional subset snapshots a
  resolved supplier once per invocation for each `serviceKey:unitKey`, so
  multiple LUI calls in the same invocation observe the same supplier while
  later invocations may switch. Required contextvar, service-container, or
  unsupported consistency combinations such as late-bound /
  transactional-switch are rejected during Python planning with `PY-003`.

## `resource-lifecycle`

Purpose: describe context manager, startup/shutdown, and disposal behavior.

Suggested attachment:

- `LUI.extensions` for target instance resources.
- `Closure.extensions` for closure-scoped resources.
- `LogicUnit.extensions` for whole-unit runtime lifecycle.

Example payload shape:

```ts
type PythonResourceLifecyclePayload = {
  selector?: { luiId?: string; closureId?: string };
  protocol:
    | 'none'
    | 'context-manager'
    | 'async-context-manager'
    | 'start-stop'
    | 'custom';
  ordering?: 'parent-before-child' | 'child-before-parent';
};
```

Requirement guidance:

- `required` when resources must be acquired/released correctly.
- `optional` for tracing or editor annotations.

Core boundary:

- Core has no context manager or destructor protocol.
- The current executable Python draft supports `none` plus minimal
  `context-manager`, `async-context-manager`, and `start-stop` subsets. A host
  can provide `resources` keyed by selector, for example `adder` or
  `lui:adder`; the runtime enters or starts resources before first invocation,
  exposes the entered/started value through the LUI context, and exits or stops
  resources from `runtime.dispose()`. Async context managers use `asyncio.run`
  when no event loop is already running; integration with an already-running
  loop remains unsupported. `start-stop` supports synchronous `start()` /
  `stop()` and awaitable `start()` / `stop()` through `asyncio.run` when no
  event loop is already running. Required `custom` lifecycle is rejected during
  Python planning with `PY-005`, before lowering can generate runtime code that
  cannot preserve it. Already-running-loop start/stop integration, custom
  disposal, richer ordering, and idempotency/failure policy remain future
  runtime behavior.

## `concurrency`

Purpose: describe Python concurrency realization and isolation constraints.

Suggested attachment:

- `LUCore.extensions` for whole-core concurrency policy.
- `LUI.extensions` for target-specific scheduling or isolation.
- `Connection.extensions` for queue/backpressure policy.

Example payload shape:

```ts
type PythonConcurrencyPayload = {
  selector?: { luiId?: string; connectionId?: string };
  execution:
    | 'same-thread'
    | 'asyncio-task'
    | 'thread'
    | 'process'
    | 'external-worker';
  backpressure?: 'drop' | 'latest' | 'buffer' | 'block' | 'custom';
  ordering?: 'preserve' | 'best-effort' | 'unordered';
};
```

Requirement guidance:

- `required` when ordering, isolation, or backpressure affects semantics.
- `optional` for performance hints.

Core boundary:

- Core push/pull/retained-current contacts do not imply Python thread,
  process, task, queue, or GIL behavior.
- The current executable Python draft supports `same-thread` and a minimal
  blocking `thread` subset for synchronous LUI implementations. `thread`
  execution runs the selected implementation once in a one-worker executor and
  currently accepts only absent or `block` backpressure and absent or
  `preserve` ordering. Required `asyncio-task`, `process`, `external-worker`,
  non-blocking thread backpressure, or non-preserve thread ordering are
  rejected during Python planning with `PY-006`, before lowering can generate
  runtime code that cannot preserve them. Queues and richer backpressure remain
  future runtime behavior.

## `error-policy`

Purpose: define exception, cancellation, and task failure handling.

Suggested attachment:

- `LUCore.extensions` for default error policy.
- `LUI.extensions` for per-target overrides.
- `Connection.extensions` if error propagation is tied to a connection.

Example payload shape:

```ts
type PythonErrorPolicyPayload = {
  selector?: { luiId?: string; portKey?: string };
  onException:
    | 'raise'
    | 'return-exception'
    | 'emit-error'
    | 'cancel-task'
    | 'use-error-port';
  cancellation?: 'unsupported' | 'asyncio-cancel' | 'cooperative' | 'custom';
};
```

Requirement guidance:

- `required` when projected behavior depends on exception/cancellation
  semantics.
- `optional` for logging or debugging.

Core boundary:

- Core does not define Python exceptions or cancellation.
- The current executable Python draft supports `raise`, a minimal
  `use-error-port` subset, and a minimal `emit-error` subset. For
  `use-error-port`, the policy selector must name the failing LUI and an output
  `portKey`; invalid selectors are rejected during Python planning with
  `PY-007`. The runtime writes a normalized `{ name, message }` object to that
  LUI output and uses ordinary LogicIR connections to expose it. For
  `emit-error`, the host must provide `emit_error(event)` or `emitError(event)`.
  Required `return-exception` and `cancel-task` policies are rejected during
  Python planning with `PY-001`, before lowering can generate runtime code that
  cannot preserve them. Cancellation, typed exception payloads, and richer
  event-channel semantics remain future feature behavior.

## Python Projector Capability Checklist

A Python projector should declare support for:

- Core schema versions.
- LU kinds and nesting matrix.
- Sync, coroutine, generator, async-generator, and threadpool invocation forms.
- Retained-current realization forms it can preserve.
- Dynamic fulfillment binding forms.
- Resource lifecycle protocols.
- Concurrency, ordering, and backpressure policies.
- Error and cancellation policies.
- Type-system extensions it relies on for Python type hints or runtime checks.
- Diagnostics for unsupported required Python runtime extensions.
