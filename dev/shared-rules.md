# 共同规则

这些规则适用于人与 AI 在本仓库中共同推进 LogicIR 实现同步的工作。

## 权威入口

- [docs/essay.md](../docs/essay.md) 是 LogicIR 当前理论源头。
- [operational-theory.md](operational-theory.md) 是工程执行版理论摘录，用于把 essay 概念落到 schema、projection、runtime 和工具设计。
- [schema-principles.md](schema-principles.md) 是 schema、feature/extension、projection target、协议兼容和历史实现边界的规则入口。
- [logicir-architecture.md](logicir-architecture.md) 是 LogicIR Document、feature、profile、stack、execution provider 等生态概念的架构入口。
- `packages/legacy/engine/src/`、`packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 只作为历史实现证据；旧代码不能作为新 schema 的权威形状。

涉及模型同步时，计划必须明确对应到 LU/LUI、X/Y 执行平面、Z 需求/履约、Closure、Requirement/Fulfillment、Projection/Runtime 分离等概念。涉及 schema 或 projection 的计划必须遵守 [schema-principles.md](schema-principles.md)。

## 计划先于实现

- 重大 schema、API、运行时语义、投影语义调整必须先在 [plans/](plans/) 中写计划。
- 计划要说明目标、理论映射、实现范围、兼容影响、测试方式和未决问题；详细清单见 [plans/README.md](plans/README.md)。
- 小型文档修正或明显局部修复可以直接执行，但仍要保持最终说明清楚。

## AI 自动探索隔离

- 人与 AI 共同确认、逐步讨论并审阅过的内容，才可以进入正式项目文件，例如 `packages/`、`schema/`、`examples/`、`fixtures/` 或正式文档。
- AI 使用 `/goal` 或类似方式全自动完成的大任务，例如一次性生成一个 feature、tool、engine、projector、profile stack 或 runtime prototype，默认只能写入根目录 `ai/tasks/` 下的一个任务子目录。
- Sandbox 内容是素材，不是项目结果。它可以包含代码、文档、测试、运行记录和结论，但不能被正式 workspace package import，也不能作为 schema authority。
- 每个自动任务只能写入自己的一个 task 子目录；可以读取仓库其他位置和其他 task，但不能写入别的 task 子目录。
- Sandbox 隔离是写入隔离，不是读取隔离。Task-local 代码可以通过相对路径读取或引用外部仓库文件作为 read-only input，包括 JS/TS、Verilog HDL、Python、fixture、文档和生成产物；正式项目文件不能反向 import 或依赖 task-local 代码。
- 多个 agent 可以并行写不同 task。每个 task 必须有独立目录、README、范围说明、状态、验证记录和可迁移成果清单。
- Roadmap round 类 task 必须端到端打通。不能只生成中间 schema、plan 或 artifact；必须从 fixture 跑到 runtime/`iverilog` 等最终验证点，并在 task 的 `README.md` 和 `verification.md` 中记录完整链路。
- 每个 task 必须留下可运行验证证据。涉及可运行 JS/TS 代码的任务应在 task 根目录提供自己的 `package.json` 和本地验证脚本，并运行相关 type check、build、test 或 smoke；涉及 Verilog HDL 的任务要激活 `E:\oss-cad-suite\environment.ps1` 并直接调用 `iverilog`。如果任务同时声称支持 JS/TS 和 HDL，两条路径都要跑通；不能跑时必须记录具体 blocker，不能标为已验证。
- 将 task 内容晋升为正式项目文件必须经过人工确认。晋升时只迁移经过审阅的最小成果，并重新放入正确的正式目录；不要整包复制 task。
- 正式目录中的实现可以参考 task 输出，但必须重新满足当前 repo 的 package 边界、schema 边界、测试和文档要求。

## 交接必须可继续

- 任何跨会话工作都必须让后续的人或 AI 不依赖聊天上下文继续。
- 正式开发计划的后续状态写入 [plans/](plans/) 中对应计划，AI 自动任务的后续状态写入对应 `ai/tasks/` 子目录。
- 交接内容至少记录当前状态、已确认决策、相关文件、验证结果、风险和下一步。
- 如果工作被中断，优先更新对应计划或 task 记录，再继续或交还。

## 工作区保护

- 不覆盖用户或他人未授权改动。
- 如果发现工作区已有无关改动，只记录并避开。
- 如果已有改动影响当前任务，先理解并在其基础上继续；只有无法安全继续时再询问。

## 验证纪律

- 每次代码实现后至少运行 `yarn build`。
- 如果无法运行验证命令，必须在对应计划、task 记录或最终说明中记录原因。
- 纯文档结构变更不要求构建，但应检查新增文件可读、链接路径合理，并确认工作区只出现预期变更。
