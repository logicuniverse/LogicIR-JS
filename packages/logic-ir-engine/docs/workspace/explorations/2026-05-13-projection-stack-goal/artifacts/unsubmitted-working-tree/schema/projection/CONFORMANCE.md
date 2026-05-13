# Projection Conformance Matrix

This matrix maps current fixtures to target coverage and expected diagnostics.
`conformance-fixtures.ts` stores the top-level fixture matrix, and
`conformance-smoke.ts` keeps that matrix executable; the larger target smoke
files still carry detailed runtime and lowering behavior.

## Gates

Run these gates after changing schema, extension validators, projection plans,
or lowerings:

```powershell
.\node_modules\.bin\tsc.cmd --strict --noEmit --target ES2022 --module ESNext --moduleResolution node .\schema\core\v0-draft\types.ts .\schema\core\v0-draft\examples.ts .\schema\core\v0-draft\validator.ts .\schema\core\v0-draft\validator-smoke.ts .\schema\extensions\drafts\types.ts .\schema\extensions\drafts\validator.ts .\schema\projection\types.ts .\schema\projection\preflight.ts .\schema\projection\target-plans.ts .\schema\projection\lowering.ts .\schema\projection\preflight-smoke.ts .\schema\projection\js-runtime-smoke.ts .\schema\projection\python-runtime-smoke.ts .\schema\projection\conformance-fixtures.ts .\schema\projection\conformance-smoke.ts
yarn build
```

The executable smoke gate compiles these draft files to a temporary CommonJS
directory and runs:

- `core/v0-draft/validator-smoke.js`
- `projection/preflight-smoke.js`
- `projection/js-runtime-smoke.js`
- `projection/python-runtime-smoke.js`
- `projection/conformance-smoke.js`

## Core Fixtures

| Fixture | Source | Expected Coverage |
| --- | --- | --- |
| `combinationalAdderExample` | `core/v0-draft/examples.ts` | Basic ports, external LUI target, pull-readable connections, JS/Python executable combinational runtime, HDL typed module lowering. |
| `statefulRetainedCounterExample` | `core/v0-draft/examples.ts` | Push input, retained-current output, host-managed JS/Python stateful runtime, HDL clock/reset diagnostics. |
| `sequentialPipelineExample` | `core/v0-draft/examples.ts` | Ordered sequential steps, JS promise policy, Python sync-call policy. |
| `structuralCompositionExample` | `core/v0-draft/examples.ts` | Structural anchors/outlets, composition fills, structural slice extension validation. |
| `requirementClosureParentExample` | `core/v0-draft/examples.ts` | Requirement-backed target, closure fulfillment, forwarded ports, external target resolver fixture. |
| `sharedServiceUpstreamSupplierExample` | `core/v0-draft/examples.ts` | Shared-service fulfillment, upstream supplier resolution, type-system requirement compatibility. |

## Target Fixtures

