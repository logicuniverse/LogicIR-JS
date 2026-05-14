# LogicIR Schema Artifacts

This directory is the language-neutral published schema surface. It should
contain generated or curated specification artifacts, plus thin route files that
point to the TypeScript authoring packages.

Authoring sources live in workspace packages:

- [`packages/core/src`](../packages/core/src): LogicIR core protocol data.
- [`packages/architecture/src`](../packages/architecture/src): feature,
  profile, stack, capability, provider, stage, policy, and execution-binding
  data.
- [`packages/features/type-system/src`](../packages/features/type-system/src):
  target-neutral algebraic type-system feature data.

Design rationale and collaboration rules live in `dev/`, not here:

- [`dev/operational-theory.md`](../dev/operational-theory.md)
- [`dev/schema-principles.md`](../dev/schema-principles.md)
- [`dev/logicir-architecture.md`](../dev/logicir-architecture.md)

## Current Artifacts

- [`core/v0-draft/`](core/v0-draft/): curated core v0 draft specification notes.
- [`architecture/`](architecture/): route to architecture schema source and
  future generated artifacts.
- [`features/type-system/`](features/type-system/): route to the type-system
  feature source and future generated artifacts.
- [`migrations/legacy-tsjs-v1/`](migrations/legacy-tsjs-v1/): migration notes
  from the old JS/TS prototype.

## Rule

If generated artifacts exist, put the generated files and their normative
documentation here. If no generated artifacts exist yet, keep only a route file
to the source package and a short status note.
