# Stdlib Nodes Replica

## Objective

Replicate every legacy `ff-core` `nodes/stdlib` node in a new AI task sandbox,
using the latest-schema engine replica shape as the execution reference.

The task is evidence only. It does not promote schema, feature definitions, or
runtime implementation into formal project directories.

## Interpretation Note

Legacy stdlib behavior is catalog and provider evidence, not a required LogicIR
feature model. This replica proves coverage against old keys; formal promotion
may split the catalog, change provider packaging, drop or defer nodes, or lower
selected behavior differently after review.

## Scope

In scope:

- Legacy stdlib node inventory from
  `packages/legacy/flow-core/src/nodes/stdlib`.
- Runtime behavior evidence from
  `packages/legacy/flow-core/src/node-functions/stdlib`.
- Task-local pure data catalog, providers, latest core `LogicUnit` fixtures,
  compiler, runtime smoke tests, and coverage gate.

Out of scope:

- Non-stdlib legacy nodes.
- Editor-specific rendering or old editor package promotion.
- Formal package, schema, docs, examples, or fixture changes outside this task.
- Verilog HDL lowering for software-only JS stdlib behavior.

## Status

Current status: `ready-for-review`

## How To Read This Task

1. `source-map.md`
2. `design-notes.md`
3. `src/catalog.ts`
4. `src/providers.ts`
5. `src/smoke-cases.ts`
6. `docs/coverage-report.md`
7. `verification.md`
8. `promotion-checklist.md`

## Verification

Run from this directory:

```powershell
yarn verify
```

The verification chain typechecks, builds, executes all smoke cases through
latest core `LogicUnit` fixtures compiled into a task-local interpreter plan,
extracts actual legacy stdlib keys from source, and checks
catalog/provider/smoke coverage against that legacy stdlib key list.
