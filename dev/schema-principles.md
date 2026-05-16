# Schema 原则

这个文档记录后续制定 LogicIR schema 时必须遵守的设计原则。它用于约束 schema 计划，不替代 [docs/essay.md](../docs/essay.md) 的理论正文。

职责边界：本文维护 schema、feature/extension 和 projection target 的规则；生态术语归 [`logicir-architecture.md`](logicir-architecture.md)，理论动机归 [`operational-theory.md`](operational-theory.md)，具体实现阶段归 [`roadmap.md`](roadmap.md)。

## 理论优先

- [docs/essay.md](../docs/essay.md) 是 LogicIR 新 schema 的理论源头。
- `packages/legacy/engine/src/` 中的 TS/JS 代码是旧版 LogicIR engine prototype/reference，只能作为历史实现、运行时压力、设计借鉴和兼容风险的参考；它不是 schema 真理，也不是唯一或最优实现路线。
- `packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 是更早 FlowForge-era source-only 快照，只能作为运行时、编辑操作、lowering 和旧 node/LUI catalog 覆盖面的历史证据。
- 旧 TS/JS 代码不是新 schema 的权威形状，不能反向决定理论概念。
- 例如，不能因为旧代码使用 `Composable` 命名，就阻止新 schema 按 essay 采用 `Structural` 作为执行平面上的 LU kind。

## 目标中立 Schema

- 新 schema 必须表达 LogicIR 的拓扑、边界语义、Requirement/Fulfillment、Closure、Projection/Runtime 分离。
- 新 schema 不能只服务 JS runtime，也不能把某一个 projector 的实现便利当成 schema 的核心语义。
- Projection target 只约束 schema 的可表达性和边界语义，不要求当前阶段立即实现所有 projector。
- Schema TS authoring source 不能使用 TypeScript 泛型或 utility type 作为 schema 抽象，包括 `Base<T>`、`Record<K, V>`、`Exclude<T, U>`、`Pick`、`Omit`、`Partial` 等。需要显式写出可序列化 object、union、intersection、array 和 index-signature 类型；如果重复结构过多，优先接受少量重复，而不是引入 TS-only abstraction。
- Core 可以表达 target-neutral 的端口 contact kind：`pull`、`push`、`property`。`property` 是 retained-current reactive contact；core 不能规定这些能力在 JS runtime 或 HDL 中的具体实现位置和机制。
- Core 可以表达嵌套 payload 的逻辑寻址，例如 object path、array index、bus lane 或包裹总线字段；但不能把深层 payload 结构自动提升为 nested core pins 或 target-specific type system。
- Core 可以表达 structural `exportAnchors` 作为 named spatial slices，并允许 `Connection + payloadPath` 支撑 slice 间 bus-style routing；但不能把某个分布式 runtime 的 RX/TX 端口生成、placement、transport、scheduling 或 serialization 规则固定为 core schema。
- X 轴仍然是 unit-level boundary drive。端口 contact capability 不能反向变成新的 X 轴方向。
- Core 的 port surface 使用 kind-specific slots：`inputs`、合法时存在的 `outputs`，以及合法时存在的 `result`。`inputs` / `outputs` 内部使用 `PortKey` map；`result` 是独立槽位，不是端口 role。`combinational` 只有 `inputs + result`，不能有普通 `outputs`；多个组合结果通过 `result.pins` 和 `payloadPath` 表达。
- Core sequential organization 只保存 `steps: LUIId[]`，表达 pipeline/step list，不表达一般分支控制流图。`GoBackIf`、`ReturnIf`、guard、branch、async 或调度语义必须走 feature extension 或 projection lowering。
- `LUCore.kindOrganization.kind` 决定 runtime、projector 和 compiler 的首层处理策略。Core 只保存 target-neutral organization skeleton；software interpreter、generated software、Verilog HDL 或其它 target 的具体处理方式必须由 profile、feature、lowering 或 engine 实现声明。不能把 `LUCore.luis` 默认拍平成 eager node list，也不能把某个 target 的执行策略反向写成 core 字段。

## 长期协议模型

LogicIR schema 应该像长期协议一样演进：稳定核心、命名空间扩展、显式能力声明，以及无法保持语义时的安全失败。

- Core schema 是长期稳定的语义核心，只放跨 projection target 必须共同理解的逻辑拓扑。
- Core schema 稳定后默认只做 additive changes，不随意删除字段或改变既有语义。
- 破坏性核心语义变化必须走 major version，并提供 migration 或 compat layer。
- Feature/extension 用于承载目标或领域扩展，例如 software runtime、Verilog HDL、分布式运行时或验证工具。
- Feature 必须有命名空间，避免不同应用、工具或 target 的字段和语义互相污染。
- Feature 必须定义 extension kind 的 payload schema 和字段必选性；profile 必须区分 required、conditional-required、recommended 和 optional feature/extension contract。
- 旧工具或旧 projector 遇到不支持的 required 或 conditional-required extension contract 时，不能假装支持，也不能静默丢失语义。

## Core/Feature/Projection 边界

- Core schema 定义 LogicIR 是否仍是同一个逻辑拓扑的必要语义。
- Feature/extension 定义某类 target、host、runtime、tooling 或领域所需的附加约束。
- Profile/stack 不是 LogicIR 对象模型的一部分；它属于 architecture 层兼容契约。Profile 描述单个 IR pipeline、projection 或 execution 层的要求，stack 组合这些 profile 形成用户可选工作流。
- Projection 实现不是单一函数，而是一组声明过的能力集合。
- Projector 必须声明支持的 core version、features、LU kinds、fulfillment forms 和 target constraints。它可以接受 stack/profile 名称，但必须解析为具体 features、stages、policies 和 provider contracts。
- Projector 只能在声明能力覆盖 schema 需求时执行 projection；否则必须返回结构化 diagnostic。
- Projector、compiler 和 execution engine 必须按 LU kind 分派处理，并声明自己采用的 realization strategy。当前 basic 路线把 `combinational` 作为 `ports.result` lazy pull / 组合逻辑，把 `sequential` 作为 pipeline/step list，把 `stateful` 作为 durable property/current state realization，把 `structural` 作为 composition function / elaboration result realization；这些是 baseline，不是唯一算法。任何 flatten/lowering 成平面执行计划或采用其它执行模型的行为，都必须是显式、可诊断、可验证的 projection step，并证明没有丢失对应 LU kind 的可观察语义。
- JS/TS runtime feature 可以定义 async、subscription、host native、runtime state、error/lifecycle 等软件实现细节。
- Verilog HDL feature 可以定义 module boundary、clock/reset、combinational block、sequential block、generate/elaboration-time 结构和静态绑定约束。

## Feature / Extension 策略

后续扩展采用 feature-centered 结构：feature 是横切语义能力单元，extension 是挂在具体节点上的 payload。Profile 是 architecture 层的单层兼容契约，stack 是用户可选的 profile 组合；LogicIR core 不定义 profile 或 stack。

- **Feature / Capability** 表示可单独声明、验证和投影的能力单元。Feature 自身有稳定身份，通常是 `namespace + key`，例如 `logicir.type-system / core`。具体字段语义放在该 feature 下的 extension key 中，例如 `payload-type`、`clock-reset` 或 `completion-policy`。
- **LogicUnit feature manifest** 是 LU-local 的 feature 依赖表，inline 保存 feature namespace/key/version，让 LU 脱离 document/package 后仍然可携带和验证。Feature 级行为配置应进入 feature-owned extension、profile policy 或 execution binding，而不是 manifest 的通用 config。
- **Extension record** 挂在具体 schema 节点上，通过本地 `featureKey` 引用当前 `LogicUnit.features` 中的 feature，并用 `key` 标识该 feature 下的具体 extension kind，承载 payload。Record 本身不声明 optional/required。
- **Profile** 声明一个处理层需要哪些 features、extension points、stages、policies、diagnostics、target constraints、provider contracts 或 execution bindings。
- **Stack** 组合 IR pipeline profile、projection profile 和可选 execution profile，作为用户或应用选择的端到端工作流。
- **Application bundle** 如果存在，只是应用层便捷别名；它必须解析为具体 profile、stack 或 feature identities 后才能做能力检查。
- Feature、profile 和 stack 是多对多关系：一个 feature 可以被多个 profile 复用，一个 stack 也可以组合多个 profile。
- 不要把 JS runtime、HDL、类型系统、编辑器布局和兼容迁移塞进一个大 feature。
- 也不要为每个字段创建一个 feature；字段级数据应作为相关 feature 下的 extension key。
- Extension attachment 应优先选择稳定 owner 或关系节点，例如 `LogicUnit`、`LUCore`、`LUI`、`Port`、`Connection`、`Closure`、requirement service、service-level fulfillment 或 unit fulfillment。不要为了给 helper 子结构加 metadata 而让 `PinSet`、sequential `steps`、composition leaf/value 或 `kindOrganization` 内部字段自己支持 extension；owner-level payload 可以用 selectors 指向这些内部位置。
- Kind-specific metadata 应通过 `LUCore.extensions` 组织。`kindOrganization` 是 core 最小骨架，不是各 target/runtime 私有数据的容器。
- Projector 不能只声明“支持某 stack/profile”就默认支持全部能力；必须声明具体 features/capabilities，或解析 profile/stack 后逐项声明覆盖。
- 影响语义或正确性的 extension kind 应由 profile contract 声明为 required 或 conditional-required；只影响展示、布局、注释或可安全降级优化的 extension kind 可以在相应 profile 中声明为 recommended 或 optional。

## Projection Target 纪律

- 每个 schema 计划必须显式评估 JS/TS runtime projection impact。
- 每个 schema 计划必须显式评估 Verilog HDL projection impact。
- 如有必要，计划可以继续扩展到其他宿主语言、运行时、分布式系统或硬件目标。
- 如果某个 LogicIR 概念无法直接投影到 Verilog HDL，计划必须说明原因：语义限制、实现暂缓，还是需要额外 projection pass。

## Verilog HDL 考量

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
