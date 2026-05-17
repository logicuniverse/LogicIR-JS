# 变更提案

这个目录保存重大 LogicIR 变更的审阅单元。它借鉴 OpenSpec 的 change /
proposal / spec delta 工作流，但不引入 OpenSpec 工具，也不让本目录成为新的
schema authority。

权威仍然分层维护：

- 理论源头：[`docs/essay.md`](../../docs/essay.md)。
- 工程理论和规则：[`dev/operational-theory.md`](../operational-theory.md)、
  [`dev/schema-principles.md`](../schema-principles.md)。
- 当前已接受 TS authoring source：`packages/core`、`packages/architecture`、
  `packages/features/*`。
- 语言无关规范 surface：`schema/`。
- AI 自动探索素材：`ai/tasks/`。

## 何时新增 Change

以下情况应先开一个 `dev/changes/<change-id>/`：

- Core schema、architecture schema、feature/extension、profile 或 stack 语义变化。
- Runtime、projector、compiler、provider contract 或 capability 语义变化。
- AI task 输出准备晋升到正式项目文件。
- 旧实现证据需要被正式吸收、替代或明确丢弃。
- 变更影响兼容性、migration、验证策略或多个子系统。

小型文档修正、错别字、局部代码修复可以直接执行，但最终说明仍要清楚。

## 目录结构

每个 change 使用一个目录：

```text
dev/changes/2026-05-17-example-change/
  proposal.md
  design.md
  tasks.md
  spec-delta.md
```

文件职责：

- `proposal.md`: 为什么要改、问题背景、目标、非目标、成功标准。
- `design.md`: 设计方案、理论映射、core/feature/profile 边界、JS/TS 和 HDL
  影响、兼容和风险。
- `tasks.md`: 可执行任务清单、验证命令、review 状态。
- `spec-delta.md`: 对稳定规范、正式类型、feature catalog、roadmap 或 task
  规则的增删改摘要。

## 命名建议

使用日期前缀和短横线英文名：

```text
2026-05-17-property-core-contact
2026-05-17-structural-anchors-outlets
2026-05-17-software-interpreter-s1-promotion
```

## 状态规则

`tasks.md` 应记录当前状态：

- `draft`: 正在讨论。
- `ready-for-review`: 设计和任务清单完整，等待人工 review。
- `accepted`: 已确认可执行。
- `implemented`: 已实现并通过验证。
- `superseded`: 被其它 change 替代。
- `rejected`: 明确不采用。

## 与 AI Task 的关系

`ai/tasks/` 负责探索和证据；`dev/changes/` 负责正式晋升前的审阅单元。

推荐路线：

```text
ai/tasks/<task>
-> material-index / promotion-checklist / verification evidence
-> dev/changes/<change-id>
-> packages / schema / dev / examples / fixtures
```

不要把 task-local schema subset、runtime helper 或 README material 直接复制进
正式目录。Change 必须收窄为最小可审阅成果。

## AI Task Review 标准流程

当一轮 AI task 准备进入正式 review、交互修改、合并和稳定化时，使用以下流程。

### 1. Intake

确认 task 具备 review 条件：

- task 状态是 `ready-for-review`，或人类明确要求提前 review。
- `verification.md` 记录了最终命令、结果或 concrete blocker。
- `promotion-checklist.md` 列出可 promotion 和不可 promotion 的内容。
- `ai/tasks/material-index.md` 已同步该 task 的分类、证据、风险和 review ticket。
- task-local 构建产物已清理，或明确作为 review artifact 保留。

如果这些条件不满足，先回到 task 内补齐，不进入正式 promotion。

### 2. Open Change

为本轮 review 新建一个 change，例如：

```text
dev/changes/2026-05-17-review-basic-software-interpreter-s2/
```

在 `proposal.md` 里记录：

- review 范围。
- 关联 task。
- 本轮要回答的关键问题。
- 成功标准和非目标。

在 `design.md` 里记录：

- task 证据和 legacy evidence。
- 最终语义判断。
- core / feature / profile / runtime / projector 边界。
- JS/TS runtime 与 Verilog HDL 影响。
- 不采纳 task 中哪些内容，以及原因。

### 3. Interactive Review

人工和 AI 交互 review 时，所有结论都落到 change 中：

- bug、语义冲突、命名问题、边界问题写入 `tasks.md`。
- 已确认的设计结论写入 `design.md`。
- 对稳定文档、正式类型、feature catalog、roadmap、task 模板或 material-index
  的影响写入 `spec-delta.md`。

不要只把 review 结论留在聊天记录中。

### 4. Apply Minimal Promotion

只把已确认的最小成果迁移到正式目录：

- `packages/`: 正式 TS/JS authoring source、tools、projectors、engines。
- `schema/`: 语言无关规范 surface 或生成物入口。
- `examples/`、`fixtures/`: 可复用、已验证、已审阅的输入和示例。
- `dev/`: 稳定规则、roadmap、feature catalog、change 记录。

不要 promotion 整个 task 目录、宽泛 README、探索日志、task-local subset 或临时
generated artifact。

### 5. Stabilize

Promotion 后必须重新在正式上下文验证：

- 运行受影响 package 的 typecheck/test/build。
- 如果影响全局 package 或公共类型，运行 `yarn build`。
- 如果影响 software runtime、projector、engine、tool 或 fixture，运行对应 smoke。
- 如果影响 HDL，激活 `E:\oss-cad-suite\environment.ps1` 并运行 `iverilog` smoke。
- 更新 `dev/roadmap.md`、`dev/feature-catalog.md` 或其它稳定文档中的状态。
- 更新 task 的 `promotion-checklist.md` 或 `material-index.md`，标记已 promotion、
  partially promoted、needs-rework 或 archive-only。

### 6. Close Change

关闭 change 前，确认：

- `tasks.md` 状态更新为 `implemented`、`superseded` 或 `rejected`。
- `spec-delta.md` 列出实际发生的规范和代码变化。
- 验证命令和结果写入 `tasks.md`。
- 未采纳内容有明确后续路线：rework task、new change、roadmap item、
  long-term vision 或 archive-only。
