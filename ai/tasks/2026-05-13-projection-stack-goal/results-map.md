# Results Map

This map groups the archived automatic-run artifacts by design layer. Active
`schema/` files are the committed human-confirmed state; paths below marked
`artifacts/unsubmitted-working-tree/...` are not active project files.

The useful policy and roadmap material from tracked active-file edits has been
extracted into:

- `tracked-patch-extract.md`

## Core Schema And Validator

Primary artifacts:

- `packages/core/src/types.ts`
- `schema/core/v0-draft/README.md`
- `artifacts/unsubmitted-working-tree/schema/core/v0-draft/VALIDATION.md`
- `artifacts/unsubmitted-working-tree/schema/core/v0-draft/examples.ts`
- `artifacts/unsubmitted-working-tree/schema/core/v0-draft/validator.ts`
- `artifacts/unsubmitted-working-tree/schema/core/v0-draft/validator-smoke.ts`

Current evidence:

- `Port.interaction` is a three-field contact capability:
  `pullReadable`, `pushNotifiable`, and `retainedCurrent`.
- `Port.boundary` is separate from graph direction. Root LU/closure input
  ports are graph sources inside their core; LUI input ports are graph sinks.
- `PortSurface` uses one `PortKey` namespace per owner. Input and output ports
  cannot reuse the same key on the same owner.
- `EndpointRef.payloadPath` supports logical nested addressing for payloads,
  buses, lanes, and message fields without turning nested payload structure
  into nested core pins.
- `LUCore` is discriminated by `kindOrganization.kind`; the `luis` field
  remains one map, while the containing LU kind constrains allowed LUI kinds.
- Structural composition is represented with anchors and outlets:
  `exportAnchors`, `externalOutlets`, `exportAnchorFills`, `luiFills`, and
  structural LUI `compositionSurface`.
- Structural export anchors can be read as named spatial slices. Distributed
  slice projection is supported by core topology but remains a projection
  strategy.
- Requirement services can be inline or external by `namespace + key`.
  Fulfillment remains explicit Z-axis structure through closure or upstream
  supplier relations.
- Extension attachments are kept coarse: stable owners and relationship nodes,
  not helper children such as composition leaves or sequential step entries.

Current validator evidence:

- Positive examples cover combinational, stateful retained-current,
  sequential pipeline, structural composition, requirement closure, and shared
  upstream service cases.
- Negative smoke coverage exists for schema version, port interaction,
  retained-current, primary-result, pins, endpoint resolution, graph direction,
  target overlap, LUI kind matrix, sequential steps, target compatibility,
  structural composition, fulfillment scope, closure forwarding, upstream
  reachability, and required-extension capability diagnostics.

Remaining core concern:

- Decide whether additional runtime shape guards are needed for data already
  constrained by TypeScript authoring types or draft feature validators.

## Feature Drafts

Primary artifacts:

- `artifacts/unsubmitted-working-tree/schema/extensions/drafts/types.ts`
- `artifacts/unsubmitted-working-tree/schema/extensions/drafts/validator.ts`
- `artifacts/unsubmitted-working-tree/schema/extensions/drafts/type-system.md`
- `artifacts/unsubmitted-working-tree/schema/extensions/drafts/js-runtime.md`
- `artifacts/unsubmitted-working-tree/schema/extensions/drafts/python-runtime.md`
- `artifacts/unsubmitted-working-tree/schema/extensions/drafts/verilog-hdl.md`

Current evidence:

- Extension records are feature-centered: `feature.namespace + feature.key`
  selects a capability unit, and `ExtensionRecord.key` selects the payload kind
  inside that feature.
- Type-system payloads include primitive, record, array, tuple, union, and
  named type expressions.
- Type-system validation covers payload type declarations, path schemas,
  named type registry lookup, connection compatibility, composition
  compatibility, and requirement compatibility.
- JS runtime draft payloads cover async policy, retained-current realization,
  dynamic fulfillment, lifecycle, and error policy.
- Python runtime draft payloads cover invocation, retained-current realization,
  dynamic fulfillment, resource lifecycle, concurrency, and error policy.
- Verilog HDL draft payloads cover signal types, clock/reset, module binding,
  combinational assigns, state registers, elaboration, and structural slices.

Important boundary:

- Core does not import JS Promise/subscription/store mechanics, Python
  coroutine/resource mechanics, or HDL clock/reset/module mechanics.
- Required target behavior must be declared through required extensions and
  capability checks, not inferred as projector magic.

## Projection Contracts

Primary artifacts:

- `artifacts/unsubmitted-working-tree/schema/projection/types.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/preflight.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/target-plans.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/lowering.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/preflight-smoke.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/CONFORMANCE.md`
- `artifacts/unsubmitted-working-tree/schema/projection/conformance-fixtures.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/conformance-smoke.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/IMPLEMENTATION-GAPS.md`

Current evidence:

- Projection is represented as declared capabilities plus preflight, planning,
  and lowering, not as an unchecked conversion function.
- Preflight runs core validation, core capability checks, extension payload
  checks, and selected target constraints before target lowering.
- Capability contracts cover core support, type-system support, JS runtime,
  Python runtime, and Verilog HDL.
- Conformance has both a Markdown matrix and executable fixture matrix.
- Unsupported required extensions and unsupported target semantics produce
  diagnostics rather than being silently dropped.

## Type-System Projection Evidence

Implemented draft behaviors:

