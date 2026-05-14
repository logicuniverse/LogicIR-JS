# Source Map

## Roadmap And Current Task Evidence

| Source | Why It Matters |
| --- | --- |
| `dev/roadmap.md` | Defines the `legacy-coverage-map` task acceptance and categories. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s1/` | S1 pure invocation coverage. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s2/` | S2 retained-current coverage. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s3/` | S3 completion/await coverage. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s4/` | S4 fulfillment/closure coverage. |
| `ai/tasks/2026-05-14-basic-software-interpreter-s5/` | S5 diagnostic coverage. |

## Legacy Engine Sources

| Source | Why It Matters |
| --- | --- |
| `packages/legacy/engine/src/types/models.ts` | Old LogicIR V1 model: ports, LU/LUI kinds, sequential steps, provider, closures, composable data. |
| `packages/legacy/engine/src/types/runtime.ts` | Runtime evidence: Result/Option, Thenable, emit/subscribe, inject, StateStore, sessions, plugins. |
| `packages/legacy/engine/src/types/hooks.ts` | Hook event taxonomy and plugin transform/override surfaces. |
| `packages/legacy/engine/src/projection.ts` | Old projection and execution behavior evidence. |
| `packages/legacy/engine/src/projector.ts` | Service/projector lookup and injection evidence. |
| `packages/legacy/engine/src/helpers/index.ts` | Simple projector adapters and emit/subscribe helper behavior. |
| `packages/legacy/engine/src/hooks/*` | Concrete hook adapters for override/transform behavior. |

## Legacy Flow Runtime Sources

| Source | Why It Matters |
| --- | --- |
| `packages/legacy/flow-runtime-core/src/types/models.ts` | Older Flow model: FlowKind, PortType, sequence steps, component composition, providers. |
| `packages/legacy/flow-runtime-core/src/types/runtime.ts` | Older runtime evidence mirroring engine runtime shapes. |
| `packages/legacy/flow-runtime-core/src/run-flow.ts` | Full runner evidence for state, events, injection, subflows, and hooks. |
| `packages/legacy/flow-runtime-core/src/runner.ts` | Provider injection and runner behavior. |
| `packages/legacy/flow-runtime-core/src/utils.ts` | Thenable, Result/Option, and runtime utility behavior. |

## Legacy Flow Core Sources

| Source | Why It Matters |
| --- | --- |
| `packages/legacy/flow-core/src/compile/*` | Editor-to-runtime lowering evidence. |
| `packages/legacy/flow-core/src/edit/*` | Edit operations and reconciliation evidence. |
| `packages/legacy/flow-core/src/nodes/stdlib/*` | Old node template catalog coverage. |
| `packages/legacy/flow-core/src/node-functions/stdlib/*` | Old node function/provider catalog coverage. |
| `packages/legacy/flow-core/src/nodes/reserved/*` | Reserved control-flow node evidence. |
| `packages/legacy/flow-core/src/nodes/html/*` | HTML node evidence. |
| `packages/legacy/flow-core/src/nodes/react-dom/*` | React DOM node evidence. |
| `packages/legacy/flow-core/src/nodes/cel/*` | CEL node evidence. |
| `packages/legacy/flow-core/src/nodes/hono/*` | Hono node evidence. |
| `packages/legacy/flow-core/src/nodes/pi-ai/*` | PI AI node evidence. |

## Source Priority Notes

- Current theory and accepted schema rules outrank legacy code.
- Legacy code is source-only evidence, not schema authority.
- S1-S5 are sandbox evidence, not formal implementation.
- This task maps coverage; it does not promote any code.
