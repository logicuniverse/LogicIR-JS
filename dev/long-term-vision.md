# 中长期愿景

这份文档保存 LogicIR 的不确定中长期方向、研究分支和 architecture pressure
tests。它不是路线图，也不是当前承诺要做的任务列表。

职责边界：

- 稳定理论和工程原则见 [operational-theory.md](operational-theory.md)。
- 当前已确认 feature 方向见 [feature-catalog.md](feature-catalog.md)。
- 当前开发顺序、验收主线和进度跟踪见 [roadmap.md](roadmap.md)。
- 任何方向只有在形成明确计划、验收标准和审阅路径后，才进入
  `dev/plans/`、`dev/roadmap.md` 或 `ai/tasks/`。

总原则：

- 中长期愿景不能反向污染 core schema。
- 这些方向适合做 architecture pressure test，但除非它们揭示缺失的
  target-neutral topology relation，否则不应驱动 core schema 变化。
- 文件仍是可移植 artifact；database、model、agent、runtime strategy 都是
  tooling、feature、profile、provider 或 platform 层问题。

## Zero-to-LogicIR

`zero-to-LogicIR` 是独立的中长期 research / dataset / training 分支，不是
LogicIR 的终极目标，也不是近期主线实现。它参考 `Zero-to-CAD: Agentic
Synthesis of Interpretable CAD Programs at Million-Scale Without Real Data`
的思路：用 agentic synthesis、执行/验证反馈和 synthetic corpus curation，
在缺少真实数据时构造高质量、可解释、可执行的训练样本。

这条线的价值在于为 AI-assisted LogicIR editing 提供数据和局部补全能力；它不
替代 core、feature/profile、validator、interpreter、HDL projector、provider
catalog、edit transaction 和晋升 workflow 这些主线工程目标。

LogicIR 版本的目标不是直接训练模型写代码，而是生成和筛选可验证的 LogicIR
edit transactions：

```text
intent / source code / partial IR
-> proposed LogicIR operation sequence
-> after LogicIR
-> schema/profile/type/capability validation
-> projection / execution / simulation
-> curated transaction corpus
```

前置条件：

- Core validator。
- Profile resolver。
- Capability checker。
- Type-system seed。
- `basic-software-interpreter` formal seed。
- `basic-hdl-sim` formal seed。
- Edit transaction MVP。
- Existing-code provider wrapping seed。

候选阶段：

1. **ZL1 transaction schema**: 定义样本记录结构，包括 intent、before、
   operations、after、validation、projection/execution result 和 rationale。
2. **ZL2 synthetic fixture generator**: 生成 schema-valid LogicIR fixtures，
   覆盖 combinational、stateful、sequential 和 structural seed。
3. **ZL3 verifier loop**: 接入 validator、profile resolver、capability
   checker、type checker、software smoke 和 HDL `iverilog` simulation。
4. **ZL4 repair loop**: 根据 diagnostics 自动修复 LogicIR，并保留失败/修复
   轨迹。
5. **ZL5 corpus curation**: 去重、难度分级、coverage matrix、quality gates
   和 high-quality subset。
6. **ZL6 model training**: 训练或微调 intent-to-LogicIR、code-to-LogicIR、
   partial-to-complete 和 diagnostic-to-repair 能力。
7. **ZL7 local micro-agent**: 训练或蒸馏一个面向 Web IDE 的小模型，专注预测
   局部 LogicIR edit operations，而不是通用代码生成。

如果这个独立分支成立，一个重要远期收益是让 Web IDE 使用本地小模型完成高频、
低延迟、可验证的逻辑编辑，减少服务器资源依赖：

```text
Web IDE
-> current scope / partial IR / typed holes
-> local model proposes edit transaction
-> local validator / catalog / type checker filters
-> user accepts or rejects
```

