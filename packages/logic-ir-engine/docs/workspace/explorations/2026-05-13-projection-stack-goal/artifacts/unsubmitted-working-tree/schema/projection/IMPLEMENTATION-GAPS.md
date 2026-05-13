# Projection Implementation Gaps

This file tracks what remains after the current schema, examples, validation
checklist, feature drafts, and capability contract types.

## Completed Artifacts

- Core shape: `schema/core/v0-draft/types.ts`.
- Positive core fixtures: `schema/core/v0-draft/examples.ts`.
- Core validator checklist and plan: `schema/core/v0-draft/VALIDATION.md`.
- Feature drafts:
  - `schema/extensions/drafts/type-system.md`.
  - `schema/extensions/drafts/js-runtime.md`.
  - `schema/extensions/drafts/python-runtime.md`.
  - `schema/extensions/drafts/verilog-hdl.md`.
- Draft feature payload types: `schema/extensions/drafts/types.ts`.
- Draft projector capability contract types: `schema/projection/types.ts`.
- Draft extension validator:
  `schema/extensions/drafts/validator.ts`.
- Projection preflight:
  `schema/projection/preflight.ts`.
- Draft target projection plans:
  `schema/projection/target-plans.ts`.
- Minimal skeleton and first executable lowering artifacts:
  `schema/projection/lowering.ts`.
- Projection preflight smoke checks:
  `schema/projection/preflight-smoke.ts`.
- JS executable runtime smoke:
  `schema/projection/js-runtime-smoke.ts`.
- Python executable runtime smoke:
  `schema/projection/python-runtime-smoke.ts`.
- Cross-target conformance matrix:
  `schema/projection/CONFORMANCE.md`.
- Data-only conformance fixture matrix:
  `schema/projection/conformance-fixtures.ts`.
- Table-driven conformance smoke:
  `schema/projection/conformance-smoke.ts`.

## Not Yet Complete

These are required before claiming type-system, JS/Python runtime, or Verilog
HDL projection is actually complete.

### Core Validator

- Implemented `validateLogicUnit`.
- Positive smoke coverage exists for `examples.ts`.
- Negative smoke coverage exists for the implemented core validator
  diagnostics: schema version, port interaction, retained-current,
  primary-result, pins, endpoint resolution and pin addressing, graph
  direction, interaction compatibility, overlapping targets, LUI kind matrix,
  sequential steps, resolver-backed target kind/port/composition
  compatibility, structural outlet/anchor/fill checks, fulfillment keys,
  fulfillment scope and coverage, closure fulfillment, closure forwarding,
  upstream reachability/supplier resolution, and required/optional extension
  capability diagnostics.
- Upstream reachability path and supplier service/unit resolution checks are
  implemented for core fulfillment validation.
- Resolver test doubles exist for local LU target checks, external target
  contracts, and external requirement-service contracts used by current
  examples.

Remaining:

- Decide whether protocol-level rules that are currently enforced by TypeScript
  shape or draft extension validators need additional runtime shape guards in
  the core validator. This mainly covers required map/array presence,
  non-repeated entity ids, `PayloadPath` non-computation semantics, concrete
  union branch integrity, composition leaf single-value shape, explicit-empty
  documentation, requirement nesting discipline, structural requirement-unit
  shape, closure forwarding discipline beyond same-key boundary checks, and
  extension registry/selector checks owned by draft feature validators.

### Type-System Feature

- Decide whether draft payload types become stable feature schemas or need a
  versioned namespace.
- Draft payload-shape validation is implemented.
- Draft selector resolution is implemented for local ports, LUIs,
  connections, anchors, outlets, closures, and sequential step indexes where
  the owner context can resolve them.
- Declared `path-schema` validation for `EndpointRef.payloadPath` is
  implemented when a path schema is attached to the referenced port.
- Declared `payload-types` are collected and checked across connections.
  Current compatibility coverage includes `exact`, structural `assignable`,
  record width subtyping, record optional fields, and conservative
  tuple/fixed-array and union compatibility under `assignable`, recursive
  shape-preserving `int -> float` widening through records, arrays, and
  tuples, and explicit `projector-adapter`/`custom` escape policies.
  `port-compatibility` policies can apply by owner-level default,
  `connectionId`, or endpoint selector matching `from`/`to` port keys and
  optional payload paths.
  `projector-adapter` now requires explicit `adapterTarget` evidence.
