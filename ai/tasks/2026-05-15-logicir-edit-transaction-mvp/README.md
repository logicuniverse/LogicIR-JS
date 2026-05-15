# LogicIR Edit Transaction MVP

## Objective

Define and verify a minimal task-local LogicIR edit transaction model. The MVP
shows that a partial LogicIR fixture with typed holes can be completed through
structured operations, replayed deterministically, validated, and smoke-tested.

## Round Target

- Stack: task-local `basic-software-interpreter` style smoke.
- Round: `logicir-edit-transaction-mvp`.
- End-to-end chain: `partial LogicIR -> edit transaction -> replay -> core validation -> invocation plan -> provider smoke`.
- Required fixture: a combinational add-pair LogicUnit with typed holes for the
  invocation feature and provider-backed LUI.
- Required verification command: `yarn verify`.
- Expected promotable output: concepts and minimal shapes for edit transaction,
  replay, typed holes, and transaction validation.

## Scope

In scope:

- Task-local edit transaction data shape.
- Task-local operation model: `set`, `insert`, `delete`, and `connect`.
- Replay and hash checks.
- Minimal core-oriented validation for the replayed add-pair fixture.
- Minimal invocation projection/execution smoke.

Out of scope:

- Promotion into `packages/`, `schema/`, `docs/`, `dev/`, `examples/`, or
  `fixtures/`.
- A final edit transaction schema.
- A complete JSON Patch implementation.
- Full core validation, type checking, capability checking, or provider
  registry implementation.

## Status

Current status: `ready-for-review`

## How To Read This Task

Recommended order:

1. `source-map.md`
2. `design-notes.md`
3. `src/types.ts`
4. `src/fixture.ts`
5. `src/replay.ts`
6. `src/validate.ts`
7. `src/smoke.ts`
8. `verification.md`
9. `promotion-checklist.md`

## Directory Map

- `src/types.ts`: task-local edit transaction, operation, diagnostic, snapshot,
  typed hole, and smoke types.
- `src/fixture.ts`: before/after LogicIR snapshots and the transaction.
- `src/replay.ts`: deterministic operation replay.
- `src/validate.ts`: transaction replay checks and minimal core validation.
- `src/interpreter.ts`: tiny invocation plan projector and provider executor.
- `src/smoke.ts`: end-to-end verification entrypoint.
- `reports/`: reserved for generated reports if needed.
- `verification.md`: commands run and results.
- `promotion-checklist.md`: review notes for possible promotion.

## Write Boundary

This sandbox reads `@logic-universe/logic-ir-core` as a formal read-only
dependency. It must not be imported by formal workspace packages.
