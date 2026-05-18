# Schema 原则

这份文档记录制定 LogicIR schema 时必须遵守的规则。它面向人类协作者，不替代
[docs/essay.md](../../docs/essay.md)，也不替代 `packages/` 中的正式 TS authoring source。

## 权威和边界

- `docs/essay.md` 是理论源头。
- `packages/core` 是当前 core schema 的 TS authoring source。
- `packages/architecture` 是 architecture definition 的 TS authoring source。
- `packages/features/*` 是已接受 feature 数据结构的 TS authoring source。
- `schema/` 是语言无关规范和生成物入口。
- legacy packages 和 AI tasks 只提供 evidence，不决定 schema 形状。

## Target-Neutral Core

Core 只表达跨 target 必须共同理解的逻辑拓扑：

- `LogicUnit`、`LUCore`、`LUI`。
- Port、endpoint、payloadPath、connection。
- LU kind organization。
- Requirement / fulfillment。
- Closure。
- Structural composition。
- Feature use manifest 和 extension records 的承载位置。

Core 不包含 runtime function、host callback、JS async primitive、subscription
mechanism、state store handle、Verilog clock/reset implementation、provider registry、
profile reference 或 target-specific lowering rule。

## TS Authoring Style

- Schema TS authoring source 不使用 TypeScript 泛型或 utility type 作为协议抽象。
- 允许使用 `Record<K, V>` 表达同质 dictionary。
- 优先使用显式 object、union、intersection、array 和 dictionary。
- 类型层负责协议骨架和 kind-specific 大类约束，不追求排除所有低级错误。
- 依赖当前 Core Scope、catalog、profile、feature manifest 或 capability 的组合语义，
  由 validator / resolver / capability checker 返回结构化 diagnostic。

## Port Surface

- Port contact kind 是 `pull`、`push`、`property`。
- `property` 是 retained-current reactive contact；core 不规定 JS/HDL 实现机制。
- 输入端口和输出端口不是同一个 namespace。
- `result` 是独立 slot，不与 input/output key 共享 namespace。
- `combinational` 只有 `inputs + result`。
- 单值 result 默认使用 whole result；只有 demux / tuple-like 多结果或需要第一层可寻址
  surface 时才声明 `result.pins`。
- 深层 payload 寻址用 `payloadPath`，不自动提升为 nested core pins。

## Core Scope 和 Endpoint

- Core Scope 是一份 `LUCore` 的局部规则上下文，可以是 root `LogicUnit.core`，
  也可以是任意 `Closure.core`。
- `EndpointRef.owner.kind === "boundary"` 表示当前 Core Scope 自身边界，不表示 root LU。
- `LUITarget.kind === "lu"` 才表示 LUI 指向某个 LogicUnit target。
- `from` / `to` 是 graph-local flow roles；endpoint 是否能作为 source/sink 取决于
  当前 Core Scope、owner 和 port slot，由 validator 检查。

## LU Kind Organization

- `LUCore.kindOrganization.kind` 决定 runtime/projector/compiler 的首层分派。
- `kindOrganization` 只保存 target-neutral skeleton。
- `sequential` core 只保存 `steps: { luiId }[]`。
- `GoBackIf`、`ReturnIf`、guard、branch、async、调度等必须走 feature extension、
  profile policy、runtime realization 或 projection lowering。
- 不允许把 `LUCore.luis` 默认拍平成 eager node list；flatten/lowering 必须显式、
  可诊断、可验证。

## Feature / Extension / Profile

- Feature 是横向语义能力单元，有 namespace/key/version。
- `LogicUnit.featureUses` 是 LU-local manifest。
- Extension record 通过 local `featureKey` 引用 manifest entry，并携带 feature-owned
  extension payload。
- Feature-level behavior configuration 应进入 extension、profile policy 或 execution
  binding，不进入 manifest 的 generic config。
- Profile/stack 属于 architecture 层，不属于 LogicIR core object model。
- Required / conditional-required feature 或 extension contract 不被支持时，工具必须
  diagnostic，不得静默降级。

## Projection Target Discipline

每个 schema 计划都必须考虑：

- JS/TS runtime impact。
- Verilog HDL impact。
- 是否会把 target-specific detail 错误放入 core。
- unsupported semantics 是拒绝、diagnostic、还是需要显式 lowering。

Verilog HDL 是早期压力测试目标。它要求 core topology 不被 JS runtime 假设锁死，但不要求
core 退化成 HDL schema。
