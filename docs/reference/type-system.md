# Type System

The current type-system work is split into two stable reader-visible surfaces.

## Feature Package

Feature schema package:

- `@logic-universe/logic-ir-feature-type-system`
- source: `packages/features/type-system`

This package defines the accepted type-system feature data shape.

Published schema route:

- [schema/features/type-system/](../../schema/features/type-system/)

## Tool Package

Checker/tool package:

- `@logic-universe/logic-ir-tool-type-system`
- source: `packages/tools/type-system`

This package is the current zero-dependency checker/tool implementation for the
accepted algebraic type-system surface.

Current implemented scope includes:

- type definition registry
- alias resolution
- generic substitution within the algebraic type model
- value validation
- assignability / equivalence / overlap / disjointness checks
- helpers for reading LogicIR type-system extension records

## Boundary

The type-system is a feature/tooling layer. It is not part of the LogicIR core
topology object model itself.

Readers should keep the distinction clear:

- `packages/core`: target-neutral logic topology
- `packages/features/type-system`: accepted type feature data shape
- `packages/tools/type-system`: executable checker/tool behavior
