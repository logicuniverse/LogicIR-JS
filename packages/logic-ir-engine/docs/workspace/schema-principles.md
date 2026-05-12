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
- Core 可以表达 target-neutral 的端口 contact capability，例如 readable、notifiable、retained-current；但不能规定这些能力在 JS runtime 或 HDL 中的具体实现位置和机制。
- Core 可以表达嵌套 payload 的逻辑寻址，例如 object path、array index、bus lane 或包裹总线字段；但不能把深层 payload 结构自动提升为 nested core pins 或 target-specific type system。
- Core 可以表达 structural `exportAnchors` 作为 named spatial slices，并允许 `Connection + payloadPath` 支撑 slice 间 bus-style routing；但不能把某个分布式 runtime 的 RX/TX 端口生成、placement、transport、scheduling 或 serialization 规则固定为 core schema。
- X 轴仍然是 unit-level boundary drive。端口 contact capability 不能反向变成新的 X 轴方向。
- Core 的 port surface 使用单一 `PortKey` namespace；`input` / `output` 是 port boundary，不是两套独立 key 空间。
- Core sequential organization 只保存 `steps: LUIId[]`。更细的 control-flow、guard、branch、return、go-back、async 或调度语义必须走 feature extension 或 projection lowering。

## Long-Lived Protocol Model

LogicIR schema 应该像长期协议一样演进：稳定核心、命名空间扩展、显式能力声明，以及无法保持语义时的安全失败。

- Core schema 是长期稳定的语义核心，只放跨 projection target 必须共同理解的逻辑拓扑。
- Core schema 稳定后默认只做 additive changes，不随意删除字段或改变既有语义。
- 破坏性核心语义变化必须走 major version，并提供 migration 或 compat layer。
- Feature/extension 用于承载目标或领域扩展，例如 software runtime、Verilog HDL、分布式运行时或验证工具。
- Feature 必须有命名空间，避免不同应用、工具或 target 的字段和语义互相污染。
- 扩展必须区分 optional 和 required：optional 可以被不了解的工具忽略，required 不被支持时必须安全失败并给出 diagnostic。
- 旧工具或旧 projector 遇到不支持的 required extension 时，不能假装支持，也不能静默丢失语义。

## Core/Feature/Projection Boundary

- Core schema 定义 LogicIR 是否仍是同一个逻辑拓扑的必要语义。
- Feature/extension 定义某类 target、host、runtime、tooling 或领域所需的附加约束。
- Profile/bundle 不是 LogicIR 对象模型的一部分；它只是应用层或工具层为了方便引用而组织 feature 集合。
- Projection 实现不是单一函数，而是一组声明过的能力集合。
- Projector 必须声明支持的 core version、features、LU kinds、fulfillment forms 和 target constraints。它可以接受应用层 bundle 名称，但必须解析为具体 feature。
- Projector 只能在声明能力覆盖 schema 需求时执行 projection；否则必须返回结构化 diagnostic。
- JS/TS runtime feature 可以定义 async、subscription、host native、runtime state、error/lifecycle 等软件实现细节。
- Verilog HDL feature 可以定义 module boundary、clock/reset、combinational block、sequential block、generate/elaboration-time 结构和静态绑定约束。

## Feature / Extension Strategy

后续扩展采用 feature-centered 结构：feature 是 projector capability unit，extension 是挂在具体节点上的 payload。应用层可以定义 profile/bundle 来引用 feature 集合，但 LogicIR core 不定义 profile。

- **Feature / Capability** 表示可单独声明、验证和投影的能力单元。Feature 自身有稳定身份，通常是 `namespace + key`，例如 `logicir.software-runtime / async-policy`、`logicir.verilog-hdl / clock-reset`、`logicir.type-system / payload-types`。
- **Extension record** 挂在具体 schema 节点上，显式引用所属 `feature`，并用 `key` 标识该 feature 下的具体 extension kind，承载 optional/required payload。
- **Application bundle/profile** 可以作为应用层 feature 集合，例如 `software-runtime`、`verilog-hdl`、`type-system`、`control-flow`、`visual-editor`、`legacy-tsjs-v1`，但不进入 canonical LogicIR object。
- Feature 和应用层 bundle 是多对多关系：一个 feature 可以被多个 bundle 复用，一个 bundle 也可以组合多个 namespace 下的 feature。
- 不要把 JS runtime、HDL、类型系统、编辑器布局和兼容迁移塞进一个大 feature。
- 也不要为每个字段创建一个 feature；字段级数据应作为相关 feature 下的 extension key。
- Extension attachment 应优先选择稳定 owner 或关系节点，例如 `LogicUnit`、`LUCore`、`LUI`、`Port`、`Connection`、`Closure`、requirement service、service-level fulfillment 或 unit fulfillment。不要为了给 helper 子结构加 metadata 而让 `PinSet`、sequential `steps`、composition leaf/value 或 `kindOrganization` 内部字段自己支持 extension；owner-level payload 可以用 selectors 指向这些内部位置。
- Kind-specific metadata 应通过 `LUCore.extensions` 组织。`kindOrganization` 是 core 最小骨架，不是各 target/runtime 私有数据的容器。
- Projector 不能只声明“支持某 bundle/profile”就默认支持全部能力；必须声明具体 features/capabilities，或解析 bundle manifest 后逐项声明覆盖。
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
