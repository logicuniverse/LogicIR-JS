# 中长期愿景

这份文档保存不确定的长期方向和 architecture pressure tests。它不是路线图，也不是
当前任务列表。

## 总原则

- 中长期愿景不能反向污染 core schema。
- 只有当某个方向揭示缺失的 target-neutral topology relation 时，才回到 core
  schema 讨论。
- 默认把这些方向建模为 feature、profile、provider、tool、runtime strategy 或
  platform 层问题。
- 进入实现前，必须先形成明确 change、验收标准和 review 路径。

## Zero-to-LogicIR

独立 research / dataset / training 分支，不是 LogicIR 的终极目标，也不是近期主线。

价值：为 AI-assisted LogicIR editing 提供 transaction corpus 和局部补全能力。

前置条件：

- Core validator。
- Profile resolver。
- Capability checker。
- Type-system seed。
- Software interpreter seed。
- HDL simulation seed。
- Edit transaction MVP。

可能产物：

- 可验证 LogicIR edit transaction corpus。
- diagnostic-to-repair 数据。
- 面向 Web IDE 的本地 micro-agent。

## No-GC / 高性能运行时

面向 C/C++、no-GC WASM、嵌入式、实时系统和高性能 target 的 runtime / projection
pressure test。

核心问题：

- ownership、lifetime、arena/region、reference counting 如何由 profile/feature/
  projection policy 表达。
- property、stateful LU、closure、event stream 在 no-GC target 上如何限制或拒绝。
- projector 何时 fail diagnostic，何时要求 lowering 或 adapter。

这不要求把引用计数写入 core。

## 显式资源和副作用

长期 feature/profile/capability 路线，用于显式表达传统文本编程里隐藏的资源、
副作用、权限、生命周期和可重放性。

候选对象：

- file、socket、database、lock、timer、thread、GPU handle、device handle、
  subscription、state store、external service session。
- network request、file IO、database mutation、event emission、logging、metrics、
  time/random/env access、UI/DOM mutation、hardware register access。

价值：

- target 不支持 effect 时可诊断拒绝。
- test runner 可以 mock provider。
- AI edit review 可以区分 pure / impure 区域。
- security policy 可以基于声明 capability 检查。

## Catalog Database / Dependency Index

长期 tooling / platform 路线。文件仍是交换和审阅载体；database 是索引、查询和协作
加速层。

应支持的问题：

- 改 provider contract 影响哪些 LU、profile、stack、fixtures。
- 某 feature/extension 被哪些 LogicUnit 使用。
- fulfillment path 是否经过某 closure 或 upstream supplier。
- 哪些 LU 使用 software-only effect，不能投影到 HDL。
- 哪些 legacy node/function 已被 wrapper、replica 或 fixture 覆盖。

这对 AI tool-routing 很重要，但不是 core schema 字段。

## 其它愿景池

- Circuit/netlist projection。
- PCB / board-level realization。
- Mechanical assembly / product enclosure。
- Python runtime/projection。
- Distributed runtime。
- Visual editor productization。
- 面向外部读者的公开定位文档。

这些方向等待 core-only examples、validator、software interpreter seed 和 HDL sim seed
稳定后再评估。
