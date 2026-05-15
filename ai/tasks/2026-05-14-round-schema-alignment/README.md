# round-schema-alignment

## Objective

Audit and repair the 2026-05-14 S1-S5 and H1-H5 AI task rounds so their LogicIR
fixtures and architecture/profile/stack data are typed against the stable
workspace schema packages instead of task-local schema copies.

## Round Target

- Stack: `basic-software-interpreter` and `basic-hdl-sim`
- Round: schema alignment audit/fix
- End-to-end chain: `round source audit -> formal schema type imports -> round verification -> alignment verification`
- Required fixture: S1-S5 and H1-H5 task source trees
- Required verification command: `yarn verify`
- Expected promotable output: an auditable rule that task-local `types.ts` files
  may define runtime/projector drafts but must not redefine LogicIR core or
  architecture schema types.

## Scope

In scope:

- `ai/tasks/2026-05-14-basic-software-interpreter-s1` through `s5`.
- `ai/tasks/2026-05-14-basic-hdl-sim-h1` through `h5`.
- Task-local type imports from `@logic-universe/logic-ir-core`.
- Task-local type imports from `@logic-universe/logic-ir-architecture` when the
  round contains architecture/profile/stack data.
- Re-running every touched round's `yarn verify`.

Out of scope:

- Promoting sandbox code into formal packages.
- Redesigning feature extension payload schemas.
- Merging S1-S5 or H1-H5 into one implementation.

## Status

Current status: `ready-for-review`

## Directory Map

- `src/verify-alignment.js`: checks task-local schema type ownership.
- `verification.md`: command evidence.
- `promotion-checklist.md`: review notes.

## Write Boundary

This task may write its own directory and the S1-S5/H1-H5 task directories it
audits. Formal project directories remain read-only inputs.

This was a one-off historical exception for repairing already-created sandbox
rounds after an explicit schema-alignment request. Do not copy this write
boundary for new tasks. New autonomous tasks should write only inside their own
`ai/tasks/YYYY-MM-DD-<task>/` directory unless a human explicitly grants a
different bounded write set.
