# Shared Rules

这些规则适用于人与 AI 在本仓库中共同推进 LogicIR 实现同步的工作。

## 理论源头

- [../essay.md](../essay.md) 是 LogicIR 当前理论源头。
- [operational-theory.md](operational-theory.md) 是从 essay 提取出的工程执行版理论，用于日常 schema、projection 和 runtime 设计。
- 涉及模型同步时，计划必须明确对应到 LU/LUI、X/Y 执行平面、Z 需求/履约、Closure、Requirement/Fulfillment、Projection/Runtime 分离等概念。
- essay 是理论正文；本目录中的文档负责记录实现计划、协作规则和交接状态。

## 旧代码定位

- 当前 `src/` 中的 TS/JS 代码是旧版本 prototype/reference。
- 旧代码可以用于理解历史命名、运行时压力、已有 projector 行为和兼容风险。
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
- Feature 必须命名空间化，并定义 extension kind 的 payload schema；profile 明确 feature/extension contract 是 optional 还是 required。
- Projection 实现必须声明 capability set，包括支持的 core version、features 和 target constraints。应用层 bundle/profile 只能作为 feature 集合引用，不能替代具体 feature capability。
- 每个 LogicUnit 通过自己的 `features` manifest 声明 feature 依赖；document/package 只是容器，不应成为 LU 语义依赖的唯一来源。
- Extension 应挂在稳定 owner 或关系节点上；`kindOrganization` 内部字段、sequential `steps`、composition leaf/value、pin children 等 helper 结构的附加数据通过 owner-level extension payload selector 表达。
- Projector 遇到不支持的 profile-required extension contract 或无法保持声明语义的结构时，必须返回 diagnostic，不能静默降级。

## 计划先于实现

- 重大 schema、API、运行时语义、投影语义调整必须先在 [plans/](plans/) 中写计划。
- 计划要说明目标、理论映射、实现范围、兼容影响、测试方式和未决问题。
- 小型文档修正或明显局部修复可以直接执行，但仍要保持最终说明清楚。

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
