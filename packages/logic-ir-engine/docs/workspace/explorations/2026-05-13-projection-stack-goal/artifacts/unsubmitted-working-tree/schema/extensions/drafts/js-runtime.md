# JS Runtime Feature Extension Drafts

These drafts describe software-runtime semantics that must not enter LogicIR
core. They are feature-scoped extension candidates for JS/TS projectors and
runtimes.

## Feature Identity

Recommended feature ref: `logicir.js-runtime / core`.

Extension keys under this feature:

- `async-policy`
- `retained-current-realization`
- `dynamic-fulfillment`
- `lifecycle`
- `error-policy`

Application bundles may group this feature, but projectors must declare
support for concrete feature refs and extension keys.

## `async-policy`

Purpose: describe JS async realization for sequential or external targets
without changing core sequential semantics.

Suggested attachment:

- `LUCore.extensions` for sequential organization policy.
- `LUI.extensions` for per-target invocation policy.
- `Port.extensions` only when the async behavior is a boundary contract.

Example payload shape:

```ts
type AsyncPolicyPayload =
  | {
      selector: { stepIndex: number };
      invocation: 'sync' | 'promise' | 'async-iterator';
      awaitBeforeNext: boolean;
    }
  | {
      selector: { luiId: string };
      invocation: 'sync' | 'promise' | 'async-iterator';
    };
```

Requirement guidance:

- `required` if projection correctness depends on await/order behavior.
- `optional` only for optimization hints that can be ignored.

Core boundary:

- Core keeps `steps: LUIId[]`.
- Branching, go-back, return, and await/no-await are not core step objects.
- The current executable JS draft supports `sync`, `promise`, and a minimal
  `async-iterator` subset that consumes the iterable and uses the final yielded
  output object. Streaming/backpressure semantics remain future runtime
  behavior. Required `awaitBeforeNext: false` is rejected during JS planning
  with `JS-004`, before lowering can generate runtime code that cannot
  preserve ordered execution.

## `retained-current-realization`

Purpose: declare where retained-current behavior is realized in a JS runtime.

Suggested attachment:

- `Port.extensions` when a port exposes a runtime store, signal, observable,
  or subscription contract.
- `LUI.extensions` when a target realizes multiple retained ports through the
  same runtime mechanism.

Example payload shape:

```ts
type RetainedCurrentPayload = {
  selector?: {
    luiId?: string;
    portKey: string;
    payloadPath?: (string | number)[];
  };
  realization:
    | 'source-store'
    | 'sink-cache'
    | 'projector-adapter'
    | 'host-observable';
  notification?: 'push' | 'subscribe' | 'microtask' | 'custom';
};
```

Requirement guidance:

- `required` when retained-current semantics would otherwise be lost.
- `optional` for runtime optimization or preferred implementation.

Core boundary:

- Core only states `retainedCurrent: true`.
- Core does not choose store/cache/subscription placement.
- The current executable JS draft realizes `source-store`, `sink-cache`,
  `host-observable`, and a minimal `projector-adapter` subset with an
  instance-local latest-value cache. For
  `host-observable`, a host latest-value source can also seed retained
  endpoints before execution. A minimal `host-observable` / `subscribe`
  subset is executable: host sources may expose `getSnapshot()` and
  `subscribe(listener)`, and listener delivery updates the runtime retained
  cache between invocations; `dispose()` unsubscribes active listeners. The
  current subset is policy-aware for endpoint-scoped subscriptions: a
  `retained-current-realization` extension attached to a concrete port, or a
  matching `selector.portKey`, limits subscription startup to matching retained
  endpoints instead of subscribing every retained-current contact. A concrete
  port attachment can also use `selector.payloadPath` to select a retained
  payload subpath. In that subset, the extension path supplies the endpoint
  owner and port, while `selector.payloadPath` selects the nested retained
  value. Core/LUI-level policies can instead use explicit
  `{ luiId, portKey, payloadPath }` selectors to identify a LUI endpoint owner
  without attaching the extension to the port. The runtime caches the selected
  value under the path-qualified endpoint key and assembles it into
  `context.retainedCurrent[portKey]` before invoking the LUI.
  After propagation, path-qualified retained cache entries are refreshed from
  the latest whole-port output when available, so a stale prior notification
  does not override a newer LUI result on the next invocation.
  Owner-less core/LUI-level policies that use `selector.payloadPath` without a
  concrete port attachment or explicit LUI selector are rejected during JS
  planning with `JS-006`.
  `notification: "microtask"` is supported as a minimal host-observable subset:
  listener delivery schedules the retained-cache update on the next microtask,
  making the update visible to later invocations after that turn. Reentrant
  invocation ordering, richer push scheduling, and custom notification
  contracts remain future runtime behavior.
  The `projector-adapter` subset means the projector inserts the same local
  latest-value adapter used for cache/store realization; it does not imply a
  host observable, custom scheduler, or stronger reentrant ordering contract.

