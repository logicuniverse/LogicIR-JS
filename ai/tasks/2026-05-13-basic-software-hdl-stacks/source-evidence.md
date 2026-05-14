# Source Evidence

This file records the concrete evidence used to draft `basic-software` and
`basic-hdl`. Current TS/JS code is historical prototype evidence, not authority
for the new schema.

## Current Architecture Evidence

`dev/logicir-architecture.md` defines:

- LogicIR document as the mutable logic object.
- Three single-layer profile types:
  - IR Pipeline Profile.
  - Projection Profile.
  - Execution Profile.
- Stack as an end-to-end composition of those profiles.
- Execution binding as item-level mapping data.
- Execution provider as the concrete capability entity.
- Plugin as an implementation detail, not a core ecosystem term.

## Current Core Evidence

`packages/core/src/types.ts` provides target-neutral core shape:

- `LogicUnit` with `schemaVersion`, a LU-local `features` manifest, `core`,
  and `requirements`.
- `LUCore` kinds: `combinational`, `sequential`, `stateful`, `structural`.
- One `PortSurface` key namespace per owner.
- Port interaction capabilities:
  - `pullReadable`.
  - `pushNotifiable`.
  - `retainedCurrent`.
- `EndpointRef.payloadPath` for nested payload addressing.
- Requirement services and fulfillment relations.
- Closure cores and forwarded port keys.
- Structural composition through `exportAnchors`, `externalOutlets`,
  `exportAnchorFills`, `luiFills`, and structural LUI `compositionSurface`.
- Extension records with `{ featureKey, key, payload }`, where `featureKey`
  resolves through the containing `LogicUnit.features` manifest.

## Current TS/JS Prototype Evidence

### Old Model Shape

`packages/legacy/engine/src/types/models.ts` shows the old prototype mixing
schema and runtime convenience:

- `PortKind.Pull`, `PortKind.Push`, and `PortKind.Property`.
- `Property` is evidence for retained-current contact semantics.
- `Net.source.address` and `Net.target.address` are evidence for payload-level
  addressing.
- `SequentialStep.isAwaited` is evidence for software completion policy, not
  core sequential shape.
- `Provider`, `SovereignSource`, `dependencies`, `closures`, `Native`,
  `AbstractLUT`, and `LU` targets are evidence for requirement/provider
  binding pressure.
- `Composable` and `LUICompositions` are evidence for structural composition,
  but not final vocabulary.

### Runtime Result And Completion

`packages/legacy/engine/src/types/runtime.ts` defines:

- `Result = Ok | Error`.
- `Option = Some | Nothing`.
- `ReturnResult = Immediate | Thenable`.
- `Packet = { result, path? }`.
- `LUProjector` as a callable execution provider shape.
- `StateStore` as retained/current state backing evidence.
- `LUProjectorPlugin` with `getServiceProjector`, `inject`, and hooks.

For new architecture, `Thenable` should be abstracted as software completion,
not JS Promise. `LUProjectorPlugin` should be abstracted as local execution
provider packaging.

### Interpreter Provider Configuration

`packages/legacy/engine/src/projector.ts` shows:

- `createLUProjector(entryId, lus, plugins, getKVStore)`.
- `plugins` provide native service projectors and injection providers.
- `getKVStore` provides state/retained-current backing.
- Hook aggregation is a runtime/provider mechanism.
- Provider lookup order and caching are execution profile policies.

Architecture mapping:

```text
createLUProjector
  evidence for an Execution Engine factory

LUProjectorPlugin
  evidence for local Execution Provider packaging

getServiceProjector / inject / getKVStore
  evidence for Execution Bindings and Providers
```

### Execution Behavior

`packages/legacy/engine/src/projection.ts` shows:

- Pull reads gather source values from port state, constants, and computed
  combinational LUI returns.
- Push dispatch propagates packets along nets and preserves packet path.
- Property ports update `portStates` before dispatch.
- Combinational LUIs cannot return thenable.
- Stateful LUIs initialize and update property values.
- Sequential steps execute in order, with old `isAwaited` deciding whether to
  pause before the next step or continue and dispatch later.
- Closure projectors wrap nested LU execution and forward same-key ports.
- Requirement/provider injection chooses closure, default provider, or runtime
  provider.
- Hooks can observe, transform, or override runtime behavior.

New architecture mapping:

- Ordered software completion belongs to a software feature/profile.
- Retained-current realization belongs to an execution profile/provider.
- Closure/upstream fulfillment remains core relation, while supplier binding
  belongs to execution profile.
- Hooks belong to provider/execution implementation, not core.

## Archived Draft Evidence

The archived automatic-run drafts are not accepted schema, but they provide
useful proposal material:

- `ai/tasks/2026-05-13-projection-stack-goal/artifacts/unsubmitted-working-tree/schema/extensions/drafts/type-system.md`:
  payload types, path schemas, port/requirement/composition compatibility.
- `ai/tasks/2026-05-13-projection-stack-goal/artifacts/unsubmitted-working-tree/schema/extensions/drafts/js-runtime.md`:
  async/completion, retained-current realization, dynamic fulfillment,
  lifecycle, error policy.
- `ai/tasks/2026-05-13-projection-stack-goal/artifacts/unsubmitted-working-tree/schema/extensions/drafts/verilog-hdl.md`:
  signal types, clock/reset, module binding, combinational assigns,
  state registers, elaboration, structural slices.
- `ai/tasks/2026-05-13-projection-stack-goal/artifacts/unsubmitted-working-tree/schema/projection/CONFORMANCE.md`:
  candidate fixture coverage and diagnostics matrix.

This pack generalizes JS/Python-specific archived material into
`basic-software` where possible, and keeps Verilog-specific material in
`basic-hdl`.
