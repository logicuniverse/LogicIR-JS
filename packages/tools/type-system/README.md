# LogicIR Type System Tool

This module provides a zero-dependency JavaScript/TypeScript tool for the
LogicIR algebraic type-system feature.

It consumes the same serializable type-expression shape authored in
`packages/features/type-system/src/types.ts`, but it does not import the feature
schema package directly yet. The `schema/` tree remains the language-neutral
specification surface; this package is the runtime/tool implementation.

## Scope

Implemented:

- Type definition registry and transparent alias resolution.
- Generic type parameter substitution.
- Value validation for primitives, literals, enums, arrays, tuples, records,
  objects, unions, intersections, tagged unions, references, and refinements.
- Assignability, equivalence, overlap, and disjointness checks.
- Built-in refinement predicates for numeric ranges, length, regex pattern, and
  multiples.
- Custom predicate hook for host/tool-owned predicates.
- Helpers for reading `logicir.type-system / core` extension records from
  LogicIR-like objects.

Not implemented here:

- ArkType, JSON Schema, TypeScript, Verilog, or Python code generation.
- Requirement and composition type-binding evaluation. The feature schema
  already reserves composition selectors such as `anchor`, `outlet`,
  `lui-anchor`, and `lui-outlet`; when implemented, they must follow the core
  composition direction `outlet -> anchor`.
- Host-specific coercion, transforms, or async validation.
- Projection-specific width/layout decisions.

Those can be added as adapters that consume the same algebraic type expression
data.
