# Latest Schema Engine Replica

Status: `ready-for-review`

## Objective

Use the current LogicIR core and architecture TypeScript packages as the schema
authority, then rebuild the useful legacy engine behavior as a task-local
software interpreter pipeline.

This task is an AI sandbox. It is not a promoted package and it does not change
formal schema or project source files.

## Scope

Included:

- Latest-schema `LogicUnit` fixtures imported from `@logic-universe/logic-ir-core`.
- A compiler from current core topology plus software `runtime-operation`
  extensions to an interpreter plan.
- A task-local runtime covering provider invocation, retained state,
  completion, fulfillment, payload paths, event emit/reactive replay, hooks,
  sequential control, structural rendering, nested LU execution, sessions, and
  diagnostics.
- A legacy coverage table with machine-checked required capability rows.

Excluded:

- Formal feature schema promotion.
- Formal package API design.
- Editor operations and model reconciliation.
- Copying the old `models.ts` shape into core.

## Verification

Run from this directory:

```powershell
yarn verify
```

The current verification runs:

- `yarn typecheck`
- `yarn build`
- `yarn smoke`
- `yarn coverage`

## Directory

```text
ai/tasks/2026-05-14-latest-schema-engine-replica/
  src/
    compiler.ts
    coverage-check.ts
    fixtures.ts
    legacy-coverage.ts
    runtime.ts
    smoke.ts
    types.ts
  package.json
  tsconfig.json
```