## `dynamic-fulfillment`

Purpose: support runtime selection or switching of requirement suppliers.

Suggested attachment:

- `RequirementServiceFulfillment.extensions` for service-level switching.
- `UnitFulfillment.extensions` for per-unit switching.

Example payload shape:

```ts
type DynamicFulfillmentPayload = {
  selector?: { serviceKey?: string; unitKey?: string };
  mode: 'static-at-startup' | 'switchable' | 'late-bound';
  consistency:
    | 'no-live-switch'
    | 'quiescent-switch'
    | 'transactional-switch';
};
```

Requirement guidance:

- Usually `required`, because unsupported dynamic supply changes semantics.

Core boundary:

- Core records the fulfillment relation.
- Runtime policy decides how that relation is bound, switched, or diagnosed.
- The current executable JS lowering supports static-at-startup /
  no-live-switch binding, a minimal late-bound / no-live-switch subset, and
  minimal switchable / quiescent-switch plus switchable / transactional-switch
  subsets. Non-callable
  `host.fulfillments` entries count as startup evidence; callable entries can
  realize requirement-target LUIs. For late-bound or switchable fulfillment,
  `host.fulfillments` may be a resolver function or expose
  `resolve({ serviceKey, unitKey })`; it is consulted at the requirement LUI
  invocation boundary. The transactional subset snapshots a resolved supplier
  once per invocation for each `serviceKey:unitKey`, so multiple LUI calls in
  the same invocation observe the same supplier while later invocations may
  switch. Unsupported dynamic combinations, such as late-bound /
  transactional-switch, are rejected during JS planning with `JS-003`.

## `lifecycle`

Purpose: describe JS lifecycle callbacks or resource management for external
targets, closures, or stateful units.

Suggested attachment:

- `LUI.extensions` for target lifecycle.
- `Closure.extensions` for closure resource lifecycle.
- `LogicUnit.extensions` only for whole-unit lifecycle policy.

Example payload shape:

```ts
type LifecyclePayload = {
  selector?: { luiId?: string; closureId?: string };
  hooks: ('mount' | 'start' | 'stop' | 'dispose')[];
  ordering?: 'parent-before-child' | 'child-before-parent';
};
```

Requirement guidance:

- `required` if resource correctness depends on hook support.
- `optional` for diagnostics, tracing, or editor-only lifecycle notes.

Core boundary:

- Core has no hook API.
- Lifecycle is runtime realization.
- The current executable JS lowering supports a minimal host hook protocol:
  required `mount` and `start` hooks run before the first invocation; required
  `stop` and `dispose` hooks run from runtime `dispose()`. Missing required
  host hooks fail before execution. Ordering beyond this flat phase order
  remains future runtime behavior.

## `error-policy`

Purpose: define JS exception, rejection, cancellation, or error-port behavior.

Suggested attachment:

- `LUCore.extensions` for a whole core policy.
- `LUI.extensions` for per-target behavior.
- `Connection.extensions` if errors are explicitly routed through a declared
  connection-level policy.

Example payload shape:

```ts
type ErrorPolicyPayload = {
  selector?: { luiId?: string; portKey?: string };
  onThrow: 'fail-projection' | 'reject' | 'emit-error' | 'use-error-port';
  cancellation?: 'unsupported' | 'abort-signal' | 'custom';
};
```

Requirement guidance:

- `required` when the projected runtime must preserve error behavior.
- `optional` for logging or debugging behavior.

Core boundary:

- Fatal/error/result roles are not currently core port roles except
  `primary-result`.
- Error semantics should become feature extensions unless a later core version
  proves they are target-neutral topology.
- The current executable JS draft supports `reject`, a minimal
  `use-error-port` subset, and a minimal `emit-error` subset. For
  `use-error-port`, the policy selector must name the failing LUI and an output
  `portKey`; invalid selectors are rejected during JS planning with `JS-005`.
  The runtime writes a normalized `{ name, message }` object to that
  LUI output and uses ordinary LogicIR connections to expose it. For
  `emit-error`, the host must provide `emitError(event)`. Required
  `fail-projection` is rejected during JS planning with `JS-001`, before
  lowering can generate runtime code that cannot preserve it. Cancellation,
  typed error-payload contracts, and richer event-channel semantics remain
  future feature behavior.

## JS Projector Capability Checklist

A JS projector should declare support for:

- Core schema versions.
- LU kinds and LUI kind nesting matrix.
- Port interactions, including retained-current contacts.
- `payloadPath` depth and remapping.
- Closure fulfillment and upstream fulfillment forms.
- Each concrete JS feature ref and extension key.
- Safe-failure diagnostics for unsupported required extensions.
