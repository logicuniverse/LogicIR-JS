# HDL Model

这份文档讨论如何把当前 LogicIR core schema 与
[software-runtime-model.md](software-runtime-model.md) 中梳理出的运行语义，映射到
Verilog HDL 这一类硬件投影目标。

它不是 HDL feature 设计稿，也不是综合脚本规范；它的目标是回答：

1. 四种 `LU` 在 HDL 里分别更像什么。
2. 哪些语义可以直接投影，哪些必须 lowering，哪些应直接 diagnostic。
3. 哪些 software 运行时概念在 HDL 中应当保留，哪些应当被替换或消解。

## 1. 总原则

HDL 是 LogicIR 的一等投影压力测试目标，但 LogicIR 不应退化成 HDL schema。

因此必须同时坚持两件事：

- 不能把 software runtime 细节硬塞进 core。
- 也不能因为 HDL 的限制，就把 core 里本来清晰的逻辑关系重新压扁成单一时序流。

更准确地说：

- core 负责描述逻辑拓扑。
- HDL projector 负责把这份拓扑 lower / elaborate 成可模拟、可综合的电路结构。

## 2. 运行与投影的层次对应

software model 里，我们用：

```text
manifest -> run -> A/B/C/(stateful D)
```

在 HDL 里，对应关系不应照搬成“软件 session”，而应改写成：

```text
manifest
-> elaborate / lower to RTL module graph
-> simulate or synthesize
```

因此：

- `manifest`
  - 在 HDL 中更接近 elaboration / lowering。
  - 也就是把 `LogicUnit`、`Closure`、`LUI`、connections、fills 变成 RTL module、
    wire、reg、generate、localparam、always block 等。
- `run`
  - 在 HDL 中不再是“创建一次软件 session”。
  - 更接近“在仿真时钟/复位和输入激励下观察该电路”。
- `handle`
  - software 中是 stateful `Phase D` 的 response handle。
  - 在 HDL 中通常不需要对应到核心语义对象；硬件本身就是持续存在的结构。
  - 如果仿真器、testbench 或宿主工具需要句柄，那属于 simulator/tooling 句柄，不是
    core 语义句柄。

## 3. Core Scope、LU、Closure、LUI 在 HDL 里的对应

### 3.1 Core Scope

一个 `Core Scope` 在 HDL 中通常对应一段局部可封装的电路作用域：

- 顶层 `LogicUnit.core` 可对应一个顶层 module。
- `Closure.core` 可对应：
  - 一个被专门生成的子 module，
  - 一个被内联展开的局部逻辑区域，
  - 或 elaboration 阶段生成的局部 specialization 结果。

关键点不是“必须生成独立 module”，而是：

- root LU 和 Closure 仍然使用同一种局部规则。
- projector 只是在模块化和内联之间做工程选择。

### 3.2 LUI

`LUI` 在 HDL 中通常对应：

- 一个模块实例，
- 或一个被内联的局部逻辑实例化结果。

这与 software runtime 中“LUI 是在 scope 内运行的局部单元实例”是对齐的，只是 HDL
更偏向静态 elaboration，而不是运行时创建对象。

## 4. Port 与 Connection 在 HDL 中的对应

### 4.1 Boundary 与连接

最直接的映射是：

- `boundary input` -> module input
- `boundary output` -> module output
- `boundary result` -> 特定 output 或一组 output
- `connection` -> wire / reg-mediated signal path / continuous assignment / process-local signal path

`EndpointRef.payloadPath` 如果只是一层 pin surface，通常可直接映射到：

- packed bits
- flattened signal bundle / bus
- 或拆分后的独立端口

更深层 payload path 不应在 HDL projector 中被随意隐式扩展；如果需要更细粒度可见拓扑，
仍应优先通过中间 `LUI` 或 lowering 显式化。

### 4.2 Contact kinds

在 HDL 里，`pull / push / property` 不应机械翻译成三种完全不同语法，而应理解为三种
边界语义约束。

- `pull`
  - 最自然地映射为可在当前电路状态下被读取的信号值。
  - 可由 wire、组合表达式或寄存器输出提供。
- `push`
  - 在 HDL 中往往需要 lowering 成事件/脉冲/握手语义。
  - 常见实现是 `valid` 脉冲、`strobe`、`fire`、`ready/valid`、单拍 pulse。
  - core 不规定具体握手机制；profile 或 projector 必须选定一种。
