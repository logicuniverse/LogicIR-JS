# LogicIR Type System v0 Draft

The TypeScript authoring source for this feature lives in
`packages/features/type-system/src`. This directory is the language-neutral
specification surface for type-system feature notes and future generated
artifacts.

This draft defines a target-neutral algebraic type system feature. It is meant
to be shared by software, HDL, validators, analyzers, and projection compilers.

It intentionally does not define JavaScript, Python, Verilog, ArkType, JSON
Schema, or runtime implementation mechanics. Those can be adapters or tools
that consume this feature.

## Type Model

The type expression model includes:

- `any`, `unknown`, and `never`.
- primitive types.
- literal and enum types.
- arrays, tuples, records, and structural objects.
- unions, intersections, and tagged unions.
- aliases, nominal types, opaque external types, and recursive references.
- refinements with serializable predicate descriptors.

Definitions are carried by the `type-definitions` extension point on
`logic-unit`. Port payloads and nested payload paths use `payload-type` on
`port`. Requirement and composition compatibility use owner-level payloads with
selectors rather than adding extensions to helper core structures.

## Extension Points

The feature definition in [`feature.ts`](feature.ts) declares these extension
points:

- `type-definitions` on `logic-unit`.
- `payload-type` on `port`.
- `connection-type-policy` on `connection`.
- `requirement-type-bindings` on `requirement-service`.
- `composition-type-bindings` on `lu-core` and `lui`.

Profiles decide which of these extension points are required.
