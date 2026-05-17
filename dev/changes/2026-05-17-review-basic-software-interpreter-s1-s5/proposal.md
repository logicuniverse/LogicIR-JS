# Proposal

## 背景

本 change 为人工 review `basic-software-interpreter` S1-S5 准备工作台。
它只整理 intake、证据、验证状态、legacy 对照点、schema 对照点、逐轮
review checklist 和待人工判断的问题。

本 change 不做以下事情：

- 不修改 S1-S5 task 代码。
- 不 promotion 到 `packages/`、`schema/`、`examples/` 或 `fixtures/`。
- 不把 task-local schema subset 视为正式 schema。
- 不替人工 reviewer 做最终语义结论。

## 问题

S1-S5 已经形成一组可 review 的 software interpreter sandbox evidence，但它们
仍是分离 round：

- S1: pure provider invocation。
- S2: retained-current / property current read-write。
- S3: completion / await。
- S4: fulfillment / closure。
- S5: structured diagnostics。

人工 review 前需要一个统一工作台，帮助 reviewer 快速判断：

- 哪些行为可以作为正式 interpreter seed。
- 哪些只是 task-local baseline。
- 哪些需要重做或后续 round。
- 哪些语义应该进入 core、feature/profile、projector、engine 或 provider
  contract。

## 目标

- 给人工 reviewer 提供 S1-S5 的阅读顺序和证据索引。
- 汇总每轮 verification 状态和 promotion 候选。
- 列出 legacy source evidence 对照点。
- 列出当前 schema / roadmap 对照点。
- 提供逐轮 review checklist。
- 提供待人工判断的问题，不给出最终采纳结论。

## 非目标

- 不运行新的 task verification。
- 不修复 task 内部代码或文档。
- 不迁移任何 task 文件到正式目录。
- 不合并 S1-S5 为正式 interpreter。
- 不决定正式 diagnostic taxonomy、provider API、state store API 或 interpreter
  plan schema。

## 成功标准

- Reviewer 能从本 change 开始 review，不需要先翻聊天上下文。
- 每个 S round 都有明确 evidence、verification、promotion candidates 和
  review questions。
- Cross-round 风险、integration gaps 和 formal promotion blockers 被列出。
- Review 结论后可以直接继续填写 `design.md` 和 `spec-delta.md`，再决定是否
  打开后续 promotion change。

## 相关证据

- AI tasks:
  - `ai/tasks/2026-05-14-basic-software-interpreter-s1`
  - `ai/tasks/2026-05-14-basic-software-interpreter-s2`
  - `ai/tasks/2026-05-14-basic-software-interpreter-s3`
  - `ai/tasks/2026-05-14-basic-software-interpreter-s4`
  - `ai/tasks/2026-05-14-basic-software-interpreter-s5`
  - `ai/tasks/2026-05-14-basic-software-interpreter-summary`
  - `ai/tasks/2026-05-14-legacy-coverage-map`
- Legacy source:
  - `packages/legacy/engine/src/types/models.ts`
  - `packages/legacy/engine/src/types/runtime.ts`
  - `packages/legacy/engine/src/projector.ts`
  - `packages/legacy/engine/src/projection.ts`
  - `packages/legacy/flow-runtime-core/src/runner.ts`
  - `packages/legacy/flow-runtime-core/src/run-flow.ts`
  - `packages/legacy/flow-core/src/node-functions/stdlib/state.ts`
- Current docs:
  - `dev/schema-principles.md`
  - `dev/operational-theory.md`
  - `dev/logicir-architecture.md`
  - `dev/feature-catalog.md`
  - `dev/roadmap.md`
  - `ai/tasks/material-index.md`
- Current packages:
  - `packages/core/src/types.ts`
  - `packages/architecture/src/types.ts`
  - `packages/features/type-system`
  - `packages/tools/type-system`

## Review 范围

- In scope:
  - S1-S5 task evidence intake。
  - Current schema 对照。
  - Legacy evidence 对照。
  - 人工 reviewer 的问题清单。
  - Formal promotion 的候选切片和 blockers。
- Out of scope:
  - 正式 package 代码变更。
  - task-local 代码修复。
  - 新一轮 interpreter integration implementation。
  - 任何自动 promotion。

## Promotion 候选

这些只是候选，等待人工 review：

- S1 pure invocation fixture / provider execution seed。
- S2 retained-current fixture / memory current read-write behavior。
- S3 completion resolve/reject fixture / completion policy seed。
- S4 fulfillment fixture / closure-vs-upstream plan distinction。
- S5 diagnostic failure fixtures / diagnostic report seed。
- Summary 中的 narrow promotion slice：diagnostics、profile resolver seed、
  interpreter-plan data shape、provider invocation engine path、
  retained-current state path、selected fixtures。
