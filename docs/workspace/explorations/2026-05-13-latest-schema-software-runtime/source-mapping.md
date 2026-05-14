# Source Mapping

This file records how the old JS/TS runtime informed this exploration. The old
files are evidence, not schema authority.

## Source Files

- `src/types/models.ts`: old LU/LUI/port/net model.
- `src/types/runtime.ts`: old `Result`, `ReturnResult`, provider, state store,
  session, and plugin/runtime types.
- `src/projector.ts`: old runtime entry point and provider lookup mechanism.
- `src/projection.ts`: old pull read, push dispatch, retained-current store,
  sequential await, closure, and composition behavior.
- `src/utils.ts`: old result constructors, thenable wrapper, runtime port
  indexing, and payload path helpers.

## Mapping To Current Core

| Old concept | Current schema/runtime replay |
| --- | --- |
| `PortKind.Pull` | `Port.interaction.pullReadable` plus `Port.boundary`. |
| `PortKind.Push` | `Port.interaction.pushNotifiable` plus dispatch over `Connection`. |
| `PortKind.Property` | `Port.interaction.retainedCurrent`; storage strategy is software-runtime feature/profile data. |
| `Net.source/target.address` | `Connection.from/to.payloadPath`. |
| `LU.kind` maps | `LUCore.kindOrganization.kind` discriminated union. |
| `sequentialSteps` with `isAwaited` | Core keeps `steps: LUIId[]`; await policy is `logicir.software-runtime/basic` `completion-policy`. |
| `LUITargetKind.Native` | Current `LUITarget.kind = external`; provider binding is execution profile data. |
| `AbstractLUT` / `dependencies` | Current requirement services and fulfillment model; not implemented in this runtime draft. |
| `Provider` injection | `ExecutionBinding` to an external target provider plus runtime `ProviderRegistry`. |
| `StateStore` | Runtime implementation detail for retained-current ports. Architecture binding uses namespaced `named` subject. |
| hooks/plugins | Out of scope; future observation/lifecycle features can add them. |

## Mapping To Architecture Data

| Runtime need | Architecture definition |
| --- | --- |
| Completion/thenable behavior | Feature extension point `completion-policy` on `lu-core`. |
| External target call contract | Feature extension point `provider-contract` on `lui`. |
| Retained-current storage | Feature extension point `retained-current-realization` on `port`; execution binding `retained-current-store`. |
| Provider registry | Provider contract `logicir.software-runtime/external-provider`; execution binding `external-target-providers`. |
| Direct interpretation | Execution profile `basic-software-direct-execution`. |
| Interpreter plan route | Projection profile `basic-software-interpreter-plan`. |

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

