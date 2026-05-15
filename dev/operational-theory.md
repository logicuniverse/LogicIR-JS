# 工程化理论摘录

这份文档把 [docs/essay.md](../docs/essay.md) 中对工程实现有直接约束力的部分提取出来。它不是新的理论来源；它是给 schema、projection、runtime 和工具设计使用的执行版理论。

## 来源优先级

1. 完整理论源头是 [docs/essay.md](../docs/essay.md)。
2. 这份文档是 essay 的工程执行版摘录；如果两者冲突，以
   [docs/essay.md](../docs/essay.md) 为准。
3. `packages/legacy/engine/src/` 是旧版 LogicIR JS/TS engine prototype/reference，只能作为实现证据和兼容风险参考。`packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 是更早 FlowForge-era source-only 快照，只作为运行时、编辑操作、lowering 和旧 LUI/node 覆盖面的历史证据。

## 核心主张

LogicIR 的工程目标不是把代码换一种语法重写，而是把逻辑拓扑作为可检查、可变换、可投影的源对象。代码、运行时、HDL、工具视图和其它宿主产物都是 projection 或 realization，不是 LogicIR 本身。

## 人 + AI 协同编辑前景

这一节不是新的理论分支，而是把 [docs/essay.md](../docs/essay.md) 中关于“机器编辑源码时需要先从 token residue 重建隐含结构”、以及 AI-assisted work 可以从 token proximity 转向 declared regions、boundaries、requirement sites 和 semantic-preservation checks 的论点，落成工程实践。

LogicIR 的一个核心价值是把 AI 从“直接生成或修改目标代码”提升到“在受约束的语义结构中进行小步、原子、可验证的逻辑编辑”。内部开发和外部用户 authoring 都应优先围绕这个模型设计：

```text
自然语言 / 拖拽 / 图编辑 / 表单输入
-> partial LogicIR
-> typed holes / semantic slots
-> AI completion / repair / refinement
-> validation / typecheck / capability check
-> projection / execution / simulation / report
```

这不是普通 code generation 的替代语法，而是一个 mixed-initiative authoring model：人类可以在不同抽象层级描述目标、拖拽结构、选择 feature/provider、留下空位；AI 根据当前 scope、closure、profile、feature、provider registry 和 type information 补全、修复或细化 LogicIR。代码、HDL、execution plan、测试和文档都是后续 projection 或 verification artifact。

这个方向比直接 vibe coding 更强的地方在于：AI 编辑的对象不再是自由文本代码，而是带 schema、边界、feature contract、provider contract 和验证结果的逻辑结构。人类 review 的对象也不只是代码 diff，而是一次带有 intent、scope、operations、validation 和 tests 的可追踪 edit transaction。

## Partial IR 和 Typed Holes

LogicIR authoring 应允许暂时不完整，但不允许语义无边界地空缺。一个空位应该有明确接口，例如：

- 这里需要一个满足 invocation contract 的 provider。
- 这里需要补齐某个 port payload type 或 signal width。
- 这里需要 completion、error、retained-current 或 fulfillment policy。
- 这里需要一个 closure 或 upstream fulfillment。
- 这里需要选择 projection target 或 execution binding。

只要空位的接口确定，AI 就可以在可检查空间内自动补全；如果当前 profile 不允许补全所需 feature，工具必须给出 diagnostic，而不是静默降级。

## Authoring Level

用户和 AI 可以在多个 level 协作：

- **Intent level**: 自然语言描述目标。
- **Structure level**: 创建 LU、LUI、port、connection、closure 和 composition surface。
- **Semantic level**: 选择 feature、extension、requirement service 和 provider contract。
- **Binding level**: 绑定 provider、runtime、target、projection 和 execution environment。
- **Verification level**: 运行 schema check、profile check、type check、capability check、runtime smoke 或 HDL simulation。
- **Projection level**: 生成 interpreter plan、JS/TS、Verilog HDL、report、测试或可视化 artifact。

后续工具设计应把这些 level 保持为同一 LogicIR edit flow 的不同入口，而不是互相割裂的产品模式。

## LogicIR Edit Transaction

AI 自动修改 LogicIR 时，理想输出不是“我改了几个文件”，而是一条可验证 transaction：

```text
intent
scope / closure
before state reference
operations
after state reference
validation result
test or simulation result
rationale
```

每次 transaction 都应该尽量小，落在明确 scope 内，并且可以被 replay、review、rollback 或 promotion。这个模型也是 `ai/tasks/` sandbox 与正式项目文件之间的桥梁：AI 可以在 sandbox 中探索完整实现，但被 promotion 的应是经过人工审查、验证通过、边界清楚的最小成果。

## Logic Unit 模型

- **LU** 是在某个边界和尺度上可完整描述的有界逻辑拓扑。
- **LUI** 是某个 LU 在更大拓扑中的局部显现。
- LU 不是不可分原子；它可以递归包含更小的 LUIs、连接、需求和履约关系。
- LUI 的 target 说明它显现什么，但 target 不等于 Z 轴的 requirement fulfillment。

## 执行平面：X/Y

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

当前 core schema 的执行平面形状是：`LUCore.kindOrganization.kind` 是 LU kind 的唯一来源；`LUCore` 按该 kind 形成 discriminated union；每个 core 仍使用一个 `luis` map，但允许的 LUI kind 由外层 LU kind 约束。Sequential core 的最小组织数据是 `steps: LUIId[]`，只表达有序推进的 LUI 序列；分支、guard、return、go-back、async/await 策略或可寻址 control-flow node 都不是 core sequential step 结构，应该由 feature extension 或 projection lowering 表达。

## 需求履约：Z

Z 轴区分“声明需求”和“满足需求”：

- **Requirement** 是 LU 内部声明的需要某种兼容逻辑满足的 requirement surface。
- **Fulfillment** 是兼容逻辑满足该 requirement 的关系。
- **Require (-Z)** 和 **Fulfill (+Z)** 是同一条履约路径从两侧读取的方向。
- **Z-0** 表示在当前 LUI 处通过 Closure 本地履约。
- **Z-n** 表示沿 supply lineage 向上游解析履约。
- Requirement service 可以 inline 定义，也可以通过 namespace/key 引用外部预定义 contract。外部 contract 解析后才能用于检查 LUI ports、unit compatibility、structural composition surface 和 fulfillment shape；core 不定义 registry/database lookup 机制。

Requirement fulfillment 不能被普通数据流、命名查找、参数传递、callback 或 ambient context 隐藏。数据和信号沿 X/Y 平面移动；所需逻辑的供应沿 Z 轴表达。

## Closure

- Closure 是附着在 LUI 上、用于本地履约某个 exposed requirement 的 wrapper。
- Closure 内部包含可投影的逻辑 core，但 Closure 本身不是 LUI，也不是通用 runtime projection。
- Closure 可以按 same-key 方式 forward 内部普通 ports，让数据或信号与外部拓扑连接。
- Closure 可以打开或限制供内部 requirement 继续解析的 supply environment。

## LogicIR 表示义务

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

## Endpoint 寻址

Endpoint refs 应支持 port-level 以及 payload-level 寻址：

- `owner + portKey` 定位一个边界 contact。
- 每个 owner 的 port surface 是一个 `PortKey` namespace；`input` 和 `output` 不是两套 key 空间，而是同一 `Port` 上的 `boundary` 属性。
- `payloadPath` 定位该 port payload 内部的嵌套位置，例如 object field、array item、bus lane 或包裹总线字段。
- `Port.pins` 只声明第一层可见 pin surface；pin 继承 port 的 boundary 和 interaction。
- `Port.boundary` 是 port 在 owner 边界上的侧别，而 `Connection.from/to` 是相对当前 `LUCore` 图的流向。当前 LU/Closure 的 input boundary 是图内 source，当前 LU/Closure 的 output boundary 是图内 sink；子 LUI 的 input boundary 是图内 sink，子 LUI 的 output boundary 是图内 source。
- `payloadPath` 的后续段是逻辑 payload address，由 target LUI、feature extension 或 projector 解释，不自动变成 nested core pins。
- `from.payloadPath` 在 pull-readable flow 中是 source payload selector，在 push-notifiable flow 中是 source payload path filter/prefix。
- `to.payloadPath` 在 pull-readable flow 中是 target payload assembly location，在 push-notifiable flow 中是 target payload path prefix/remap。
- Single-driver 检查应按 target endpoint path overlap 判断：同一 `owner + portKey` 下，whole-port 与任意 sub-path 冲突，重复 path 冲突，parent/child path 冲突；不同 sibling lanes 可以分别连接。
- 如果深层 payload 需要独立拓扑、不同 boundary/interaction 或独立身份，应引入中间 LUI，而不是把 pin 层变成完整子图。
- `payloadPath` 只做寻址和路径映射，不做计算、fan-in、merge、pack/unpack 语义；这些需要 LUI 或 profile 声明为 required / conditional-required 的 feature extension。

## Structural 空间切片和分布式投影

Structural composition 可以用 anchor 和 outlet 两个原语理解。`CompositionAnchor` 有 `shape` 和 `required`，表示可以接收 composition value 的锚点；outlet 在 core 中只是可放入某个 anchor 的结构出口 key，因此 `compositionSurface.outlets` 是 set-like key array。Structural LU/closure 的 `exportAnchors` 是当前结构对外提供的隐式 single anchors，因此只保存 `required`；`externalOutlets` 是当前结构内部可引用、但由父级 composition context 供应的 outlets。一个 structural LU 被实例化成 LUI 后，这些 external outlets 在父级视角解析为 `compositionSurface.anchors`，由父级填充；structural LUI 的 `compositionSurface.outlets` 则是该 LUI 提供给父级放入当前 LU/closure anchor 的 outlets。

Structural LU 的 `exportAnchors` 仍可以被读取为 named spatial slices。一个 structural LU 不需要只有一个默认出口；`root` 可以是常用主 slice 约定，但不是 schema 特权字段。多个 `exportAnchors` 允许同一个 structural LUI 在父级中按不同空间切片被引用。

`exportAnchorFills[anchorKey]` 描述某个 export anchor / slice 的 single composition leaf。遍历这些 leaves 可以推导该 slice 直接使用哪些 child LUI outlets、哪些 external outlets，以及哪些 child structural export slices 被接入。集合或映射组合不直接放在当前 LU/closure 的 export anchor 上；它们属于 structural LUI anchors，并通过 `luiFills[luiId]` 提供。`luiFills[luiId]` 描述该 child LUI 实例的 anchors 如何被填充；它属于实例上下文，不属于某一次 `lui-outlet` 引用。

基于这些结构，projector 或 analyzer 可以把一个含 N 个 export anchors 的 structural LU 切分成 N 个 slice subsystems。切分后，每个 subsystem 可以有自己的局部结构和跨 slice 通信边界。一个常见 lowering 是为每个 slice subsystem 生成一个 push-notifiable `rx` input bus 和一个 push-notifiable `tx` output bus；`tx` 不必按目标 slice 膨胀成 N-1 个端口，目标 slice/channel 可以作为第一层 pin 或 `payloadPath` 段，后续段表达 message field、bus lane 或嵌套地址。

这种分布式 slice 设计由 core 支持，但不由 core 强制。Core 只提供：

- `exportAnchors` / `exportAnchorFills` 表达 spatial slice boundary 和 slice composition。
- `luiFills` 表达 child LUI 实例的 anchor fills / composition context。
- `ConnectionId` 保留拆分后逻辑边的独立身份。
- `EndpointRef.payloadPath` 表达 bus、sub-bus、lane 或 nested message address。

具体的 RX/TX 端口生成、placement、transport、调度、打包、序列化、fan-in resolver 或 merge policy 属于 projection strategy 或 profile 声明为 required / conditional-required 的 feature extension。Projector 不能把这些语义作为隐式 runtime 假设静默引入。

Core 的 structural outlet 目前只是 key：`compositionSurface.outlets: CompositionOutletKey[]` 是 set-like 声明，不携带 shape、required 或额外 metadata。需要 outlet category、layout、type、compatibility tag 或 distributed routing hint 时，应挂到拥有该 surface 的结构上，例如 structural LUI 的 `compositionSurface.extensions` 或外层 `LUCore.extensions`，由 extension payload 用 outlet key selector 指向具体 outlet。

## Core/Feature/Projection

- **Core schema** 保存跨 projection target 必须共同理解的逻辑拓扑语义。
- **Feature/extension** 保存某个 target、host、runtime、tooling 或领域的附加约束。每个 `LogicUnit` 通过本地 `features` manifest 声明自己使用的 feature，extension record 通过本地 `featureKey` 引用该 manifest。
- **Profile/stack** 不是 LogicIR object model 的一部分；它属于 architecture 层兼容契约。Profile 描述单个 IR pipeline、projection 或 execution 层的要求，stack 组合这些 profile 形成用户可选工作流。
- **Projection** 是能力声明和 lowering/realization pipeline，不只是一个转换函数。

当前 core schema 把 extension attachment 控制在稳定 owner 或关系节点上：`LogicUnit`、`LUCore`、`LUI`、`Port`、`Connection`、`Closure`、requirement service、service-level fulfillment 和 unit fulfillment。`kindOrganization` 内部字段、sequential `steps`、composition leaves/values、pin children 等 helper 结构不直接挂 extension；相关 metadata 由 owner-level extension payload 通过 selectors 指到内部位置。Extension record 的 `featureKey` 必须在当前 `LogicUnit.features` manifest 中解析，document/package 只是容器，不是 LU 语义依赖的来源。

具体 feature/profile/stack 边界、capability 检查和兼容失败规则由 [schema-principles.md](schema-principles.md) 维护；本节只保留 theory 到工程结构的映射。

## 投影目标（Projection Target）

新 schema 不能只服务 JS/TS runtime。每个 schema 计划必须显式评估：

- **JS/TS runtime impact**: async、subscription、host native、runtime state、error/lifecycle、legacy compatibility。
- **Verilog HDL impact**: module boundary、ports/directions、connections、combinational logic、sequential logic、state、clock/reset、generate/elaboration-time structure、static binding constraints。

Verilog HDL 不要求 LogicIR 退化成 HDL schema；它要求核心拓扑和边界语义不要被软件 runtime 假设锁死。

## 当前实现阅读指南

读取旧实现代码时按以下方式使用：

- `packages/legacy/engine/src/types/models.ts` 说明旧 V1 把 schema、runtime convenience 和 projection 便利混在一起。
- `PortKind.Pull/Push` 可作为旧版 boundary/contact 实现参考，但新 schema 应区分 unit-level X 轴和 port-level contact capability。
- `Property` 是旧实现中 retained-current contact 的证据：它把可读取当前值、变化通知和最新值缓存绑在一起。新 core 可以表达 retained-current 语义，但 JS store/subscription/cache 机制仍属于 runtime feature 或 projector implementation。
- `SequentialStep` 是 sequential kind organization 的早期形态；`isAwaited` 偏 JS async projection。
- `dependencies`、`Provider`、`SovereignSource`、`AbstractLUT`、`closures` 是 Z 轴旧近似实现。
- `packages/legacy/engine/src/types/runtime.ts` 中的 `Thenable`、`subscribe`、`StateStore`、`LUProjectorPlugin` 属于 JS runtime projection，不应进入 core schema。
- `packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 可用于补充运行时、编辑操作、旧 node/LUI catalog、node function/provider 和 lowering 证据，但不是当前 schema 权威。
