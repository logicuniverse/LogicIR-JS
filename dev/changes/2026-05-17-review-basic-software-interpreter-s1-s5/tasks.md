# Tasks

Status: `draft`

本 change 是人工 review 工作台。不要在本 change 内修改 S1-S5 task 代码，也不要
promotion 到正式包。

## Intake

- [x] 关联 task 已在 `ai/tasks/material-index.md` 中登记。
- [x] S1 `verification.md` 已记录 `yarn verify` passed。
- [x] S2 `verification.md` 已记录 `yarn verify` passed。
- [x] S3 `verification.md` 已记录 `yarn verify` passed。
- [x] S4 `verification.md` 已记录 `yarn verify` passed。
- [x] S5 `verification.md` 已记录 `yarn verify` passed。
- [x] S1-S5 都有 `promotion-checklist.md`。
- [x] Review 范围、成功标准和非目标已写入 `proposal.md`。
- [ ] Reviewer 已确认是否需要清理 task-local `dist/`，或保留为历史 build artifact。

## Evidence Reading

- [ ] 阅读 `ai/tasks/2026-05-14-basic-software-interpreter-summary/summary-report.md`。
- [ ] 阅读 `ai/tasks/2026-05-14-legacy-coverage-map/coverage-report.md`。
- [ ] 阅读 `ai/tasks/material-index.md` 中 basic software interpreter 条目。
- [ ] 阅读 S1 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 S2 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 S3 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 S4 README / source-map / design-notes / verification / promotion checklist。
- [ ] 阅读 S5 README / source-map / design-notes / verification / promotion checklist。

## Schema / Theory Cross-Check

- [ ] 对照 `dev/schema-principles.md` 的 core/feature/profile 边界。
- [ ] 对照 `dev/operational-theory.md` 的 LU kind organization 处理规则。
- [ ] 对照 `dev/logicir-architecture.md` 的 profile、stack、provider、execution binding 术语。
- [ ] 对照 `dev/feature-catalog.md` 中 software feature 状态。
- [ ] 对照 `packages/core/src/types.ts` 当前 core schema。
- [ ] 对照 `packages/architecture/src/types.ts` 当前 architecture schema。

## Legacy Cross-Check

- [ ] Provider invocation: `packages/legacy/engine/src/types/runtime.ts`、
      `packages/legacy/engine/src/projector.ts`、`packages/legacy/flow-runtime-core/src/runner.ts`。
- [ ] Property/state: `packages/legacy/engine/src/types/models.ts`、
      `packages/legacy/engine/src/projection.ts`、
      `packages/legacy/flow-core/src/node-functions/stdlib/state.ts`。
- [ ] Thenable/completion: `packages/legacy/engine/src/types/runtime.ts`、
      `packages/legacy/engine/src/utils.ts`。
- [ ] Fulfillment/dependency: `packages/legacy/engine/src/types/models.ts`、
      `packages/legacy/engine/src/projection.ts`。
- [ ] Coverage gaps: `ai/tasks/2026-05-14-legacy-coverage-map/coverage.json`。

## Round Review Checklist

### S1

- [ ] 判断 plain external add LUI 是否不需要 feature/extension。
- [ ] 判断 provider selection 是否属于 architecture execution binding。
- [ ] 判断 lazy result pull 是否只是 S1 baseline。
- [ ] 判断 S1 smoke 是否足够证明 non-eager unrelated LUI 行为。
- [ ] 判断 S1 哪些 fixture/plan/engine 片段可作为 formal seed。

### S2

- [ ] 判断 `property` 是否作为 core retained-current contact。
- [ ] 判断 S2 feature-free 是否作为正式方向。
- [ ] 判断 state-store target key 是否仅为 task-local runtime route。
- [ ] 判断 read-current / write-current operation shape 是否可作为 seed。
- [ ] 判断缺失 write input 时 “do not write” 是否合理。
- [ ] 判断 initial current value 规则应由 S2 还是后续 S6/property-node fixture 覆盖。
- [ ] 判断 subscription/update notification 是否必须后移。

### S3

- [ ] 判断 completion policy 的归属：LUI extension、provider contract 或 execution profile policy。
- [ ] 判断 Promise/Thenable 是否只是 JS runtime realization。
- [ ] 判断 reject diagnostic 是否应统一到 S5 shape。
- [ ] 判断 cancellation/retry/backpressure 是否明确后移。
- [ ] 判断与 sequential awaited step 的关系是否后移到 S7/S12。

### S4

- [ ] 判断 requirement/fulfillment 是否保持 Z-axis，而不是普通 dataflow。
- [ ] 判断 closure fulfillment / upstream fulfillment plan node 是否可作为 seed。
- [ ] 判断 task-local runtime-function closure 是否必须替换为 formal Closure core fixture。
- [ ] 判断 S4 fulfillment feature draft 是否必要。
- [ ] 判断 missing provider diagnostic 是否统一到 S5。

### S5

- [ ] 判断 diagnostic 字段是否可作为 shared seed。
- [ ] 判断 phase taxonomy 是否需要扩展。
- [ ] 判断第一批 formal diagnostic fixtures。
- [ ] 判断 source range / LogicIR path / requirement id 是否进入第一版。
- [ ] 判断 report summary 是否是正式 helper 还是 test-only helper。

## Promotion Planning

- [ ] 判断是否先开独立 change 做 formal diagnostics seed。
- [ ] 判断是否先开独立 change 做 interpreter-plan data shape seed。
- [ ] 判断是否先开独立 change 做 software engine provider invocation seed。
- [ ] 判断是否先开独立 change 做 retained-current fixture seed。
- [ ] 判断是否需要 S10 multi-lui-plan 前置。
- [ ] 判断哪些内容标记为 `needs-rework`。
- [ ] 判断哪些内容标记为 `archive-only`。

## Stabilization Tasks

当前 change 不执行 promotion。若 review 后进入 promotion，请在新 change 或本
change 后续阶段补充：

- [ ] 修改正式 package / fixtures / docs。
- [ ] 运行正式 package `yarn build`。
- [ ] 运行 formal software smoke。
- [ ] 更新 `dev/roadmap.md`。
- [ ] 更新 `dev/feature-catalog.md`。
- [ ] 更新来源 task 的 `promotion-checklist.md`。
- [ ] 更新 `ai/tasks/material-index.md`。

## 验证任务

- [x] `git diff --check` for this workbench change。
- [ ] Reviewer 决定是否重新运行 S1-S5 `yarn verify`。
- [ ] Reviewer 决定是否清理 task-local `dist/`。

## Review 记录

- Reviewer:
- Review date:
- Decision:
- Notes:
