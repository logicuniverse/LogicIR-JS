# Design

## 说明

本文是人工 review 工作台，不是最终设计结论。所有 “待判断” 项都需要 reviewer
确认后，才能写入正式 schema、feature、roadmap 或 package 实现。

## 阅读顺序

建议 reviewer 按以下顺序阅读：

1. `ai/tasks/material-index.md` 中的 `Basic software interpreter 主干`。
2. `ai/tasks/2026-05-14-basic-software-interpreter-summary/summary-report.md`。
3. `ai/tasks/2026-05-14-legacy-coverage-map/coverage-report.md`。
4. S1 和 S5：先确认 invocation success path 和 diagnostics failure path。
5. S2/S3/S4：再确认 retained-current、completion、fulfillment 的 additive
   behavior。
6. 对照 `dev/schema-principles.md`、`dev/roadmap.md` 和
   `packages/core/src/types.ts`。

## Intake Matrix

| Round | Task | Status in task | Verification recorded | Claimed capability | Main review focus |
| --- | --- | --- | --- | --- | --- |
| S1 | `2026-05-14-basic-software-interpreter-s1` | `ready-for-review` | `yarn verify` passed; output `result: 5` | Pure provider invocation through interpreter plan | Provider binding boundary, combinational lazy pull, no feature required for plain add |
| S2 | `2026-05-14-basic-software-interpreter-s2` | `ready-for-review` | `yarn verify` passed; final state `{ counter: 11 }` | Retained-current read/write through task-local memory state | `property` as core contact, feature-free S2, state-store as runtime route |
| S3 | `2026-05-14-basic-software-interpreter-s3` | `ready-for-review` | `yarn verify` passed; resolve output `12`, reject `PROVIDER_REJECTED` | Completion / await behavior | Promise mechanics as software feature/profile behavior, not core |
| S4 | `2026-05-14-basic-software-interpreter-s4` | `ready-for-review` | `yarn verify` passed; closure `5`, upstream `14`, missing provider diagnostic | Fulfillment through closure or upstream provider | Z-axis fulfillment explicitness; closure function is task-local only |
| S5 | `2026-05-14-basic-software-interpreter-s5` | `ready-for-review` | `yarn verify` passed; five failure classes checked | Structured diagnostics and report summary | Diagnostic shape seed vs final taxonomy/source-location policy |

## Current Schema 对照点

Reviewer 应特别核对以下当前规则：

- Core 只放 target-neutral topology semantics。
- `Port.contact` 当前为 `pull`、`push`、`property`。
- `property` 是 retained-current reactive contact；core 不规定 JS store、
  subscription 或 HDL register 实现。
- `combinational` 只有 `ports.inputs + ports.result`，不能有普通
  `ports.outputs`。
- 单值 `result` 默认使用 whole result；只有 demux / tuple-like 多结果或需要
  第一层可寻址 surface 时才声明 `result.pins`。
- `sequential` core 只保存 `steps: { luiId }[]`，async / await / branch /
  go-back / return 都不能进入 core step 字段。
- `LUCore.kindOrganization.kind` 决定 runtime/projector/compiler 首层分派；
  不能把 `LUCore.luis` 无条件 eager flatten。
- Feature/extension 承载 target/runtime/tool/domain 附加约束；profile 声明
  required / conditional-required / recommended / optional contract。
- Profile/stack 属于 architecture 层，不属于 LogicIR core object model。
- Task-local type subset 不能作为 accepted schema。

## Legacy Evidence 对照点

这些旧代码只作为 evidence，不是 schema authority：

| Capability | Legacy evidence | Review use |
| --- | --- | --- |
| Provider invocation | `packages/legacy/engine/src/types/runtime.ts`, `packages/legacy/engine/src/projector.ts`, `packages/legacy/flow-runtime-core/src/runner.ts` | 对照 S1 的 provider registry / execution binding 是否足够明确 |
| Property / retained-current | `packages/legacy/engine/src/types/models.ts`, `packages/legacy/engine/src/projection.ts`, `packages/legacy/flow-runtime-core/src/types/models.ts`, `packages/legacy/flow-core/src/node-functions/stdlib/state.ts` | 对照 S2 是否只吸收 retained-current 语义，而不是 store/subscription 机制 |
| Thenable completion | `packages/legacy/engine/src/types/runtime.ts`, `packages/legacy/engine/src/utils.ts`, `packages/legacy/flow-runtime-core/src/utils.ts` | 对照 S3 是否把 Promise/Thenable 留在 software feature/profile/runtime 层 |
| Fulfillment / dependency injection | `packages/legacy/engine/src/types/models.ts`, `packages/legacy/engine/src/projection.ts`, `packages/legacy/engine/src/types/runtime.ts` | 对照 S4 是否保留 Z-axis fulfillment，不退化成普通 dataflow/provider lookup |
| Diagnostics / failure handling | S3/S4 task diagnostics plus `dev/roadmap.md` S5 requirement | 对照 S5 的 diagnostic model 是否应成为 shared seed，或需要重新设计 |
| Missing legacy areas | `ai/tasks/2026-05-14-legacy-coverage-map/coverage-report.md` | 确认 S1-S5 不是 full interpreter MVP |

## Round Review Checklist

### S1 Pure Invocation

Evidence:

- `src/fixture.ts`
- `src/architecture.ts`
- `src/resolver.ts`
- `src/projector.ts`
- `src/engine.ts`
- `src/smoke.ts`
- `verification.md`
- `promotion-checklist.md`

待人工判断：

