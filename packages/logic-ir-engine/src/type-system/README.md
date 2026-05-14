# LogicIR Type System Tool

This module provides a zero-dependency JavaScript/TypeScript tool for the
LogicIR algebraic type-system feature.

It consumes the same serializable type-expression shape defined by
`schema/features/type-system/v0-draft/types.ts`, but it does not import schema
files directly. The `schema/` tree remains protocol data authoring; `src/` is
the runtime/tool implementation.

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
- Host-specific coercion, transforms, or async validation.
- Projection-specific width/layout decisions.

Those can be added as adapters that consume the same algebraic type expression
data.

