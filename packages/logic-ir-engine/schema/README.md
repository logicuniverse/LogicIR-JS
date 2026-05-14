# LogicIR Schema Workspace

This directory contains the new LogicIR schema work. It is separate from `src/types/models.ts`, which is the old TS/JS prototype schema and must be treated as reference evidence rather than schema authority.

## Source Priority

1. `docs/essay.md` is the full theory source.
2. `docs/workspace/operational-theory.md` is the engineering extract.
3. `docs/workspace/schema-principles.md` defines schema and projection discipline.
4. `src/` is legacy implementation reference.

For the current schema ecosystem architecture, see
[`ARCHITECTURE.md`](ARCHITECTURE.md).

## Authoring Format

Use TypeScript as the schema authoring source for this package, with strict limits:

- TS files in `schema/` describe protocol data shapes and type-level contracts only.
- Do not put runtime functions, classes, Promise/Thenable mechanics, subscriptions, stores, projection/execution callbacks, or host-specific execution machinery in core schema.
- Prefer plain serializable object/union shapes. Do not use TypeScript generics
  to express schema structure in active schema files; generic abstractions make
  generated JSON Schema, docs, and non-TypeScript tooling harder to reason
  about.
- Generated or derived formats may later include JSON Schema, Markdown reference docs, TS declarations, fixtures, or target-specific validation rules.
- Theory and schema docs remain semantic authority; TS types are the maintainable engineering source for the protocol shape.

## Directory Roles

- `core/`: target-neutral LogicIR semantic core.
- `architecture/`: serializable feature, profile, stack, capability,
  tool-capability, provider contract, provider capability, stage, policy, and
  execution-binding definition schemas. Identity, indexing, package layout, and
  persistence are catalog/application concerns.
- `features/`: concrete feature schemas, such as the target-neutral algebraic
  type-system feature.
- `extensions/`: feature-scoped extension registry and extension-specific schemas.
- `projection/`: projection compiler capability declarations, diagnostics, and projection contract schemas. Create concrete drafts only after core or feature extension fields exist.
- `profiles/`: single-layer profile contracts and stack notes. Profiles are not part of the LogicIR object model; they describe IR pipeline, projection, or execution compatibility.
- `migrations/`: mappings from old schemas or implementations to the new schema.

## Current Core Draft

The active core draft is `core/v0-draft/types.ts`. Its current shape uses:

- `PortSurface` with one `PortKey` namespace per owner.
- `Port.interaction` for readable/notifiable/retained-current contact capability.
- `LUCore.kindOrganization.kind` as the LU kind discriminator.
- `steps: LUIId[]` as minimal sequential organization.
- Structural `exportAnchors`, `externalOutlets`, `exportAnchorFills`, `luiFills`, and structural LUI `compositionSurface`.
- Inline or external requirement service contracts and explicit closure/upstream fulfillment relations.
- `LogicUnit.features` as the LU-local feature manifest.
- Feature-scoped extension records on stable owner or relationship nodes,
  referring to local feature manifest keys.
- Optional `version` fields for core references that point at external
  `namespace + key` contracts.

## Drafting Discipline

Keep the workspace incremental. Do not create placeholder files for design areas that have not started. Add new files only when they carry decisions, constraints, examples, or schema types that are ready to discuss.

## Compatibility Rule

LogicIR schema evolves like a long-lived protocol: stable core, namespaced
features, explicit feature/profile requirements, explicit capability
declaration, and safe failure when a tool, compiler, or execution engine cannot
preserve declared semantics.