- Plain external add LUI 是否确实不需要 feature/extension？
- Provider selection 是否只应进入 architecture execution binding？
- S1 的 lazy-pull result 路径是否只是 baseline，不应成为唯一 engine law？
- Smoke 是否充分证明 unrelated LUI 不应 eager execution，还是需要补 fixture？
- Interpreter plan shape 哪些字段可以作为正式 seed，哪些只是 task-local？
- Formal promotion 时是否应先 promotion fixture，再 promotion projector/engine？
- S1-local `types.ts` 与 `packages/core` / `packages/architecture` 差异是否可接受？

### S2 Retained-Current

Evidence:

- `src/fixture.ts`
- `src/projector.ts`
- `src/engine.ts`
- `src/smoke.ts`
- `verification.md`
- `promotion-checklist.md`

待人工判断：

- `property` 是否应作为 core retained-current contact，而不是 feature 定义出来的能力？
- S2 feature-free 是否是正式方向？
- State-store external target key 是否只是 task-local runtime route？
- `read-current` 和 `write-current` 是否是正式 interpreter-plan seed，还是应重命名？
- `write` 输入缺失时 “do not write” 是否合理，还是需要显式 operation guard？
- S2 是否需要覆盖初始值要求，还是留给后续 S6/property node fixture？
- 当前 stateful property output 规则是否需要 formal validator 支持？
- Subscription / update notification 是否必须单独开 S6，而不是塞进 S2 promotion？

### S3 Completion / Await

Evidence:

- `src/architecture.ts`
- `src/fixture.ts`
- `src/projector.ts`
- `src/engine.ts`
- `src/smoke.ts`
- `verification.md`
- `promotion-checklist.md`

待人工判断：

- Completion 是否应是 software feature/profile policy，而不是 core 字段？
- LUI-level `completion-policy` extension 是否合适，还是应放在 provider contract
  或 execution profile policy？
- Provider output 使用 `Promise<value>` 是否只是 JS runtime realization？
- Reject diagnostic 的 shape 是否应沿用到 S5，还是 S5 应统一覆盖它？
- Cancellation、retry、backpressure 是否明确 out of scope？
- 与 sequential awaited step 的关系应在 S7/S12 处理，还是 S3 promotion 就要预留？

### S4 Fulfillment / Closure

Evidence:

- `src/fixture.ts`
- `src/projector.ts`
- `src/engine.ts`
- `src/smoke.ts`
- `verification.md`
- `promotion-checklist.md`

待人工判断：

- Requirement / fulfillment 是否被明确表达为 Z-axis，而不是普通 dataflow？
- Closure fulfillment 和 upstream provider fulfillment 的 plan node 是否可作为 seed？
- Task-local closure body 是 runtime function；promotion 前是否必须改为 formal
  Closure core fixture？
- Missing upstream provider diagnostic 是否应并入 S5 shared diagnostic shape？
- S4 的 fulfillment feature draft 是否必要，还是 core requirement/fulfillment
  已能表达最小关系？
- Shared-service、nested reachability、dynamic provider 是否应全部后移？

### S5 Error / Diagnostic

Evidence:

- `src/types.ts`
- `src/diagnostics.ts`
- `src/projector.ts`
- `src/engine.ts`
- `src/smoke.ts`
- `verification.md`
- `promotion-checklist.md`

待人工判断：

- Diagnostic fields `code`、`severity`、`phase`、`message`、`subject`、
  `detail` 是否足够作为 shared seed？
- `phase: project/execute` 是否过窄，是否需要 validate/resolve/check/lower/simulate？
- Provider missing、plan invalid、unsupported semantics、runtime failure 是否是第一批
  formal diagnostic fixtures？
- S3/S4 的 rejection/missing-provider diagnostic 是否应重写到 S5 shape？
- Source ranges、LogicIR path、feature/profile requirement id 是否必须进入第一版？
- Report summary 统计 code 是否有 promotion 价值，还是只保留为 test helper？

## Cross-Round Review Questions

- S1-S5 是否应该先合并成一个 formal interpreter-plan type，再 promotion 任何
  engine behavior？
- 是否需要一个 `packages/projectors/interpreter-plan` seed 和一个
  `packages/engines/software` seed 分开 review？
- Formal resolver 是否应该先于 projector/engine promotion？
- 哪些 S1-S5 fixtures 可以直接改写成 `fixtures/logicir/basic-software/*`？
- Diagnostics 是否应成为独立 shared package/tool，还是放进 architecture/tooling？
- Type-system 是否保持 optional/recommended，不阻塞 basic interpreter MVP？
- 是否需要先做 S10 multi-lui-plan，再 promotion S2-S4 的多语义组合？
- `dist/` 目前存在于 S1-S5 task 目录；review 时是否需要清理，或保留为历史
  build artifact？

## Promotion Candidate Map

候选仅供人工 review，不代表接受：

| Candidate | Source rounds | Possible formal area | Main blocker |
| --- | --- | --- | --- |
| Pure invocation fixture | S1 | `fixtures/logicir/basic-software` | Must adapt to accepted core/architecture types |
| Minimal profile/stack fixture | S1-S5 | `fixtures/profiles` or architecture examples | Need one shared architecture shape |
| Interpreter-plan data shape | S1-S5 summary | `packages/projectors/interpreter-plan` | S1-S5 currently use separate local plan shapes |
| Provider invocation engine path | S1, S5 | `packages/engines/software` | Needs diagnostics and provider contract boundary |
| Retained-current state path | S2 | `packages/engines/software` or fixture | Needs property initial value and notification decision |
| Completion policy seed | S3 | software feature/profile | Need decide LUI extension vs provider/execution policy |
| Fulfillment plan nodes | S4 | interpreter plan / engine | Need formal Closure core fixture |
| Diagnostic model seed | S5 | shared diagnostics/tooling | Need source path, phase taxonomy, severity policy review |

## Reviewer Notes

Use this section during review.

-