这个方向可行的前提是 LogicIR 输出空间被 schema、feature/profile、provider
catalog 和 validator 强约束。小模型不需要理解或生成完整工程；它可以先专注于
provider binding、port/type 补全、connection patch、diagnostic repair、
naming/organization 等局部任务。复杂 synthesis 仍可交给云端大模型或 agentic
task。

## No-GC / 高性能运行时内存模型

`no-gc-runtime-memory` 是中长期 projection / runtime pressure test，不是近期
主线实现，也不是 core schema 变更需求。它面向 C/C++、no-GC WASM、嵌入式、
实时系统和其它高性能运行环境，用来验证 LogicIR 在没有宿主 GC 的情况下，能否
安全地投影到 deterministic lifetime、ownership 和 memory release 模型。

这条线的重点不是把引用计数写进 core，而是研究 profile、feature、projection
policy 和 execution runtime strategy 如何表达并验证：

- 哪些值可以静态分配、栈分配、arena/region 分配或复用。
- 哪些值需要 heap ownership、共享引用或跨 closure / async / event-stream
  生命周期。
- 什么时候可以使用 reference counting，什么时候应优先使用 region、
  arena、linear/borrow-like ownership 或显式 adapter。
- 是否允许 reference cycle；如果允许，需要 weak reference、cycle policy 或
  diagnostic。
- property、stateful LU、structural composition、event stream 和 closure
  capture 在 no-GC target 上的 lifetime 约束。
- projector 遇到无法保持内存语义的结构时，应 fail diagnostic、要求 lowering，
  还是插入显式 adapter。

候选 AI task：

- `no-gc-memory-pressure-test`
  - 目标：选择一小组 LogicIR fixtures，尝试投影成 task-local C-like 或
    no-GC WASM-like runtime plan。
  - 必需内容：ownership/lifetime feature 草案、RC/region/arena 策略对比、
    cycle rejection fixture、property/stateful/event-stream lifetime fixture、
    diagnostic report。
  - 验收：task-local checker 能标出哪些 fixture 可静态或 region 管理，哪些
    需要 RC，哪些因为 cycle、escaping closure 或 async lifetime 不可安全投影。

## 显式资源和副作用管理

`explicit-resource-effect-management` 是中长期 feature/profile/capability 路线，
优先级高于具体 no-GC 内存策略，但仍不属于近期主线实现。它用于把传统文本编程
中隐藏在代码体和库调用里的资源依赖、副作用、权限、生命周期和可重放性显式化。

这条线不要求 core schema 增加资源或 effect 字段；它应通过 feature extension、
profile contract、provider contract、execution binding、capability checker 和
diagnostic 实现。候选资源和副作用包括：

- file、socket、database、lock、timer、thread、GPU handle、device handle、
  subscription、state store 和 external service session。
- network request、file IO、database mutation、event emission、logging、
  metrics、time/random/env access、UI/DOM mutation、hardware register access
  和 external service call。
- resource ownership、borrowing、sharing、teardown、scope binding、
  deterministic lifetime 和 no-GC target compatibility。
- effect ordering、idempotency、replayability、cancellation、compensation、
  sandbox/mock policy 和人工确认策略。

候选 AI task：

- `explicit-effects-resources-pressure-test`
  - 目标：选择 software interpreter、HDL rejection、domain provider、reactive
    runtime 和 no-GC memory 的代表性 fixtures，给它们添加 task-local
    resource/effect declarations。
  - 必需内容：resource/effect feature 草案、profile requirement 草案、
    capability checker seed、mock provider binding、pure/impure diagnostic、
    HDL unsupported-effect rejection。
  - 验收：task-local checker 能区分 pure computation、provider invocation、
    state mutation、event emission、external IO 和 resource lifetime；对 HDL
    或 no-GC target 不支持的 effect 给出结构化 diagnostic。

这条线的长期价值是让 LogicIR 在测试、权限、安全审查、AI edit review、
distributed runtime、嵌入式和高性能 target 上都比传统文本编程更可控。

## Catalog Database 和依赖查询

