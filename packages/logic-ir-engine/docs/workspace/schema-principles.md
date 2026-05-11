# Schema Principles

这个文档记录后续制定 LogicIR schema 时必须遵守的设计原则。它用于约束 schema 计划，不替代 [../essay.md](../essay.md) 的理论正文。

## 理论优先

- [../essay.md](../essay.md) 是 LogicIR 新 schema 的理论源头。
- 当前 `src/` 中的 TS/JS 代码是旧版本 prototype/reference，只能作为历史实现、运行时压力和兼容风险的参考。
- 当前 TS/JS 代码不是新 schema 的权威形状，不能反向决定理论概念。
- 例如，不能因为旧代码使用 `Composable` 命名，就阻止新 schema 按 essay 采用 `Structural` 作为执行平面上的 LU kind。

## Target-Neutral Schema

- 新 schema 必须表达 LogicIR 的拓扑、边界语义、Requirement/Fulfillment、Closure、Projection/Runtime 分离。
- 新 schema 不能只服务 JS runtime，也不能把某一个 projector 的实现便利当成 schema 的核心语义。
- Projection target 只约束 schema 的可表达性和边界语义，不要求当前阶段立即实现所有 projector。

## Long-Lived Protocol Model

LogicIR schema 应该像长期协议一样演进：稳定核心、命名空间扩展、显式能力声明，以及无法保持语义时的安全失败。

- Core schema 是长期稳定的语义核心，只放跨 projection target 必须共同理解的逻辑拓扑。
- Core schema 稳定后默认只做 additive changes，不随意删除字段或改变既有语义。
- 破坏性核心语义变化必须走 major version，并提供 migration 或 compat layer。
- Profile/sub-schema 用于承载目标或领域扩展，例如 software runtime、Verilog HDL、分布式运行时或验证工具。
- 扩展必须命名空间化，避免不同 profile 的字段和语义互相污染。
- 扩展必须区分 optional 和 required：optional 可以被不了解的工具忽略，required 不被支持时必须安全失败并给出 diagnostic。
- 旧工具或旧 projector 遇到不支持的 required extension 时，不能假装支持，也不能静默丢失语义。

## Core/Profile/Projection Boundary

- Core schema 定义 LogicIR 是否仍是同一个逻辑拓扑的必要语义。
- Profile/sub-schema 定义某类 target、host、runtime、tooling 或领域所需的附加约束。
- Projection 实现不是单一函数，而是一组声明过的能力集合。
- Projector 必须声明支持的 core version、profiles、features、LU kinds、fulfillment forms 和 target constraints。
- Projector 只能在声明能力覆盖 schema 需求时执行 projection；否则必须返回结构化 diagnostic。
- JS/TS runtime profile 可以定义 async、subscription、host native、runtime state、error/lifecycle 等软件实现细节。
- Verilog HDL profile 可以定义 module boundary、clock/reset、combinational block、sequential block、generate/elaboration-time 结构和静态绑定约束。

## Profile / Feature / Extension Strategy

后续扩展采用三层结构：profile 按领域拆，feature 按能力拆，extension 按具体节点声明拆。

- **Profile** 表示一组稳定的 target/domain 规则，例如 `software-runtime`、`verilog-hdl`、`type-system`、`control-flow`、`visual-editor`、`legacy-tsjs-v1`。
- **Feature / Capability** 表示 profile 内可单独声明支持的能力，例如 `async-policy`、`dynamic-fulfillment`、`clock-reset`、`module-binding`、`port-types`、`payload-path-types`。
- **Extension record** 挂在具体 schema 节点上，承载 optional/required payload。
- 不要把 JS runtime、HDL、类型系统、编辑器布局和兼容迁移塞进一个大 profile。
- 也不要为每个字段创建一个 profile；字段级数据应作为 profile namespace 下的 extension key。
- Projector 不能只声明“支持某 profile”就默认支持全部能力；必须声明具体 features/capabilities。
- 影响语义或正确性的 extension 应为 `required`；只影响展示、布局、注释或可安全降级优化的 extension 可以为 `optional`。

## Projection Target Discipline

- 每个 schema 计划必须显式评估 JS/TS runtime projection impact。
- 每个 schema 计划必须显式评估 Verilog HDL projection impact。
- 如有必要，计划可以继续扩展到其他宿主语言、运行时、分布式系统或硬件目标。
- 如果某个 LogicIR 概念无法直接投影到 Verilog HDL，计划必须说明原因：语义限制、实现暂缓，还是需要额外 projection pass。

## Verilog HDL Considerations

Verilog HDL 不是事后附加目标。制定 schema 时必须考虑它是否能表达为硬件友好的结构，包括但不限于：

- 端口和方向。
- 显式连接。
- 组合逻辑。
- 时序逻辑。
- 状态。
- 时钟和复位。
- 模块边界。
- elaboration-time 结构。

这些考虑不意味着 LogicIR 要退化成 HDL schema。它们只是要求 schema 的核心拓扑和边界语义不要被 JS/TS 软件运行时假设锁死。
