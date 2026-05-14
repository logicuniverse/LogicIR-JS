# legacy-coverage-map

## Objective

Map legacy LogicIR / FlowForge-era capabilities to the verified
`basic-software-interpreter` S1-S5 sandbox rounds, then identify missing,
partial, deferred, and intentionally dropped areas.

This task is source-evidence extraction. It does not implement runtime code.

## Round Target

- Stack: `basic-software-interpreter`
- Round: legacy coverage mapping
- End-to-end chain: `legacy source evidence -> S1-S5 task evidence -> coverage.json -> coverage-report.md -> verification script`
- Required fixture: `coverage.json`
- Required verification command: `yarn verify`
- Expected promotable output: a coverage matrix that can guide future roadmap
  rounds and promotion decisions.

## Scope

In scope:

- `packages/legacy/engine`
- `packages/legacy/flow-runtime-core`
- `packages/legacy/flow-core`
- `basic-software-interpreter` S1-S5 AI tasks
- runtime core, projection, control flow, structural/editor, and node catalog
  coverage categories

Out of scope:

- Implementing missing runtime behavior.
- Promoting sandbox code into formal packages.
- Deciding final feature schemas for every missing capability.

## Status

Current status: `ready-for-review`

## Directory Map

- `coverage.json`: machine-readable coverage matrix.
- `coverage-report.md`: human-readable analysis and recommendations.
- `source-map.md`: exact evidence sources used.
- `src/verify-coverage.js`: task-local verification script.
- `verification.md`: commands and results.
- `promotion-checklist.md`: review and promotion notes.

## Write Boundary

This task writes only inside:

```text
ai/tasks/2026-05-14-legacy-coverage-map/
```

Formal project directories are read-only evidence.
