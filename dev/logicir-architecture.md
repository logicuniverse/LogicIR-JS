# LogicIR 生态架构

这份文档定义 LogicIR schema、profile、projection 和 execution support 的当前工作架构。它是后续 schema 工作的开发指南，不是生成的 schema artifact，也不替代 `docs/` 中的理论文档。

## 主要可移植数据

LogicIR 开发围绕两个可移植数据对象展开：

- **LogicIR Document**: 可变的逻辑对象，承载正在 authoring、validation、transformation、projection 或 execution 的拓扑。
- **Architecture Definition**: 只读 catalog 内容，例如 feature、profile、stack、provider contract 或 capability definition。

Profile definition 是某一个 processing layer 的兼容契约。它告诉工具当前层适用哪些规则、feature、stage、target constraint 或 execution binding。

Generated code、Verilog 文件、report、executable plan、provider、compiler、engine、architecture index file、registry entry 和 database row 都是派生产物、实现或 catalog storage。它们不是 LogicIR protocol 的核心可移植源对象。

Feature definition、profile definition、stack definition、capability definition、tool capability definition、provider contract、provider capability declaration、stage、policy 和 execution binding 的 TypeScript authoring source 位于 [`packages/architecture/src/types.ts`](../packages/architecture/src/types.ts)。

语言无关的 specification surface 位于 [`schema/architecture/`](../schema/architecture/)。这里的 schema 是 content-only：只包含 JSON-serializable config、policy 和 payload-schema data；不要求 document wrapper；不包含 factory、helper function、callback、provider、runtime implementation 或 TypeScript generic schema abstraction。Catalog identity、namespace、version、indexing、persistence、file layout 和 database key 属于 architecture definition schema 之外的 registry、package、index export 或 application layer。

## 北极星，不是项目计划

长期北极星是 heterogeneous system realization：一个 LogicIR document 可以描述系统的逻辑拓扑，而 profile、feature、extension 和 provider 可以把不同部分 realization 成 software、HDL/FPGA/ASIC logic、circuit/netlist artifact、external service、mechanical assembly、product enclosure 或其它 domain artifact。

这只是架构压力测试，不是当前项目计划。它要求 core 足够宽，能表示稳定逻辑拓扑；但不能把 target-domain detail 拉进 core。Physical footprint、pin map、electrical rule、board constraint、mechanical dimension、material、enclosure geometry、manufacturing constraint、placement、routing 和 tool-specific export format 都应放在 namespaced feature、extension record、projection profile、execution/realization binding 中。

当前主要 stack 仍然是 software 和 Verilog HDL。Circuit/netlist、mechanical design 和 product enclosure 路线是参考 probe 和未来 extension path。它们有助于检查 architecture 是否保持 target-neutral 和可扩展，但不应驱动 core schema 改动，除非它们揭示了缺失的 target-neutral topology relation。

## 可验证逻辑协同编辑

这一节是 [docs/essay.md](../docs/essay.md) 中 LogicIR 作为 logic-as-data substrate、topological source of truth 和 AI-assisted work 结构化交互单位的工程化展开；它不是独立于 essay 的新产品叙事。

LogicIR authoring 的长期产品形态不是让用户只写代码，也不是让 AI 一次性生成大段代码。更有价值的形态是让用户通过自然语言、拖拽、图编辑、表单或它们的组合，半自动构造不同 level 的 partial LogicIR；AI 在明确的 scope、closure、feature/profile 约束和 provider/type 信息下补全空位、修复不一致、生成 projection，并运行验证。

```text
user intent / visual edit
-> LogicIR edit transaction
-> validation / typecheck / capability check
-> projection / execution / simulation
-> reviewable result
```

这个模型适用于内部开发，也适用于未来外部用户工具。内部使用时，AI task 应尽量提交可验证的 LogicIR fixture、architecture data、projector/engine smoke 和 promotion notes；外部使用时，用户的自然语言和拖拽操作也应落成同一种可验证 edit transaction。

### Edit Transaction

LogicIR edit transaction 是一次原子逻辑编辑的审查单位。它至少应能表达：

```ts
{
  intent: string;
  scope: unknown;
  before: unknown;
  operations: unknown[];
  after: unknown;
  validation: unknown;
  tests: unknown;
  rationale: string;
}
```

这里的 `unknown` 不是最终 schema，而是提醒当前文档只定义架构角色：`scope` 应指向可编辑的 LU、closure、profile 或 task-local fixture boundary；`operations` 应是可 replay 的结构化 edit operation；`validation` 和 `tests` 应保存 schema、profile、type、runtime 或 HDL simulation 结果。

AI 不应把 edit transaction 降级成普通文件 diff。文件 diff 可以是实现载体，但 review 的核心应该是：这次编辑的意图是什么、改动落在哪个 scope、是否满足当前 profile、是否有 semantic loss、哪些 projection/execution 验收已经通过。

### Partial IR 和空位

