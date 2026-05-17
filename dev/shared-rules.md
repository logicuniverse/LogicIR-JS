# 共同规则

这些规则适用于人与 AI 在本仓库中共同推进 LogicIR 实现同步的工作。

## 权威入口

- [docs/essay.md](../docs/essay.md) 是 LogicIR 当前理论源头。
- [operational-theory.md](operational-theory.md) 是工程执行版理论摘录，用于把 essay 概念落到 schema、projection、runtime 和工具设计。
- [schema-principles.md](schema-principles.md) 是 schema、feature/extension、projection target、协议兼容和历史实现边界的规则入口。
- [logicir-architecture.md](logicir-architecture.md) 是 LogicIR Document、feature、profile、stack、execution provider 等生态概念的架构入口。
- `packages/legacy/engine/src/`、`packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 只作为历史实现证据；旧代码不能作为新 schema 的权威形状。

涉及模型同步时，变更提案必须明确对应到 LU/LUI、X/Y 执行平面、Z 需求/履约、Closure、Requirement/Fulfillment、Projection/Runtime 分离等概念。涉及 schema 或 projection 的变更提案必须遵守 [schema-principles.md](schema-principles.md)。

## Change 先于重大实现

- 重大 schema、API、运行时语义、投影语义调整必须先在 [changes/](changes/) 中开变更提案。
- Change 要包含 `proposal.md`、`design.md`、`tasks.md` 和 `spec-delta.md`，说明目标、理论映射、实现范围、兼容影响、测试方式和未决问题；详细规则见 [changes/README.md](changes/README.md)。
- 小型文档修正或明显局部修复可以直接执行，但仍要保持最终说明清楚。

## AI 自动探索隔离

- 人与 AI 共同确认、逐步讨论并审阅过的内容，才可以进入正式项目文件。
- AI 使用 `/goal` 或类似方式全自动完成的大任务，默认写入根目录
  `ai/tasks/` 下的一个任务子目录；不确定、探索性或可丢弃内容进入
  `ai/scratch/`。
- Sandbox 内容是素材，不是项目结果。它可以包含代码、文档、测试、运行记录和
  结论，但不能被正式 workspace package import，也不能作为 schema authority。
- 具体 AI task 操作规程、roadmap round 验收、material-index 同步和 promotion
  checklist 要求见 [process.md](process.md) 与
  [`../ai/tasks/README.md`](../ai/tasks/README.md)。

## 交接必须可继续

- 任何跨会话工作都必须让后续的人或 AI 不依赖聊天上下文继续。
- 正式变更的后续状态写入 [changes/](changes/) 中对应 change，AI 自动任务的后续状态写入对应 `ai/tasks/` 子目录。
- 交接内容至少记录当前状态、已确认决策、相关文件、验证结果、风险和下一步。
- 如果工作被中断，优先更新对应 change 或 task 记录，再继续或交还。

## 工作区保护

- 不覆盖用户或他人未授权改动。
- 如果发现工作区已有无关改动，只记录并避开。
- 如果已有改动影响当前任务，先理解并在其基础上继续；只有无法安全继续时再询问。

## 验证纪律

- 每次代码实现后至少运行 `yarn build`。
- 如果无法运行验证命令，必须在对应 change、task 记录或最终说明中记录原因。
- 纯文档结构变更不要求构建，但应检查新增文件可读、链接路径合理，并确认工作区只出现预期变更。