`logicir-catalog-db` 是中长期 tooling / platform 路线。它的目标不是把 core
schema 改成数据库格式，而是承认文件树不适合独自承担 LogicIR 的长期查询、
影响面分析、依赖追踪、版本 lineage、provider discovery 和 AI 协作上下文。

LogicIR 的核心数据天然是关系型和图状的：

- `LogicUnit -> LUI target`
- `Connection -> EndpointRef`
- `Requirement -> Fulfillment -> Closure / upstream reachability`
- `Closure -> inner LogicUnit`
- `Feature -> ExtensionRecord`
- `Profile -> required Feature / Capability / ProviderContract`
- `Provider -> Capability / Contract`
- `Fixture -> Feature / Stack / VerificationResult`
- `EditTransaction -> changed region / before / after / validation`
- `SchemaVersion -> migration / compatibility`

这些关系可以继续以文件作为交换和审阅载体，但正式 tooling 应能把它们导入
catalog database，支持查询：

- 改某个 provider contract 会影响哪些 LU、profile、stack 和 fixtures。
- 某个 feature 或 extension 被哪些 LogicUnit 使用。
- 某条 fulfillment path 是否经过指定 closure 或 upstream supplier。
- 哪些 LogicUnit 使用 software-only effect，不能投影到 HDL。
- 哪些 edit transaction 修改过某个 boundary、connection 或 requirement。
- 哪些 legacy node/function 已被 wrapper、replica 或 fixture 覆盖。
- 哪些 schema version 需要 migration。

候选实现路线：

- 第一阶段使用 SQLite，服务本地 CLI、AI task、审阅和 CI。
- 复杂 reachability 可以先用 SQL recursive CTE；必要时再评估 Datalog、
  Souffle、Postgres 或 graph database。
- 文件仍是可移植 artifact；database 是索引、查询和协作加速层。

候选 AI task：

- `logicir-catalog-db-pressure-test`
  - 目标：从当前 `packages/`、`ai/tasks/material-index.md` 和 selected fixtures
    导入一个 task-local SQLite catalog。
  - 必需内容：schema 草案、importer、dependency queries、impact report、
    legacy coverage/query demo。
  - 验收：能回答至少五类依赖问题，例如 provider impact、feature usage、
    fulfillment reachability、fixture coverage 和 edit transaction changed region。

这条线对 AI 协作尤其重要：AI 不应每次都从文件文本和 grep 中重建上下文。长期
工具应能把相关 LU、feature、provider、fixtures、历史 transaction 和审阅
状态作为结构化 query result 提供给 agent。

进一步的 AI tool-routing query 应回答：

- 当前 intent 影响哪些 LU、feature、profile、provider 和 stack。
- 哪些 task 是可审阅素材，哪些只是 archive-only / reference-only evidence。
- 当前 scope 的允许写入位置和只读参考位置是什么。
- 需要运行哪些验证工具，例如 core validator、type checker、software smoke、
  Verilog `iverilog`、profile resolver 或 capability checker。
- 哪些 fixtures、diagnostics、promotion checklist 和 prior edit transactions
  应作为本次 agent work 的上下文。

这个能力不是为了替代人类审阅，而是为了让 AI 更少依赖文本猜测，更准确地调用
工具、控制改动范围、补齐验证路径，并输出更可审查的 transaction 或 promotion
proposal。

## 其它愿景池

以下只是愿景或 pressure-test pool，不是当前项目计划：

- Circuit/netlist projection。
- PCB 或 board-level realization。
- Mechanical assembly 和 product enclosure。
- Python runtime/projection。
- 超出 basic provider 和 transport 边界的 distributed runtime。
- Visual editor productization。
- 面向外部读者的公开定位文档，例如 `docs/logicir-as-universal-carrier.md`。

这些方向应等待 `basic-software-interpreter` 与 `basic-hdl-sim` 的正式 seed 跑通
后，再判断是否值得进入 `dev/plans/` 或 `ai/tasks/`。