- Draft `type-definitions` registry lookup is implemented for named type
  references, including duplicate, unknown, and recursive named type
  diagnostics when they affect local connection checks.
- Draft `composition-compatibility` local checks are implemented for
  structural `exportAnchorFills` and `luiFills`: typed anchors require typed
  source outlets and are checked under `exact`, `assignable`, or `custom`
  policies.
- Draft requirement compatibility checks are implemented for the local closure
  fulfillment subset: when a fulfilled requirement unit and its closure core
  expose same-key `payload-types`, the validator compares them under the
  declared `requirement-compatibility` relation. Default
  `structural-subtype` compares input ports with `assignable` and output ports
  with `exact`; `same-contract` and `nominal-implements` use exact same-key
  payload matching; `adapter-required` requires evidence and is treated as an
  explicit adapter proof.
- Draft requirement compatibility checks now also cover upstream-unit
  fulfillments and upstream shared-service supplier fulfillments, including
  supplier services resolved through external requirement-service resolvers.
  Whole-port and explicitly declared nested `payloadPath` types are checked;
  `adapter-required` requires explicit evidence.

Remaining:

- Add richer compatibility rules beyond the current local structural subset.

### JS Runtime Projection

- Draft JS projector capability shape exists in `projection/types.ts`.
- Draft JS runtime extension payload validation and required-capability
  diagnostics exist in `extensions/drafts/validator.ts`.
- Draft JS runtime target planning exists in `projection/target-plans.ts`.
- Minimal JS runtime host skeleton lowering exists in
  `projection/lowering.ts`.
- First executable JS runtime lowering exists for typed combinational cores
  with whole-port, `payloadPath`, or first-level `Port.pins` connections and host-provided LUI
  implementations.
- The executable JS runtime also supports a minimal sequential subset by
  executing `organization.steps` in order and reusing the same host LUI
  implementation contract.
- The executable JS runtime supports a minimal host-managed stateful subset
  where host LUI implementations retain state across invocations and expose
  retained-current outputs through normal value propagation.
- The executable JS runtime now preserves async-policy payloads and supports
  required `sync`/`promise` invocation for ordered execution. It also supports
  required `async-iterator` invocation by consuming the async iterable and using
  the final yielded output object. Required `awaitBeforeNext: false` policies
  now fail during JS planning with `JS-004`, before lowering emits runtime code
  that cannot preserve ordered execution.
- Required dynamic fulfillment policies outside the
  static-at-startup/no-live-switch, late-bound/no-live-switch, and switchable
  quiescent/transactional subsets now fail during JS planning with `JS-003`,
  before lowering emits runtime code that cannot preserve stronger live-switch
  semantics.
- The executable JS runtime now requires `host.fulfillments` evidence for the
  supported static-at-startup/no-live-switch dynamic fulfillment subset.
- The executable JS runtime can now bind requirement-target LUIs to callable
  `host.fulfillments` entries, while preserving non-callable entries as startup
  evidence only. For the supported late-bound and switchable subsets,
  `host.fulfillments` may be a resolver function or expose
  `resolve({ serviceKey, unitKey })`; it is consulted at the requirement LUI
  invocation boundary. For switchable transactional fulfillment, a resolved
  supplier is snapshotted per invocation and reused by every matching
  requirement-target LUI in that invocation.
- The executable JS runtime supports the required `reject` error policy by
  preserving Promise rejection/exception propagation. It also supports a
  minimal required `use-error-port` subset when the policy selects an output
  port on the failing LUI; the runtime writes a normalized error object to that
  port and continues normal connection propagation. It supports a minimal
  required `emit-error` subset by calling `host.emitError` with a normalized
  event. Required invalid `use-error-port` selectors now fail during JS
  planning with `JS-005`, before lowering emits runtime code. Required
  `fail-projection` error policy now fails during JS planning with `JS-001`,
  before lowering emits runtime code.
- The executable JS runtime now supports required lifecycle hooks through a
  minimal host hook protocol: `mount` and `start` run before first invocation,
  and `stop` / `dispose` run from runtime `dispose()`. Missing required host
  hooks fail before execution.