- `union` type form exists in type expressions and capability declarations.
- Assignability handles source unions and target unions conservatively.
- Record width subtyping, optional record fields, tuple/fixed-array checks,
  recursive widening, and named type lookup are covered by smoke tests.
- `projector-adapter` compatibility requires adapter target evidence.
- Requirement compatibility covers local closure fulfillment, upstream-unit
  fulfillment, and upstream shared-service suppliers, including external
  requirement-service resolver fixtures.

Remaining:

- Richer compatibility rules and stable feature schema/versioning decisions.

## JS Runtime Projection Evidence

Primary smoke artifact:

- `artifacts/unsubmitted-working-tree/schema/projection/js-runtime-smoke.ts`

Implemented draft behaviors:

- Executable combinational, ordered sequential, and host-managed stateful
  subsets.
- Whole-port, `payloadPath`, and first-level pin routing.
- Required `sync`, `promise`, and final-yield `async-iterator` ordered
  invocation subsets.
- Required dynamic fulfillment for static-at-startup/no-live-switch,
  late-bound/no-live-switch, switchable/quiescent, and
  switchable/transactional subsets.
- Transactional switchable fulfillment snapshots the resolved supplier per
  invocation for matching requirement-target LUIs.
- Required retained-current realizations include `source-store`, `sink-cache`,
  `host-observable`, and `projector-adapter` over an instance-local latest
  cache.
- Host-observable supports snapshot seeding, subscription, microtask delivery,
  payload-path-scoped retained cache, and unsubscribe on dispose.
- Lifecycle supports a minimal host hook protocol for mount/start/stop/dispose.
- Error policy supports reject propagation, selector-based error ports,
  host `emitError`, and planner diagnostics for unsupported or invalid cases.

Remaining:

- Richer push scheduling, reentrant invocation ordering, streaming async
  iterator outputs, cancellation/backpressure, fuller lifecycle ordering, and
  richer error event contracts.

## Python Runtime Projection Evidence

Primary smoke artifact:

- `artifacts/unsubmitted-working-tree/schema/projection/python-runtime-smoke.ts`

Implemented draft behaviors:

- Executable combinational, ordered sequential, and host-managed stateful
  subsets.
- Whole-port, `payloadPath`, and first-level pin routing.
- Required `sync-call`, coroutine, generator, async-generator, and one-call
  threadpool invocation subsets.
- Required dynamic fulfillment for constructor-injected/startup-only,
  late-bound/task-local, switchable/quiescent, and switchable/transactional
  subsets.
- Transactional switchable fulfillment snapshots the resolved supplier per
  invocation for matching requirement-target LUIs.
- Required retained-current realizations include `source-property`,
  `sink-cache`, `observable`, `asyncio-queue-latest` snapshot, and
  `projector-adapter`.
- Observable supports snapshot/poll/subscribe delivery and unsubscribe on
  dispose. Payload-path-scoped retained cache is supported.
- Resource lifecycle supports `none`, context manager, async context manager,
  and start-stop subsets.
- Concurrency supports same-thread and a blocking thread subset.
- Error policy supports raise propagation, selector-based error ports, and
  host `emit_error` / `emitError`.

Remaining:

- Already-running event-loop integration, live queue delivery/backpressure,
  executor reuse, cancellation, richer resource ordering, process/external
  worker execution, and fuller exception/cancellation semantics.

## Verilog HDL Projection Evidence

Primary smoke artifact:

- `artifacts/unsubmitted-working-tree/schema/projection/preflight-smoke.ts`

Implemented draft behaviors:

- Signal-type planning for root ports and explicitly typed endpoint paths.
- Same-width direct assigns for whole ports and explicitly typed payload paths.
- Conservative packed aggregate assembly and source-side part-selects for
  explicitly typed numeric lanes.
- Child module instances from LUI-level `module-binding` extensions.
- Projector-side module registry binding for external target `namespace/key`
  identities, including optional interface checks.
- Clock/reset coverage diagnostics and clock/reset preservation in generated
  artifacts.
- Feature-level `combinational-assigns` for endpoint, constant, unary,
  binary, concat, reduction, mux, and cast expressions, with conservative
  width diagnostics.
- Minimal `state-registers` lowering with typed register targets,
  clock/reset-backed nonblocking assignments, reset values, and optional
  1-bit enables.
- Structural slice plans derived from `exportAnchors`, `exportAnchorFills`,
  and `luiFills`.
- Structural slice skeleton lowering preserves slice metadata, top-level RX/TX
  wires, slice instances, module stubs, single-provider typed TX/RX links,
  ambiguous fan-in diagnostics, and bitwise fan-in lowering for `or`, `and`,
  and `xor`.

Remaining:

- Richer payload-path flattening, non-numeric/nested packed layouts, primitive
  libraries, target-specific arithmetic sizing, state-machine encodings,
  registry versioning, routed cross-slice buses, arbitration, child placement
  inside slices, and integration of structural slices with sequential/stateful
  lowering.

## Conformance Evidence

Primary artifacts:

- `artifacts/unsubmitted-working-tree/schema/projection/CONFORMANCE.md`
- `artifacts/unsubmitted-working-tree/schema/projection/conformance-fixtures.ts`
- `artifacts/unsubmitted-working-tree/schema/projection/conformance-smoke.ts`

Current evidence:

- Every target has positive coverage and expected diagnostic coverage.
- Planner core-validation gates are checked.
- Unsupported required extension failure is checked across targets.
- Current fixtures align the Markdown matrix with executable smoke checks.

Remaining:

- Split the growing smoke files into dedicated target fixture suites once
  target semantics stabilize.
