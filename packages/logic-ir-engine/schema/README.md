# LogicIR Schema Workspace

This directory contains the new LogicIR schema work. It is separate from `src/types/models.ts`, which is the old TS/JS prototype schema and must be treated as reference evidence rather than schema authority.

## Source Priority

1. `docs/essay.md` is the full theory source.
2. `docs/workspace/operational-theory.md` is the engineering extract.
3. `docs/workspace/schema-principles.md` defines schema and projection discipline.
4. `src/` is legacy implementation reference.

## Authoring Format

Use TypeScript as the schema authoring source for this package, with strict limits:

- TS files in `schema/` describe protocol data shapes and type-level contracts only.
- Do not put runtime functions, classes, Promise/Thenable mechanics, subscriptions, stores, projector callbacks, or host-specific execution machinery in core schema.
- Generated or derived formats may later include JSON Schema, Markdown reference docs, TS declarations, fixtures, or target-specific validation rules.
- Theory and schema docs remain semantic authority; TS types are the maintainable engineering source for the protocol shape.

## Directory Roles

- `core/`: target-neutral LogicIR semantic core.
- `profiles/`: target, host, runtime, tool, or domain sub-schemas. Create concrete profile folders only after core needs them.
- `projection/`: projector capability declarations, diagnostics, and projection contract schemas. Create concrete drafts only after core/profile fields exist.
- `extensions/`: namespaced extension registry and extension-specific schemas.
- `migrations/`: mappings from old schemas or implementations to the new schema.

## Drafting Discipline

Keep the workspace incremental. Do not create placeholder files for design areas that have not started. Add new files only when they carry decisions, constraints, examples, or schema types that are ready to discuss.

## Compatibility Rule

LogicIR schema evolves like a long-lived protocol: stable core, namespaced extensions, explicit capability declaration, and safe failure when a projector cannot preserve declared semantics.
