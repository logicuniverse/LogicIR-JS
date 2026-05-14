# LogicIR Architecture v0 Draft Artifacts

The TypeScript authoring source for this draft lives in:

- [`packages/architecture/src/types.ts`](../../../packages/architecture/src/types.ts)

This draft currently has no generated JSON Schema or rendered reference output
checked in. The package source defines serializable content shapes for:

- feature definitions
- profile definitions
- stack definitions
- capability definitions
- provider contracts and provider capabilities
- stages, policies, and execution bindings

Catalog identity, namespace, version, indexing, persistence, file layout, and
database keys remain registry/application concerns outside the architecture
schema content.