- The executable JS runtime now supports required `source-store`,
  `sink-cache`, and `host-observable` retained-current realizations through an
  instance-local latest-value cache seeded before each invoke and updated after
  propagation. `host-observable` can additionally seed retained endpoints from
  a host latest-value source before execution. The minimal
  `host-observable` / `subscribe` subset can subscribe to host sources exposing
  `getSnapshot()` / `subscribe(listener)`, update the retained cache between
  invocations, and unsubscribe on runtime `dispose()`. Subscription startup is
  policy-aware for concrete port attachments and matching `selector.portKey`,
  so unrelated retained-current endpoints are not implicitly subscribed.
  Concrete port-attached policies can scope retained-current realization to
  `selector.payloadPath`; lowering seeds, subscribes, and caches the
  path-qualified endpoint key, then reconstructs nested
  `context.retainedCurrent[portKey]` for the selected LUI. Core/LUI-level
  policies can now use explicit `{ luiId, portKey, payloadPath }` selectors to
  identify retained-current LUI endpoints without attaching the extension to
  the port. Required owner-less payloadPath retained-current policies still
  fail during JS planning with `JS-006` when executable lowering cannot infer
  the endpoint owner safely.
  After propagation, path-qualified retained cache entries are refreshed from
  the latest whole-port output when available, so stale notification cache does
  not override newer LUI results on later invocations.
  `notification: "microtask"` is supported for host-observable delivery by
  scheduling retained-cache updates onto the next microtask, visible to later
  invocations after that turn. Required `projector-adapter` retained-current
  realization is supported as a minimal projector-inserted latest-value adapter
  over the same local cache path.

Remaining:

- Extend pin-aware executable routing beyond first-level declared pins when a
  future feature makes deeper pins explicit topology rather than payload paths.
- Extend executable lowering beyond the current combinational and ordered
  sequential plus host-managed stateful subsets.
- Extend retained-current realization beyond the current instance-local
  latest-value cache, projector-adapter cache subset, and minimal
  endpoint-aware host-observable subscribe subset, including richer push
  scheduling, reentrant invocation ordering, and richer observable contracts.
- Expand async-iterator execution semantics beyond the current final-yield
  output subset, including streaming outputs, cancellation, and backpressure.
- Implement dynamic fulfillment behavior beyond static callable startup
  bindings and the current late-bound plus switchable quiescent/transactional
  invocation-boundary resolver subsets, including stronger consistency
  policies.
- Expand lifecycle realization beyond the current flat host hook protocol,
  including selector-aware ordering, closure/child ordering, idempotency
  policies, and failure handling.
- Expand non-propagating error policy realization beyond the current
  selector-based `use-error-port` and host `emit-error` subsets, including
  typed error payload contracts, richer event-channel semantics, and
  cancellation behavior.

### Python Runtime Projection

- Draft Python projector capability shape exists in `projection/types.ts`.
- Draft Python runtime extension payload validation and required-capability
  diagnostics exist in `extensions/drafts/validator.ts`.
- Draft Python runtime target planning exists in `projection/target-plans.ts`.
- Minimal Python runtime host skeleton lowering exists in
  `projection/lowering.ts`.
- First executable Python runtime lowering exists for typed combinational cores
  with whole-port, `payloadPath`, or first-level `Port.pins` connections and host-provided LUI
  implementations.
- The executable Python runtime also supports a minimal sequential subset by
  executing `organization.steps` in order and reusing the same host LUI
  implementation contract.
- The executable Python runtime supports a minimal host-managed stateful subset
  where host LUI implementations retain state across invocations and expose
  retained-current outputs through normal value propagation.
- The executable Python runtime now preserves async-policy payloads and
  supports required `sync-call` invocation for ordered execution. It also
  supports required `coroutine` invocation through `asyncio.run` when no event
  loop is already running, required `generator` invocation by consuming the
  final yielded output object, required `async-generator` invocation through
  `asyncio.run` when no event loop is already running, and required
  `threadpool-call` invocation by running the implementation once in a
  one-worker executor. Required `awaitBeforeNext: false` policies now fail
  during Python planning with `PY-004`, before lowering emits runtime code that
  cannot preserve ordered execution.
