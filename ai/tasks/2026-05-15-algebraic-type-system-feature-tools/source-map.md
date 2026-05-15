# Source Map

| Source | Why It Matters |
| --- | --- |
| `packages/core/src/types.ts` | Defines LogicIR feature manifests, extension records, ports, connections, and payload paths. |
| `packages/architecture/src/types.ts` | Defines pure data `FeatureDefinition` and extension point schema shape. |
| `packages/features/type-system/src/` | Existing accepted seed for algebraic type-system feature data. |
| `packages/tools/type-system/src/` | Existing accepted seed for type checking and LogicIR extension helpers. |
| `dev/schema-principles.md` | Keeps type-system semantics in feature extensions, not core. |
| `dev/operational-theory.md` | Clarifies that payload paths are logical addressing and type compatibility belongs to feature/tooling. |

This task is sandbox evidence. It does not override the existing formal package
shape; it proposes a complete candidate slice for review.
