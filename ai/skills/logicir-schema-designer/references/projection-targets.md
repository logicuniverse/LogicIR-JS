# Projection Targets Reference

评估 schema、architecture、feature、tool、projection 或 execution 变化如何影响
JS/TS runtime 与 Verilog HDL 时使用本参考。

## JS/TS Runtime Projection

Software runtime details 属于 feature extensions 或 projector implementation，
不属于 core schema。

常见 JS/TS feature concerns：

- async 与 thenable/promise realization。
- subscription 与 event listener mechanics。
- host native capabilities。
- runtime state storage。
- error 与 lifecycle events。
- provider contracts 与 execution bindings。
- interpreter plans、generated-code plans 和 execution profiles。
- legacy TS/JS compatibility。
- provider packaging、hook systems 或 local plugin loaders。

拒绝任何把这些 details 变成 core LogicIR mandatory semantics 的设计。

## Verilog HDL Projection

Verilog HDL 是一等 projection constraint，不是事后附加目标。

评估 schema 是否可映射到：

- module boundaries。
- ports 与 directions。
- explicit connections。
- combinational logic。
- sequential logic。
- state。
- clock 与 reset handling。
- generate/elaboration-time structure。
- static binding constraints。

不要把 LogicIR 强行变成 HDL schema。HDL 的作用是检查 core topology 是否被
software runtime assumptions 锁死。

## 当 HDL 不能直接支持某概念

先分类 gap：

- Semantic limitation：target 无法保持 declared LogicIR behavior。
- Implementation deferred：语义上可能，但 projector 暂不支持。
- Requires projection pass：需要 lowering、specialization、static elaboration 或
  decomposition 才能生成 HDL。

Required unsupported behavior 必须产生 diagnostic，不能生成 partial HDL。

## Execution Provider Boundary

- Execution target 是运行形态。
- Execution environment 是宿主上下文。
- Execution binding 是 item-level profile data，用于把 abstract need 映射到
  provider identity 和 config。
- Execution provider 是真实能力实体，例如 function、module、remote service、
  database、message bus、hardware interface 或 simulator foreign module。
- `Plugin` 只是 provider 或 pass 的一种 packaging/loading strategy，不是 core
  ecosystem term。

## Resource / Effect / No-GC Target Check

资源、副作用和无 GC 运行时约束要按 target 能力检查：

- File、network、database、AI call、logging、event emission 等 effect 是否被
  selected profile 允许。
- Resource lifetime、teardown、ownership、borrowing、sharing 或 handle policy
  是否有 provider/capability 支撑。
- No-GC、embedded 或 high-performance target 是否需要 reference counting、
  region、arena、static allocation 或 explicit teardown lowering。
- HDL、deterministic replay、serverless 或 sandbox target 是否必须拒绝某些
  unsupported effects。

这些检查应在 feature/profile/tooling 层表达，不能把具体 runtime resource
mechanics 写进 core。

## Catalog / Dependency / Tool-Routing Check

长期 catalog database 与 dependency index 是协作和分析工具，不是 core storage
规定。Projection 或 review tooling 可以查询：

- 哪些 LU 使用某 feature、provider、profile 或 stack。
- 某 provider/version 变化影响哪些 fixture、tests、projectors 或 tasks。
- 哪些逻辑依赖 software-only effect，不能投影到 HDL。
- 某 task 是否已经有可 promotion 的 verification evidence。
- AI 当前应调用 validator、type checker、HDL simulator、catalog lookup 还是
  edit transaction tool。

文件仍是 portable artifact；database/index 是查询、依赖分析和 AI tool-routing
加速层。

## Target-Neutral Design Test

对每个 proposed core field 问：

- JS/TS 是否只是因为 runtime implementation 才需要它？
- HDL 是否只是因为 hardware realization 才需要它？
- 它能否表达为 feature extension data 或 projector capability？
- 移除它会破坏 logical topology，还是只影响某个 target 的 lowering path？
