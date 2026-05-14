# Latest Schema Software Runtime Exploration

Status: exploration material, not active schema or production runtime.

This pack replays the useful behavior of the earlier JS/TS runtime against the
current LogicIR core and architecture schemas:

- `packages/core/src/types.ts` is the TS authoring source for LogicIR object
  shape.
- `packages/architecture/src/types.ts` is the TS authoring source for feature,
  profile, stack, provider contract, and binding definition shapes.
- Old `packages/legacy/engine/src/types/models.ts`,
  `packages/legacy/engine/src/types/runtime.ts`,
  `packages/legacy/engine/src/projector.ts`, and
  `packages/legacy/engine/src/projection.ts` are evidence only.

The goal is to create human/AI discussion material for a future software runtime
profile. Nothing here should be promoted without review.

## Files

- `architecture/software-runtime-architecture.ts`: feature, capability, profile,
  provider contract, provider capability, and stack data using the latest
  architecture schema.
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
- Sequential `steps: LUIId[]` with profile-owned await policy.
- External target provider invocation.

Not implemented in this pack:

- Closure fulfillment and upstream requirement lineage execution.
- Structural composition rendering.
- Handler/control-flow nodes from the old runtime.
- Hooks/plugins from the old runtime.
- JS-specific `Promise` as schema data.

Those omissions are intentional. They keep this exploration aligned with the
current core boundary and leave target-specific behavior in features, profiles,
provider contracts, or later runtime drafts.

## Verification

From the package root:

```powershell
.\node_modules\.bin\tsc.cmd --strict --noEmit --target ES2022 --module ESNext --moduleResolution node packages\core\src\types.ts packages\architecture\src\types.ts ai\tasks\2026-05-13-latest-schema-software-runtime\architecture\software-runtime-architecture.ts ai\tasks\2026-05-13-latest-schema-software-runtime\runtime\software-runtime.ts ai\tasks\2026-05-13-latest-schema-software-runtime\examples\software-runtime-examples.ts ai\tasks\2026-05-13-latest-schema-software-runtime\smoke.ts
```

To run the smoke checks without adding build artifacts to the repo:

```powershell
$out = Join-Path $env:TEMP 'logicir-latest-schema-runtime-smoke'
Remove-Item -Recurse -Force $out -ErrorAction SilentlyContinue
.\node_modules\.bin\tsc.cmd --target ES2020 --module CommonJS --moduleResolution node --strict --outDir $out packages\core\src\types.ts packages\architecture\src\types.ts ai\tasks\2026-05-13-latest-schema-software-runtime\architecture\software-runtime-architecture.ts ai\tasks\2026-05-13-latest-schema-software-runtime\runtime\software-runtime.ts ai\tasks\2026-05-13-latest-schema-software-runtime\examples\software-runtime-examples.ts ai\tasks\2026-05-13-latest-schema-software-runtime\smoke.ts
node (Join-Path $out 'ai\tasks\2026-05-13-latest-schema-software-runtime\smoke.js')
```