Authoring tool 可以创建 partial LogicIR，但空位必须有接口。典型空位包括：

- 需要选择 provider 的 invocation。
- 需要补齐 payload type、signal width 或 value shape 的 port。
- 需要 completion/error/lifecycle/retained-current policy 的 software 语义。
- 需要 clock/reset/state/combinational/elaboration constraint 的 HDL 语义。
- 需要 closure 或 upstream fulfillment 的 requirement。
- 需要 projection target 或 execution binding 的 stack 选择。

AI completion 必须在这些接口内工作。Feature definition、profile requirement、provider contract、type system 和 capability checker 共同限定 AI 可补全的空间。

## LogicIR 文档（LogicIR Document）

LogicIR document 回答：

```text
What is the logic?
```

它包含 target-neutral core topology：

- `LogicUnit`、`LUCore` 和 `LUI`。
- Port、endpoint、pin 和 connection。
- Requirement service 和 fulfillment relation。
- Closure。
- Structural composition。
- `LogicUnit.features` manifest，用来声明这个独立 LU 使用的 feature dependency。
- 附着在稳定 owner 或 relation node 上的 feature-scoped extension record。

LogicIR document 可以被 authoring tool 和 IR pipeline tool 读写。Projection compiler 和 execution engine 通常只读消费它。

LogicIR core 不应包含 runtime function、host callback、state store handle、JS/Python async 机制、Verilog clock/reset 机制、provider registry 或 profile reference。

## Feature 和 Extension

Feature 和 extension 构成横向语义层。

- **Feature**: namespaced semantic capability unit，例如 type system、software completion policy、Verilog clocking 或 distributed routing。
- **Feature use**: `LogicUnit` 本地 manifest entry，inline 保存 feature 的 namespace、key 和可选 version。
- **Extension point**: 某个 feature 拥有的 attachment contract，包含 attach 到哪里，以及使用什么 payload schema。
- **Extension record**: LogicIR document 内部实际挂在节点上的声明。它引用 `LogicUnit.features` 的本地 key、一个 extension key 和 payload。

Feature definition 定义语义和兼容义务。Extension record 把这些语义放到具体 LogicIR node 上。Profile contract 决定某个具体 processing layer 中哪些 feature 和 extension point 是 required、conditional、recommended 或 optional。

示例：

```text
Feature:
  logicir.type-system / core

LogicUnit feature manifest:
  type = { namespace: logicir.type-system, key: core }

Extension record:
  attached to a Port
  featureKey = type
  key = payload-type
  payload = { typeRef: ... }
```

Profile contract 定义某个 pipeline、projection 或 execution target 需要哪些 feature 和 extension point。Required extension point 必须先被工具理解，工具才可以 preserve、transform、project 或 execute 受影响语义。不支持 required feature 或 extension contract 时必须产生 diagnostic，不能静默降级。

`FeatureUseKey` 只是本地别名。Tool 必须通过所在 `LogicUnit.features` map 把它解析为具体 feature identity 后，才能做 capability check。Package 或 document container 可以索引很多 LU，但不能成为某个 LU 语义 feature dependency 的来源。

所有指向外部 `namespace + key` 的 core reference 都可以携带可选 `version`。当 deterministic validation 或 projection 需要稳定性时，version 用来 pin 外部 feature、target 或 requirement-service contract。Feature-level behavior configuration 应建模为 feature-owned extension、profile policy 或 execution binding，而不是 generic core config。

Feature definition 可以声明 feature-level `requires` 和 `conflictsWith` metadata。这些 metadata 描述 feature 之间的语义兼容性；它们不决定某个 feature 是否被具体 pipeline、projection 或 execution target required。Requiredness 仍然是 profile contract。

## 三类 Profile

Profile 是单层兼容契约。一个 tool 可以只实现其中一类 profile，而不实现其它 profile。

### IR Pipeline Profile（IR 管线 Profile）

IR pipeline profile 管理仍然保持 LogicIR 形态的 transformation：

```text
LogicIR -> LogicIR
```

它由 validator、resolver、normalizer、type checker、lowerer 和 adapter insertion tool 实现。

它声明：

- 接受的 core version range。
- 接受或要求的 feature 和 extension point。
- Stage order。
- Required pass capability。
- Validation 和 diagnostic policy。
- Feature lowering policy。
- Authoring-only 或 analysis-only data 的 strip/retain policy。

示例名称：

- `basic-software-ir`
- `verilog-hdl-ir`
- `authoring-to-canonical`

### Projection Profile（投影 Profile）

Projection profile 管理离开 LogicIR 形态的过程：

```text
LogicIR -> target artifact | executable plan
```

它由 projection compiler、code generator、HDL emitter、report generator 和 interpreter-plan generator 实现。

它声明：

- Required input LogicIR shape。
- Projection target。
- Artifact 或 plan kind。
- Projection stage。
- Target constraint。
- Required feature support。
- Unsupported semantics policy。
- Diagnostics policy。

示例名称：