- Required dynamic fulfillment policies outside the
  constructor-injected/startup-only, late-bound/task-local, and switchable
  quiescent/transactional subsets now fail during Python planning with
  `PY-003`, before lowering emits runtime code that cannot preserve contextvar,
  service-container, or stronger binding semantics.
- The executable Python runtime now requires host `fulfillments` evidence for
  the supported constructor-injected/startup-only dynamic fulfillment subset.
- The executable Python runtime can now bind requirement-target LUIs to callable
  host `fulfillments` entries, while preserving non-callable entries as startup
  evidence only. For the supported late-bound and switchable subsets, host
  `fulfillments` may be a resolver callable or expose
  `resolve({"serviceKey": ..., "unitKey": ...})`; it is consulted at the
  requirement LUI invocation boundary. For switchable transactional
  fulfillment, a resolved supplier is snapshotted per invocation and reused by
  every matching requirement-target LUI in that invocation.
- The executable Python runtime supports the required `raise` error policy by
  preserving exception propagation. It also supports minimal required
  `use-error-port` and `emit-error` subsets: `use-error-port` writes a
  normalized exception object to a selected LUI output port and uses normal
  connection propagation, while `emit-error` calls host `emit_error` /
  `emitError` with a normalized event. Required invalid `use-error-port`
  selectors now fail during Python planning with `PY-007`, before lowering
  emits runtime code. Required `return-exception` and `cancel-task` policies
  now fail during Python planning with `PY-001`, before lowering emits runtime
  code.
- The executable Python runtime accepts required `none` and minimal
  `context-manager`, `async-context-manager`, and `start-stop` resource
  lifecycle subsets. Resources are acquired or started before first invocation,
  exposed to selected LUIs through the implementation context, and released or
  stopped by `runtime.dispose()`. Async context managers use `asyncio.run` when
  no event loop is already running. `start-stop` supports synchronous and
  awaitable `start()` / `stop()` through `asyncio.run` when no event loop is
  already running. Required `custom` lifecycle now fails during Python planning
  with `PY-005`, before lowering emits runtime code that cannot preserve it.
- The executable Python runtime accepts required `same-thread` and minimal
  blocking `thread` concurrency subsets. The `thread` subset runs selected
  synchronous LUI implementations once in a one-worker executor. Required
  unsupported concurrency policies now fail during Python planning with
  `PY-006`, including task/process/external-worker execution and non-blocking
  or non-preserve thread policies.
- The executable Python runtime now supports required `source-property`,
  `sink-cache`, `observable`, and a minimal `asyncio-queue-latest` snapshot
  subset through an instance-local latest-value cache seeded before each invoke
  and updated after propagation. Observable host retained-current sources can
  expose `get_snapshot()` / `getSnapshot()` and `subscribe(listener)`; callback
  delivery updates the retained cache between invocations, and runtime
  `dispose()` unsubscribes active listeners. `notification: "poll"` is
  supported as invoke-boundary latest snapshot polling without subscription.
  Queue-like host retained-current sources are drained for the latest currently
  available item before invocation, and empty queues fall back to the runtime
  cache. Concrete port-attached policies can scope retained-current
  realization to `selector.payloadPath`; lowering seeds, subscribes, and caches
  the path-qualified endpoint key, then reconstructs nested
  `context["retainedCurrent"][portKey]` for the selected LUI. Core/LUI-level
  policies can now use explicit `{ luiId, portKey, payloadPath }` selectors to
  identify retained-current LUI endpoints without attaching the extension to
  the port. Required owner-less payloadPath retained-current policies still
  fail during Python planning with `PY-008` when executable lowering cannot
  infer the endpoint owner safely. After propagation, path-qualified retained cache entries are
  refreshed from the latest whole-port output when available, so stale
  notification cache does not override newer LUI results on later invocations.
  Required `projector-adapter` retained-current realization is supported as a
  minimal projector-inserted latest-value adapter over the same local cache
  path.

Remaining:

- Extend pin-aware executable routing beyond first-level declared pins when a
  future feature makes deeper pins explicit topology rather than payload paths.
