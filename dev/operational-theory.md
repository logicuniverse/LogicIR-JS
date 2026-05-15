# 工程化理论摘录

这份文档把 [docs/essay.md](../docs/essay.md) 中对工程实现有直接约束力的部分提取出来。它不是新的理论来源；它是给 schema、projection、runtime 和工具设计使用的执行版理论。

职责边界：本文维护理论到工程的原则和 north-star；具体 ecosystem 术语归 [`logicir-architecture.md`](logicir-architecture.md)，具体 schema 规则归 [`schema-principles.md`](schema-principles.md)，具体执行顺序归 [`roadmap.md`](roadmap.md)。

## 来源优先级

1. 完整理论源头是 [docs/essay.md](../docs/essay.md)。
2. 这份文档是 essay 的工程执行版摘录；如果两者冲突，以
   [docs/essay.md](../docs/essay.md) 为准。
3. `packages/legacy/engine/src/` 是旧版 LogicIR JS/TS engine prototype/reference，只能作为实现证据、设计借鉴和兼容风险参考；它不是 schema 真理，也不是四类 LU 的唯一或最优实现路线。`packages/legacy/flow-runtime-core/` 和 `packages/legacy/flow-core/` 是更早 FlowForge-era source-only 快照，只作为运行时、编辑操作、lowering 和旧 LUI/node 覆盖面的历史证据。

## 核心主张

LogicIR 的工程目标不是把代码换一种语法重写，而是把逻辑拓扑作为可检查、可变换、可投影的源对象。代码、运行时、HDL、工具视图和其它宿主产物都是 projection 或 realization，不是 LogicIR 本身。

## AI + 可计算工业时代的通用载体

LogicIR 的长期定位不只是“软件/硬件统一语言”，也不只是“AI 代码生成工具”。更准确的 north-star 是：

> LogicIR 是 AI + 可计算工业时代的可验证逻辑通用载体及其生态。

这里的“可计算工业”比传统软件工业更宽，包含软件、HDL/FPGA/ASIC、仿真、执行计划、测试、分析报告、未来 circuit/netlist probe、PCB/机械/产品结构扩展，以及围绕这些对象的工具、验证、协作和生产流程。LogicIR 试图统一的不是最终语法或最终 artifact，而是这些 realization 背后的逻辑拓扑、边界语义、需求履约、能力契约、验证链路和投影路径。

AI 和可计算工业是两股不同但相互放大的力量：

- 可计算工业需要结构化、可复用、可验证、可审查的逻辑资产，否则大规模系统会被口头上下文、局部代码约定、手工 diagram 和事后测试拖回作坊状态。
- AI 提供生成、补全、迁移、测试和修复的巨大产能，但它需要明确 scope、schema、capability、type、provider、validation 和 review boundary，才能可靠进入长期工程系统。
- LogicIR 位于两者之间：它为工业化系统提供 AI 可操作的逻辑载体，也为 AI 提供工业级可验证的编辑对象。

这个定位可以借用工业史类比，但内部文档应保持克制：不是宣称 LogicIR 等同于牛顿定律或麦克斯韦方程组，而是承认一个行业从作坊走向大工业，通常需要可共享、可计算、可验证的基础表示和规律框架。机械工业需要可计算的力学对象，无线通信需要可计算的电磁模型；AI + 可计算工业同样需要比代码文本更显式的逻辑载体。

没有这种载体时，AI 与人类只能围绕代码文本、prompt、README、局部测试和人工 review 猜测意图；有了这种载体后，软件、HDL、执行计划、测试、文档、可视化编辑器和 AI 协作都可以成为同一个逻辑对象的 projection、verification 或 edit workflow。

中长期可以参考 `Zero-to-CAD: Agentic Synthesis of Interpretable CAD Programs at Million-Scale Without Real Data` 的方法论：用 agentic synthesis、执行/验证反馈和 synthetic corpus curation 生成可解释程序数据。LogicIR 对应的方向是 zero-to-LogicIR，但它依赖 core validator、profile resolver、capability checker、software interpreter、HDL simulation 和 edit transaction seed 先形成最小闭环；因此它是中长期 research / dataset 路线，不是近期主线实现。