- `property`
  - 最自然地映射为“可读 current”的寄存器化状态暴露。
  - 若需要“更新时主动通知”，HDL 通常还要附带 change pulse / valid / dirty 标志，
    这属于 projector 约定，不是 core 强制字段。

### 4.3 Timing context 不是普通数据线

`clock / reset` 在 HDL 投影里不应默认被理解成普通业务数据线。

更合适的理解是：

- 它们属于共享的 `timing context`
- `timing context` 通过 structural 挂载关系向下继承
- 顶层 anchor、父 LUI 或父 scope 负责提供该 context

也就是说：

- 一个 outlet 挂到某个 anchor 下
- 就默认继承该 anchor 所在 structural subtree 的 timing context
- 在 HDL 中，这个 context 首先就包含 `clock` 与 `reset`

因此，structural 在 HDL 里的一个重要作用不是传数据，而是表达：

- mount relation
- shared context
- context inheritance

这比把 `clk/rst` 当普通 `input` 到处连更清楚，因为它把两类关系分开了：

- `dataflow connection`
- `structural context inheritance`

建议 projector 遵守以下规则：

- `sequential` 与 `stateful` 区域必须有明确有效的 timing context
- 跨 timing context 不得静默发生
- 如需跨域，必须通过显式 adapter / CDC-like lowering / feature contract
- 顶层 timing context 如何最终 lower 成 Verilog 端口与连线，是 projector/profile 问题，
  不是 core schema 本身的问题

## 5. 四种 LU 的 HDL 对应

### 5.1 Combinational

`combinational LU` 在 HDL 中是最自然的一类。

它通常对应：

- 纯组合逻辑网络
- `assign`
- `always @*`（若 target profile 允许 SystemVerilog，也可使用 `always_comb`）
- 无内部时钟状态的模块

software model 中的 `Phase C` 在 HDL 中更接近：

- 当前输入与当前上游信号稳定后，
- `result` 作为组合函数自然出现。

这里有几个很漂亮的对应：

- software 中它适合 lazy demand 和自动并行；
- HDL 中它天然就是并发的组合网络。

也就是说：

- software realization 可以把独立依赖子树并行求值；
- HDL realization 则直接把它们投成天然并发的逻辑锥。

因此 combinational 在两个 target 上虽然机制不同，但语义非常对齐。

### 5.2 Sequential

`sequential LU` 在 HDL 中最自然地对应：

- 显式时间线
- 状态机 / step counter / program counter
- 受时钟驱动的阶段推进

当前你在 software model 中收敛出的规则：

- `steps` 只表达线性时间线
- 不在 core 中直接放 branch/loop graph
- 分支通过高阶 `LUI / closure` 实现

这对 HDL 非常有利，因为 projector 可以更直接地把它 lower 为：

- 一个线性的 step 寄存器
- 若干 step-local latch / current
- 每个 step 对应的组合 next-state 逻辑

### `goBack` 与 `return`

如果未来增加这两个 feature，HDL 对应大致是：

- `goBack`
  - 修改 step register / PC
  - 同时清除目标 step 及其之后建立的内部状态
- `return`
  - 令时间线提前进入结束状态

但要注意：

- HDL 无法像 software runtime 一样“抛错误”
- “读取未运行 step 是错误”这条语义，通常要 lower 成：
  - projector 静态拒绝，
  - 或插入 assertion / invalid flag / poison signal

也就是说，这条语义在 HDL 中仍然成立，但实现方式更偏 diagnostic / assertion，
而不是宿主异常。

### 5.3 Stateful

`stateful LU` 在 HDL 中也非常自然。

它通常对应：

- 寄存器集合
- `always @(posedge clk)`（若 target profile 允许 SystemVerilog，也可使用 `always_ff`）
- reset 初始化
- next-state/update 逻辑

software model 里的：

- `Phase A`: 建立 current
- `Phase C`: 观察 property outputs
- `Phase D`: stateful response

在 HDL 中可以这样重读：

- `Phase A`
  - 更接近 reset / initialization / first-state establishment
  - 不是一次性软件 setup object，而是电路进入已知状态的机制
- `Phase C`
  - 当前寄存器状态经由输出端口对外可见
- `Phase D`
  - 不再表现为 software handle
  - 而表现为“电路在后续时钟与输入驱动下持续响应”

因此，stateful 在 HDL 中依然有 `A/C/D` 的语义骨架，但 `D` 被吸收进持久电路本体，
而不是单独 runtime handle。

### 5.4 Structural

`structural LU` 在 HDL 中最需要小心。