- Extend executable lowering beyond the current combinational and ordered
  sequential plus host-managed stateful subsets.
- Extend retained-current realization beyond the current instance-local
  latest-value cache, projector-adapter cache subset,
  observable callback/poll subset, and queue snapshot subset, including
  asyncio events, live queue delivery/backpressure, scheduled or background
  polling, and richer observable contracts.
- Expand coroutine and async-generator support for already-running event loops,
  streaming outputs, cancellation, and backpressure.
- Expand threadpool execution beyond the current one-call/one-worker subset,
  including executor reuse, cancellation, backpressure, and resource lifecycle
  integration.
- Implement dynamic fulfillment behavior beyond static callable startup
  bindings and the current late-bound plus switchable quiescent/transactional
  invocation-boundary resolver subsets, including contextvar/service-container
  behavior and stronger consistency policies.
- Expand resource lifecycle beyond the current context-manager subsets,
  including already-running event-loop integration for async context managers,
  already-running event-loop integration for async start-stop resources, custom
  protocols, closure/unit ordering, and failure/idempotency policies.
- Add concurrency realization beyond `same-thread` and the current blocking
  `thread` subset, and expand exception / cancellation policy handling beyond
  the current `use-error-port`, `emit-error`, and planner-level unsupported
  policy diagnostics.

### Verilog HDL Projection

- Draft Verilog projector capability shape exists in `projection/types.ts`.
- Draft Verilog HDL extension payload validation exists in
  `extensions/drafts/validator.ts`.
- Preflight emits diagnostics for unsupported push-notifiable and
  retained-current contacts under Verilog capability constraints, and rejects
  software runtime dynamic-fulfillment policies under Verilog projection.
- Draft Verilog HDL target planning exists in `projection/target-plans.ts`.
- HDL target planning currently requires `signal-types` on concrete ports and
  collects signal plans.
- HDL target planning now requires `clock-reset` feature data for
  sequential/stateful cores and sequential/stateful LUI instances unless an
  enclosing core domain covers them.
- Minimal Verilog top-module skeleton lowering exists in
  `projection/lowering.ts`.
- Verilog lowering now emits internal boundary wires and direct `assign`
  statements for same-width whole-port connections.
- Verilog target planning and lowering now support explicitly typed
  `payloadPath` / pin-path signals from `signal-types` selectors and can wire
  same-width payload-path connections.
- Verilog lowering now supports a conservative packed aggregate assembly case:
  when a whole port and a numeric-lane payload-path signal are both explicitly
  typed as packed HDL signals, same-width lane writes also emit a part-select
  assignment into the whole packed root port. Smoke coverage includes multiple
  numeric lanes.
- Verilog lowering also supports the symmetric conservative source-side case:
  explicitly typed numeric payload lanes can read from the whole packed root
  port through a Verilog part-select. Smoke coverage includes multiple numeric
  lanes.
- Verilog lowering now emits child module instances from LUI-level
  `module-binding` extensions, including explicit `portMap` names.
- Verilog target planning now requires external LUI targets to have either a
  `module-binding` extension, explicit `combinational-assigns` behavior, or
  explicit `state-registers` behavior, so external target realization cannot be
  silently omitted.
- Verilog target planning can also use a projector-side `moduleRegistry`
  capability to bind known external target `namespace/key` identities to HDL
  module payloads, avoiding repeated per-LUI `module-binding` extensions for
  registry-backed targets. Optional registry `interface` contracts are now
  checked against LUI port boundaries and planned signal widths, with `HDL-007`
  diagnostics for mismatches.
- Verilog lowering now preserves planned clock/reset domains in the generated
  artifact and wires root clock/reset signals into bound sequential/stateful
  child module instances, so HDL lowering cannot silently lose the domain
  declaration at module boundaries.
- Verilog planning and lowering now support a feature-level
  `combinational-assigns` payload for endpoint, constant, unary, binary,
  concat, reduction, mux, and cast expressions.
- Verilog planning now emits `HDL-004` for conservative explicit-width
  combinational assignment mismatches when both target and expression widths
  can be resolved without guessing arithmetic result sizing.