如果 zero-to-LogicIR 形成足够高质量的 transaction corpus，还可以支持极小的本地模型：模型不需要自由生成大段代码，而是根据 scope、typed holes、catalog 和 diagnostics 预测候选 edit operation。Web IDE 可以用 WebGPU/WASM 在本地运行这种 micro-agent，并用本地 validator、catalog lookup 和用户确认兜底。这样既减少服务器资源，也更符合 LogicIR 的结构化编辑模型。

## 既有生态优先接入

LogicIR 不能假设世界会重写，也不应该否定文本代码。现实生态中的 JS/TS、Python、C、Rust、Java、Verilog/SystemVerilog、EDA IP、数据库、消息队列、HTTP/RPC、云服务、旧业务系统、旧 node catalog、测试和部署工具都已经沉淀了大量价值。

更准确的原则是：

> Higher-level logic needs a higher-level medium, but existing code remains a valid realization medium.

Python 和 Node.js 可以调用 C/C++ 类库，C 语言可以内嵌汇编，HDL 可以实例化外部 IP；这些都说明工业系统本来就是分层 realization。LogicIR 同样不需要替代所有底层 medium。它要做的是把更高层的逻辑拓扑、边界语义、需求履约和验证关系提升到更合适的结构化 medium 中，同时让已有代码和工具链通过 provider、external target、binding、adapter、fixture 和 projection 继续发挥作用。

因此，既有生态的接入路线应是：

```text
existing ecosystem
-> wrap as Provider
-> expose as LUI or external target
-> bind through profile / stack
-> validate with fixtures
-> replicate or replace only when valuable
```

AI 在这里尤其有价值：它可以快速读取旧代码、提取输入输出边界、识别 provider-like capability、生成 wrapper/adapter、复刻 LUI/provider seed、补 regression fixture、建立 coverage map，并在不重写旧系统的前提下让旧能力进入 LogicIR 的可验证生态。

所以早期 adoption 策略应是 **wrap first, replicate second, replace later**。复刻或替换必须有明确收益和验证证据，不能因为 LogicIR 存在就要求已有生态整体重写。

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

当前旧代码中的 `Composable` 更接近早期 structural/composition 实现痕迹，不应阻止新 schema 采用 `Structural`，也不应把旧 composition 算法固定成唯一实现。

当前 core schema 的执行平面形状是：`LUCore.kindOrganization.kind` 是 LU kind 的唯一来源；`LUCore` 按该 kind 形成 discriminated union；每个 core 仍使用一个 `luis` map，但允许的 LUI kind 由外层 LU kind 约束。Sequential core 的最小组织数据是 `steps: LUIId[]`，只表达有序推进的 LUI 序列。它不是一般分支控制流图；旧实现中可见的 `GoBackIf` 和 `ReturnIf` 只是一个可借鉴的 pipeline 控制扩展路线。guard、branch、return、go-back、async/await 策略或可寻址 control-flow node 都不应进入 core sequential step 结构，应该由 feature extension 或 projection lowering 表达。

## LU Kind Organization 的目标处理方式

Runtime、projector 和 compiler 必须先按 `LUCore.kindOrganization.kind`
识别 LU kind 的语义差异，不能把 `LUCore.luis` 无条件拍平成同一种 eager
node list 后顺序运行。这是语义保护规则，不是算法规定。

下表描述当前 basic software / basic HDL 路线的 reference baseline，尤其用于
指导近期 AI task 和 legacy migration。它不是唯一实现路线。其它 interpreter、
compiler、incremental runtime、actor runtime、HDL lowering 或分布式 realization
可以采用不同算法，但必须在 profile、feature、lowering trace 或 engine
capability 中显式声明，并用 fixture / smoke / simulation 证明没有丢失对应
LU kind 的可观察语义。

