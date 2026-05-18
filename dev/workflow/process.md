# 开发流程

这份文档说明 LogicIR 项目怎么推进。它是操作规程，不是路线图，也不是 schema 权威。

## 文档读者边界

- `dev/` 面向人类协作者：短、稳定、决策导向。
- `ai/` 面向 AI agent 和自动化 review：可以详尽保存 source map、验证记录、失败尝试、
  长 checklist、coverage report、promotion checklist 和 material index。
- 同一信息两边都需要时，`dev/` 只保留决策摘要，`ai/` 保留详细证据和步骤。

## 开发节奏

- 每一轮只增加少量语义，保持可审阅、可验证。
- 不为下一轮提前实现复杂抽象。
- 当前主线先做无 feature 的 core-only examples，再考虑 feature/profile/runtime。
- 所有 projector、compiler、engine 必须按 `LUCore.kindOrganization.kind` 首层分派；
  不能把 `LUCore.luis` 默认拍平成 eager node list。
- Unsupported semantics 必须 diagnostic、明确拒绝或显式 lowering，不能静默降级。
- 正式 TS/JS package 默认避免 `class`；优先 plain object、factory、closure 和
  数据驱动 helper，便于后续移植到其它语言和运行时。

## AI Task 边界

AI task 不承担实质性的 IR、feature 或 extension 制定。所有 IR / feature /
extension 数据结构都以人类为主要编写者和决策者；AI 可以在对话中提供分析、对照、
草案、风险提示和局部编辑协助，但不得通过 autonomous task 自动制定这些结构。

AI task 适合在规则明确后做低自由度工作：

- examples / fixtures。
- wrappers / mechanical migration。
- coverage map / negative cases。
- verification scripts。
- 基于固定 schema/feature contract 的 validator、type system、lint/checker、
  diagnostic reporter、projection helper。

如果 task 发现需要改变 IR / feature / extension 语义，必须记录为 open question，
回到人工设计流程。

## AI Task 路由

- `/goal`、roadmap round、parallel-agent work 或明确可 review 的自动化任务，进入
  `ai/tasks/YYYY-MM-DD-<task>/`。
- 不确定、探索性、可丢弃内容进入 `ai/scratch/`。
- 新 task 细节按 [`../../ai/tasks/README.md`](../../ai/tasks/README.md) 执行。
- AI task 完成时必须更新 [`../../ai/tasks/material-index.md`](../../ai/tasks/material-index.md)。

AI task 不得写入正式目录，除非人类明确要求做 task 之外的已审阅文档更新。正式目录包括
`packages/`、`schema/`、`docs/`、`dev/`、`examples/`、`fixtures/`。

## Review 和 Promotion

AI task output 是素材，不是项目结果。人工晋升时：

- 先粗筛，再细读。
- 如果一批 task 暴露出基础语义错误，立即停止细读，标记为 `needs-rework` 或
  `archive-only`，转向更小的基础例子。
- 不把 AI task 的创造性探索直接当作 IR / feature / extension 设计依据。
- 只迁移经过审阅的最小成果。
- 不整包复制 task。
- Promotion 后必须在正式项目上下文重新验证。

标准路径：

```text
ai/tasks/<task>
-> material-index / promotion-checklist / verification evidence
-> coarse dev/changes/<change-id>/review.md
-> optional promotion change
-> packages / schema / dev / examples / fixtures
```

## Changes

重大 schema、API、runtime、projection、package 边界变化先记录到
[../changes/](../changes/)。

- 默认 change 只需要 `review.md`。
- `review.md` 记录范围、粗结论、决策表、关键语义判断和后续动作。
- 只有确认进入正式 promotion / implementation 时，才补充 proposal/design/tasks/
  spec-delta。
- changes 面向人类 review，不保存长证据和长 checklist；这些留在 `ai/`。

## 最小 Round 规则

每一轮只保留当前端到端路径实际使用的数据结构、schema 片段、profile 字段、feature
contract、runtime plan 字段和 helper。

如果正式 schema 类型要求空字段，例如 `featureContracts: []`、`stages: []` 或
`providerContracts: []`，可以保留，但必须说明这是 schema-shape constraint，不是未来
业务预留。

## 验证纪律

- 代码实现后运行相关 build/test/smoke。
- 文档结构变更至少运行 `git diff --check`。
- 无法验证时必须写明原因。
