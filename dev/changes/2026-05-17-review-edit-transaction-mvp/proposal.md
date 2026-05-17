# Proposal

## 背景

`2026-05-15-logicir-edit-transaction-mvp` 验证了一个 authoring/edit 路线：
partial LogicIR 通过 edit transaction replay 变成可验证 fixture，再跑 provider
invocation smoke，最终 result 为 `5`。

本 change 为人工 review 准备 edit transaction MVP 工作台。

## 问题

Edit transaction 对 AI-assisted authoring 很关键，但 task 当前实现是 MVP：

- JSON path 是 task-local。
- Hash 是 task-local deterministic FNV。
- Validator 只覆盖当前 combinational fixture。
- Tiny interpreter 只是 smoke helper。

需要人工判断哪些概念可晋升，哪些必须重做。

## 目标

- 汇总 transaction replay、typed holes、validation、hash 和 smoke evidence。
- 明确 edit transaction 与 core schema、tools、AI authoring workflow 的边界。
- 准备后续正式 edit model 的 review 问题。

## 非目标

- 不把 transaction shape 放入 core。
- 不接受 FNV hash 为正式 content addressing。
- 不 promotion task-local validator / tiny interpreter。
- 不实现 editor reconciliation。

## 成功标准

- Reviewer 能判断是否开启正式 edit transaction package/tool change。
- Typed holes 和 transaction replay 的价值与风险清楚分离。
- 不把 authoring workflow 和 runtime semantics 混淆。

## 相关证据

- AI task:
  - `ai/tasks/2026-05-15-logicir-edit-transaction-mvp`
- Related docs:
  - `dev/process.md`
  - `dev/schema-principles.md`
  - `dev/long-term-vision.md`
  - `ai/tasks/material-index.md`

## Review 范围

- In scope:
  - Transaction operation shape。
  - Partial LogicIR / typed holes。
  - Replay + validation flow。
  - Deterministic hash evidence。
  - AI-assisted authoring workflow implications。
- Out of scope:
  - Full editor model。
  - Reconciliation。
  - Database storage design。
  - Formal runtime implementation。

## Promotion 候选

候选仅供人工 review：

- Transaction concepts。
- Replay behavior。
- Typed hole validation。
- Invalid transaction diagnostic cases。
- Design notes as formal edit model seed。
