# Source Mapping

This file records how the old JS/TS runtime informed this exploration. The old
files are evidence, not schema authority.

## Source Files

- `packages/legacy/engine/src/types/models.ts`: old LU/LUI/port/net model.
- `packages/legacy/engine/src/types/runtime.ts`: old `Result`,
  `ReturnResult`, provider, state store, session, and plugin/runtime types.
- `packages/legacy/engine/src/projector.ts`: old runtime entry point and
  provider lookup mechanism.
- `packages/legacy/engine/src/projection.ts`: old pull read, push dispatch,
  retained-current store, sequential await, closure, and composition behavior.
- `packages/legacy/engine/src/utils.ts`: old result constructors, thenable
  wrapper, runtime port indexing, and payload path helpers.

## Mapping To Current Core

| Old concept | Current schema/runtime replay |
| --- | --- |
| `PortKind.Pull` | `Port.interaction.pullReadable` plus `Port.boundary`. |
| `PortKind.Push` | `Port.interaction.pushNotifiable` plus dispatch over `Connection`. |
| `PortKind.Property` | `Port.interaction.retainedCurrent`; this task keeps storage as task-local runtime state. |
| `Net.source/target.address` | `Connection.from/to.payloadPath`. |
| `LU.kind` maps | `LUCore.kindOrganization.kind` discriminated union. |
| `sequentialSteps` with `isAwaited` | Core keeps `steps: LUIId[]`; this task awaits task-local completion values directly. |
| `LUITargetKind.Native` | Current `LUITarget.kind = external`; provider lookup is a task-local runtime registry. |
| `AbstractLUT` / `dependencies` | Current requirement services and fulfillment model; not implemented in this runtime draft. |
| `Provider` injection | Runtime `ProviderRegistry` keyed by external target identity. |
| `StateStore` | Runtime implementation detail for retained-current ports. |
| hooks/plugins | Out of scope; future observation/lifecycle features can add them. |

## Deferred Architecture Candidates

The current smoke path does not define architecture/profile/stack catalog data.
The following items are candidates for later focused tasks, not active contracts
in this task:

| Runtime need | Future candidate |
| --- | --- |
| Completion/thenable behavior | Software runtime completion feature or execution policy. |
| External target call contract | Architecture-level execution binding and provider contract. |
| Retained-current storage | Retained-current feature plus runtime state realization policy. |
| Provider registry | Provider capability registry selected by execution context. |
| Direct interpretation | Basic software execution profile. |
| Interpreter plan route | Basic software projection profile. |

## Deliberate Non-Replays

The following old runtime features are intentionally not reproduced as active
behavior here:

- `GoBackIf` and `ReturnIf`: old control-flow nodes are feature/lowering
  territory. Core sequential organization only has ordered `LUIId[]`.
- Closure execution and fallback injection: current core has Closure and
  fulfillment structures, but this minimal software runtime focuses on direct
  external target providers.
- Structural/composable rendering: current structural composition is topology
  and projection material, not part of this basic direct software interpreter.
- Hook override behavior: old hooks are observation/override features, not core
  runtime semantics.
