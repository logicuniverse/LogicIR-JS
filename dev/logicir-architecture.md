# LogicIR 生态架构

这份文档定义当前工程中常用的生态术语。它面向人类协作者，只保留稳定边界；详细
schema 形状以 `packages/architecture/src/types.ts` 为准。

## 可移植数据

- **LogicIR Document**: 可变的逻辑对象，承载 core topology、requirement /
  fulfillment、closure、feature use manifest 和 extension records。
- **Architecture Definition**: 只读 catalog 内容，例如 feature、profile、stack、
  provider contract、capability、stage、policy 和 execution binding。

Generated code、Verilog 文件、report、execution plan、provider、compiler、engine、
registry entry 和 database row 都是派生产物、实现或索引，不是 core protocol 的
主要可移植源对象。

## Core / Feature / Profile / Stack

- **Core schema**: target-neutral logic topology。
- **Feature**: 横向语义能力，例如 type-system、completion、clocking。
- **Extension record**: feature-owned payload，挂在 LogicIR 的稳定 owner 或 relation 上。
- **Profile**: 单层兼容契约。Tool 实现 profile。
- **Stack**: 用户选择的端到端 profile 组合。Stack 不能替代 capability check。

兼容链条：

```text
Stack
-> Profile
-> Feature / policy / provider contract
-> Tool / projector / engine / provider capability
-> Capability checker
```

## 三类 Profile

- **IR Pipeline Profile**: `LogicIR -> LogicIR`。由 validator、resolver、normalizer、
  type checker、lowerer、adapter insertion 等实现。
- **Projection Profile**: `LogicIR -> target artifact | executable plan`。由 projector、
  compiler、emitter、report generator 等实现。
- **Execution Profile**: `LogicIR | plan | artifact -> execution`。由 interpreter、
  runtime engine、generated-code host、simulator、provider registry 等实现。

Execution profile 配置 realization；除非它产生新的 LogicIR artifact，否则不应称为
LogicIR transformation stage。

## Execution 术语

- **Execution target**: interpreter、generated software、Verilog simulator、
  synthesis target、distributed runtime 等运行形态。
- **Execution environment**: browser、server process、FPGA board、Verilog simulator
  等 host context。
- **Execution binding**: execution profile 中的 mapping data，把 abstract need、
  external target 或 requirement 映射到 provider identity/config。
- **Execution provider**: 真实能力实体，例如 function、module、library、remote
  service、database、message bus、hardware interface 或 simulator hook。
- **Provider contract**: provider 必须满足的 interface 和 semantic obligation。
- **Provider capability**: provider 声明实际支持什么。

`Plugin` 不是 core 生态术语；它只是 provider 或 pass provider 的 packaging/loading
strategy。

## Tool 角色

- **IR authoring tool**: 读 profile，读写 LogicIR。
- **IR pipeline tool**: 实现 IR pipeline profile，读写 LogicIR。
- **Projection compiler / projector**: 实现 projection profile，读取 LogicIR，写出
  artifact 或 executable plan。
- **Execution engine**: 实现 execution profile，运行 LogicIR、plan 或 artifact。
- **Profile resolver**: 把 stack/profile 展开为具体 requirements。
- **Capability checker**: 检查 LogicIR extension records、profile requirements 和
  tool/provider capability 是否覆盖。

## LU Kind 处理入口

所有 projector、compiler 和 engine 都必须先按 `LUCore.kindOrganization.kind`
分派。`LUCore.luis` 是当前 Core Scope 内的 LUI map，不是默认 eager execution list。

- `combinational`: 同步 lazy computation；只有 `inputs + result`。
- `sequential`: pipeline / step list；复杂 branch、go-back、return、async policy 走
  feature/lowering/runtime realization。
- `stateful`: 运行内 retained current / register-like state；常见 pattern 是
  `pull initial` + `push updates` + `property output`。
- `structural`: composition / elaboration surface；anchors/outlets/fills 描述结构结果。

任何 flatten、lowering 或替代执行模型都必须显式声明 strategy，并通过 diagnostic /
trace / verification 证明语义保留。

## 既有生态接入

既有函数、模块、服务、HDL IP、数据库、队列、UI node 和测试应优先通过 wrapper /
provider / external target / fulfillment / execution binding 接入。

策略：

```text
wrap first
-> replicate when useful
-> replace only with clear value and verification
```

旧实现是 evidence，不是 schema authority。
