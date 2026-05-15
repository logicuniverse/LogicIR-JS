# Source Map

| Source | Use |
| --- | --- |
| `dev/operational-theory.md` | Defines AI-assisted LogicIR editing as small, scoped, replayable, verifiable work. |
| `dev/logicir-architecture.md` | Defines edit transaction, partial IR, typed holes, profile/provider constraints, and review boundary as architecture roles. |
| `dev/roadmap.md` | Lists `logicir-edit-transaction-mvp` as a candidate AI task and defines acceptance criteria. |
| `ai/tasks/README.md` | Defines sandbox write boundary and required task contents. |
| `ai/templates/task/README.md` | Provides task README structure and package expectations. |
| `ai/templates/task/promotion-checklist.md` | Provides review/promotion checklist structure. |
| `packages/core/src/types.ts` | Formal core schema authoring source for `LogicUnit`, ports, LUI, connections, extensions, and endpoint refs. |
| `@logic-universe/logic-ir-core` | Task-local TypeScript import path for formal core types. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s1` | Reference pattern for minimal add-pair invocation fixture and task-local smoke. |

This task intentionally does not import previous task code. It only borrows the
minimal add-pair shape as a scenario.