| Target | Smoke File | Positive Evidence | Negative Diagnostics |
| --- | --- | --- | --- |
| Core validator | `core/v0-draft/validator-smoke.ts`, `projection/conformance-smoke.ts` | Positive examples plus local LU/external target/external requirement-service resolvers. | `VAL-005`, `VAL-010`, `VAL-012`, `VAL-017`, `VAL-018`, `VAL-019`, `VAL-028`, `VAL-036`, `VAL-037`, `VAL-040`, `VAL-042`, `VAL-043`, `VAL-045`. |
| Type system | `projection/preflight-smoke.ts`, `projection/conformance-smoke.ts` | Payload types, path schemas, named type definitions, exact/widening/assignable compatibility including record width subtyping, optional record fields, tuple/fixed-array compatibility, and union compatibility, composition compatibility, closure/upstream/shared-service requirement compatibility, and relation-aware requirement compatibility for structural-subtype versus same-contract. | `EXT-103`, `EXT-110`, `EXT-120`, `EXT-123`, `EXT-127`, `EXT-128`, `EXT-137`, `EXT-138`, `VAL-045`. |
| JS runtime | `projection/preflight-smoke.ts`, `projection/js-runtime-smoke.ts`, `projection/conformance-smoke.ts` | Capability collection, executable combinational/sequential/stateful runtime, payloadPath routing, first-level pin routing, promise and async-iterator invocation, static dynamic fulfillment evidence, callable requirement-target fulfillment binding, late-bound and switchable fulfillment resolution at LUI invocation boundaries, instance-local retained-current cache, host-observable latest-value seed, endpoint-aware subscribe delivery, port-attached and explicit-owner payloadPath retained-current subscribe/cache/context assembly, microtask retained-cache delivery, projector-adapter retained-current cache, host lifecycle hooks, reject error propagation, selector-based `use-error-port` routing, `host.emitError` side-channel events, planner-level `fail-projection`, owner-less payloadPath retained-current selector rejection, transactional dynamic-fulfillment, await-before-next, and invalid error-port selector safe failures, planner core-validation gate. | `EXT-201`, `JS-001`, `JS-003`, `JS-004`, `JS-005`, `JS-006`, `VAL-005`, `VAL-045`, missing dynamic evidence, missing lifecycle hook rejection. |
| Python runtime | `projection/preflight-smoke.ts`, `projection/python-runtime-smoke.ts`, `projection/conformance-smoke.ts` | Capability collection, executable combinational/sequential/stateful runtime, payloadPath routing, first-level pin routing, sync-call, coroutine, generator, async-generator, and threadpool-call invocation, constructor-injected dynamic evidence, callable requirement-target fulfillment binding, late-bound and switchable fulfillment resolution at LUI invocation boundaries, instance-local retained-current cache, projector-adapter retained-current cache, observable retained-current callback delivery and unsubscribe, port-attached and explicit-owner payloadPath retained-current subscribe/cache/context assembly, observable invoke-boundary poll snapshots without subscription, `asyncio-queue-latest` retained snapshot seed, synchronous and async context-manager resource lifecycle, synchronous and awaitable start-stop resource lifecycle, same-thread and blocking thread concurrency, raise error propagation, selector-based `use-error-port` routing, host `emit_error`/`emitError` side-channel events, planner-level return-exception/cancel-task, owner-less payloadPath retained-current selector rejection, transactional dynamic-fulfillment, await-before-next, custom resource lifecycle, unsupported concurrency, and invalid error-port selector safe failures, planner core-validation gate. | `EXT-301`, `EXT-306`, `PY-001`, `PY-003`, `PY-004`, `PY-005`, `PY-006`, `PY-007`, `PY-008`, `VAL-005`, `VAL-045`, missing dynamic evidence. |
| Verilog HDL | `projection/preflight-smoke.ts`, `projection/conformance-smoke.ts` | Signal planning, per-LUI and projector-registry module binding, registry interface compatibility, direct assign wiring, payloadPath signal flattening, packed lane part-selects, combinational expressions, enabled state-register behavior, clock/reset preservation and bound-instance wiring, structural slice plan derivation, static slice footprint derivation, skeleton metadata lowering, conservative structural slice interface wires, top-level slice instances, single-provider typed TX/RX cross-slice assigns, ambiguous slice fan-in diagnostics, declared bitwise slice fan-in lowering, and module stub emission with typed RX/TX slice ports, planner core-validation gate. | `HDL-001`, `HDL-002`, `HDL-003`, `HDL-004`, `HDL-005` state-register width mismatch, `HDL-006` state-register enable mismatch, `HDL-007` module registry interface mismatch, `HDL-008` required structural slice coverage, `HDL-009` structural slice TX/RX link mismatch, `HDL-010` structural slice fan-in ambiguity, `EXT-438`, `EXT-443`, `PRJ-017`, `PRJ-027`, `VAL-005`, `VAL-045`. |

## Remaining Matrix Gaps

- Expand `conformance-smoke.ts` execution from target-level table checks into
  dedicated target fixture files once target semantics stabilize.
- Add dedicated executable fixture files by target instead of growing one smoke
  script.
- Expand structural HDL conformance beyond current slice plan, static footprint,
  single-provider typed TX/RX assigns, ambiguous fan-in diagnostics, declared
  bitwise fan-in lowering, and conservative typed wire/instance/stub coverage
  once child elaboration and routed cross-slice bus wiring exist.
- Add broader JS/Python projector-managed retained-current fixtures for richer
  push scheduling, reentrant invocation ordering, richer observable contracts,
  and queue/backpressure semantics.
- Add richer type-system compatibility fixtures once stable feature versioning
  is decided.
