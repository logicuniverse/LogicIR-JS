# Source Map

## Formal Sources

| Source | Use |
| --- | --- |
| `packages/core/src/types.ts` | Current LogicIR core schema authority for `LogicUnit`, `LUI`, ports, connections, closures, requirements, and payload paths. |
| `packages/architecture/src/types.ts` | Current architecture/profile/stack data shape authority. |
| `dev/operational-theory.md` | Engineering theory boundary for LU/LUI, X/Y/Z, Closure, core/feature/projection separation. |
| `dev/schema-principles.md` | Schema discipline: pure data, target-neutral core, feature/profile/stack separation. |

## Legacy Evidence

| Source | Use |
| --- | --- |
| `packages/legacy/engine/src/types/models.ts` | Old mixed model evidence: ports, LU/LUI kinds, sequential steps, provider, closures, composable data. |
| `packages/legacy/engine/src/types/runtime.ts` | Runtime evidence: Result/Option, Thenable, Packet, StateStore, sessions, projectors, plugins. |
| `packages/legacy/engine/src/projection.ts` | Behavior evidence for projection, emit/subscribe, hooks, sequential go-back/return, closure and recursive LU projection. |
| `packages/legacy/engine/src/projector.ts` | Top-level projector creation, provider lookup, state store, plugin hook composition. |
| `packages/legacy/engine/src/utils.ts` | `getResultByPath`, `transformReturnResult`, sequential helpers, composable transform evidence. |
| `packages/legacy/engine/src/hooks/*` | Hook transform/override behavior and event naming evidence. |
| `packages/legacy/engine/src/helpers/index.ts` | Simple projector adapters and Promise/Thenable conversion evidence. |

## Related AI Tasks

| Source | Use |
| --- | --- |
| `ai/tasks/2026-05-14-basic-software-interpreter-s1/` through `s5/` | Earlier isolated semantic slices. |
| `ai/tasks/2026-05-14-legacy-coverage-map/` | Gap analysis that motivated this integrated replica. |
| `ai/tasks/2026-05-14-basic-software-interpreter-summary/` | Route summary that identified S1-S5 as seeds, not a full integrated MVP. |

