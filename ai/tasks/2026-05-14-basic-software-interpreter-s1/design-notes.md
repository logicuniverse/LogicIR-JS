# Design Notes

## Summary

S1 proves the narrowest useful `basic-software-interpreter` path: one
combinational LogicIR unit delegates to one external provider, then the software
engine maps provider output back to the LU output port.

This is intentionally not a full runtime. It is a verified slice that can guide
promotion of the first interpreter-plan projector and engine shapes.

## Theory Mapping

- LU/LUI: the fixture has one top-level combinational LU and one child
  combinational LUI.
- X/Y execution plane: input/output ports and connections carry values from LU
  boundary to provider LUI and back.
- Z requirement/fulfillment: not exercised in S1.
- Closure: not exercised in S1.
- Core vs architecture: core stores topology; a plain external-target add LUI
  does not need a software invocation feature. Provider selection is resolved by
  architecture-level execution bindings, not by LogicIR feature payload.
- Profile/stack layer: `basic-software-interpreter` composes
  `basic-software-ir`, `to-interpreter-plan`, and
  `software-interpreter-execution`.
- Projection/runtime boundary: the projector emits a serializable interpreter
  plan; the engine consumes that plan and a provider registry.

## Proposed Artifacts

| Draft Artifact | Intended Formal Home | Notes |
| --- | --- | --- |
| `src/architecture.ts` | `packages/architecture` fixtures or examples | Minimal S1 profile/stack/execution binding data. |
| `src/fixture.ts` | `fixtures/logicir` or `examples/basic-software` | Minimal pure invocation LogicIR fixture. |
| `src/resolver.ts` | future `packages/tools/profile-resolver` | Only supports the S1 profile composition. |
| `src/projector.ts` | future `packages/projectors/interpreter-plan` | Only supports one combinational external LUI. |
| `src/engine.ts` | future `packages/engines/software` | Only supports synchronous provider object in/out. |
| `src/smoke.ts` | future fixture-runner smoke | Verifies the full S1 chain. |

## Boundaries

Core boundary:

- Provider implementation, provider registry, execution binding, and stack
  selection stay out of core.
- No type-system data is required for S1.

Feature/extension boundary:

- Feature identity: none in S1. A plain add-pair external target does not need a
  software invocation feature just to be executable by this stack.
- Extension point: none in S1.
- Provider selection is not feature payload. It belongs to the execution profile
  binding selected by the stack.

Architecture/profile boundary:

- Profiles: `basic-software-ir`, `to-interpreter-plan`,
  `software-interpreter-execution`.
- Requiredness: no LogicIR feature is required for S1 pure invocation. The stack
  only carries the profile composition and execution binding data needed by the
  current end-to-end path.
- Execution binding: maps external target `logicir.examples.math / add-pair`
  to provider `logicir.examples.providers / add-pair-function`.

Implementation boundary:

- Resolver validates that the stack references one IR, one projection, and one
  execution profile, then returns only the S1 runtime view: `stackKey` and
  required execution bindings.
- Projector performs minimal capability-sensitive plan construction.
- Engine executes an already projected plan; it does not inspect LogicIR
  topology.

Round minimality:

- Each roadmap round should keep only the schema, profile, stack, plan, and
  runtime data that the round actually uses.
- Later rounds may add feature contracts, stages, provider contracts, validation
  output, diagnostics, or richer plan fields when their business path consumes
  them.
- S1 intentionally does not predeclare feature use manifest resolution, core
  validation stages, provider contract catalogs, or required feature lists.
- Empty `featureContracts`, `stages`, and `providerContracts` arrays remain only
  because the current architecture schema shape requires those fields.

## Alternatives Considered

| Option | Tradeoff | Decision |
| --- | --- | --- |
| Import formal TS source types directly | Stronger type coupling, but task build pulls formal package sources into the sandbox compile graph. | Not used for build; formal types are mirrored as a small S1-local subset and recorded as source references. |
| Make type-system required | More realistic for later validation, but violates S1 roadmap requirement and old runtime evidence. | Deferred. |
| Support many LUIs and topological scheduling | Closer to a real interpreter, but too broad for S1. | Deferred to later rounds after one invocation is verified. |
| Return diagnostics instead of throwing on invalid S1 shape | Better runtime UX, but S1 acceptance only needs success path. | Minimal fail-fast errors now; structured diagnostic round comes later. |

## Risks And Open Questions

- The S1-local type subset must be reconciled with formal package types before
  promotion.
- The current plan shape is intentionally narrow and should not be promoted as
  a complete interpreter plan schema.
- Provider output is assumed to be a plain object. Completion/async and error
  semantics belong to later rounds.
- Missing provider and invalid plan currently throw. Round S5 should replace
  this with shared structured diagnostics.
