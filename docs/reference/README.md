# LogicIR Reference

This section describes the current stable or intentionally reader-visible
surfaces of the LogicIR workspace.

These pages are not internal process notes. They are the public-facing map of
what currently exists in accepted packages and published schema routes.

## Current Surfaces

- [Schema Surfaces](schema-surfaces.md)
  - Published language-neutral schema routes under `schema/`
  - Current TypeScript authoring sources in `packages/core` and
    `packages/architecture`
- [Core Software Interpreter](core-software-interpreter.md)
  - The current feature-free TypeScript execution seed for core LogicIR
- [Type System](type-system.md)
  - The current accepted type-system feature package and checker tool

## Not In Scope

These are intentionally not reader-facing stable reference surfaces:

- `dev/`: internal development rules, planning, and review workflow
- `ai/tasks/`: sandbox evidence and autonomous exploration output
- `packages/legacy/`: historical implementation evidence

## Reading Order

If you want the shortest path:

1. Read [../essay.md](../essay.md)
2. Read [Schema Surfaces](schema-surfaces.md)
3. Read the runtime or tool page you care about
