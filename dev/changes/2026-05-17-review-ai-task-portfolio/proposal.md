# Proposal

## 背景

本 change 为 `ai/tasks/` 中除 `basic-software-interpreter` S1-S5 之外的
剩余素材建立人工 review 总工作台。S1-S5 已由
`dev/changes/2026-05-17-review-basic-software-interpreter-s1-s5/` 覆盖，本
change 只做全局分类和入口索引。

AI task 输出是 sandbox evidence，不是项目结果。人工 review 前需要先把素材按
成熟度和依赖关系分类，再进入对应专题工作台。

## 问题

当前 `ai/tasks/` 中同时存在：

- 可近期 review 并可能窄范围 promotion 的纵向切片。
- 有价值但依赖 foundation 稳定后的 runtime/catalog/provider 素材。
- 当前 schema 稳定前的历史材料。
- 只适合做对照或规则回放的 reference task。

如果不先分组，review 容易把 archive 证据、runtime route、feature seed 和
core schema 决策混在一起。

## 目标

- 给所有剩余 tasks 建立分类和 review 入口。
- 明确哪些 task 已有独立工作台，哪些本轮新建工作台。
- 让 reviewer 可以按 `review-first`、`review-after-foundation`、
  `reference-only`、`archive-only` 顺序推进。
- 不对 task 做最终采纳判断。

## 非目标

- 不修改任何 `ai/tasks/` 代码。
- 不重新运行 task verification。
- 不 promotion 到 `packages/`、`schema/`、`examples/` 或 `fixtures/`。
- 不把 task-local schema subset、runtime helper 或 provider shape 变成正式
  schema。

## 成功标准

- 每个剩余 task 都有明确分类。
- 每个可 review 的专题都有对应 `dev/changes/<change-id>/` 工作台。
- `reference-only` 和 `archive-only` task 有明确低优先级入口，避免误用。
- Reviewer 能从本总览跳转到具体专题，不需要查聊天上下文。

## 相关证据

- AI task index:
  - `ai/tasks/material-index.md`
- 已有工作台:
  - `dev/changes/2026-05-17-review-basic-software-interpreter-s1-s5/`
- 新建专题工作台:
  - `dev/changes/2026-05-17-review-basic-hdl-sim-h1-h5/`
  - `dev/changes/2026-05-17-review-legacy-coverage-map/`
  - `dev/changes/2026-05-17-review-type-system-core/`
  - `dev/changes/2026-05-17-review-edit-transaction-mvp/`
  - `dev/changes/2026-05-17-review-stdlib-catalog-slice/`
  - `dev/changes/2026-05-17-review-reactive-runtime-slice/`
  - `dev/changes/2026-05-17-review-structural-ui-runtime-slice/`
  - `dev/changes/2026-05-17-review-domain-provider-catalog-slice/`
  - `dev/changes/2026-05-17-review-reference-archive-tasks/`

## Review 范围

- In scope:
  - 全部剩余 AI tasks 的分类。
  - 专题工作台的入口和优先级。
  - 各专题的 review 顺序、证据索引和待判断问题。
- Out of scope:
  - 任何正式实现。
  - task-local 代码修复。
  - promotion 决策。

## Promotion 候选

本总览没有直接 promotion 候选。候选内容必须进入对应专题工作台后再由人工
review 收窄。