| LU kind | Core organization | Software interpreter / execution plan | Generated software | Verilog HDL projection |
| --- | --- | --- | --- | --- |
| `combinational` | 当前值映射；`kindOrganization.kind = combinational`；通常有一个 `primary-result` 输出。 | 当前 software-interpreter baseline 是从 `primary-result` / return contact 开始 lazy pull，沿 `Connection` 反向读取依赖，只计算被需要的相关 LUI；其它策略可以预分析、拓扑排序或编译表达式，但不能把 unrelated LUI 的运行变成可观察副作用。 | 生成纯函数、可内联表达式或已优化求值计划；不引入状态、订阅、clock 或 runtime lifecycle。 | 生成 continuous assignment、组合表达式或 `always_comb`；不得引入寄存器、clock/reset 或隐式 state。 |
| `sequential` | `kindOrganization.steps: LUIId[]` 是最小有序推进骨架。 | 当前 software-interpreter baseline 是按 `steps` 作为 pipeline 推进。旧实现允许 `GoBackIf` 调整 step index，允许 `ReturnIf` 提前返回；这是可复用的 control extension 证据，不是唯一控制模型。completion/await、go-back、early-return 等属于 software feature 或 lowering metadata，不属于 core step 字段。 | 生成 pipeline runner、step runner、state machine、async workflow 或其它等价 realization；调度、await、异常传播必须来自 profile/feature policy。 | 需要 clocking/state contract；生成 edge-triggered process、寄存器转移或 FSM；没有 clock/reset/state feature 时应 diagnostic，而不是降级成组合逻辑。 |
| `stateful` | 驻留状态逻辑；core 只说明 stateful organization，不规定 store 实现。 | 当前 software-interpreter baseline 是对 stateful LUIs 逐个独立运行，收集 property/current 返回值并写入 durable retained-current state。其它 store、reactive、incremental 或 event-loop 策略可以不同，但必须保留 stateful boundary、current read 和 durable/update 语义。 | 生成带私有状态、store handle 或 host binding 的 module/class/function closure；每个 stateful unit 的 durable/current 结果边界必须清楚，生命周期和并发策略由 feature/profile 决定。 | 映射为 register/state variable、reset/initial behavior 和 sequential update；必须有 clocking/state HDL contract。 |
| `structural` | anchors/outlets、`exportAnchors`、`externalOutlets`、`exportAnchorFills`、`luiFills` 描述结构显现和 composition。 | 当前 software-interpreter baseline 是对 structural/composable LUIs 逐个独立运行，结果是 composition function / composable return；root composition function 之后再用 context 和 inputs 生成结构结果。其它 materialization、diff、incremental composition 或 host-specific builder 可以不同，但必须保留 structural composition surface。 | 生成 composable function、组件/布局/tree construction、module assembly 或 host-specific composition artifact。 | 生成 module instance、wire、hierarchy、generate/elaboration structure；structural slices 可以 lowering 为子系统或层级模块。 |

旧 `packages/legacy/engine/src/projection.ts` 体现了一个可借鉴的分派路线：
Combinational 是 non-reactive 的 `readLUOutput`；读取 combinational LUI
输出时才 project 该 LUI 并缓存临时结果。Sequential 走 `manifestSteps`，
本质是按 step index 线性推进的 pipeline，只有 `GoBackIf` 和 `ReturnIf`
这类显式控制扩展。Stateful 走 `initializeState`，逐个 project
`statefulLUIs`，把返回对象中的 property/current 值写入 state store。
Composable / structural 走 `projectCompositions`，逐个 project
`composableLUIs`，收集结果后返回 root composition functions；这些函数后续
通过 `transformComposable` 使用 context 和 component inputs 组合出结构。
这些旧实现细节可以指导近期 basic-software-interpreter，但不决定新 schema
命名，也不排除更好的 projector / engine 实现路线。

因此，`Port.interaction.pushNotifiable` 只说明 contact 能接收或发出通知，
不等于 provider 应被主动执行；`pullReadable` 只说明 contact 可读，也不等于
所有可读节点都应预先求值。执行入口由 LU kind 和 profile 决定，端口
capability 只约束连接和可观察边界。

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
