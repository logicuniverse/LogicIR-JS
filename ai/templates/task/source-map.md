# Source Map

Record the sources used by this autonomous task.

## Current Project Sources

- `packages/core/src/`: current LogicIR core TS authoring source.
- `packages/architecture/src/`: current architecture/profile/stack/provider TS
  authoring source.
- `packages/features/*/src/`: accepted feature schema sources.
- `schema/`: language-neutral generated or curated specification surface; not
  the primary TS authoring source.
- `docs/`: reader-facing theory and user documentation.
- `dev/operational-theory.md`: engineering theory extract.
- `dev/schema-principles.md`: schema and projection discipline.

## Legacy Evidence

- `packages/legacy/engine/src/`: old LogicIR JS/TS engine evidence.
- `packages/legacy/flow-runtime-core/`: older runtime evidence.
- `packages/legacy/flow-core/`: older editor-core, lowering, node/LUI catalog,
  and node function evidence.

## Task-Specific Sources

List exact files and why each was used:

| Source | Why It Matters |
| --- | --- |
|  |  |

Task-local code may reference these sources through relative paths as read-only
inputs, including JS/TS imports, Verilog HDL include/file arguments, Python
imports, fixture paths, or generated-artifact inputs. Record each external
source path here so review can distinguish read-only evidence from promotable
task output.

## Source Priority Notes

- Theory and accepted schema docs outrank legacy code.
- Current packages outrank exploration drafts.
- `schema/` route files and generated/curated artifacts should be reconciled
  with the corresponding package source before promotion.
- Legacy code is evidence, not schema authority.
- This task's own output is sandbox material until human promotion.
