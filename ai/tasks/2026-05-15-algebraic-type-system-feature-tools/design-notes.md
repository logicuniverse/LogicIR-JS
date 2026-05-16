# Design Notes

## Boundary

The type system is a feature, not core. Core ports and payload paths remain
target-neutral topology. Type definitions, payload types, and connection
compatibility are feature-owned data consumed by tools, validators, projectors,
or compilers.

## Active Slice

This task only implements the extension points that its fixture-to-smoke path
uses:

- `type-definitions` on `LogicUnit`.
- `payload-type` on `Port`.
- `connection-type-policy` on `Connection`.

Requirement and composition type bindings are important, but they are deferred
because this task does not run requirement or structural fixtures.
When they are activated in a later formal tool, composition selectors should
match the current core vocabulary: `anchor`, `outlet`, `lui-anchor`, and
`lui-outlet`, with composition direction read as `outlet -> anchor`.

## Compatibility Rules

- `integer` is assignable to `number`; `number` is not assignable to `integer`.
- Object assignability uses width subtyping unless the target is exact.
- Optional target fields may be absent from the source.
- Source union is assignable to target only when every source variant is
  assignable to the target.
- Source is assignable to target union when at least one target variant accepts
  it.
- Equivalence is mutual assignability.
- Overlap/disjoint are conservative and diagnostic-friendly.

## Promotion Risk

The checker is deliberately small enough to review. It is not a final theorem
prover and does not implement host coercion, canonical union sorting, recursive
subtyping proof, or projection-specific layout semantics.