- `to-interpreter-plan`
- `to-generated-js`
- `to-verilog-hdl`
- `to-analysis-report`

### Execution Profile（执行 Profile）

Execution profile 管理 LogicIR document、artifact 或 executable plan 如何被实际运行或消费：

```text
LogicIR | executable plan | artifact -> execution
```

它由 interpreter、runtime engine、generated-code host、simulator、deployment environment 和 provider registry 实现。

它声明：

- Execution target。
- Execution environment constraint。
- Provider contract。
- Execution binding。
- State、scheduler、transport、service、lifecycle 和 diagnostics policy。

Execution profile 不定义 LogicIR transformation stage，除非它明确产生新的 LogicIR artifact。它配置 realization。

## Stack

Stack 是用户或应用选择的端到端组合。它引用 profile；它本身不能替代 profile-level compatibility check。

```text
Stack =
  IR Pipeline Profile
  + Projection Profile
  + optional Execution Profile
```

示例：

```text
当前优先目标：

basic-software-interpreter stack
  ir: basic-software-ir
  projection: to-interpreter-plan
  execution: software-interpreter-execution

basic-hdl-sim stack
  ir: verilog-hdl-ir
  projection: to-verilog-hdl
  execution: iverilog-sim-execution

暂缓：

basic-software-generated stack
  ir: basic-software-ir
  projection: to-generated-software
  execution: generated-software-execution

verilog-hdl-build stack
  ir: verilog-hdl-ir
  projection: to-verilog-hdl
  execution: none
```

用户通常选择 stack。Tool 实现 profile。Profile resolver 把 stack 展开成具体 profile requirement。

## Pipeline、Stage 和 Pass

- **Pipeline**: profile 声明或引用的有序 processing flow。
- **Stage**: pipeline 中的逻辑 slot，例如 validate、resolve、normalize、lower 或 emit。
- **Pass**: stage 的具体实现。

IR pipeline stage 产生 LogicIR。Projection stage 产生 target artifact 或 executable plan。Execution profile 配置 realization；除非它写出新的 LogicIR document，否则不应被称为 LogicIR stage。

## Execution 术语

Execution support 由 profile data 和外部 provider 表达。

- **Execution target**: 运行形态，例如 interpreter、generated software、Verilog simulator、Verilog synthesis 或 distributed runtime。
- **Execution environment**: host context，例如 software host、browser、server process、FPGA board、cloud deployment 或 Verilog simulator。
- **Execution binding**: execution profile 中的 item-level mapping record。它把 abstract requirement、external target 或 namespaced named need 映射到具体 provider identity 和 configuration。Feature/provider contract 定义 state store、transport、probe、module 或 clock/reset binding 等具体 named need。
- **Execution provider**: 满足 binding 的真实能力实体。它可以是 function、module、linked library、remote service、database、message bus、hardware interface 或 simulator foreign module。
- **Provider contract**: provider 必须满足的 interface 和 semantic obligation。
- **Provider capability**: provider 声明自己实际支持什么。

`Plugin` 不是 core 生态术语。Plugin 只是 execution provider 或 pass provider 的一种 local packaging/loading strategy。

## Tool 角色

- **IR authoring tool**: 读取 profile，并读写 LogicIR。
- **IR pipeline tool**: 实现 IR pipeline profile，并读写 LogicIR。
- **Projection compiler**: 实现 projection profile，读取 LogicIR，写出 artifact 或 executable plan。
- **Execution engine**: 实现 execution profile，并运行 LogicIR、plan 或 target artifact。
- **Execution provider**: 满足 execution profile 引用的 provider contract。
- **Profile resolver**: 把 stack 或 profile 展开为具体 feature、stage、policy 和 binding。
- **Capability checker**: 检查 LogicIR extension record 和 profile requirement 是否被 tool、pass、compiler、engine 和 provider capability 覆盖。

## 兼容规则

兼容链条是：

```text
用户选择 Stack。
Stack 引用 Profile。
Tool 实现 Profile。
Profile 引用 Feature。
LogicIR 包含 Extension Record。
Execution Profile 包含 Binding。
Provider 满足 Binding。
Capability Checker 验证覆盖。
```

除非 profile 已经被解析为具体 feature、stage、policy 和 provider contract，并且 tool 声明的 capability 覆盖它们，否则 tool 不能只靠 profile 名称声称兼容。

## 边界汇总

```text
LogicIR Document
  可变逻辑对象

Feature
  横向语义能力

Feature Use
  LogicUnit 本地 manifest 中的一条 feature dependency

Extension Record
  LogicIR 内部由 feature 拥有的声明

IR Pipeline Profile
  LogicIR -> LogicIR 的兼容契约

Projection Profile
  LogicIR -> artifact/plan 的兼容契约

Execution Profile
  realization 兼容契约

Stack
  端到端 profile 组合

Execution Binding
  execution profile 中的 item-level mapping data

Execution Provider
  真实能力实体
```
