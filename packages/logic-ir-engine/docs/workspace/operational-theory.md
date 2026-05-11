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

Requirement fulfillment 不能被普通数据流、命名查找、参数传递、callback 或 ambient context 隐藏。数据和信号沿 X/Y 平面移动；所需逻辑的供应沿 Z 轴表达。

## Closure

- Closure 是附着在 LUI 上、用于本地履约某个 exposed requirement 的 wrapper。
- Closure 内部包含可投影的逻辑 core，但 Closure 本身不是 LUI，也不是通用 runtime projection。
- Closure 可以按 same-key 方式 forward 内部普通 ports，让数据或信号与外部拓扑连接。
- Closure 可以打开或限制供内部 requirement 继续解析的 supply environment。

## LogicIR Representation Obligations

新 schema 至少必须能显式表达：

- 有界 LUs 和局部 LUIs。
- Ports、pins、port discipline、addressable endpoint refs。
- In-plane connections。
- LU kind 和 kind-specific organization。
- Requirement services 和 requirement units。
- Fulfillment relations，包括 Closure fulfillment 和 upstream lineage fulfillment。
- Closure cores 和 same-key forwarded port declarations。
- LU-defined、external、requirement-backed target references。
- Representation 与 projection/runtime 的边界。

这些是结构义务，不是固定字段名。schema 可以演进，但不能丢失这些可检查关系。

## Core/Profile/Projection

- **Core schema** 保存跨 projection target 必须共同理解的逻辑拓扑语义。
- **Profile/sub-schema** 保存某个 target、host、runtime、tooling 或领域的附加约束。
- **Projection** 是能力声明和 lowering/realization pipeline，不只是一个转换函数。
- Projector 必须声明支持的 core version、profiles、features、LU kinds、fulfillment forms 和 target constraints。
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
- Profile/sub-schema 和 extension 必须命名空间化。
- Extension 必须标记 optional 或 required。
- 旧工具可以忽略 optional extension，但遇到不支持的 required extension 必须失败。
- 需要破坏性迁移时必须说明 migration 或 compat layer。

## Current Implementation Reading Guide

读取当前代码时按以下方式使用：

- `models.ts` 说明旧 V1 把 schema、runtime convenience 和 projection 便利混在一起。
- `PortKind.Pull/Push` 可作为 X 轴历史实现参考；`Property` 更像软件 runtime/state convenience。
- `SequentialStep` 是 sequential kind organization 的早期形态；`isAwaited` 偏 JS async projection。
- `dependencies`、`Provider`、`SovereignSource`、`AbstractLUT`、`closures` 是 Z 轴旧近似实现。
- `runtime.ts` 中的 `Thenable`、`subscribe`、`StateStore`、`LUProjectorPlugin` 属于 JS runtime projection，不应进入 core schema。
