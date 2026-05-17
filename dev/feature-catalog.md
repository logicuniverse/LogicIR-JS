# Feature 目录

这份文档维护 LogicIR 当前已确认或近期需要沉淀的 feature 方向。它不是
roadmap 进度表，也不是 schema authority；正式数据结构仍以 `packages/features/*`
和对应 `schema/features/` 规范为准。

职责边界：

- 稳定理论原则见 [operational-theory.md](operational-theory.md)。
- Feature / profile / stack 的生态关系见
  [logicir-architecture.md](logicir-architecture.md)。
- 当前开发顺序和验收进度见 [roadmap.md](roadmap.md)。
- 不确定的中长期愿景和 pressure tests 见
  [long-term-vision.md](long-term-vision.md)。

## 状态约定

- `accepted`: 已有正式 package 或正式 schema draft。
- `near-term`: 当前 basic software / HDL 主线需要，预计近期以最小切片沉淀。
- `candidate`: 有价值，但尚未进入当前 roadmap 承诺。
- `research`: 属于中长期愿景或 pressure test，不应驱动当前 core/schema 变化。

## 已接受

- `logicir.type-system / core`
  - 状态：`accepted`
  - 当前来源：[`packages/features/type-system`](../packages/features/type-system)、
    [`packages/tools/type-system`](../packages/tools/type-system)
  - 范围：payload type reference、type declaration、value shape checking、
    projection-facing type metadata。
  - 注意：`basic-software-interpreter` MVP 不把 type-system 作为 required；
    它可以在 profile 中作为 recommended 或 optional。

## 近期共享 Feature

- `logicir.value / core`
  - 范围：literal value、constant payload、default value 和 value
    compatibility rules。
  - 触发点：fixture、type-system、software interpreter、HDL signal default。
- `logicir.diagnostics / unsupported-semantics`
  - 范围：unsupported semantic marker、rejection policy data、projector/engine
    diagnostics。
  - 触发点：HDL H4、software S5、capability checker。

## 近期软件 Feature

- `logicir.software.completion / core`
  - completion、failure、cancellation 和 thenable-compatible await 语义。
- `logicir.software.invocation / core`
  - callable/service invocation、argument/result mapping、provider contract
    linkage。
- `logicir.software.state-store / core`
  - software runtime state-store binding、current value read/write operation、
    state-store contract linkage。
  - `property` 的 retained-current 语义属于 core `Port.contact`，不是这个
    feature 定义出来的能力；该 feature 只描述软件 runtime 如何保存、
    读取、写入或绑定 current value。
  - basic software S2 的最小 smoke 不依赖该 feature；它是后续正式软件
    runtime 需要更丰富 binding/lowering metadata 时的 additive feature。
- `logicir.software.fulfillment / core`
  - provider fulfillment shape、static startup binding、dynamic/switchable
    provider contract。
- `logicir.software.error / core`
  - error propagation、recoverability、diagnostic/result mapping。

这些 feature 服务 `basic-software-interpreter` 的正式化。它们不应把 JS runtime
机制塞回 core；Promise、subscription、state store handle、hook、lifecycle 等
实现细节仍属于 feature payload、profile policy、provider contract 或 runtime。

## 近期 HDL Feature

- `logicir.hdl.signal / core`
  - bit/vector signal、signedness、packed shape、port signal metadata。
- `logicir.hdl.module / core`
  - module boundary、instance naming、parameter mapping、static structural
    constraint。
- `logicir.hdl.clocking / core`
  - clock/reset domain、sequential process binding。
- `logicir.hdl.state / core`
  - register、retained hardware state、initial value、reset behavior。
- `logicir.hdl.combinational / core`
  - combinational block constraint、continuous assignment constraint。
- `logicir.hdl.elaboration / core`
  - generate-time structure、parameter、static binding constraint。
- `logicir.hdl.structural-slices / core`
  - structural anchors、slice-oriented hardware projection rule。

这些 feature 服务 `basic-hdl-sim` 的正式化。它们不应把 clock/reset、module
elaboration 或 HDL lowering detail 写入 core，除非某个字段表达的是
target-neutral topology relation。

## 候选 Feature 池

这些方向有明确价值，但尚未进入当前 roadmap 承诺。它们可以作为后续 plan 或
AI task 候选，不能因为出现在本文件就视为 accepted schema。

- `logicir.control-flow / core`
  - branch、guard、loop、return、go-back，以及 core sequential `steps` 之外的
    lowering metadata。
- `logicir.adapter / core`
  - automatic adapter insertion 变成可审阅项目数据后，用于记录显式
    adapter/lowering trace。
- `logicir.observation / core`
  - probe、trace、assertion 和非语义 observation point。
- `logicir.software.lifecycle / core`
  - startup、shutdown、resource lifetime、hook、teardown policy。
- `logicir.software.scheduling / core`
  - scheduling policy、task queue、concurrency limit、backpressure。
- `logicir.software.transport / core`
  - service boundary、remote invocation、message bus、serialization、
    distributed runtime hint。
- `logicir.hdl.simulation / core`
  - testbench hook、probe、waveform metadata、simulator integration。
- `logicir.hdl.synthesis / core`
  - synthesis constraint、target family hint、synthesis diagnostic。

## 研究和中长期 Feature

以下方向属于 [long-term-vision.md](long-term-vision.md) 的 pressure test 或平台愿景：

- `logicir.resources / core`
- `logicir.effects / core`
- no-GC / ownership / lifetime feature family
- catalog database / dependency index / AI tool-routing query

它们的长期意义很大，但当前不应驱动 core schema 变化。只有当 pressure test
证明存在缺失的 target-neutral topology relation 时，才回到 schema 计划中讨论。
