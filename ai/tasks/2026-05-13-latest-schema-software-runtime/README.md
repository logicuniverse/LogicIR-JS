# Latest Schema Software Runtime Exploration

Status: AI task material, not accepted project source or production runtime.

This pack replays the useful behavior of the earlier JS/TS runtime against the
current LogicIR core schema:

- `packages/core/src/types.ts` is the TS authoring source for LogicIR object
  shape.
- Old `packages/legacy/engine/src/types/models.ts`,
  `packages/legacy/engine/src/types/runtime.ts`,
  `packages/legacy/engine/src/projector.ts`, and
  `packages/legacy/engine/src/projection.ts` are evidence only.

The goal is to create human/AI discussion material for a future software runtime
profile. Nothing here should be promoted without review.

## Files

- `runtime/software-runtime.ts`: a small interpreter draft for current core
  LogicUnits.
- `examples/software-runtime-examples.ts`: minimal LogicIR examples and provider
  registry.
- `source-mapping.md`: mapping from old JS/TS runtime concepts to current
  core/architecture/runtime exploration concepts.
- `smoke.ts`: runtime checks for the examples.

## Deliberate Scope

Implemented runtime semantics:

- `Option`, `Result`, and completion values.
- Immediate and continuation/thenable completion.
- Pull-readable reads across `Connection` edges with `payloadPath`.
- Push dispatch to connected sinks.
- Retained-current port state.
- Sequential `steps: LUIId[]` with task-local await handling.
- External target provider invocation.

Not implemented in this pack:

- Closure fulfillment and upstream requirement lineage execution.
- Structural composition rendering.
- Handler/control-flow nodes from the old runtime.
- Hooks/plugins from the old runtime.
- JS-specific `Promise` as schema data.

Those omissions are intentional. They keep this exploration aligned with the
current core boundary and leave target-specific behavior to later focused
feature/profile/provider-contract tasks.

Minimal-round note: this task no longer carries architecture/profile/stack
catalog data because the smoke path only consumes core-shaped fixtures, a
provider registry, and the task-local runtime.

## Verification

From the package root:

```powershell
.\node_modules\.bin\tsc.cmd --strict --noEmit --target ES2022 --module ESNext --moduleResolution node packages\core\src\types.ts ai\tasks\2026-05-13-latest-schema-software-runtime\runtime\software-runtime.ts ai\tasks\2026-05-13-latest-schema-software-runtime\examples\software-runtime-examples.ts ai\tasks\2026-05-13-latest-schema-software-runtime\smoke.ts
```

To run the smoke checks without adding build artifacts to the repo, bundle the
task entrypoint so workspace package imports resolve from the repository root:

```powershell
.\node_modules\.bin\esbuild.cmd ai\tasks\2026-05-13-latest-schema-software-runtime\smoke.ts --bundle --platform=node --format=cjs --outfile=.tmp\latest-schema-software-runtime-smoke.cjs
node .tmp\latest-schema-software-runtime-smoke.cjs
Remove-Item .tmp\latest-schema-software-runtime-smoke.cjs
```
