# LogicIR 路线图

这份路线图是项目协调文档，用来描述 LogicIR 的 feature、profile、stack、
tool、projector、compiler、engine、fixture 和 AI task 的建设顺序。

它不是 schema 权威。已确认的数据结构由 `packages/` 下的 TS 源包维护，
语言无关的规范和生成产物入口在 `schema/` 下。具体实现仍需要写入
`dev/plans/` 中的聚焦计划，或者先放进 `ai/tasks/` 下的隔离 AI task。

## 验收主线

近期项目应该优先证明两个主 stack：

- **basic-software**: LogicIR 可以被验证、规范化、投影到 interpreter plan
  或 JS/TS 生成产物，并通过显式 provider binding 执行。
- **basic-hdl**: LogicIR 可以被验证、规范化，对 software-only 语义进行
  拒绝或 lowering，并投影到 Verilog HDL。

这两个 stack 是第一轮兼容性压力测试。software 路线验证 runtime/provider
语义；HDL 路线验证 core 没有吸收软件 runtime 假设。

近期优先级：

1. **最高优先级：`basic-software-interpreter`**
   - 目标链路：`LogicIR -> interpreter execution plan -> software engine run`。
   - 用它还原或升级 legacy engine 中已经证明有用的旧代码和运行经验，例如
     provider、state store、retained-current、thenable completion 和 projection
     plan。
   - 不把 legacy 结构原样搬回 core；旧代码只作为 feature、profile、
     projector、engine 和 provider 边界的实现证据。
2. **第二优先级：`basic-hdl-sim`**
   - 目标链路：`LogicIR -> Verilog HDL -> iverilog simulation`。
   - 用它约束 core 不被 JS runtime 假设污染，并证明 HDL projection 可行。
3. **暂缓：`basic-software-generated`**
   - 等 interpreter plan 跑通后再做 generated artifact、bundle、host
     integration 和 source-map 之类复杂问题。
4. **暂缓或作为 HDL sim 子集：`basic-hdl-build`**
   - 只生成 Verilog 的价值不如 simulation 闭环。Synthesis/build 更晚再处理。

开发节奏：

- 每一轮都必须端到端打通，而不是先堆完整 feature catalog、profile 或 engine。
- 每一轮只增加少量语义，保持可 review、可 promotion。
- 每一轮至少包含：LogicIR fixture、最小 profile/stack 声明、validator/resolver
  检查、projection 或 execution plan、runtime/`iverilog` 验证、diagnostic 记录。
- 每一轮都可以作为一个 `/goal` AI task，在 `ai/tasks/YYYY-MM-DD-<round>/`
  中独立完成；task 结束时必须留下 `package.json`、fixture、verification 和
  promotion checklist。
- 不为下一轮提前实现复杂抽象。下一轮开始前再根据上一轮验证结果决定是否扩展。

## 阶段 0：仓库和协议基础

状态：基本已启动。

需要达成：

- Monorepo 边界足够稳定，可以承载后续开发。
- `packages/core` 维护已确认的 TypeScript core 数据结构。
- `packages/architecture` 维护已确认的 TypeScript architecture definition
  数据结构。
- `packages/features/*` 维护已确认的 feature 数据和 extension payload
  数据结构。
- `schema/` 只作为语言无关规范和生成产物入口，不作为主要 authoring
  工作区。