software model 里你已经收敛出：

- structural 产出的不是普通值
- `outlet` 不是普通 input
- `Phase C` 可能返回一个可继续 `applyOutlets(...)` 的 structural result surface

在 HDL 中，这一套只有在“结构是静态可 elaboration 的”前提下才自然。

最自然的映射是：

- `anchors / outlets / fills`
  - 对应 module composition slots
  - 对应 generate-time binding
  - 对应静态装配关系

也就是说：

- static structural composition -> HDL 很自然
- runtime structural reapplication -> HDL 通常不自然

因此 structural 在 HDL 中应优先理解成：

- elaboration-time structure
- generate-time assembly
- module topology synthesis
- shared timing/context inheritance

而不是 software 那种 runtime late-bound composition handle。

如果某个 structural 语义要求：

- 运行中动态换结构
- 运行后继续反复 `applyOutlets(...)`
- 把 outlet 当 runtime function parameter 注入

那么对纯 Verilog HDL 来说，通常应分类为：

- 需要 projection pass / specialization
- 或直接 semantic limitation

## 6. `A/B/C/D` 在 HDL 中如何重读

HDL 不能简单复制 software runtime 的 `A/B/C/D` 机制，但这四相依然很有用。

### `A`

`A` 与时间推进本身关系不大，更像状态建立。

在 HDL 中通常对应：

- reset
- initial current establishment
- power-up known state policy

### `B`

`B` 与时间直接相关。

在 HDL 中通常对应：

- clocked progression
- step register advance
- FSM state transition

### `C`

`C` 与时间本身关系较弱，更像当前可观察截面。

在 HDL 中通常对应：

- 当前寄存器 + 当前输入下可见的输出/result/anchors

### `D`

`D` 在当前理论里只属于 `stateful` 响应阶段。

在 HDL 中它不需要变成 software handle，而更像：

- 持续存在的寄存器化电路
- 在后续时钟下继续响应 push/update/input 的能力

所以：

- software 里 `D` 是 response handle
- HDL 里 `D` 是持久状态电路本体

## 7. Closure 与高阶控制在 HDL 中的意义

你当前对 sequential 的收敛是：

- 分支不进 core step graph
- 分支通过高阶 `LUI / closure` 实现

这对 HDL 很关键，因为它允许 projector 在 elaboration 阶段做以下选择：

- 生成条件化的局部子模块
- 为某个 closure specialization 生成独立模块
- 直接内联该 closure 的逻辑

也就是说，`closure` 在 HDL 中更像：

- 局部可 specialization 的电路作用域

而不是：

- runtime function closure

这再次说明：同一个 core 语义，在 software 和 HDL 中可以有不同 realization，
但不必改变 core 对象本身。

## 8. 哪些语义不应直接硬投到 HDL

以下内容如果出现，应默认要求 lowering、feature contract，或直接 diagnostic：

- software-style subscription object
- JS promise / thenable / callback lifecycle
- runtime dynamic structural reapplication
- “晚点再 emit”但没有明确硬件握手模型
- 隐式异常 / throw
- 不可静态决定的 requirement binding

对应分类应尽量清楚：

- semantic limitation
- implementation deferred
- requires lowering / specialization / static elaboration

## 9. 适合 HDL 的投影骨架

如果把四种 LU 放在一起看，HDL projector 的自然骨架大概是：

- `combinational`
  - lower 成组合逻辑锥
- `sequential`
  - lower 成显式时序推进骨架
- `stateful`
  - lower 成寄存器与更新逻辑
- `structural`
  - lower 成静态 module/generate 装配

这说明四种 LU 在 HDL 中不是勉强兼容，而是各有很清晰的投影位置。

## 10. 当前建议

基于当前 schema 与 software model，HDL 方向建议坚持以下判断：

1. HDL projector 必须先按 `LU.kind` 分派，不要先拍平一切再想办法恢复语义。
2. `combinational` 和 `stateful` 是最直接的 HDL 映射基础。
3. `sequential` 适合 lower 成线性时序骨架，不要把 CFG 直接塞进 core。
4. `structural` 在 HDL 中优先解释为 elaboration-time structure。
5. `property` 的“可读 current”非常适合寄存器语义；“主动通知”需要 projector 选定机制。
6. `push` 在 HDL 中必须通过握手/脉冲/valid 等约定显式化。
7. software handle、subscription、runtime callback 不是 HDL core semantics。
8. 无法保持的必需语义必须 diagnostic，不能静默降级。
