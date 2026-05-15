# Source Map

| Source | Why It Matters |
| --- | --- |
| `dev/roadmap.md` | Defines S2 retained-current goal and acceptance. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s1/` | Provides the S1 stack/resolver/projector/engine baseline pattern. |
| `packages/core/src/types.ts` | Formal reference for port interaction and `retainedCurrent` contact capability. |
| `packages/architecture/src/types.ts` | Formal reference for feature/profile/stack data. |
| `packages/legacy/engine/src/types/runtime.ts` | Old `StateStore` and runtime evidence. |
| `packages/legacy/engine/src/types/models.ts` | Old `PropertyPort` evidence for retained-current semantics. |

This task uses local minimal TS types for build isolation. Formal package files
are read-only references.