- `ai/tasks/` 是全自动 AI task 在人工确认前唯一允许写入的区域。
- 默认开发环境支持通过
  [OSS CAD Suite](https://github.com/YosysHQ/oss-cad-suite-build) 做 HDL
  验证。本机 Windows 安装路径约定为 `E:\oss-cad-suite`；运行 HDL 验证前
  先激活 `E:\oss-cad-suite\environment.ps1`。HDL smoke test 应直接调用
  `iverilog`；PowerShell 中的 `where.exe iverilog` 或 `cmd` 中的
  `where iverilog` 只作为 PATH 排查手段。

当前正式包：

- `packages/core`
- `packages/architecture`
- `packages/features/type-system`
- `packages/tools/type-system`

重要 source-only 证据：

- `packages/legacy/engine`
- `packages/legacy/flow-runtime-core`
- `packages/legacy/flow-core`

## 阶段 1：最小协议工具链

目标：在建设更大的 engine 之前，让 LogicIR 和 architecture definition
可以被机械检查。

必需 tool：

- Core schema validator：验证 LogicIR core 形状、本地 feature manifest
  解析、extension attachment 位置、endpoint reference 和基础图一致性。
- Architecture definition validator：验证 feature、profile、stack、
  capability、provider contract、provider capability、stage、policy 和
  binding 定义。
- Profile resolver：把 stack 展开为 IR pipeline、projection 和可选
  execution profile 的要求。
- Capability checker：检查 tool、pass、projector、engine 和 provider
  是否覆盖 resolved profile requirements。
- Diagnostic model：为 validator、resolver、projector、compiler 和 engine
  提供共享结构化 diagnostic。

第一轮验收标准：

- 一个 LogicIR fixture 可以基于 `packages/core` 被验证。
- 一个 feature definition 可以声明 extension point 的 attachment kind 和
  payload schema。
- 一个 profile 可以把 feature 和 extension point contract 标记为
  `required`、`conditional-required`、`recommended` 或 `optional`。
- 一个 stack 可以解析为具体 profile requirements。
- 不支持 required 或 conditional-required contract 时必须产生 diagnostic。

## 阶段 2：Feature Catalog

目标：定义小而可复用的语义 feature。Feature 不是 stack。software 和 HDL
在语义重叠时可以引用同一个 feature。

### 共享 Feature

初始共享 feature：

- `logicir.type-system / core`: payload type reference、type declaration、
  value shape checking 和 projection-facing type metadata。
- `logicir.value / core`: literal value、constant payload、default value 和
  value compatibility rules。
- `logicir.diagnostics / unsupported-semantics`: 显式 unsupported semantic
  marker，以及 profile/projector 使用的 rejection policy data。

后续可能的共享 feature：

- `logicir.control-flow / core`: branch、guard、loop、return、go-back，以及
  保持在 core sequential `steps` 之外的 lowering metadata。
- `logicir.adapter / core`: automatic adapter insertion 变成可审阅项目数据后，
  用于记录显式 adapter/lowering trace。
- `logicir.observation / core`: probe、trace、assertion 和非语义 observation
  point。

### 面向 Software 的 Feature

初始 software feature：

- `logicir.software.completion / core`: completion、failure、cancellation 和
  thenable-compatible await 语义，作为 projection/runtime contract。
- `logicir.software.invocation / core`: callable/service invocation 语义、
  argument/result mapping 和 provider contract linkage。
- `logicir.software.retained-current / core`: retained-current state surface、
  current value read、update notification 和 state-store contract linkage。
- `logicir.software.fulfillment / core`: provider fulfillment shape、static
  startup binding，以及 dynamic/switchable provider 的显式 contract。
- `logicir.software.error / core`: error propagation、recoverability 和
  diagnostic/result mapping。

后续可能的 software feature：

- `logicir.software.lifecycle / core`: startup、shutdown、resource lifetime、
  hook 和 teardown policy。
- `logicir.software.scheduling / core`: scheduling policy、task queue、
  concurrency limit 和 backpressure。
- `logicir.software.transport / core`: service boundary、remote invocation、
  message bus、serialization 和 distributed runtime hint。

### 面向 HDL 的 Feature

初始 HDL feature：

- `logicir.hdl.signal / core`: bit/vector signal、signedness、packed shape 和
  port signal metadata。
- `logicir.hdl.module / core`: module boundary、instance naming、parameter
  mapping 和 static structural constraint。
- `logicir.hdl.clocking / core`: clock/reset domain 和 sequential process
  binding。
- `logicir.hdl.state / core`: register、retained hardware state、initial value
  和 reset behavior。
- `logicir.hdl.combinational / core`: combinational block constraint 和
  continuous assignment constraint。
- `logicir.hdl.elaboration / core`: generate-time structure、parameter 和
  static binding constraint。
- `logicir.hdl.structural-slices / core`: structural export anchor 和
  slice-oriented hardware projection rule。

后续可能的 HDL feature：

- `logicir.hdl.simulation / core`: testbench hook、probe、waveform metadata 和
  simulator integration。
- `logicir.hdl.synthesis / core`: synthesis constraint、target family hint 和
  synthesis diagnostic。

## 阶段 3：Profile

Profile 是单层兼容契约。Tool 实现 profile；用户通常选择 stack。

必需 IR pipeline profile：

- `basic-software-ir`: 验证 core，解析 feature manifest，检查 software
  feature contract，在存在 type/value 信息时支持检查，并且只 lowering
  selected profile 明确声明的语义。
- `basic-hdl-ir`: 验证 core，解析 feature manifest，检查 HDL contract，
  要求 HDL-compatible type/signal 信息，并拒绝或 lowering unsupported
  software semantics。

必需 projection profile：

- `to-interpreter-plan`: 把 LogicIR 投影成 executable interpreter plan，同时
  保留 provider 和 execution binding 要求。
- `to-generated-js`: 把 LogicIR 投影成 JS/TS-oriented generated artifact。
- `to-verilog-hdl`: 把 LogicIR 投影成 Verilog HDL artifact 和 diagnostic。
- `to-analysis-report`: 把 LogicIR 投影成用于 validation、capability gap 和
  unsupported semantics review 的 report。

必需 execution profile：

- `software-interpreter-execution`: 在 JS/TS runtime 中通过显式 provider 运行
  LogicIR 或 interpreter plan。
- `generated-software-execution`: 用 selected provider binding 运行 generated
  software artifact。
- `verilog-sim-execution`: 通过 simulator environment 消费 generated Verilog。

后续可能的 profile：

- `authoring-to-canonical`
- `distributed-software-ir`
- `to-netlist`
- `to-python`
- `to-mechanical-report`

## 阶段 4：Stack

Stack 把 profile 组合成用户可选 workflow。Stack 本身不是 capability proof。

当前目标 stack：

- `basic-software-interpreter`
  - IR profile: `basic-software-ir`
  - Projection profile: `to-interpreter-plan`
  - Execution profile: `software-interpreter-execution`
- `basic-hdl-sim`
  - IR profile: `basic-hdl-ir`
  - Projection profile: `to-verilog-hdl`
  - Execution profile: `verilog-sim-execution`

暂缓 stack：

- `basic-software-generated`
  - IR profile: `basic-software-ir`
  - Projection profile: `to-generated-js`
  - Execution profile: `generated-software-execution`
- `basic-hdl-build`
  - IR profile: `basic-hdl-ir`
  - Projection profile: `to-verilog-hdl`
  - Execution profile: none

后续 stack probe：

- `software-distributed`
- `hdl-synthesis`
- `logicir-analysis-report`
- `logicir-netlist-probe`

## 阶段 5：Tool

Tool 是 `packages/tools/*` 下的正式实现。Tool 必须声明 capability，不能只靠
stack 名称声称支持。

近期 tool：

- `tools/core-validator`: LogicIR core validation 和 reference resolution。
- `tools/architecture-validator`: architecture definition validation。
- `tools/profile-resolver`: stack/profile expansion。
- `tools/capability-checker`: profile requirement coverage check。
- `tools/type-system`: type registry 和 type checking。已启动。
- `tools/fixture-runner`: 运行 validation/projection/execution fixture。

后续 tool：

- `tools/migration`: schema migration 和 compat check。
- `tools/lint`: authoring 和 style diagnostic。
- `tools/report`: 面向人的 capability 和 projection report。
- `tools/adapter-lowering`: 显式 adapter insertion 或 lowering analysis。

## 阶段 6：Projector 和 Compiler

Projector 消费已验证的 LogicIR 和 resolved profile，产生 target artifact 或
executable plan。

近期 projector：

- `projectors/interpreter-plan`: LogicIR 到 software interpreter plan。
- `projectors/js`: LogicIR 到 JS/TS-oriented generated artifact。
- `projectors/verilog`: LogicIR 到 Verilog HDL。
- `projectors/report`: LogicIR 到 analysis/capability report。

Projector 要求：

- 声明支持的 core version。
- 声明支持的 feature 和 extension point。
- 声明支持的 LU kind 和 fulfillment form。
- 拒绝 unsupported required 或 conditional-required contract。
- 保留 semantic loss 或 unsupported target construct 的 diagnostic。

## 阶段 7：Engine 和 Provider

Execution 是 realization，不是 core LogicIR transformation，除非它明确写出新的
LogicIR artifact。

近期 engine：

- `engines/software`: 面向 LogicIR 或 interpreter plan 的 JS/TS
  interpreter/runtime。
- `engines/generated-software-host`: generated JS/TS-oriented artifact 的 host
  helper。
- `engines/verilog-sim`: generated HDL 的 simulator-facing execution wrapper。

近期 provider contract：

- State store provider。
- Invocation/function provider。
- Requirement service provider。
- Scheduler provider。
- Diagnostics provider。
- HDL clock/reset binding provider。
- HDL simulation probe provider。

Provider 规则：

- `Plugin` 不是 core 生态术语。Plugin 只是 provider 或 pass provider 的一种
  package/loading strategy。

## 阶段 8：Fixture 和 Example

Fixture 应证明兼容性，避免 roadmap 只停留在概念层。

必需 fixture 组：

- Minimal combinational LU。
- Minimal sequential LU。
- Minimal stateful retained-current LU。
- Structural LU with export anchors and outlet fills。
- Requirement fulfillment with closure。
- Requirement fulfillment through upstream lineage。
- Payload path connection and single-driver overlap checks。
- Type-system payload examples。
- basic-software interpreter example。
- basic-software generated artifact example。
- basic-hdl combinational module。
- basic-hdl sequential/state module。
- basic-hdl unsupported-semantics rejection。
- 使用 OSS CAD Suite 的 `iverilog` 做 Verilog syntax/simulation smoke check。

Example 目录应保持小而可审阅：

- `examples/basic-software`
- `examples/basic-hdl`
- `fixtures/logicir`
- `fixtures/profiles`
- `fixtures/features`

## AI Task 候选

全自动 AI task 应各自写入 `ai/tasks/` 下的一个子目录。适合的候选任务：

### `basic-software-interpreter` Round

这些 round 按顺序推进。每个 round 都必须端到端跑通：

1. **Round S1: pure invocation**
   - 目标：一个最小 LogicIR fixture 调用 provider function，输入映射到输出。
   - 必需内容：最小 `basic-software-interpreter` stack/profile 数据、最小
     profile resolver、interpreter execution plan、software engine smoke。
   - legacy 参考：`Provider`、`Projection`、旧 runtime invocation 相关代码。
   - 验收：从 task 目录运行 JS/TS smoke，得到确定输出；不引入 type-system
     requiredness。
2. **Round S2: retained-current**
   - 目标：加入 current value/state store 语义，还原旧 `Property` /
     `StateStore` 的核心行为。
   - 必需内容：retained-current feature/extension 草案、state store provider
     contract、读写 current value fixture。
   - 验收：写入状态、读取 current、更新后再次读取都通过 task-local smoke。
3. **Round S3: completion / await**
   - 目标：加入 thenable-compatible completion，覆盖 resolve/reject。
   - 必需内容：completion feature/extension 草案、async provider fixture、plan
     中的 completion policy。
   - 验收：异步 resolve 得到正确输出；reject 产生结构化 diagnostic。
4. **Round S4: fulfillment / closure**
   - 目标：加入最小 Z 轴 fulfillment，包括本地 closure fulfillment 和最小
     upstream provider 解析。
   - 必需内容：requirement fixture、closure fixture、provider binding fixture。
   - 验收：requirement 可被 closure/provider 满足；缺失 provider 返回 diagnostic。
5. **Round S5: error / diagnostic**
   - 目标：统一 provider missing、plan invalid、unsupported semantics 和 runtime
     failure 的 diagnostic。
   - 必需内容：diagnostic model 草案、失败 fixture、report 输出。
   - 验收：失败路径返回结构化 diagnostic，不依赖未捕获 throw。

`basic-software-interpreter` 的 MVP 不把 `logicir.type-system / core` 作为
required。Type-system 可以作为 recommended 或 optional 出现在 profile 中，
但第一轮端到端闭环不应被它阻塞。

### `basic-hdl-sim` Round

这些 round 可以和 software round 并行探索，但优先级低于
`basic-software-interpreter`：

1. **Round H1: combinational module**
   - 目标：最小 LogicIR combinational fixture 投影成 Verilog module。
   - 必需内容：最小 `basic-hdl-sim` stack/profile 数据、Verilog projector
     smoke、testbench。
   - 验收：激活 `E:\oss-cad-suite\environment.ps1` 后直接运行 `iverilog`，
     syntax/simulation smoke 通过。
2. **Round H2: signal width / simple type**
   - 目标：加入 bit width、vector、signedness 等 HDL 必需信号信息。
   - 必需内容：signal feature/extension 草案、width fixture。
   - 验收：生成 Verilog 宽度正确，`iverilog` smoke 通过。
3. **Round H3: sequential state**
   - 目标：加入 clock/reset/register。
   - 必需内容：clocking/state feature 草案、sequential fixture、testbench。
   - 验收：仿真中 reset 和 register update 行为正确。
4. **Round H4: unsupported-semantics rejection**
   - 目标：显式拒绝 software-only feature。
   - 必需内容：unsupported-semantics diagnostic fixture。
   - 验收：projector 不静默降级，返回结构化 diagnostic。
5. **Round H5: structural module composition**
   - 目标：module instance、wire 和 simple hierarchy。
   - 必需内容：module composition fixture。
   - 验收：生成层级 Verilog，`iverilog` smoke 通过。

### 其它候选任务

- 基于当前 architecture schema 原型化 `tools/profile-resolver`。
- 用 feature/profile fixture 原型化 `tools/capability-checker`。
- 从 `packages/legacy/flow-core` 提取可复用的 node/LUI catalog 证据。

晋升规则：

- AI task output 只是素材。人工 promotion 时只迁移经过审阅的最小成果到
  `packages/`、`schema/`、`examples/`、`fixtures/` 或 `dev/`，然后在正式
  project context 中重新验证。

## 暂不作为项目计划

以下只是 north-star probe，不是近期必做：

- Circuit/netlist projection。
- PCB 或 board-level realization。
- Mechanical assembly 和 product enclosure。
- Python runtime/projection。
- 超出 basic provider 和 transport seam 的 distributed runtime。
- Visual editor productization。

这些方向适合做 architecture pressure test，但除非它们揭示了缺失的
target-neutral topology relation，否则不应驱动 core schema 改动。
