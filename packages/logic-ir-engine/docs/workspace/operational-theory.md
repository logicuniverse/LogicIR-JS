# Operational Theory Extract

这份文档把 [../essay.md](../essay.md) 和 `D:\Projects\logicuniverse\origin-lab\essay\` 中对工程实现有直接约束力的部分提取出来。它不是新的理论来源；它是给 schema、projection、runtime 和工具设计使用的执行版理论。

## Source Priority

1. 完整理论源头是 [../essay.md](../essay.md)。
2. 原始分章节来源在 `D:\Projects\logicuniverse\origin-lab\essay\`，优先参考：
   - `04-tri-axial-model.md`
   - `06-logicir.md`
   - `08-evidence-and-limits.md`
   - `03-engineering-origin.md`
   - `07-what-logicir-enables.md`
3. 当前 `src/` TS/JS 代码是旧版本 prototype/reference，只能作为实现证据和兼容风险参考。

## Core Claim

LogicIR 的工程目标不是把代码换一种语法重写，而是把逻辑拓扑作为可检查、可变换、可投影的源对象。代码、运行时、HDL、工具视图和其它宿主产物都是 projection 或 realization，不是 LogicIR 本身。

## Logic Unit Model

- **LU** 是在某个边界和尺度上可完整描述的有界逻辑拓扑。
- **LUI** 是某个 LU 在更大拓扑中的局部显现。
- LU 不是不可分原子；它可以递归包含更小的 LUIs、连接、需求和履约关系。
- LUI 的 target 说明它显现什么，但 target 不等于 Z 轴的 requirement fulfillment。

## Execution Plane: X/Y

X 轴描述边界如何被推进：

- **Pull (-X)**: 通过读取、采样、请求、锁存或门控推进。
- **Push (+X)**: 外部到达、通知、事件或交付可以直接推进。

X 轴是 LU/LUI 的 unit-level boundary drive，不是端口 API 形状的枚举。端口层单独描述 contact capability：是否可读取当前值、是否可接收/发出变化通知、是否承诺 retained-current 语义。`retained-current` 表示可读取的值具有最新当前值语义；它可以由 source、sink 或 projector 插入的 adapter 实现，core 只约束可观察边界语义。

Y 轴描述当前层如何跨时间存在：

- **Space (-Y)**: 当前映射，不保留自身时间轨迹。
- **Time (+Y)**: 保留进程、状态、历史结果或跨事件轨迹。

四类 LU kind：

- **Combinational (-X, -Y)**: 可被采样的无状态当前映射。
- **Sequential (-X, +Y)**: 以步骤推进并保留进展的时序逻辑。
- **Stateful (+X, +Y)**: 在外部到达下演进的驻留状态逻辑。
- **Structural (+X, -Y)**: 在外部到达下重新显现结构，但自身层不保留主要时间身份。

当前旧代码中的 `Composable` 更接近早期 structural/composition 实现痕迹，不应阻止新 schema 采用 `Structural`。

## Requirement Fulfillment: Z

Z 轴区分“声明需求”和“满足需求”：

- **Requirement** 是 LU 内部声明的需要某种兼容逻辑满足的 requirement surface。
- **Fulfillment** 是兼容逻辑满足该 requirement 的关系。
- **Require (-Z)** 和 **Fulfill (+Z)** 是同一条履约路径从两侧读取的方向。
- **Z-0** 表示在当前 LUI 处通过 Closure 本地履约。
- **Z-n** 表示沿 supply lineage 向上游解析履约。
- Requirement service 可以 inline 定义，也可以通过 namespace/key 引用外部预定义 contract。外部 contract 解析后才能用于检查 LUI ports、unit compatibility 和 fulfillment shape；core 不定义 registry/database lookup 机制。

Requirement fulfillment 不能被普通数据流、命名查找、参数传递、callback 或 ambient context 隐藏。数据和信号沿 X/Y 平面移动；所需逻辑的供应沿 Z 轴表达。

## Closure

- Closure 是附着在 LUI 上、用于本地履约某个 exposed requirement 的 wrapper。
- Closure 内部包含可投影的逻辑 core，但 Closure 本身不是 LUI，也不是通用 runtime projection。
- Closure 可以按 same-key 方式 forward 内部普通 ports，让数据或信号与外部拓扑连接。
- Closure 可以打开或限制供内部 requirement 继续解析的 supply environment。

## LogicIR Representation Obligations

新 schema 至少必须能显式表达：

- 有界 LUs 和局部 LUIs。
- Ports、pins、port interaction capabilities、port discipline、addressable endpoint refs。
- In-plane connections。
- LU kind 和 kind-specific organization。
- Requirement services 和 requirement units。
- Fulfillment relations，包括 Closure fulfillment 和 upstream lineage fulfillment。
- Closure cores 和 same-key forwarded port declarations。
- LU-defined、external、requirement-backed target references。
- Representation 与 projection/runtime 的边界。

这些是结构义务，不是固定字段名。schema 可以演进，但不能丢失这些可检查关系。

## Endpoint Addressing

Endpoint refs 应支持 port-level 以及 payload-level 寻址：

- `owner + portKey` 定位一个边界 contact。
- `payloadPath` 定位该 port payload 内部的嵌套位置，例如 object field、array item、bus lane 或包裹总线字段。
- `Port.pins` 只声明第一层可见 pin surface；pin 继承 port 的 boundary 和 interaction。
- `Port.boundary` 是 port 在 owner 边界上的侧别，而 `Connection.from/to` 是相对当前 `LUCore` 图的流向。当前 LU/Closure 的 input boundary 是图内 source，当前 LU/Closure 的 output boundary 是图内 sink；子 LUI 的 input boundary 是图内 sink，子 LUI 的 output boundary 是图内 source。
- `payloadPath` 的后续段是逻辑 payload address，由 target LUI、feature extension 或 projector 解释，不自动变成 nested core pins。
- `from.payloadPath` 在 pull-readable flow 中是 source payload selector，在 push-notifiable flow 中是 source payload path filter/prefix。
- `to.payloadPath` 在 pull-readable flow 中是 target payload assembly location，在 push-notifiable flow 中是 target payload path prefix/remap。
- Single-driver 检查应按 target endpoint path overlap 判断：同一 `owner + portKey` 下，whole-port 与任意 sub-path 冲突，重复 path 冲突，parent/child path 冲突；不同 sibling lanes 可以分别连接。
- 如果深层 payload 需要独立拓扑、不同 boundary/interaction 或独立身份，应引入中间 LUI，而不是把 pin 层变成完整子图。
- `payloadPath` 只做寻址和路径映射，不做计算、fan-in、merge、pack/unpack 语义；这些需要 LUI 或 required feature extension。

## Structural Spatial Slices and Distributed Projection

Structural composition 可以用 anchor 和 outlet 两个原语理解。`CompositionAnchor` 有 `shape` 和 `required`，表示可以接收 composition value 的锚点；`CompositionOutlet` 是可以放入某个 anchor 的结构出口。Structural LU/closure 的 `exportSlots` 是当前结构对外提供的隐式 single anchors，因此只保存 `required`；`placeholderOutlets` 是当前结构声明的 placeholder outlets。一个 structural LU 被实例化成 LUI 后，这些 placeholder outlets 在父级视角解析为 `compositionSurface.anchors`，由父级填充；structural LUI 的 `compositionSurface.outlets` 则是该 LUI 提供给父级放入当前 LU/closure anchor 的 outlets。

Structural LU 的 `exportSlots` 仍可以被读取为 named spatial slices。一个 structural LU 不需要只有一个默认出口；`root` 可以是常用主 slice 约定，但不是 schema 特权字段。多个 `exportSlots` 允许同一个 structural LUI 在父级中按不同空间切片被引用。

`exportSlotFills[exportSlotKey]` 描述某个 anchor / slice 的 single composition leaf。遍历这些 leaves 可以推导该 slice 直接使用哪些 child LUI outlets、哪些 placeholder outlets，以及哪些 child structural export slices 被接入。集合或映射组合不直接放在当前 LU/closure 的 export slot 上；它们属于 structural LUI anchors，并通过 `luiFills[luiId]` 提供。`luiFills[luiId]` 描述该 child LUI 实例的 anchors 如何被填充；它属于实例上下文，不属于某一次 `lui-outlet` 引用。

基于这些结构，projector 或 analyzer 可以把一个含 N 个 export slots 的 structural LU 切分成 N 个 slice subsystems。切分后，每个 subsystem 可以有自己的局部结构和跨 slice 通信边界。一个常见 lowering 是为每个 slice subsystem 生成一个 push-notifiable `rx` input bus 和一个 push-notifiable `tx` output bus；`tx` 不必按目标 slice 膨胀成 N-1 个端口，目标 slice/channel 可以作为第一层 pin 或 `payloadPath` 段，后续段表达 message field、bus lane 或嵌套地址。

这种分布式 slice 设计由 core 支持，但不由 core 强制。Core 只提供：

- `exportSlots` / `exportSlotFills` 表达 spatial slice boundary 和 slice composition。
- `luiFills` 表达 child LUI 实例的 anchor fills / composition context。
- `ConnectionId` 保留拆分后逻辑边的独立身份。
- `EndpointRef.payloadPath` 表达 bus、sub-bus、lane 或 nested message address。

具体的 RX/TX 端口生成、placement、transport、调度、打包、序列化、fan-in resolver 或 merge policy 属于 projection strategy 或 required feature extension。Projector 不能把这些语义作为隐式 runtime 假设静默引入。

## Core/Feature/Projection

- **Core schema** 保存跨 projection target 必须共同理解的逻辑拓扑语义。
- **Feature/extension** 保存某个 target、host、runtime、tooling 或领域的附加约束。
- **Profile/bundle** 不是 LogicIR object model 的一部分；如果应用或工具需要，可以作为 feature 集合的引用便利存在。
- **Projection** 是能力声明和 lowering/realization pipeline，不只是一个转换函数。
- Projector 必须声明支持的 core version、features、LU kinds、fulfillment forms 和 target constraints。应用层 bundle 必须解析成具体 feature 后才能用于能力判断。
- 不支持 required extension 或无法保持声明语义时，projector 必须安全失败并返回 diagnostic。

## Projection Targets

新 schema 不能只服务 JS/TS runtime。每个 schema 计划必须显式评估：

- **JS/TS runtime impact**: async、subscription、host native、runtime state、error/lifecycle、legacy compatibility。
- **Verilog HDL impact**: module boundary、ports/directions、connections、combinational logic、sequential logic、state、clock/reset、generate/elaboration-time structure、static binding constraints。

Verilog HDL 不要求 LogicIR 退化成 HDL schema；它要求核心拓扑和边界语义不要被软件 runtime 假设锁死。

## Compatibility Discipline

LogicIR schema 按长期协议演进：

- Core schema 稳定后默认只做 additive changes。
- 破坏性核心语义变化走 major version。
- Feature 和 extension 必须命名空间化。
- Extension 必须标记 optional 或 required。
- 旧工具可以忽略 optional extension，但遇到不支持的 required extension 必须失败。
- 需要破坏性迁移时必须说明 migration 或 compat layer。

## Current Implementation Reading Guide

读取当前代码时按以下方式使用：

- `models.ts` 说明旧 V1 把 schema、runtime convenience 和 projection 便利混在一起。
- `PortKind.Pull/Push` 可作为旧版 boundary/contact 实现参考，但新 schema 应区分 unit-level X 轴和 port-level contact capability。
- `Property` 是旧实现中 retained-current contact 的证据：它把可读取当前值、变化通知和最新值缓存绑在一起。新 core 可以表达 retained-current 语义，但 JS store/subscription/cache 机制仍属于 runtime feature 或 projector implementation。
- `SequentialStep` 是 sequential kind organization 的早期形态；`isAwaited` 偏 JS async projection。
- `dependencies`、`Provider`、`SovereignSource`、`AbstractLUT`、`closures` 是 Z 轴旧近似实现。
- `runtime.ts` 中的 `Thenable`、`subscribe`、`StateStore`、`LUProjectorPlugin` 属于 JS runtime projection，不应进入 core schema。
