# Shared Rules

这些规则适用于人与 AI 在本仓库中共同推进 LogicIR 实现同步的工作。

## 理论源头

- [docs/essay.md](../docs/essay.md) 是 LogicIR 当前理论源头。
- [operational-theory.md](operational-theory.md) 是从 essay 提取出的工程执行版理论，用于日常 schema、projection 和 runtime 设计。
- 涉及模型同步时，计划必须明确对应到 LU/LUI、X/Y 执行平面、Z 需求/履约、Closure、Requirement/Fulfillment、Projection/Runtime 分离等概念。
- essay 是理论正文；本目录中的文档负责记录实现计划、协作规则和交接状态。

## 旧代码定位

- `packages/legacy/engine/src/` 是旧版 LogicIR JS/TS engine prototype/reference。
- `packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 是更早 FlowForge-era source-only 快照。
- 旧代码可以用于理解历史命名、运行时压力、已有 projector 行为、编辑操作、lowering、旧 node/LUI catalog 覆盖面和兼容风险。
- 旧代码不能作为新 schema 的权威形状，不能反向决定 essay 中的理论概念。
- 涉及 schema 的计划必须遵守 [schema-principles.md](schema-principles.md)。

## 投影目标纪律

- 新 schema 必须保持 target-neutral，不能只服务 JS runtime。
- 每个 schema 计划必须显式评估 JS/TS runtime projection impact。
- 每个 schema 计划必须显式评估 Verilog HDL projection impact。
- 如果某个 LogicIR 概念无法直接投影到 Verilog HDL，计划必须说明是语义限制、实现暂缓，还是需要额外 projection pass。

## 协议兼容纪律

- LogicIR schema 按长期协议思路演进：稳定 core、命名空间扩展、显式 capability、安全失败。
- Core schema 稳定后默认只做 additive changes；破坏性核心语义变化必须走 major version，并说明 migration 或 compat layer。
- Feature 必须命名空间化，并定义 extension kind 的 payload schema；profile 明确 feature/extension contract 是 required、conditional-required、recommended 还是 optional。
- Projection 实现必须声明 capability set，包括支持的 core version、features 和 target constraints。stack/profile 只能作为兼容契约入口，不能替代具体 feature、stage、policy 和 provider capability 覆盖。
- 每个 LogicUnit 通过自己的 `features` manifest 声明 feature 依赖；document/package 只是容器，不应成为 LU 语义依赖的唯一来源。
- Extension 应挂在稳定 owner 或关系节点上；`kindOrganization` 内部字段、sequential `steps`、composition leaf/value、pin children 等 helper 结构的附加数据通过 owner-level extension payload selector 表达。
- Projector 遇到不支持的 required 或 conditional-required extension contract，或者无法保持声明语义的结构时，必须返回 diagnostic，不能静默降级。

## 计划先于实现

- 重大 schema、API、运行时语义、投影语义调整必须先在 [plans/](plans/) 中写计划。
- 计划要说明目标、理论映射、实现范围、兼容影响、测试方式和未决问题。
- 小型文档修正或明显局部修复可以直接执行，但仍要保持最终说明清楚。

## AI 自动探索隔离

- 人与 AI 共同确认、逐步讨论并审阅过的内容，才可以进入正式项目文件，例如 `packages/`、`schema/`、`examples/`、`fixtures/` 或正式文档。
- AI 使用 `/goal` 或类似方式全自动完成的大任务，例如一次性生成一个 feature、tool、engine、projector、profile stack 或 runtime prototype，默认只能写入根目录 `ai/tasks/` 下的一个任务子目录。
- Sandbox 内容是素材，不是项目结果。它可以包含代码、文档、测试、运行记录和结论，但不能被当前正式包 import，也不能作为 schema authority。
- 每个自动任务只能写入自己的一个 task 子目录；可以读取仓库其他位置和其他 task，但不能写入别的 task 子目录。
- 多个 agent 可以并行写不同 task。每个 task 必须有独立目录、README、范围说明、状态、验证记录和可迁移成果清单。
- 将 task 内容晋升为正式项目文件必须经过人工确认。晋升时只迁移经过审阅的最小成果，并重新放入正确的正式目录；不要整包复制 task。
- 正式目录中的实现可以参考 task 输出，但必须重新满足当前 repo 的 package 边界、schema 边界、测试和文档要求。

## 交接必须可继续

- handoff 必须让后续的人或 AI 不依赖聊天上下文继续工作。
- handoff 至少记录当前状态、已确认决策、相关文件、验证结果、风险和下一步。
- 如果工作被中断，优先更新 handoff，再继续或交还。

## 工作区保护

- 不覆盖用户或他人未授权改动。
- 如果发现工作区已有无关改动，只记录并避开。
- 如果已有改动影响当前任务，先理解并在其基础上继续；只有无法安全继续时再询问。

## 验证纪律

- 每次代码实现后至少运行 `yarn build`。
- 如果无法运行验证命令，必须在 handoff 或最终说明中记录原因。
- 纯文档结构变更不要求构建，但应检查新增文件可读、链接路径合理，并确认工作区只出现预期变更。
