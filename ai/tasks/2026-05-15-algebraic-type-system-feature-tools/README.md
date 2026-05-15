# Algebraic Type-System Feature And Tools

## Objective

Build a sandbox candidate for a complete target-neutral algebraic type-system
feature and its first companion tools: registry validation, value validation,
compatibility checking, LogicIR extension extraction, and connection checking.

## Scope

In scope:

- Pure data feature definition for `logicir.type-system / core`.
- Algebraic type expressions for primitives, literals, enums, arrays, tuples,
  objects, records, unions, intersections, tagged unions, references,
  refinements, nominal, and opaque definitions.
- Three consumed extension points: `type-definitions`, `payload-type`, and
  `connection-type-policy`.
- Task-local tools for type registry construction, expression validation, value
  validation, compatibility checks, and LogicIR connection type checking.
- Smoke fixtures that prove valid/invalid values, generic aliases, recursive
  types, tagged unions, connection compatibility, and diagnostic reporting.

Out of scope:

- Formal package changes under `packages/`.
- JSON Schema, TypeScript, Verilog, Python, or ArkType code generation.
- Requirement and composition type bindings as active tooling paths.
- Runtime coercion, transforms, async validation, or provider behavior.

## Status

Current status: `ready-for-review`

## Directory Map

- `src/types.ts`: serializable ADT feature payload shapes.
- `src/feature.ts`: pure architecture feature definition data.
- `src/registry.ts`: type definition registry and reference resolution.
- `src/checker.ts`: type expression, value, and compatibility checks.
- `src/logicir.ts`: LogicIR extension extraction and connection checks.
- `src/fixtures.ts`: task-local LogicIR and type fixtures.
- `src/smoke.ts`: end-to-end verification.
- `verification.md`: command evidence.
- `promotion-checklist.md`: review notes.

## Write Boundary

This task may read the repository but writes only inside:

```text
ai/tasks/2026-05-15-algebraic-type-system-feature-tools/
```

Formal packages are read-only inputs. Promotion must happen through human
review.
