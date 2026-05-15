# Source Map

| Source | Why It Matters |
| --- | --- |
| `packages/legacy/flow-core/src/node-functions/stdlib/state.ts` | Historical evidence for retained-current `property.*` nodes and update commands. |
| `packages/legacy/flow-core/src/node-functions/stdlib/event.ts` | Historical evidence for event emit, mux, merge, and map-to style stream nodes. |
| `packages/legacy/flow-core/src/node-functions/stdlib/operators.ts` | Historical evidence for derived arithmetic/logical operator nodes. |
| `packages/legacy/flow-core/src/nodes/stdlib/state/*` | Historical node templates for state-machine property nodes. |
| `packages/legacy/flow-core/src/nodes/stdlib/event/*` | Historical node templates for stream nodes and destructuring defaults. |
| `dev/operational-theory.md` | Keeps old runtime behavior as evidence, not schema law. |
| `dev/schema-principles.md` | Requires runtime behavior to stay feature/runtime scoped instead of core schema. |

This task is sandbox evidence. It does not import or modify legacy packages.