- Verilog planning and lowering now support a minimal `state-registers`
  extension: explicitly typed register targets become `reg` declarations, and
  clock/reset-backed nonblocking assignments are emitted from HDL expressions.
  Optional 1-bit enable expressions are emitted as `else if` guards. Smoke
  coverage includes positive enabled register lowering, `HDL-005` diagnostics
  for conservative explicit-width register next/reset mismatches, and
  `HDL-006` diagnostics for non-1-bit enable expressions.
- Verilog planning now derives structural slice plans for structural cores
  from `exportAnchors`, `exportAnchorFills`, and `luiFills`. Required
  `structural-slices` extensions must cover required export anchors, otherwise
  planning emits `HDL-008`. Skeleton lowering preserves slice module names,
  root leaves, child anchor-fill context, derived static slice footprints,
  placement, RX/TX hints or typed RX/TX interface data, and bus routing metadata
  as explicit artifact comments.
  It emits conservative top-level slice interface wires, instantiates planned
  slice modules, and emits module stubs for each planned slice. Legacy RX/TX
  hint ports are emitted as 1-bit placeholders; typed RX/TX interface entries
  emit explicit width/signedness on those wires and stubs. Slice footprints
  identify child LUIs, child outlet refs, external outlet deps, and child
  anchors reachable from each export anchor. When a footprint references another
  slice's root LUI outlet, and the provider slice declares compatible typed TX
  while the consumer declares typed RX, lowering emits a conservative top-level
  cross-slice assign. Required structural slice links with incompatible typed
  TX/RX interfaces fail during HDL planning with `HDL-009`. Required structural
  slice payloads with multiple compatible provider TX dependencies for one
  consumer RX interface fail with `HDL-010` unless a supported
  `fanIn[consumerAnchorKey]` bitwise policy is declared. Current lowering
  supports typed same-interface `or`, `and`, and `xor` fan-in into the consumer
  RX wire. Smoke coverage includes `EXT-438` diagnostics for invalid slice
  interface widths and `EXT-443` diagnostics for invalid fan-in policies.

Remaining:

- Expand payload-path and pin-aware signal flattening beyond explicitly typed
  endpoint paths, including richer packed bit slicing, non-numeric layouts,
  nested packed paths, and aggregate validation beyond the current explicit
  numeric-lane subset.
- Expand combinational behavior lowering beyond the current expression subset,
  especially generated primitive libraries, richer type-directed operators,
  and target-specific arithmetic sizing rules.
- Expand executable sequential/stateful HDL behavior beyond the current
  `state-registers` subset, including multi-register domains, richer reset
  policies, state-machine encodings, generated primitive state libraries, and
  interaction with structural slice lowering.
- Expand external target module binding registry integration beyond the current
  in-memory capability map and local interface checks, including registry
  versioning and reusable interface contracts.
- Expand static structural elaboration beyond current slice planning,
  metadata lowering, derived static footprints, and conservative typed slice
  wires/instances/stubs plus single-provider typed TX/RX assigns and ambiguous
  fan-in diagnostics plus bitwise fan-in lowering, including anchor/outlet
  elaboration, routed cross-slice buses, fan-in policies beyond bitwise merge,
  arbitration lowering policies, child module placement inside slices, and
  integration with stateful/sequential lowering.
- Expand diagnostics/lowering decisions for non-static structural and runtime
  constructs beyond the currently covered push, retained-current, and software
  dynamic-fulfillment cases.

### Cross-Target Conformance

- A first fixture matrix exists in `schema/projection/CONFORMANCE.md` and
  `schema/projection/conformance-fixtures.ts`.
- Expected diagnostics for the current smoke coverage are recorded there.
- A first table-driven executable conformance smoke exists in
  `schema/projection/conformance-smoke.ts`. It verifies that executable cases
  stay aligned with `conformance-fixtures.ts`, verifies positive coverage and
  expected diagnostics per target, confirms JS/Python/Verilog planners run core
  validation before lowering, and confirms unsupported required extensions fail
  safely across targets.

Remaining:

- Expand table-driven conformance execution into dedicated target fixture files
  as the JS/Python/HDL semantics stabilize.
- Add matrix rows for newly implemented retained-current, dynamic fulfillment,
  lifecycle, resource, concurrency, deeper structural elaboration, and HDL
  sequential behavior.
